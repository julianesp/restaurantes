import { NextRequest, NextResponse } from 'next/server';
import { adminCtx } from '@/lib/tenant';
import { first, updateOwned, deleteOwned, pick } from '@/lib/db';

const FIELDS = [
  'category_id', 'name', 'description', 'price', 'is_vegetarian',
  'is_spicy', 'is_available', 'display_order',
] as const;

// PUT - Actualizar item (solo admin del restaurante)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const body = await request.json();
    const { id } = await params;

    // Si cambia de categoría, debe ser una de este restaurante
    if (body.category_id) {
      const category = await first(
        'SELECT id FROM menu_categories WHERE id = ? AND restaurant_id = ?',
        body.category_id,
        ctx.tenant.id
      );
      if (!category) {
        return NextResponse.json({ error: 'Categoría no válida' }, { status: 400 });
      }
    }

    const values = pick(body, FIELDS);
    // `image` se guarda aunque venga null (borrar imagen)
    if ('image' in body) values.image = body.image ?? null;

    const data = await updateOwned('menu_items', ctx.tenant.id, id, values);
    if (!data) return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al actualizar item:', error);
    return NextResponse.json({ error: 'Error al actualizar el item del menú' }, { status: 500 });
  }
}

// DELETE - Eliminar item (solo admin del restaurante)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { id } = await params;
    await deleteOwned('menu_items', ctx.tenant.id, id);

    return NextResponse.json({ message: 'Item eliminado' });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    return NextResponse.json({ error: 'Error al eliminar el item del menú' }, { status: 500 });
  }
}
