import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';

// Función helper para verificar si es admin
async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  const userEmail = user.emailAddresses[0]?.emailAddress;

  return userEmail && adminEmails.includes(userEmail);
}

// PUT - Actualizar categoría (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, slug, icon, color, display_order, is_active } = body;
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('menu_categories')
      .update({
        name,
        slug,
        icon,
        color,
        display_order,
        is_active
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar categoría:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la categoría' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoría (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 503 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('menu_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar categoría:', error);
      return NextResponse.json(
        { error: 'Error al eliminar la categoría' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
