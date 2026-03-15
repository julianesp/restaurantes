import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Error de configuración de base de datos" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since"); // ISO timestamp para polling incremental
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabaseAdmin
    .from("kitchen_chat")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (since) {
    query = query.gt("created_at", since);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Error de configuración de base de datos" }, { status: 500 });
  }

  const body = await request.json();
  const { sender_role, sender_name, message, order_ref } = body;

  if (!sender_role || !sender_name || !message?.trim()) {
    return NextResponse.json({ error: "sender_role, sender_name y message son requeridos" }, { status: 400 });
  }

  if (!["waiter", "chef"].includes(sender_role)) {
    return NextResponse.json({ error: "sender_role debe ser 'waiter' o 'chef'" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("kitchen_chat")
    .insert({ sender_role, sender_name, message: message.trim(), order_ref: order_ref || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
