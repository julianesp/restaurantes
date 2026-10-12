import { NextResponse } from "next/server";
import { publicCtx } from "@/lib/tenant";
import { all, insert } from "@/lib/db";

export async function GET(request: Request) {
  const ctx = await publicCtx();
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
  const ctx = await publicCtx();
  if (!ctx.ok) return ctx.res;

  const { sender_role, sender_name, message, order_ref } = await request.json();

  if (!sender_role || !sender_name || !message?.trim()) {
    return NextResponse.json({ error: "sender_role, sender_name y message son requeridos" }, { status: 400 });
  }
  if (!["waiter", "chef"].includes(sender_role)) {
    return NextResponse.json({ error: "sender_role debe ser 'waiter' o 'chef'" }, { status: 400 });
  }

  const data = await insert("kitchen_chat", {
    restaurant_id: ctx.tenant.id,
    sender_role,
    sender_name,
    message: message.trim(),
    order_ref: order_ref || null,
  });
  return NextResponse.json(data, { status: 201 });
}
