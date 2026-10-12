import { NextResponse } from 'next/server';
import { adminCtx } from '@/lib/tenant';
import { updateOwned, deleteOwned, pick } from '@/lib/db';

const FIELDS = ['name', 'description', 'price', 'image_url', 'display_order', 'is_active'] as const;

/**
 * PUT /api/featured-dishes/[id]
 * Actualiza un plato destacado (solo admin del restaurante)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { id } = await params;
    const body = await request.json();

    const data = await updateOwned('featured_dishes', ctx.tenant.id, id, pick(body, FIELDS));
    if (!data) return NextResponse.json({ error: 'Featured dish not found' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in update featured dish API:', error);
    return NextResponse.json(
      { error: 'Failed to update featured dish', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/featured-dishes/[id]
 * Elimina un plato destacado (solo admin del restaurante)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { id } = await params;
    await deleteOwned('featured_dishes', ctx.tenant.id, id);

    return NextResponse.json({ success: true, message: 'Featured dish deleted successfully' });
  } catch (error) {
    console.error('Error in delete featured dish API:', error);
    return NextResponse.json(
      { error: 'Failed to delete featured dish', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
