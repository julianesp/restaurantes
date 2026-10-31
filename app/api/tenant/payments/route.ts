import { NextResponse } from "next/server";
import { adminCtx } from "@/lib/tenant";
import { deletePaymentAccount, paymentAccountStatus, savePaymentAccount } from "@/lib/payment-accounts";

// Cuenta de ePayco del restaurante (/admin/configuracion). Las llaves nunca vuelven al navegador.

// GET: ¿hay cuenta conectada? (solo una pista de la llave pública)
export async function GET() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  return NextResponse.json(await paymentAccountStatus(ctx.tenant.id));
}

// PUT: conectar o reemplazar la cuenta. Las llaves se prueban contra ePayco antes de guardarlas.
export async function PUT(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  if (ctx.role !== "owner" && ctx.role !== "platform") {
    return NextResponse.json({ error: "Solo el dueño del restaurante puede conectar la cuenta de pagos" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const result = await savePaymentAccount(ctx.tenant, body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result.status);
}

// DELETE: desconectar la cuenta (los clientes vuelven a pedir por WhatsApp)
export async function DELETE() {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  if (ctx.role !== "owner" && ctx.role !== "platform") {
    return NextResponse.json({ error: "Solo el dueño del restaurante puede desconectar la cuenta de pagos" }, { status: 403 });
  }
  await deletePaymentAccount(ctx.tenant);
  return NextResponse.json({ configured: false, publicKeyHint: null, verifiedAt: null });
}
