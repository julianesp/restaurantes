import { NextRequest, NextResponse } from 'next/server';
import { publicCtx, adminCtx } from '@/lib/tenant';
import { all, insert, isUniqueViolation } from '@/lib/db';

// GET - Obtener todas las categorías activas del restaurante (público)
export async function GET() {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;

    const data = await all(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? AND is_active = 1 ORDER BY display_order',
      ctx.tenant.id
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error al obtener las categorías' }, { status: 500 });
  }
}

// POST - Crear nueva categoría (solo admin del restaurante)
export async function POST(request: NextRequest) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { name, slug, icon, color, display_order } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 });
    }

    const data = await insert('menu_categories', {
      restaurant_id: ctx.tenant.id,
      name,
      slug,
      icon: icon || 'UtensilsCrossed',
      color: color || 'text-gray-600',
      display_order: display_order || 0,
      is_active: true,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese slug' }, { status: 409 });
    }
    console.error('Error al crear categoría:', error);
    return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 });
  }
}
