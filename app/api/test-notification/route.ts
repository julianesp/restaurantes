import { NextResponse } from 'next/server';
import { sendTestNotification, targetFor } from '../../../lib/notificationService';
import { adminCtx } from '@/lib/tenant';

// GET /api/test-notification — el admin de un restaurante envía una prueba a SU chat de Telegram
export async function GET() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const result = await sendTestNotification(targetFor(ctx.tenant));
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
