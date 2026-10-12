import { NextResponse } from 'next/server';
import { publicCtx } from '@/lib/tenant';
import { getFullMenu } from '@/lib/menu';

// GET - Menú completo del restaurante con categorías e items (público)
export async function GET() {
  try {
    const ctx = await publicCtx();
    if (!ctx.ok) return ctx.res;

    return NextResponse.json(await getFullMenu(ctx.tenant.id));
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
