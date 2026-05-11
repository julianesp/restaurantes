import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Obtener menú completo con categorías e items (público)
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 503 }
      );
    }

    // Obtener categorías activas
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoriesError) {
      console.error('Error al obtener categorías:', categoriesError);
      return NextResponse.json(
        { error: 'Error al obtener las categorías' },
        { status: 500 }
      );
    }

    // Obtener todos los items disponibles
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('display_order', { ascending: true });

    if (itemsError) {
      console.error('Error al obtener items:', itemsError);
      return NextResponse.json(
        { error: 'Error al obtener los items del menú' },
        { status: 500 }
      );
    }

    // Agrupar items por categoría
    const menuData = categories.map(category => ({
      id: category.slug,
      name: category.name,
      icon: category.icon,
      color: category.color,
      items: items
        .filter(item => item.category_id === category.id)
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image || null,
          isVegetarian: item.is_vegetarian,
          isSpicy: item.is_spicy
        }))
    }));

    return NextResponse.json(menuData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
