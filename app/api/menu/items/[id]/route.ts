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

// PUT - Actualizar item (solo admin)
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
    const {
      category_id,
      name,
      description,
      price,
      image,
      is_vegetarian,
      is_spicy,
      is_available,
      display_order
    } = body;
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update({
        category_id,
        name,
        description,
        price,
        image: image ?? null,
        is_vegetarian,
        is_spicy,
        is_available,
        display_order
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar item:', error);
      return NextResponse.json(
        { error: 'Error al actualizar el item del menú' },
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

// DELETE - Eliminar item (solo admin)
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
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar item:', error);
      return NextResponse.json(
        { error: 'Error al eliminar el item del menú' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Item eliminado' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
