import { NextResponse } from "next/server";
import { publicCtx } from "@/lib/tenant";
import { first } from "@/lib/db";
import { clientIp, hit, release } from "@/lib/rate-limit";

// Límite de intentos fallidos de PIN (ventana de 15 minutos):
// por IP dentro del restaurante, y por restaurante en total (frena ataques desde muchas IPs).
const PIN_WINDOW_MS = 15 * 60_000;
const PIN_MAX_PER_IP = 5;
const PIN_MAX_PER_RESTAURANT = 30;

// POST: verificar PIN del mesero dentro del restaurante actual (ruta pública)
export async function POST(request: Request) {
  const ctx = await publicCtx();
  if (!ctx.ok) return ctx.res;

  const { pin } = await request.json();
  if (!pin) return NextResponse.json({ error: "PIN requerido" }, { status: 400 });

  // Se cuenta el intento antes de comprobar el PIN y se descuenta si es correcto
  const keys = [`pin:ip:${ctx.tenant.id}:${clientIp(request)}`, `pin:rest:${ctx.tenant.id}`];
  const [byIp, byRestaurant] = await Promise.all([
    hit(keys[0], PIN_MAX_PER_IP, PIN_WINDOW_MS),
    hit(keys[1], PIN_MAX_PER_RESTAURANT, PIN_WINDOW_MS),
  ]);
  if (!byIp.allowed || !byRestaurant.allowed) {
    const retryAfter = Math.max(byIp.allowed ? 0 : byIp.retryAfter, byRestaurant.allowed ? 0 : byRestaurant.retryAfter);
    const minutes = Math.ceil(retryAfter / 60);
    return NextResponse.json(
      { error: `Demasiados intentos. Intenta de nuevo en ${minutes} ${minutes === 1 ? "minuto" : "minutos"}.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const waiter = await first(
    "SELECT id, name, email, active FROM waiters WHERE restaurant_id = ? AND pin = ? AND active = 1",
    ctx.tenant.id,
    String(pin)
  );

  if (!waiter) return NextResponse.json({ error: "PIN incorrecto o mesero inactivo" }, { status: 401 });
  await Promise.all(keys.map(release));
  return NextResponse.json({ ok: true, waiter });
}
