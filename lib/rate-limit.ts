/**
 * Límite de intentos con ventana fija, guardado en D1 (tabla rate_limits, migración 0004).
 * D1 es compartido por todas las instancias del Worker, a diferencia de un contador en memoria.
 *
 * Uso: `hit()` ANTES de la operación (cuenta el intento de forma atómica, así que peticiones en
 * paralelo no se saltan el límite) y `release()` si salió bien, para que solo cuenten los fallos.
 */
import { first, run } from "@/lib/db";

export interface LimitResult {
  allowed: boolean;
  /** Intentos en la ventana actual, incluido este. */
  count: number;
  /** Segundos hasta que se reinicia la ventana. */
  retryAfter: number;
}

/** Cuenta un intento para `key` y dice si sigue dentro de `max` por ventana de `windowMs`. */
export async function hit(key: string, max: number, windowMs: number, now = Date.now()): Promise<LimitResult> {
  const expired = now - windowMs;
  const row = await first<{ count: number; window_start: number }>(
    `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN window_start <= ? THEN 1 ELSE count + 1 END,
       window_start = CASE WHEN window_start <= ? THEN excluded.window_start ELSE window_start END
     RETURNING count, window_start`,
    key, now, expired, expired
  );
  const count = row?.count ?? 1;
  const windowStart = row?.window_start ?? now;
  return {
    allowed: count <= max,
    count,
    retryAfter: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)),
  };
}

/** Descuenta un intento que salió bien (no baja de 0). */
export async function release(key: string): Promise<void> {
  await run("UPDATE rate_limits SET count = MAX(count - 1, 0) WHERE key = ?", key);
}

/** Borra las ventanas que vencieron hace más de `olderThanMs` (lo llama el cron diario). */
export async function purgeRateLimits(olderThanMs = 24 * 3600_000, now = Date.now()): Promise<number> {
  return run("DELETE FROM rate_limits WHERE window_start < ?", now - olderThanMs);
}

/** IP del cliente según Cloudflare (en desarrollo no viene: todos comparten "local"). */
export function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || "local";
}
