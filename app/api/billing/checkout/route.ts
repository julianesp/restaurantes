import { NextResponse } from "next/server";
import { adminCtx } from "@/lib/tenant";
import { startSubscriptionCheckout } from "@/lib/subscriptions";

// POST /api/billing/checkout — inicia el pago de un mes de Brasaya con ePayco Checkout
export async function POST(request: Request) {
  const ctx = await adminCtx({ allowUnpaid: true });
  if (!ctx.ok) return ctx.res;
  const { tenant, email } = ctx;
  if (tenant.plan === "legacy") {
    return NextResponse.json({ error: "Este restaurante no paga suscripción" }, { status: 400 });
  }
  try {
    const origin = new URL(request.url).origin;
    const checkout = await startSubscriptionCheckout(tenant, email, origin);
    return NextResponse.json(checkout);
  } catch (error) {
    console.error("[billing] Error iniciando el pago:", error);
    return NextResponse.json({ error: "No se pudo iniciar el pago con ePayco. Intenta de nuevo." }, { status: 502 });
  }
}
