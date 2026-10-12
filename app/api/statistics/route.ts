import { NextResponse } from 'next/server';
import { adminCtx } from '@/lib/tenant';
import { itemStatistics, topItems, salesSummary, type TimeFilter } from '@/lib/stats';

export type { TimeFilter };

// Los tipos de datos se mantienen en types/statistics.ts

const VALID_TIME_FILTERS: TimeFilter[] = ['today', 'week', 'month', 'all'];
const VALID_TYPES = ['items', 'top', 'summary'];

/**
 * GET /api/statistics
 * Estadísticas de platos vendidos con filtros de tiempo (solo admin: incluye ingresos)
 *
 * Query params:
 * - type: 'items' | 'top' | 'summary' (default: 'items')
 * - timeFilter: 'today' | 'week' | 'month' | 'all' (default: 'all')
 * - limit: number (solo para type='top', default: 10)
 */
export async function GET(request: Request) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'items';
    const timeFilter = (searchParams.get('timeFilter') || 'all') as TimeFilter;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10') || 10, 100);

    if (!VALID_TIME_FILTERS.includes(timeFilter)) {
      return NextResponse.json({ error: 'Invalid timeFilter. Must be one of: today, week, month, all' }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be one of: items, top, summary' }, { status: 400 });
    }

    const id = ctx.tenant.id;
    const data =
      type === 'items' ? await itemStatistics(id, timeFilter)
      : type === 'top' ? await topItems(id, timeFilter, limit)
      : await salesSummary(id, timeFilter);

    return NextResponse.json({ success: true, type, timeFilter, data });
  } catch (error) {
    console.error('Error in statistics API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/** POST: tendencias por fecha (aún no implementado, igual que antes) */
export async function POST() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  return NextResponse.json({ success: false, message: 'Sales trends feature coming soon', data: [] });
}
