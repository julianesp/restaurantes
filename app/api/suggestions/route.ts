import { NextRequest, NextResponse } from 'next/server';
import { publicCtx, adminCtx } from '@/lib/tenant';
import { all, insert } from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['general', 'food', 'service', 'atmosphere', 'complaint', 'compliment'];

// POST - Crear nueva sugerencia (público, dentro del restaurante actual)
export async function POST(request: NextRequest) {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;

    const { name, email, phone, message, rating, suggestion_type } = await request.json();

    if (!message || String(message).trim().length === 0) {
      return NextResponse.json({ error: 'El mensaje es obligatorio' }, { status: 400 });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'La calificación debe estar entre 1 y 5' }, { status: 400 });
    }
    if (suggestion_type && !VALID_TYPES.includes(suggestion_type)) {
      return NextResponse.json({ error: 'Tipo de sugerencia no válido' }, { status: 400 });
    }

    const data = await insert('customer_suggestions', {
      restaurant_id: ctx.tenant.id,
      name: name?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      message: String(message).trim(),
      rating: rating || null,
      suggestion_type: suggestion_type || 'general',
      is_read: false,
      is_replied: false,
    });

    return NextResponse.json({ success: true, message: 'Sugerencia enviada correctamente', data });
  } catch (error) {
    console.error('Error en POST /api/suggestions:', error);
    return NextResponse.json({ error: 'Error al guardar la sugerencia' }, { status: 500 });
  }
}

// GET - Obtener las sugerencias del restaurante (solo admin)
export async function GET(request: NextRequest) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50') || 50, 200);
    const isRead = searchParams.get('is_read');
    const suggestionType = searchParams.get('type');

    const params: Array<string | number> = [ctx.tenant.id];
    let sql = 'SELECT * FROM customer_suggestions WHERE restaurant_id = ?';
    if (isRead !== null) { sql += ' AND is_read = ?'; params.push(isRead === 'true' ? 1 : 0); }
    if (suggestionType) { sql += ' AND suggestion_type = ?'; params.push(suggestionType); }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const data = await all(sql, ...params);
    return NextResponse.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Error en GET /api/suggestions:', error);
    return NextResponse.json({ error: 'Error al obtener las sugerencias' }, { status: 500 });
  }
}
