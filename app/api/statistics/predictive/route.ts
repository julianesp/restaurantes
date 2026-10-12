import { NextResponse } from 'next/server';
import { adminCtx } from '@/lib/tenant';
import { predictiveDishes, hourlyPatterns, type TimeFilter } from '@/lib/stats';

/**
 * GET /api/statistics/predictive (solo admin)
 *
 * Query params:
 * - type: 'dishes' | 'hourly' | 'customer-favorites' (default: 'dishes')
 * - daysToAnalyze: number (default: 30)
 * - minFrequency: number (0-1, default: 0.3)
 * - timeFilter: 'today' | 'week' | 'month' | 'all' (solo 'hourly', default: 'week')
 *
 * 'customer-favorites' devuelve vacío: los pedidos no guardan identidad de cliente,
 * así que no se puede calcular sin inventar datos.
 */
export async function GET(request: Request) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dishes';
    const days = Math.min(Math.max(parseInt(searchParams.get('daysToAnalyze') || '30') || 30, 1), 365);
    const minFrequency = Math.min(Math.max(parseFloat(searchParams.get('minFrequency') || '0.3') || 0.3, 0), 1);
    const timeFilter = (searchParams.get('timeFilter') || 'week') as TimeFilter;

    let data: unknown[];
    switch (type) {
      case 'dishes':
        data = await predictiveDishes(ctx.tenant.id, days, minFrequency);
        break;
      case 'hourly':
        data = await hourlyPatterns(ctx.tenant.id, timeFilter);
        break;
      case 'customer-favorites':
        data = [];
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Must be one of: dishes, hourly, customer-favorites' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, type, data });
  } catch (error) {
    console.error('Error in predictive statistics API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
