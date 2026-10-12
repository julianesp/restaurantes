import { NextResponse } from 'next/server';
import { publicCtx, adminCtx } from '@/lib/tenant';
import { all, insert } from '@/lib/db';

/**
 * GET /api/featured-dishes
 * Obtiene todos los platos destacados activos del restaurante
 */
export async function GET() {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;

    const data = await all(
      'SELECT * FROM featured_dishes WHERE restaurant_id = ? AND is_active = 1 ORDER BY display_order',
      ctx.tenant.id
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in featured dishes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured dishes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/featured-dishes
 * Crea un nuevo plato destacado (solo admin del restaurante)
 */
export async function POST(request: Request) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { name, description, price, image_url, display_order } = await request.json();

    if (!name || !description || !price) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    const data = await insert('featured_dishes', {
      restaurant_id: ctx.tenant.id,
      name,
      description,
      price,
      image_url: image_url || null,
      display_order: display_order || 0,
      is_active: true,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in create featured dish API:', error);
    return NextResponse.json(
      { error: 'Failed to create featured dish', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
