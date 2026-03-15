import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Error de configuración de base de datos" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("daily_specials")
    .select("*")
    .order("created_at", { ascending: false });

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
  const { name, description, price, category, created_by } = body;

  if (!name || !description || !price) {
    return NextResponse.json({ error: "Nombre, descripción y precio son requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("daily_specials")
    .insert({ name, description, price, category: category || "Almuerzo", available: true, created_by: created_by || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Error de configuración de base de datos" }, { status: 500 });
  }

  const body = await request.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("daily_specials")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Error de configuración de base de datos" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("daily_specials")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
