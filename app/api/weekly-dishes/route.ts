import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface WeeklyFeaturedDish {
  id: string;
  item_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  item_image?: string;
  week_start_date: string;
  week_end_date: string;
  total_orders: number;
  total_quantity_sold: number;
  total_revenue: number;
  win_count: number;
  is_active: boolean;
  published_at: string;
  published_by?: string;
}

export interface WeekWinner {
  item_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  total_orders: number;
  total_quantity_sold: number;
  total_revenue: number;
  week_start: string;
  week_end: string;
}

/**
 * GET /api/weekly-dishes
 *
 * Obtiene platos destacados de la semana
 *
 * Query params:
 * - type: 'current' | 'history' | 'winner' (default: 'current')
 * - limit: number (solo para type='history', default: 20)
 * - onlyActive: boolean (solo para type='history', default: false)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'current';
    const limit = parseInt(searchParams.get('limit') || '20');
    const onlyActive = searchParams.get('onlyActive') === 'true';

    let data;
    let error;

    switch (type) {
      case 'current':
        // Obtener plato activo actual
        ({ data, error } = await supabaseAdmin.rpc('get_current_featured_dish'));
        break;

      case 'history':
        // Obtener historial de platos destacados
        ({ data, error } = await supabaseAdmin.rpc('get_featured_dishes_history', {
          limit_count: limit,
          only_active: onlyActive,
        }));
        break;

      case 'winner':
        // Obtener ganador de la semana actual (sin publicar)
        ({ data, error } = await supabaseAdmin.rpc('get_current_week_winner'));
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be one of: current, history, winner' },
          { status: 400 }
        );
    }

    if (error) {
      console.error('Error fetching weekly dishes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch weekly dishes', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      type,
      data: data || (type === 'current' ? null : []),
    });
  } catch (error) {
    console.error('Error in weekly dishes API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/weekly-dishes
 *
 * Publica un plato como ganador de la semana
 *
 * Body:
 * {
 *   item_id: string,
 *   item_name: string,
 *   item_description: string,
 *   item_price: number,
 *   item_image?: string,
 *   total_orders: number,
 *   total_quantity_sold: number,
 *   total_revenue: number,
 *   week_start_date: string (ISO date),
 *   week_end_date: string (ISO date),
 *   published_by?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    const requiredFields = [
      'item_id',
      'item_name',
      'item_price',
      'total_orders',
      'total_quantity_sold',
      'total_revenue',
      'week_start_date',
      'week_end_date',
    ];

    const missingFields = requiredFields.filter(field => !(field in body));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const {
      item_id,
      item_name,
      item_description = '',
      item_price,
      item_image = null,
      total_orders,
      total_quantity_sold,
      total_revenue,
      week_start_date,
      week_end_date,
      published_by = null,
    } = body;

    // Publicar el plato ganador
    const { data, error } = await supabaseAdmin.rpc('publish_weekly_winner', {
      p_item_id: item_id,
      p_item_name: item_name,
      p_item_description: item_description,
      p_item_price: item_price,
      p_item_image: item_image,
      p_total_orders: total_orders,
      p_total_quantity_sold: total_quantity_sold,
      p_total_revenue: total_revenue,
      p_week_start_date: week_start_date,
      p_week_end_date: week_end_date,
      p_published_by: published_by,
    });

    if (error) {
      console.error('Error publishing weekly winner:', error);
      return NextResponse.json(
        { error: 'Failed to publish weekly winner', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly winner published successfully',
      id: data,
    });
  } catch (error) {
    console.error('Error in publish weekly dish API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/weekly-dishes
 *
 * Actualiza un plato destacado (por ejemplo, desactivarlo)
 *
 * Body:
 * {
 *   id: string (UUID),
 *   is_active?: boolean,
 *   item_image?: string
 * }
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const { id, ...updates } = body;

    // Actualizar el registro
    const { data, error } = await supabaseAdmin
      .from('weekly_featured_dishes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating weekly dish:', error);
      return NextResponse.json(
        { error: 'Failed to update weekly dish', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly dish updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error in update weekly dish API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
