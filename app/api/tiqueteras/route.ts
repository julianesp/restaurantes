import { NextResponse } from "next/server";
import { publicCtx, adminCtx, getTenantRole, getVerifiedEmails } from "@/lib/tenant";
import { all, first, insert, deleteOwned, updateOwned, batch, newId, nowIso } from "@/lib/db";

// GET: listar tiqueteras (admin) o buscar las propias por email (cliente autenticado)
export async function GET(request: Request) {
  const ctx = await publicCtx();
  if (!ctx.ok) return ctx.res;
  const { tenant } = ctx;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const id = searchParams.get("id");

  const membership = await getTenantRole(tenant);
  if (!membership) {
    // Un cliente solo puede consultar tiqueteras de sus propios correos verificados
    const myEmails = await getVerifiedEmails();
    if (myEmails.length === 0) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    if (!email || !myEmails.includes(email.toLowerCase().trim())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  const params: string[] = [tenant.id];
  let sql = "SELECT * FROM tiqueteras WHERE restaurant_id = ?";
  if (email) { sql += " AND lower(cliente_email) = lower(?)"; params.push(email.trim()); }
  if (id) { sql += " AND id = ?"; params.push(id); }
  sql += " ORDER BY created_at DESC";

  return NextResponse.json(await all(sql, ...params));
}

// POST: crear nueva tiquetera (admin)
export async function POST(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  const { tenant, email: adminEmail } = ctx;

  const body = await request.json();
  const { cliente_nombre, cliente_email, cliente_telefono, registrada_por, notas } = body;

  if (!cliente_nombre || !cliente_email) {
    return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
  }

  const data = await insert("tiqueteras", {
    restaurant_id: tenant.id,
    cliente_nombre,
    cliente_email: String(cliente_email).toLowerCase().trim(),
    cliente_telefono: cliente_telefono || null,
    comidas_total: 30,
    comidas_usadas: 0,
    activa: true,
    registrada_por: registrada_por || adminEmail,
    notas: notas || null,
  });
  return NextResponse.json(data, { status: 201 });
}

// DELETE: eliminar tiquetera (admin)
export async function DELETE(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  const { tenant } = ctx;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  await deleteOwned("tiqueteras", tenant.id, id);
  return NextResponse.json({ ok: true });
}

// PATCH: descontar comida, recargar o desactivar (admin)
export async function PATCH(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;
  const { tenant, email: adminEmail } = ctx;

  const { id, accion, registrado_por, nota } = await request.json();
  // accion: "descontar" | "recargar" | "desactivar" | "activar"

  if (!id || !accion) return NextResponse.json({ error: "id y accion son requeridos" }, { status: 400 });

  // Obtener tiquetera actual (solo si es de este restaurante)
  const tiquetera = await first<{ id: string; activa: boolean; comidas_usadas: number; comidas_total: number }>(
    "SELECT * FROM tiqueteras WHERE id = ? AND restaurant_id = ?",
    id,
    tenant.id
  );
  if (!tiquetera) return NextResponse.json({ error: "Tiquetera no encontrada" }, { status: 404 });

  const movimiento = (tipo: string, cantidad: number, restantes: number, notaDefault: string | null) => ({
    sql: `INSERT INTO tiquetera_movimientos (id, restaurant_id, tiquetera_id, tipo, cantidad, comidas_restantes, registrado_por, nota, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [newId(), tenant.id, id, tipo, cantidad, restantes, registrado_por || adminEmail, nota || notaDefault, nowIso()],
  });

  if (accion === "descontar") {
    if (!tiquetera.activa) return NextResponse.json({ error: "Tiquetera inactiva" }, { status: 400 });
    if (tiquetera.comidas_usadas >= tiquetera.comidas_total) {
      return NextResponse.json({ error: "Tiquetera sin saldo" }, { status: 400 });
    }

    const restantes = tiquetera.comidas_total - (tiquetera.comidas_usadas + 1);

    // Condición en el UPDATE: dos descuentos simultáneos no pueden pasar del saldo
    // Descuento + movimiento en una sola transacción
    await batch([
      {
        sql: `UPDATE tiqueteras SET comidas_usadas = comidas_usadas + 1
              WHERE id = ? AND restaurant_id = ? AND comidas_usadas < comidas_total`,
        params: [id, tenant.id],
      },
      movimiento("descuento", 1, restantes, null),
    ]);

    const updated = await first("SELECT * FROM tiqueteras WHERE id = ? AND restaurant_id = ?", id, tenant.id);
    return NextResponse.json({ ...updated, comidas_restantes: restantes });
  }

  if (accion === "recargar") {
    await batch([
      {
        sql: "UPDATE tiqueteras SET comidas_usadas = 0, comidas_total = 30, activa = 1 WHERE id = ? AND restaurant_id = ?",
        params: [id, tenant.id],
      },
      movimiento("recarga", 30, 30, "Recarga de 30 comidas"),
    ]);
    return NextResponse.json(await first("SELECT * FROM tiqueteras WHERE id = ? AND restaurant_id = ?", id, tenant.id));
  }

  if (accion === "desactivar" || accion === "activar") {
    const updated = await updateOwned("tiqueteras", tenant.id, id, { activa: accion === "activar" });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
