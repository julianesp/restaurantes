import { NextRequest, NextResponse } from 'next/server';
import { adminCtx } from '@/lib/tenant';
import { updateOwned, deleteOwned, pick } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH - Actualizar una sugerencia (marcar como leída, agregar notas, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { id } = await params;
    const updates = pick(await request.json(), ['is_read', 'is_replied', 'admin_notes']);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const data = await updateOwned('customer_suggestions', ctx.tenant.id, id, updates);
    if (!data) return NextResponse.json({ error: 'Sugerencia no encontrada' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Sugerencia actualizada correctamente', data });
  } catch (error) {
    console.error('Error en PATCH /api/suggestions/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar la sugerencia' }, { status: 500 });
  }
}

// DELETE - Eliminar una sugerencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { id } = await params;
    await deleteOwned('customer_suggestions', ctx.tenant.id, id);

    return NextResponse.json({ success: true, message: 'Sugerencia eliminada correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/suggestions/[id]:', error);
    return NextResponse.json({ error: 'Error al eliminar la sugerencia' }, { status: 500 });
  }
}
