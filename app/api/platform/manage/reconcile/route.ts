import { NextResponse } from "next/server";
import { platformCtx } from "@/lib/tenant";
import { first } from "@/lib/db";
import { validateTransaction } from "@/lib/epayco";
import { applySubscriptionPayment } from "@/lib/subscriptions";
import { logPlatformAction } from "@/lib/platform-admin";

const REF = /^[A-Za-z0-9_-]{4,64}$/;

/**
 * POST /api/platform/manage/reconcile { refPayco, apply? }
 * Sin `apply`: consulta la transacción en ePayco y muestra a qué pago y restaurante corresponde.
 * Con `apply: true`: la aplica con la misma lógica (y las mismas validaciones) que el webhook.
 */
export async function POST(request: Request) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;

  const body = await request.json().catch(() => ({}));
  const refPayco = typeof body.refPayco === "string" ? body.refPayco.trim() : "";
  if (!REF.test(refPayco)) return NextResponse.json({ error: "Referencia de ePayco no válida" }, { status: 400 });

  if (body.apply === true) {
    const result = await applySubscriptionPayment(refPayco);
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });
    console.warn(`[platform] ${ctx.email} reconcilió el pago ePayco ${refPayco}: ${result.status}`);
    await logPlatformAction(ctx.email, "reconcile", null, `ref_payco ${refPayco}: ${result.status}`);
    return NextResponse.json(result);
  }

  const tx = await validateTransaction(refPayco);
  if (!tx) return NextResponse.json({ error: "ePayco no encontró esa transacción" }, { status: 404 });
  const reference = (tx.extra1 || tx.invoice || "").toUpperCase();
  const payment = reference
    ? await first<{ status: string; amount: number; name: string; slug: string }>(
        `SELECT p.status, p.amount, r.name, r.slug FROM subscription_payments p
         JOIN restaurants r ON r.id = p.restaurant_id WHERE p.reference = ?`,
        reference
      )
    : null;

  return NextResponse.json({
    transaction: {
      refPayco: tx.refPayco,
      reference,
      amount: tx.amount,
      currency: tx.currency,
      approved: tx.codResponse === 1,
      codResponse: tx.codResponse,
      state: tx.state,
      method: tx.method,
      isTest: tx.isTest,
    },
    payment,
  });
}
