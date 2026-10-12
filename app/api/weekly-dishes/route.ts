import { NextResponse } from 'next/server';
import { publicCtx, adminCtx } from '@/lib/tenant';
import { updateOwned, pick } from '@/lib/db';
import {
  currentFeaturedDish, featuredDishesHistory, currentWeekWinner, publishWeeklyWinner,
} from '@/lib/weekly';

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
 * Query params:
 * - type: 'current' | 'history' | 'winner' (default: 'current')
 * - limit / onlyActive: solo para type='history'
 *
 * 'current' e 'history' son públicos (se muestran en la landing);
 * 'winner' expone ventas de la semana en curso y es solo para admins.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'current';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20') || 20, 100);
    const onlyActive = searchParams.get('onlyActive') === 'true';

    if (!['current', 'history', 'winner'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be one of: current, history, winner' }, { status: 400 });
    }

    const ctx = type === 'winner' ? await adminCtx() : await publicCtx();
    if (!ctx.ok) return ctx.res;
    const id = ctx.tenant.id;

    const data =
      type === 'current' ? (await currentFeaturedDish(id)) ?? null
      : type === 'history' ? await featuredDishesHistory(id, limit, onlyActive)
      : await currentWeekWinner(id);

    return NextResponse.json({ success: true, type, data });
  } catch (error) {
    console.error('Error in weekly dishes API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/** POST /api/weekly-dishes — publica un plato como ganador de la semana (admin) */
export async function POST(request: Request) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const body = await request.json();
    const required = [
      'item_id', 'item_name', 'item_price', 'total_orders', 'total_quantity_sold',
      'total_revenue', 'week_start_date', 'week_end_date',
    ];
    const missing = required.filter((field) => !(field in body));
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    const id = await publishWeeklyWinner(ctx.tenant.id, {
      item_id: body.item_id,
      item_name: body.item_name,
      item_description: body.item_description ?? '',
      item_price: body.item_price,
      item_image: body.item_image ?? null,
      total_orders: body.total_orders,
      total_quantity_sold: body.total_quantity_sold,
      total_revenue: body.total_revenue,
      week_start_date: body.week_start_date,
      week_end_date: body.week_end_date,
      published_by: ctx.email,
    });

    return NextResponse.json({ success: true, message: 'Weekly winner published successfully', id });
  } catch (error) {
    console.error('Error in publish weekly dish API:', error);
    return NextResponse.json(
      { error: 'Failed to publish weekly winner', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/** PATCH /api/weekly-dishes — actualiza un plato destacado (p. ej. desactivarlo) (admin) */
export async function PATCH(request: Request) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });

    const data = await updateOwned('weekly_featured_dishes', ctx.tenant.id, body.id, pick(body, ['is_active', 'item_image']));
    if (!data) return NextResponse.json({ error: 'Weekly dish not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Weekly dish updated successfully', data });
  } catch (error) {
    console.error('Error in update weekly dish API:', error);
    return NextResponse.json(
      { error: 'Failed to update weekly dish', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
