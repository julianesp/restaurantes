import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';

// GET - Obtener todos los items del menú (público)
// Opcionalmente filtrar por categoría usando query param ?category_id=xxx
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('menu_items')
      .select('*, menu_categories(*)')
      .eq('is_available', true)
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener items:', error);
      return NextResponse.json(
        { error: 'Error al obtener los items del menú' },
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

// POST - Crear nuevo item (solo admin)
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
    const {
      category_id,
      name,
      description,
      price,
      image,
      is_vegetarian,
      is_spicy,
      display_order
    } = body;

    // Validaciones
    if (!category_id || !name || !price) {
      return NextResponse.json(
        { error: 'Categoría, nombre y precio son requeridos' },
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
      .from('menu_items')
      .insert({
        category_id,
        name,
        description: description || '',
        price,
        image: image || null,
        is_vegetarian: is_vegetarian || false,
        is_spicy: is_spicy || false,
        is_available: true,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear item:', error);
      return NextResponse.json(
        { error: 'Error al crear el item del menú' },
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
