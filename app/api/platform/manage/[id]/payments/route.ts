import { NextResponse } from "next/server";
import { platformCtx } from "@/lib/tenant";
import { findRestaurant, registerManualPayment, logPlatformAction, MANUAL_METHODS } from "@/lib/platform-admin";

// POST /api/platform/manage/:id/payments — registra un pago recibido por fuera de ePayco (Nequi, efectivo…) y suma los meses
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;

  const restaurant = await findRestaurant((await params).id);
  if (!restaurant) return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const result = await registerManualPayment(restaurant, body, ctx.email);
  if (result.ok) {
    const method = MANUAL_METHODS[body.method as keyof typeof MANUAL_METHODS];
    await logPlatformAction(ctx.email, "manual_payment", restaurant, `${body.months} mes(es), ${method}, $${body.amount ?? 0} · ${result.reference}`);
  }
  return result.ok
    ? NextResponse.json(result)
    : NextResponse.json({ error: result.error }, { status: result.status });
}
