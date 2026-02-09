import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/statistics/predictive
 *
 * Obtiene estadísticas predictivas para preparar platos con anticipación
 *
 * Query params:
 * - type: 'dishes' | 'hourly' | 'customer-favorites' (default: 'dishes')
 * - daysToAnalyze: number (default: 30)
 * - minFrequency: number (0-1, default: 0.3)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dishes';
    const daysToAnalyze = parseInt(searchParams.get('daysToAnalyze') || '30');
    const minFrequency = parseFloat(searchParams.get('minFrequency') || '0.3');
    const timeFilter = searchParams.get('timeFilter') || 'week';

    console.log(`[Predictive API] Request: type=${type}, days=${daysToAnalyze}, minFreq=${minFrequency}`);

    let data;
    let error;

    switch (type) {
      case 'dishes':
        // Análisis predictivo de platos para preparar con anticipación
        ({ data, error } = await supabaseAdmin.rpc('get_predictive_dish_analysis', {
          days_to_analyze: daysToAnalyze,
          min_frequency_score: minFrequency,
        }));
        console.log(`[Predictive API] Dishes result:`, { dataCount: data?.length, error: error?.message });
        break;

      case 'hourly':
        // Patrones de pedidos por hora
        ({ data, error } = await supabaseAdmin.rpc('get_hourly_order_patterns', {
          time_filter: timeFilter,
        }));
        console.log(`[Predictive API] Hourly result:`, { dataCount: data?.length, error: error?.message });
        break;

      case 'customer-favorites':
        // Platos favoritos de clientes frecuentes
        ({ data, error } = await supabaseAdmin.rpc('get_customer_favorite_patterns', {
          days_to_analyze: daysToAnalyze,
        }));
        console.log(`[Predictive API] Customer favorites result:`, { dataCount: data?.length, error: error?.message });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Must be one of: dishes, hourly, customer-favorites' },
          { status: 400 }
        );
    }

    if (error) {
      console.error('Error fetching predictive statistics:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch predictive statistics',
          details: error.message,
          hint: 'Make sure you have run the supabase-predictive-statistics.sql file in your Supabase SQL editor'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      type,
      data: data || [],
    });
  } catch (error) {
    console.error('Error in predictive statistics API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
