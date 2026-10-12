import { NextResponse } from "next/server";
import { publicCtx } from "@/lib/tenant";
import { first } from "@/lib/db";

// POST: verificar PIN del mesero dentro del restaurante actual (ruta pública)
export async function POST(request: Request) {
  const ctx = await publicCtx();
  if (!ctx.ok) return ctx.res;

  const { pin } = await request.json();
  if (!pin) return NextResponse.json({ error: "PIN requerido" }, { status: 400 });

  const waiter = await first(
    "SELECT id, name, email, active FROM waiters WHERE restaurant_id = ? AND pin = ? AND active = 1",
    ctx.tenant.id,
    String(pin)
  );

  if (!waiter) return NextResponse.json({ error: "PIN incorrecto o mesero inactivo" }, { status: 401 });
  return NextResponse.json({ ok: true, waiter });
}
