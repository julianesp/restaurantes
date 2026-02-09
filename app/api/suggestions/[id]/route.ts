import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// PATCH - Actualizar una sugerencia (marcar como leída, agregar notas, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { is_read, is_replied, admin_notes } = body;

    const updates: any = {};

    if (is_read !== undefined) {
      updates.is_read = is_read;
    }

    if (is_replied !== undefined) {
      updates.is_replied = is_replied;
    }

    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('customer_suggestions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar sugerencia:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la sugerencia' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Sugerencia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sugerencia actualizada correctamente',
      data,
    });
  } catch (error) {
    console.error('Error en PATCH /api/suggestions/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una sugerencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 500 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('customer_suggestions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar sugerencia:', error);
      return NextResponse.json(
        { error: 'Error al eliminar la sugerencia' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sugerencia eliminada correctamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/suggestions/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
