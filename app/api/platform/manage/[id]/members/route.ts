import { NextResponse } from "next/server";
import { platformCtx } from "@/lib/tenant";
import {
  findRestaurant, listMembers, addMember, removeMember, transferOwnership, logPlatformAction, type Result,
  type AuditAction,
} from "@/lib/platform-admin";

type Params = { params: Promise<{ id: string }> };

type Restaurant = NonNullable<Awaited<ReturnType<typeof findRestaurant>>>;

async function reply(result: Result, r: Restaurant, log: { email: string; action: AuditAction; target: unknown }) {
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  await logPlatformAction(log.email, log.action, r, String(log.target ?? "").trim().toLowerCase());
  return NextResponse.json({ members: await listMembers(r.id) });
}

async function load(params: Params["params"]) {
  const restaurant = await findRestaurant((await params).id);
  return restaurant ?? NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
}

// GET /api/platform/manage/:id/members — quién puede administrar el restaurante
export async function GET(_request: Request, { params }: Params) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;
  const r = await load(params);
  if (r instanceof NextResponse) return r;
  return NextResponse.json({ members: await listMembers(r.id) });
}

// POST { email } — agrega un administrador
export async function POST(request: Request, { params }: Params) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;
  const r = await load(params);
  if (r instanceof NextResponse) return r;
  const body = await request.json().catch(() => ({}));
  return reply(await addMember(r, body.email), r, { email: ctx.email, action: "member_add", target: body.email });
}

// PATCH { email } — lo convierte en dueño (el anterior queda como administrador)
export async function PATCH(request: Request, { params }: Params) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;
  const r = await load(params);
  if (r instanceof NextResponse) return r;
  const body = await request.json().catch(() => ({}));
  return reply(await transferOwnership(r, body.email), r, { email: ctx.email, action: "owner_transfer", target: body.email });
}

// DELETE { email } — quita a un administrador (no al dueño)
export async function DELETE(request: Request, { params }: Params) {
  const ctx = await platformCtx();
  if (!ctx.ok) return ctx.res;
  const r = await load(params);
  if (r instanceof NextResponse) return r;
  const body = await request.json().catch(() => ({}));
  return reply(await removeMember(r, body.email), r, { email: ctx.email, action: "member_remove", target: body.email });
}
