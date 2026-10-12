import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { publishWeeklyWinners } from '@/lib/cron';

/**
 * GET /api/cron/publish-weekly-winner
 *
 * Disparo manual del mismo trabajo que ejecuta el cron de Cloudflare cada lunes
 * (ver worker/index.ts). Exige CRON_SECRET: sin él el endpoint queda cerrado.
 *
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  try {
    const secret = (env as unknown as { CRON_SECRET?: string }).CRON_SECRET;
    if (!secret) {
      console.error('[Cron] CRON_SECRET no está configurado');
      return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { weekStart, weekEnd, results } = await publishWeeklyWinners();
    return NextResponse.json({ success: true, weekStart, weekEnd, processed: results.length, results });
  } catch (error) {
    console.error('[Cron] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
