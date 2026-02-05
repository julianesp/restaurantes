import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Tipos para las estadísticas
export interface ItemStatistic {
  item_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  order_count: number;
  total_quantity_sold: number;
  total_revenue: number;
  first_ordered_at: string;
  last_ordered_at: string;
  avg_quantity_per_order: number;
}

export interface TopItem {
  item_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  order_count: number;
  total_quantity_sold: number;
  total_revenue: number;
  rank_position: number;
}

export interface SalesSummary {
  total_orders: number;
  total_items_sold: number;
  total_revenue: number;
  unique_items_count: number;
  avg_order_value: number;
  most_popular_item: string;
  most_popular_item_quantity: number;
}

export type TimeFilter = 'today' | 'week' | 'month' | 'all';

/**
 * GET /api/statistics
 *
 * Obtiene estadísticas de platos vendidos con filtros de tiempo
 *
 * Query params:
 * - type: 'items' | 'top' | 'summary' (default: 'items')
 * - timeFilter: 'today' | 'week' | 'month' | 'all' (default: 'all')
 * - limit: number (solo para type='top', default: 10)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'items';
    const timeFilter = (searchParams.get('timeFilter') || 'all') as TimeFilter;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validar timeFilter
    const validTimeFilters: TimeFilter[] = ['today', 'week', 'month', 'all'];
    if (!validTimeFilters.includes(timeFilter)) {
      return NextResponse.json(
        { error: 'Invalid timeFilter. Must be one of: today, week, month, all' },
        { status: 400 }
      );
    }

    // Validar type
    const validTypes = ['items', 'top', 'summary'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: items, top, summary' },
        { status: 400 }
      );
    }

    let data;
    let error;

    console.log(`[Statistics API] Request: type=${type}, timeFilter=${timeFilter}, limit=${limit}`);

    switch (type) {
      case 'items':
        // Obtener todas las estadísticas de items
        ({ data, error } = await supabaseAdmin.rpc('get_item_statistics', {
          time_filter: timeFilter,
        }));
        console.log(`[Statistics API] Items result:`, { dataCount: data?.length, error: error?.message });
        break;

      case 'top':
        // Obtener top N items más vendidos
        ({ data, error } = await supabaseAdmin.rpc('get_top_items', {
          time_filter: timeFilter,
          limit_count: limit,
        }));
        console.log(`[Statistics API] Top result:`, { dataCount: data?.length, error: error?.message });
        break;

      case 'summary':
        // Obtener resumen de ventas
        ({ data, error } = await supabaseAdmin.rpc('get_sales_summary', {
          time_filter: timeFilter,
        }));
        console.log(`[Statistics API] Summary result:`, { dataCount: data?.length, error: error?.message });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    if (error) {
      console.error('Error fetching statistics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch statistics', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      type,
      timeFilter,
      data: data || [],
    });
  } catch (error) {
    console.error('Error in statistics API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET estadísticas para gráficos de tendencias por fecha
 *
 * Query params:
 * - startDate: fecha de inicio (ISO string)
 * - endDate: fecha de fin (ISO string)
 * - groupBy: 'day' | 'week' | 'month' (default: 'day')
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startDate, endDate, groupBy = 'day' } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Query para obtener tendencias por fecha
    const { data, error } = await supabaseAdmin.rpc('get_sales_trends', {
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
    });

    if (error) {
      // Si la función no existe aún, retornar un mensaje informativo
      console.warn('Sales trends function not implemented yet:', error);
      return NextResponse.json({
        success: false,
        message: 'Sales trends feature coming soon',
        data: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error in trends API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
