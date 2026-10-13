import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { sendBillingReminders } from '@/lib/whatsapp';

/**
 * GET /api/cron/billing-reminders
 *
 * Disparo manual de los recordatorios de pago por WhatsApp que el cron de Cloudflare envía
 * cada día (ver worker/index.ts). Es idempotente: un aviso ya enviado no se repite.
 *
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = (env as unknown as { CRON_SECRET?: string }).CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 });
  }
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await sendBillingReminders();
    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error('[Cron] billing reminders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
