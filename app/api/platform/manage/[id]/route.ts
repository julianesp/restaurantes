import { NextResponse } from "next/server";
import { platformCtx } from "@/lib/tenant";
import {
  findRestaurant, setSuspended, extendAccess, deleteRestaurant, logPlatformAction, type Result,
} from "@/lib/platform-admin";

type Params = { params: Promise<{ id: string }> };

const reply = (result: Result) =>
  result.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: result.error }, { status: result.status });

// PATCH /api/platform/manage/:id — suspender, reactivar o extender el acceso de un restaurante
export async function PATCH(request: Request, { params }: Params) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;

  const restaurant = await findRestaurant((await params).id);
  if (!restaurant) return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  let result: Result;
  switch (body.action) {
    case "suspend":
      result = await setSuspended(restaurant, true);
      if (result.ok) await logPlatformAction(ctx.email, "suspend", restaurant);
      return reply(result);
    case "reactivate":
      result = await setSuspended(restaurant, false);
      if (result.ok) await logPlatformAction(ctx.email, "reactivate", restaurant);
      return reply(result);
    case "extend":
      result = await extendAccess(restaurant, body);
      if (result.ok) {
        await logPlatformAction(ctx.email, "extend", restaurant, `${body.days} días de ${body.kind === "trial" ? "prueba" : "acceso pagado"}`);
      }
      return reply(result);
    default:
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }
}

// DELETE /api/platform/manage/:id — elimina el restaurante y todos sus datos ({ confirm: slug })
export async function DELETE(request: Request, { params }: Params) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;

  const restaurant = await findRestaurant((await params).id);
  if (!restaurant) return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const result = await deleteRestaurant(restaurant, body.confirm);
  if (result.ok) {
    console.warn(`[platform] ${ctx.email} eliminó el restaurante ${restaurant.slug} (${restaurant.id})`);
    await logPlatformAction(ctx.email, "delete", restaurant, `Subdominio ${restaurant.slug}`);
  }
  return reply(result);
}
