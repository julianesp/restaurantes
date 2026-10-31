// Limpieza periódica (cron diario, worker/index.ts). Solo depende de la base de datos: la entrada
// del Worker no debe cargar Clerk ni next/headers.
import { nowIso, run } from "@/lib/db";

export { purgeRateLimits } from "@/lib/rate-limit";

/** Borra las sesiones de meseros vencidas (lib/waiter-session.ts). */
export async function purgeWaiterSessions(): Promise<number> {
  return run("DELETE FROM waiter_sessions WHERE expires_at < ?", nowIso());
}
