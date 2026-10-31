import { NextResponse } from "next/server";
import { all, insert } from "@/lib/db";
import { staffCtx } from "@/lib/waiter-session";

// Chat interno entre meseros y cocina: solo personal del restaurante, sea un miembro del panel
// (/admin/chat, Clerk) o un mesero con la sesión de su PIN (/mesero/chat, cabecera X-Waiter-Token).

export async function GET(request: Request) {
  const ctx = await staffCtx(request);
  if (!ctx.ok) return ctx.res;

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since"); // ISO timestamp para polling incremental
  const limit = Math.min(parseInt(searchParams.get("limit") || "50") || 50, 200);

  const params: Array<string | number> = [ctx.tenant.id];
  let sql = "SELECT * FROM kitchen_chat WHERE restaurant_id = ?";
  if (since) {
    sql += " AND created_at > ?";
    params.push(since);
  }
  sql += " ORDER BY created_at LIMIT ?";
  params.push(limit);

  return NextResponse.json(await all(sql, ...params));
}

export async function POST(request: Request) {
  const ctx = await staffCtx(request);
  if (!ctx.ok) return ctx.res;

  const body = await request.json();
  const { message, order_ref } = body;
  // Un mesero escribe siempre como mesero y con su nombre: no puede hacerse pasar por la cocina
  const sender_role = ctx.kind === "waiter" ? "waiter" : body.sender_role;
  const sender_name = ctx.kind === "waiter" ? ctx.waiter.name : String(body.sender_name ?? "").trim();

  if (!sender_role || !sender_name || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "sender_role, sender_name y message son requeridos" }, { status: 400 });
  }
  if (!["waiter", "chef"].includes(sender_role)) {
    return NextResponse.json({ error: "sender_role debe ser 'waiter' o 'chef'" }, { status: 400 });
  }

  const data = await insert("kitchen_chat", {
    restaurant_id: ctx.tenant.id,
    sender_role,
    sender_name,
    message: message.trim().slice(0, 1000),
    order_ref: order_ref ? String(order_ref).slice(0, 60) : null,
  });
  return NextResponse.json(data, { status: 201 });
}
