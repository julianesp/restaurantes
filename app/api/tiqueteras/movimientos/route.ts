import { NextResponse } from "next/server";
import { publicCtx, getTenantRole, getVerifiedEmails } from "@/lib/tenant";
import { all, first } from "@/lib/db";

// GET: movimientos de una tiquetera (admin, o el cliente dueño de la tiquetera)
export async function GET(request: Request) {
  const ctx = await publicCtx();
  if (!ctx.ok) return ctx.res;
  const { tenant } = ctx;

  const { searchParams } = new URL(request.url);
  const tiqueteraId = searchParams.get("tiquetera_id");

  if (!tiqueteraId) return NextResponse.json({ error: "tiquetera_id requerido" }, { status: 400 });

  // La tiquetera debe ser de este restaurante
  const tiquetera = await first<{ id: string; cliente_email: string }>(
    "SELECT id, cliente_email FROM tiqueteras WHERE id = ? AND restaurant_id = ?",
    tiqueteraId,
    tenant.id
  );

  if (!tiquetera) return NextResponse.json({ error: "Tiquetera no encontrada" }, { status: 404 });

  const membership = await getTenantRole(tenant);
  if (!membership) {
    const myEmails = await getVerifiedEmails();
    if (myEmails.length === 0) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    if (!myEmails.includes(String(tiquetera.cliente_email).toLowerCase())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  return NextResponse.json(
    await all(
      "SELECT * FROM tiquetera_movimientos WHERE tiquetera_id = ? AND restaurant_id = ? ORDER BY created_at DESC LIMIT 50",
      tiqueteraId,
      tenant.id
    )
  );
}
