import { NextResponse } from "next/server";
import { adminCtx } from "@/lib/tenant";
import { billingState, GRACE_DAYS, MONTHLY_PRICE_COP } from "@/lib/billing";
import { listPayments } from "@/lib/subscriptions";

// GET /api/billing — estado de la suscripción del restaurante y sus pagos (admin, aunque esté vencido)
export async function GET() {
  const ctx = await adminCtx({ allowUnpaid: true });
  if (!ctx.ok) return ctx.res;
  const { tenant } = ctx;
  const payments = await listPayments(tenant.id);
  return NextResponse.json({
    name: tenant.name,
    plan: tenant.plan,
    price: MONTHLY_PRICE_COP,
    graceDays: GRACE_DAYS,
    state: billingState(tenant),
    payments,
  });
}
