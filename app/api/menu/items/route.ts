import { NextRequest, NextResponse } from 'next/server';
import { publicCtx, adminCtx } from '@/lib/tenant';
import { all, first, insert } from '@/lib/db';

// GET - Items del menú del restaurante (público), con su categoría anidada
// Opcionalmente filtrar por categoría usando query param ?category_id=xxx
export async function GET(request: NextRequest) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;

    const categoryId = new URL(request.url).searchParams.get('category_id');

    const params: string[] = [ctx.tenant.id];
    let sql = `SELECT i.*, c.id AS c_id, c.name AS c_name, c.slug AS c_slug, c.icon AS c_icon,
                      c.color AS c_color, c.display_order AS c_order, c.is_active AS c_active
               FROM menu_items i
               LEFT JOIN menu_categories c ON c.id = i.category_id
               WHERE i.restaurant_id = ? AND i.is_available = 1`;
    if (categoryId) {
      sql += ' AND i.category_id = ?';
      params.push(categoryId);
    }
    sql += ' ORDER BY i.display_order';

    const rows = await all<Record<string, unknown>>(sql, ...params);

    // Misma forma que devolvía la API anterior: item + menu_categories anidado
    const data = rows.map((row) => {
      const { c_id, c_name, c_slug, c_icon, c_color, c_order, c_active, ...item } = row;
      return {
        ...item,
        menu_categories: c_id
          ? { id: c_id, name: c_name, slug: c_slug, icon: c_icon, color: c_color, display_order: c_order, is_active: c_active === 1 }
          : null,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al obtener items:', error);
    return NextResponse.json({ error: 'Error al obtener los items del menú' }, { status: 500 });
  }
}

// POST - Crear nuevo item (solo admin del restaurante)
export async function POST(request: NextRequest) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const {
      category_id, name, description, price, image,
      is_vegetarian, is_spicy, display_order,
    } = await request.json();

    if (!category_id || !name || !price) {
      return NextResponse.json({ error: 'Categoría, nombre y precio son requeridos' }, { status: 400 });
    }

    // La categoría debe pertenecer a este restaurante
    const category = await first(
      'SELECT id FROM menu_categories WHERE id = ? AND restaurant_id = ?',
      category_id,
      ctx.tenant.id
    );
    if (!category) {
      return NextResponse.json({ error: 'Categoría no válida' }, { status: 400 });
    }

    const data = await insert('menu_items', {
      restaurant_id: ctx.tenant.id,
      category_id,
      name,
      description: description || '',
      price,
      image: image || null,
      is_vegetarian: !!is_vegetarian,
      is_spicy: !!is_spicy,
      is_available: true,
      display_order: display_order || 0,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error al crear item:', error);
    return NextResponse.json({ error: 'Error al crear el item del menú' }, { status: 500 });
  }
}
