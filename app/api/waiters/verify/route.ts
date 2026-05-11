import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST: verificar PIN del mesero (ruta pública)
export async function POST(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const { pin } = await request.json();
  if (!pin) return NextResponse.json({ error: "PIN requerido" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("waiters")
    .select("id, name, email, active")
    .eq("pin", pin)
    .eq("active", true)
    .single();

  if (error || !data) return NextResponse.json({ error: "PIN incorrecto o mesero inactivo" }, { status: 401 });

  return NextResponse.json({ ok: true, waiter: data });
}
