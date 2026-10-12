import { NextRequest, NextResponse } from 'next/server';
import { adminCtx } from '@/lib/tenant';
import { updateOwned, deleteOwned, pick, isUniqueViolation } from '@/lib/db';

const FIELDS = ['name', 'slug', 'icon', 'color', 'display_order', 'is_active'] as const;

// PUT - Actualizar categoría (solo admin del restaurante)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const body = await request.json();
    const { id } = await params;

    const data = await updateOwned('menu_categories', ctx.tenant.id, id, pick(body, FIELDS));
    if (!data) return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese slug' }, { status: 409 });
    }
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json({ error: 'Error al actualizar la categoría' }, { status: 500 });
  }
}

// DELETE - Eliminar categoría (solo admin del restaurante)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { id } = await params;
    await deleteOwned('menu_categories', ctx.tenant.id, id);

    return NextResponse.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json({ error: 'Error al eliminar la categoría' }, { status: 500 });
  }
}
