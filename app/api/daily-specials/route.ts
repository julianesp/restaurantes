import { NextResponse } from "next/server";
import { publicCtx, adminCtx } from "@/lib/tenant";
import { all, insert, updateOwned, deleteOwned, pick } from "@/lib/db";

const FIELDS = ["name", "description", "price", "category", "available"] as const;

// GET - Platos del día del restaurante (público)
export async function GET() {
  const ctx = await publicCtx();
  if (!ctx.ok) return ctx.res;

  const data = await all(
    "SELECT * FROM daily_specials WHERE restaurant_id = ? ORDER BY created_at DESC",
    ctx.tenant.id
  );
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const { name, description, price, category } = await request.json();

  if (!name || !description || !price) {
    return NextResponse.json({ error: "Nombre, descripción y precio son requeridos" }, { status: 400 });
  }

  const data = await insert("daily_specials", {
    restaurant_id: ctx.tenant.id,
    name,
    description,
    price,
    category: category || "Almuerzo",
    available: true,
    created_by: ctx.email,
  });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const data = await updateOwned("daily_specials", ctx.tenant.id, body.id, pick(body, FIELDS));
  if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const ctx = await adminCtx();
  if (!ctx.ok) return ctx.res;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await deleteOwned("daily_specials", ctx.tenant.id, id);
  return NextResponse.json({ success: true });
}
