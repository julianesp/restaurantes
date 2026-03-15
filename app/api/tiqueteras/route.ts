import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET: listar tiqueteras (admin) o buscar por email (cliente)
export async function GET(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const id = searchParams.get("id");

  let query = supabaseAdmin
    .from("tiqueteras")
    .select("*")
    .order("created_at", { ascending: false });

  if (email) query = query.ilike("cliente_email", email);
  if (id) query = query.eq("id", id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: crear nueva tiquetera
export async function POST(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const body = await request.json();
  const { cliente_nombre, cliente_email, cliente_telefono, registrada_por, notas } = body;

  if (!cliente_nombre || !cliente_email || !registrada_por) {
    return NextResponse.json({ error: "Nombre, email y registrada_por son requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("tiqueteras")
    .insert({
      cliente_nombre,
      cliente_email: cliente_email.toLowerCase().trim(),
      cliente_telefono: cliente_telefono || null,
      comidas_total: 30,
      comidas_usadas: 0,
      activa: true,
      registrada_por,
      notas: notas || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH: descontar comida, recargar o desactivar
export async function PATCH(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Error de configuración" }, { status: 500 });

  const body = await request.json();
  const { id, accion, registrado_por, nota } = body;
  // accion: "descontar" | "recargar" | "desactivar" | "activar"

  if (!id || !accion) return NextResponse.json({ error: "id y accion son requeridos" }, { status: 400 });

  // Obtener tiquetera actual
  const { data: tiquetera, error: fetchError } = await supabaseAdmin
    .from("tiqueteras")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !tiquetera) return NextResponse.json({ error: "Tiquetera no encontrada" }, { status: 404 });

  if (accion === "descontar") {
    if (!tiquetera.activa) return NextResponse.json({ error: "Tiquetera inactiva" }, { status: 400 });
    if (tiquetera.comidas_usadas >= tiquetera.comidas_total) {
      return NextResponse.json({ error: "Tiquetera sin saldo" }, { status: 400 });
    }

    const nuevasUsadas = tiquetera.comidas_usadas + 1;
    const restantes = tiquetera.comidas_total - nuevasUsadas;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("tiqueteras")
      .update({ comidas_usadas: nuevasUsadas })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    // Registrar movimiento
    await supabaseAdmin.from("tiquetera_movimientos").insert({
      tiquetera_id: id,
      tipo: "descuento",
      cantidad: 1,
      comidas_restantes: restantes,
      registrado_por: registrado_por || "Sistema",
      nota: nota || null,
    });

    return NextResponse.json({ ...updated, comidas_restantes: restantes });
  }

  if (accion === "recargar") {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("tiqueteras")
      .update({ comidas_usadas: 0, comidas_total: 30, activa: true })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    await supabaseAdmin.from("tiquetera_movimientos").insert({
      tiquetera_id: id,
      tipo: "recarga",
      cantidad: 30,
      comidas_restantes: 30,
      registrado_por: registrado_por || "Sistema",
      nota: nota || "Recarga de 30 comidas",
    });

    return NextResponse.json(updated);
  }

  if (accion === "desactivar" || accion === "activar") {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("tiqueteras")
      .update({ activa: accion === "activar" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
