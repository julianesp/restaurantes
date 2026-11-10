/**
 * Meseros: PIN guardado como HMAC y sesión en el servidor tras validarlo.
 *
 * El PIN se guarda como "h1:" + HMAC(restaurante:PIN) con una clave derivada de APP_SECRET. Es
 * determinista para poder buscar al mesero por su PIN (no hay usuario) y mantener la restricción
 * UNIQUE (restaurant_id, pin). Un PIN antiguo en texto plano se convierte al primer uso.
 *
 * La sesión es un token aleatorio que el navegador envía en la cabecera X-Waiter-Token; en la base
 * solo queda su HMAC. Dura 12 horas (un turno) y muere si el mesero se borra o se desactiva.
 */
import { first, nowIso, run } from "@/lib/db";
import { hmacHex, randomToken } from "@/lib/crypto";
import { currentUser } from "@clerk/nextjs/server";
import { getStaffMember, getTenantRole, publicCtx, type AdminCtx, type Fail, type Tenant } from "@/lib/tenant";
import { NextResponse } from "next/server";

export const WAITER_TOKEN_HEADER = "x-waiter-token";
const SESSION_TTL_MS = 12 * 3600_000;
const HASH_PREFIX = "h1:";

export interface Waiter {
  id: string;
  name: string;
  email: string;
}

/** Valor que se guarda en waiters.pin. */
export async function hashPin(restaurantId: string, pin: string): Promise<string> {
  return HASH_PREFIX + (await hmacHex("waiter-pin", `${restaurantId}:${pin}`));
}

/** Mesero activo del restaurante con ese PIN, o null. */
export async function findWaiterByPin(restaurantId: string, pin: string): Promise<Waiter | null> {
  const hashed = await hashPin(restaurantId, pin);
  const waiter = await first<Waiter>(
    "SELECT id, name, email FROM waiters WHERE restaurant_id = ? AND pin = ? AND active = 1",
    restaurantId, hashed
  );
  if (waiter) return waiter;

  // PIN creado antes del hash: se acepta una vez y se reemplaza por su HMAC
  const legacy = await first<Waiter>(
    "SELECT id, name, email FROM waiters WHERE restaurant_id = ? AND pin = ? AND pin NOT LIKE 'h1:%' AND active = 1",
    restaurantId, pin
  );
  if (legacy) await run("UPDATE waiters SET pin = ? WHERE id = ? AND restaurant_id = ?", hashed, legacy.id, restaurantId);
  return legacy;
}

/** Abre una sesión para el mesero y devuelve el token (solo se muestra esta vez). */
export async function createWaiterSession(restaurantId: string, waiterId: string, now = Date.now()): Promise<string> {
  const token = randomToken();
  await run(
    "INSERT INTO waiter_sessions (token_hash, waiter_id, restaurant_id, expires_at) VALUES (?, ?, ?, ?)",
    await hmacHex("waiter-session", token), waiterId, restaurantId, new Date(now + SESSION_TTL_MS).toISOString()
  );
  return token;
}

/** Mesero de la sesión de la petición, si el token es válido para ESTE restaurante. */
export async function waiterFromRequest(request: Request, tenant: Pick<Tenant, "id">): Promise<Waiter | null> {
  const token = request.headers.get(WAITER_TOKEN_HEADER);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return first<Waiter>(
    `SELECT w.id, w.name, w.email FROM waiter_sessions s
     JOIN waiters w ON w.id = s.waiter_id AND w.restaurant_id = s.restaurant_id
     WHERE s.token_hash = ? AND s.restaurant_id = ? AND s.expires_at > ? AND w.active = 1`,
    await hmacHex("waiter-session", token), tenant.id, nowIso()
  );
}

/** Cierra la sesión del token de la petición. */
export async function endWaiterSession(request: Request, tenant: Pick<Tenant, "id">): Promise<void> {
  const token = request.headers.get(WAITER_TOKEN_HEADER);
  if (!token) return;
  await run("DELETE FROM waiter_sessions WHERE token_hash = ? AND restaurant_id = ?", await hmacHex("waiter-session", token), tenant.id);
}

export type StaffCtx =
  // `via`: "pin" = sesión del PIN (X-Waiter-Token); "account" = su cuenta de Brasaya (correo verificado)
  | { ok: true; tenant: Tenant; kind: "waiter"; waiter: Waiter; via: "pin" | "account" }
  | { ok: true; tenant: Tenant; kind: "chef"; staff: { name: string; email: string } }
  | (AdminCtx & { kind: "admin" });

const staffFail = (error: string, status: number): Fail => ({ ok: false, res: NextResponse.json({ error }, { status }) });

/**
 * Personal del restaurante: un mesero con sesión de PIN (X-Waiter-Token), un mesero o chef con su
 * cuenta (correo verificado, restaurant_members) o un miembro del panel (Clerk). Para lo que
 * comparten, como el chat de cocina o los pedidos de mesa. NO da permisos de administración.
 */
export async function staffCtx(request: Request): Promise<StaffCtx | Fail> {
  if (request.headers.get(WAITER_TOKEN_HEADER)) {
    const base = await publicCtx();
    if (!base.ok) return base;
    const waiter = await waiterFromRequest(request, base.tenant);
    if (!waiter) return staffFail("Sesión de mesero vencida. Ingresa tu PIN de nuevo.", 401);
    return { ok: true, tenant: base.tenant, kind: "waiter", waiter, via: "pin" };
  }

  const base = await publicCtx();
  if (!base.ok) return base;
  if (!(await currentUser())) return staffFail("No autenticado", 401);

  const admin = await getTenantRole(base.tenant);
  if (admin) return { ...base, role: admin.role, email: admin.email, kind: "admin" };

  const member = await getStaffMember(base.tenant);
  if (!member) return staffFail("No autorizado", 403);
  if (member.role === "chef") return { ok: true, tenant: base.tenant, kind: "chef", staff: { name: member.name, email: member.email } };
  return { ok: true, tenant: base.tenant, kind: "waiter", waiter: { id: member.id, name: member.name, email: member.email }, via: "account" };
}

/**
 * Mesero que hace la petición, si lo hay (para atribuirle un pedido de mesa público): por su token de
 * PIN o por su cuenta. `expired`: mandó un token que ya no vale (la pantalla debe pedir el PIN otra vez).
 */
export async function optionalWaiter(request: Request, tenant: Pick<Tenant, "id">): Promise<{ waiter: Waiter | null; expired: boolean }> {
  if (request.headers.get(WAITER_TOKEN_HEADER)) {
    const waiter = await waiterFromRequest(request, tenant);
    return { waiter, expired: !waiter };
  }
  if (!(await currentUser())) return { waiter: null, expired: false };
  const member = await getStaffMember(tenant);
  if (member?.role !== "waiter") return { waiter: null, expired: false };
  return { waiter: { id: member.id, name: member.name, email: member.email }, expired: false };
}
