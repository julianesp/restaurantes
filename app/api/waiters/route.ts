import { NextResponse } from "next/server";
import { adminCtx } from "@/lib/tenant";
import { all, insert, updateOwned, deleteOwned, isUniqueViolation } from "@/lib/db";
import { isValidPin, PIN_RULE_TEXT } from "@/lib/waiter-pin";
import { hashPin } from "@/lib/waiter-session";

/** Fila de mesero sin el hash del PIN. */
const withoutPin = ({ pin: _pin, ...waiter }: Record<string, unknown>) => waiter;

export async function GET() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  return NextResponse.json(
    // El PIN no sale nunca: se guarda como HMAC y no se puede mostrar
    await all("SELECT id, name, email, active, created_at FROM waiters WHERE restaurant_id = ? ORDER BY created_at DESC", ctx.tenant.id)
  );
}

export async function POST(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const { name, email, pin } = await request.json();
  if (!name || !email || !pin)
    return NextResponse.json({ error: "Nombre, email y PIN son requeridos" }, { status: 400 });
  if (!isValidPin(String(pin))) return NextResponse.json({ error: PIN_RULE_TEXT }, { status: 400 });

  try {
    const data = await insert("waiters", {
      restaurant_id: ctx.tenant.id,
      name,
      email: String(email).toLowerCase().trim(),
      pin: await hashPin(ctx.tenant.id, String(pin)),
      active: true,
    });
    return NextResponse.json(withoutPin(data), { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error))
      return NextResponse.json({ error: "El correo o el PIN ya están en uso" }, { status: 409 });
    throw error;
  }
}

export async function PATCH(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const { id, active, pin } = await request.json();
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  if (pin !== undefined && !isValidPin(String(pin)))
    return NextResponse.json({ error: PIN_RULE_TEXT }, { status: 400 });

  const update: Record<string, string | boolean> = {};
  if (active !== undefined) update.active = !!active;
  if (pin) update.pin = await hashPin(ctx.tenant.id, String(pin));

  try {
    const data = await updateOwned("waiters", ctx.tenant.id, id, update);
    if (!data) return NextResponse.json({ error: "Mesero no encontrado" }, { status: 404 });
    return NextResponse.json(withoutPin(data));
  } catch (error) {
    if (isUniqueViolation(error))
      return NextResponse.json({ error: "Ese PIN ya está en uso" }, { status: 409 });
    throw error;
  }
}

export async function DELETE(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  await deleteOwned("waiters", ctx.tenant.id, id);
  return NextResponse.json({ ok: true });
}
