import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST - Crear nueva sugerencia
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, phone, message, rating, suggestion_type } = body;

    // Validación básica
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'El mensaje es obligatorio' },
        { status: 400 }
      );
    }

    // Validar rating si se proporciona
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    // Validar tipo de sugerencia si se proporciona
    const validTypes = ['general', 'food', 'service', 'atmosphere', 'complaint', 'compliment'];
    if (suggestion_type && !validTypes.includes(suggestion_type)) {
      return NextResponse.json(
        { error: 'Tipo de sugerencia no válido' },
        { status: 400 }
      );
    }

    // Insertar la sugerencia
    const { data, error } = await supabase
      .from('customer_suggestions')
      .insert({
        name: name?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        message: message.trim(),
        rating: rating || null,
        suggestion_type: suggestion_type || 'general',
        is_read: false,
        is_replied: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase al guardar sugerencia:', error);
      return NextResponse.json(
        {
          error: 'Error al guardar la sugerencia',
          details: error.message || 'Error desconocido de la base de datos',
          hint: error.hint || 'Verifica que la tabla customer_suggestions exista en Supabase'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sugerencia enviada correctamente',
      data,
    });
  } catch (error) {
    console.error('Error en POST /api/suggestions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener todas las sugerencias (requiere autenticación)
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const isRead = searchParams.get('is_read');
    const suggestionType = searchParams.get('type');

    let query = supabaseAdmin
      .from('customer_suggestions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filtros opcionales
    if (isRead !== null && isRead !== undefined) {
      query = query.eq('is_read', isRead === 'true');
    }

    if (suggestionType) {
      query = query.eq('suggestion_type', suggestionType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener sugerencias:', error);
      return NextResponse.json(
        { error: 'Error al obtener las sugerencias' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error en GET /api/suggestions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
