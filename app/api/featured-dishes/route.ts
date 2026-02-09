import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/featured-dishes
 * Obtiene todos los platos destacados activos
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('featured_dishes')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured dishes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch featured dishes', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error in featured dishes API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/featured-dishes
 * Crea un nuevo plato destacado
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, image_url, display_order } = body;

    if (!name || !description || !price) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('featured_dishes')
      .insert([
        {
          name,
          description,
          price,
          image_url: image_url || null,
          display_order: display_order || 0,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating featured dish:', error);
      return NextResponse.json(
        { error: 'Failed to create featured dish', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in create featured dish API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
