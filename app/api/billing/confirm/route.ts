import { NextResponse } from "next/server";
import { adminCtx } from "@/lib/tenant";
import { billingState } from "@/lib/billing";
import { applySubscriptionPayment } from "@/lib/subscriptions";
import { first } from "@/lib/db";

// POST /api/billing/confirm { ref_payco } — al volver de ePayco, valida el pago contra su API y lo
// aplica (por si el webhook aún no llegó). Idempotente: el webhook y esta ruta suman el mes una sola vez.
export async function POST(request: Request) {
  const ctx = await adminCtx({ allowUnpaid: true });
  if (!ctx.ok) return ctx.res;
  const { tenant } = ctx;

  const body = (await request.json().catch(() => ({}))) as { ref_payco?: unknown };
  const refPayco = typeof body.ref_payco === "string" ? body.ref_payco.trim() : "";
  if (!refPayco) return NextResponse.json({ error: "Falta ref_payco" }, { status: 400 });

  const result = await applySubscriptionPayment(refPayco, tenant.id);

  // Estado actualizado (sin caché) para que el panel lo refleje de inmediato
  const fresh = await first<{ status: string; plan: string; trial_ends_at: string | null; paid_until: string | null }>(
    "SELECT status, plan, trial_ends_at, paid_until FROM restaurants WHERE id = ?",
    tenant.id,
  );
  return NextResponse.json({ result, state: fresh ? billingState(fresh) : null }, { status: result.ok ? 200 : 400 });
}
