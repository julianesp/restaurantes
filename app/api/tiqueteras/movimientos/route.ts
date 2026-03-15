import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const tiqueteraId = searchParams.get("tiquetera_id");

  if (!tiqueteraId) return NextResponse.json({ error: "tiquetera_id requerido" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("tiquetera_movimientos")
    .select("*")
    .eq("tiquetera_id", tiqueteraId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
