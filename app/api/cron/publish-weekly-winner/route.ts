import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/cron/publish-weekly-winner
 *
 * Endpoint para cron job que publica automáticamente el plato ganador
 * de la semana anterior cada lunes.
 *
 * Seguridad: Verifica el token de autorización para prevenir ejecuciones no autorizadas
 * En desarrollo (sin CRON_SECRET), permite acceso sin token para testing
 *
 * Headers requeridos (producción):
 * - Authorization: Bearer <CRON_SECRET>
 *
 * Variables de entorno necesarias:
 * - CRON_SECRET: Token secreto para autorizar la ejecución del cron (opcional en dev)
 */
export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    // Si hay CRON_SECRET configurado, verificarlo
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (token !== cronSecret) {
        console.error('[Cron] Unauthorized attempt to run cron job');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      console.log('[Cron] Running in development mode (no CRON_SECRET)');
    }

    console.log('[Cron] Starting auto-publish weekly winner...');

    // Calcular fechas de la semana anterior (lunes a domingo)
    const now = new Date();
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - now.getDay() - 6); // Lunes de la semana pasada
    lastMonday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    const weekStart = lastMonday.toISOString().split('T')[0];
    const weekEnd = lastSunday.toISOString().split('T')[0];

    console.log(`[Cron] Getting winner for week: ${weekStart} to ${weekEnd}`);

    // Obtener el ganador de la semana anterior
    const { data: winnerData, error: winnerError } = await supabaseAdmin.rpc(
      'get_current_week_winner'
    );

    if (winnerError) {
      console.error('[Cron] Error getting winner:', winnerError);
      return NextResponse.json(
        { error: 'Failed to get winner', details: winnerError.message },
        { status: 500 }
      );
    }

    if (!winnerData || winnerData.length === 0) {
      console.log('[Cron] No sales data for last week');
      return NextResponse.json({
        success: true,
        message: 'No sales data for last week',
        weekStart,
        weekEnd,
      });
    }

    const winner = winnerData[0];

    console.log(`[Cron] Winner found: ${winner.item_name} (${winner.total_quantity_sold} sold)`);

    // Verificar si ya se publicó esta semana
    const { data: existingPublish, error: checkError } = await supabaseAdmin
      .from('weekly_featured_dishes')
      .select('id')
      .eq('week_start_date', weekStart)
      .eq('item_id', winner.item_id)
      .maybeSingle();

    if (checkError) {
      console.error('[Cron] Error checking existing publish:', checkError);
    }

    if (existingPublish) {
      console.log('[Cron] Winner already published for this week');
      return NextResponse.json({
        success: true,
        message: 'Winner already published',
        winner: winner.item_name,
        weekStart,
        weekEnd,
      });
    }

    // Publicar el ganador
    const { data: publishData, error: publishError } = await supabaseAdmin.rpc(
      'publish_weekly_winner',
      {
        p_item_id: winner.item_id,
        p_item_name: winner.item_name,
        p_item_description: winner.item_description || '',
        p_item_price: winner.item_price,
        p_total_orders: winner.total_orders,
        p_total_quantity_sold: winner.total_quantity_sold,
        p_total_revenue: winner.total_revenue,
        p_week_start_date: weekStart,
        p_week_end_date: weekEnd,
        p_item_image: null,
        p_published_by: 'cron-auto',
      }
    );

    if (publishError) {
      console.error('[Cron] Error publishing winner:', publishError);
      return NextResponse.json(
        { error: 'Failed to publish winner', details: publishError.message },
        { status: 500 }
      );
    }

    console.log('[Cron] Winner published successfully:', publishData);

    return NextResponse.json({
      success: true,
      message: 'Weekly winner published successfully',
      winner: {
        id: publishData,
        name: winner.item_name,
        totalSold: winner.total_quantity_sold,
        totalOrders: winner.total_orders,
      },
      weekStart,
      weekEnd,
    });
  } catch (error) {
    console.error('[Cron] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
