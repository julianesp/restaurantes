import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  const email = user.emailAddresses[0]?.emailAddress;
  return email && adminEmails.includes(email);
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const { data, error } = await supabaseAdmin
    .from("waiters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const { name, email, pin } = await request.json();
  if (!name || !email || !pin)
    return NextResponse.json({ error: "Nombre, email y PIN son requeridos" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("waiters")
    .insert({ name, email: email.toLowerCase().trim(), pin, active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const { id, active, pin } = await request.json();
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (active !== undefined) update.active = active;
  if (pin) update.pin = pin;

  const { data, error } = await supabaseAdmin
    .from("waiters").update(update).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const { error } = await supabaseAdmin.from("waiters").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
