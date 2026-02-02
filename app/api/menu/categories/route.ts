import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';

// GET - Obtener todas las categorías activas (público)
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error al obtener categorías:', error);
      return NextResponse.json(
        { error: 'Error al obtener las categorías' },
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

// POST - Crear nueva categoría (solo admin)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar si es admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, icon, color, display_order } = body;

    // Validaciones
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nombre y slug son requeridos' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 503 }
      );
    }

    // Insertar en la base de datos usando service role
    const { data, error } = await supabaseAdmin
      .from('menu_categories')
      .insert({
        name,
        slug,
        icon: icon || 'UtensilsCrossed',
        color: color || 'text-gray-600',
        display_order: display_order || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear categoría:', error);
      return NextResponse.json(
        { error: 'Error al crear la categoría' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
