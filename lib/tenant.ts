import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { first } from "@/lib/db";
import { TENANT_SLUG_HEADER, TENANT_HOST_HEADER, parseHost as parseHostRaw } from "@/lib/tenant-host";
import { billingState } from "@/lib/billing";

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

export {
  ROOT_DOMAIN,
  TENANT_SLUG_HEADER,
  TENANT_HOST_HEADER,
  RESERVED_SLUGS,
  SLUG_REGEX,
  parseHost,
  tenantUrl,
} from "@/lib/tenant-host";

/**
 * Slug del restaurante que se sirve cuando el host no corresponde a ningún
 * tenant (localhost, previews de Vercel). Mantiene funcionando el despliegue actual.
 */
export const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || "";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: "trial" | "active" | "past_due" | "suspended" | "canceled";
  plan: string;
  trial_ends_at: string | null;
  /** Último mes pagado de la suscripción (ver lib/billing.ts) */
  paid_until: string | null;
  owner_email: string;
  custom_domain: string | null;
  settings: Record<string, unknown>;
}

const TENANT_COLUMNS =
  "id, slug, name, status, plan, trial_ends_at, paid_until, owner_email, custom_domain, settings";

// ---------------------------------------------------------------------------
// Búsqueda con caché corta en memoria (por instancia)
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { at: number; tenant: Tenant | null }>();

async function lookup(column: "slug" | "custom_domain", value: string): Promise<Tenant | null> {
  const key = `${column}:${value}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.tenant;

  let tenant: Tenant | null = null;
  try {
    // `column` solo puede ser uno de los dos literales del tipo: no hay entrada de usuario en el SQL
    tenant = await first<Tenant>(`SELECT ${TENANT_COLUMNS} FROM restaurants WHERE ${column} = ?`, value);
  } catch (error) {
    console.error("[tenant] Error buscando restaurante:", error);
    return null;
  }
  cache.set(key, { at: Date.now(), tenant });
  return tenant;
}

/** Restaurante por slug (p. ej. el que llega en el webhook de pagos). */
export const getTenantBySlug = (slug: string) => lookup("slug", slug);

/** Invalida la caché de un restaurante (llamar tras editar su configuración). */
export function invalidateTenantCache(slug?: string) {
  if (!slug) cache.clear();
  else for (const k of cache.keys()) if (k.endsWith(`:${slug}`)) cache.delete(k);
}

/** Restaurante de la petición actual, o null si el host no corresponde a ninguno. */
export async function getTenant(): Promise<Tenant | null> {
  const h = await headers();
  const slug = h.get(TENANT_SLUG_HEADER);
  const customHost = h.get(TENANT_HOST_HEADER);

  let tenant: Tenant | null = null;
  if (slug) tenant = await lookup("slug", slug);
  else if (customHost) tenant = await lookup("custom_domain", customHost);

  if (!tenant && !slug && !customHost && DEFAULT_TENANT_SLUG) {
    tenant = await lookup("slug", DEFAULT_TENANT_SLUG);
  }
  return tenant;
}

/**
 * ¿La petición llega al dominio raíz de la plataforma (brasaya.com / www)? Ahí getTenant() devuelve
 * el restaurante por defecto (DEFAULT_TENANT_SLUG), pero el login y /admin son los de Brasaya.
 */
export async function isPlatformHost(): Promise<boolean> {
  const h = await headers();
  return parseHostRaw(h.get("host")).kind === "platform";
}

/**
 * ¿El restaurante sirve contenido? No, si está suspendido o cancelado (a mano) o si la prueba o el
 * último mes pagado vencieron y pasaron los días de gracia (ver lib/billing.ts).
 */
export function isTenantServing(t: Tenant): boolean {
  return !billingState(t).blocked;
}

// ---------------------------------------------------------------------------
// Autorización
// ---------------------------------------------------------------------------

function platformAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** ¿Es un correo de administración de Brasaya? Esas cuentas analizan restaurantes, no los administran. */
export function isPlatformAdminEmail(email: string): boolean {
  return platformAdminEmails().includes(email.trim().toLowerCase());
}

/** Roles que ADMINISTRAN el restaurante. Los de personal ("waiter", "chef") van aparte: ver StaffRole. */
export type TenantRole = "owner" | "admin" | "platform";
/** Personal que entra con su propia cuenta pero NO administra: solo ve su parte del servicio. */
export type StaffRole = "waiter" | "chef";

/** Correos verificados del usuario autenticado (en minúsculas). */
export async function getVerifiedEmails(): Promise<string[]> {
  const user = await currentUser();
  if (!user) return [];
  return user.emailAddresses
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
}

/** ¿El usuario actual es administrador de la plataforma (ADMIN_EMAILS)? */
export async function isPlatformAdmin(): Promise<boolean> {
  const emails = await getVerifiedEmails();
  const platform = platformAdminEmails();
  return emails.some((e) => platform.includes(e));
}

/**
 * Rol del usuario actual dentro de un restaurante.
 * - "platform": administrador de la plataforma (ADMIN_EMAILS), puede entrar a cualquier restaurante.
 * - "owner" / "admin": miembro del restaurante.
 */
export async function getTenantRole(
  tenant: Tenant
): Promise<{ role: TenantRole; email: string } | null> {
  const emails = await getVerifiedEmails();
  if (emails.length === 0) return null;

  const platform = platformAdminEmails();
  const platformEmail = emails.find((e) => platform.includes(e));
  if (platformEmail) return { role: "platform", email: platformEmail };

  const placeholders = emails.map(() => "?").join(", ");
  const member = await first<{ email: string; role: TenantRole }>(
    // Solo owner/admin: un mesero o chef es miembro, pero nunca administrador (ver getStaffMember)
    `SELECT email, role FROM restaurant_members WHERE restaurant_id = ? AND email IN (${placeholders}) AND role IN ('owner', 'admin') LIMIT 1`,
    tenant.id,
    ...emails
  );
  return member ? { role: member.role, email: member.email } : null;
}

export interface StaffMember {
  id: string;
  role: StaffRole;
  email: string;
  /** Nombre para mostrar: el que puso el dueño, o la parte local del correo. */
  name: string;
}

/**
 * Mesero o chef (con correo verificado) de ESTE restaurante, o null. Solo cuentan los activos.
 * No da ningún permiso de administración: adminCtx() sigue usando getTenantRole().
 */
export async function getStaffMember(tenant: Pick<Tenant, "id">): Promise<StaffMember | null> {
  const emails = await getVerifiedEmails();
  if (emails.length === 0) return null;
  const placeholders = emails.map(() => "?").join(", ");
  const row = await first<{ id: string; email: string; role: StaffRole; name: string | null }>(
    `SELECT id, email, role, name FROM restaurant_members
     WHERE restaurant_id = ? AND email IN (${placeholders}) AND role IN ('waiter', 'chef') AND active = 1 LIMIT 1`,
    tenant.id,
    ...emails
  );
  return row ? { id: row.id, role: row.role, email: row.email, name: row.name?.trim() || row.email.split("@")[0] } : null;
}

// ---------------------------------------------------------------------------
// Contextos para rutas API
// ---------------------------------------------------------------------------
//
//   const ctx = await publicCtx();      // lectura pública del restaurante
//   if (!ctx.ok) return ctx.res;
//   const { tenant } = ctx;
//   await all("SELECT * FROM menu_items WHERE restaurant_id = ?", tenant.id)
//
//   const ctx = await adminCtx();       // requiere ser admin del restaurante
//
// Toda consulta DEBE filtrar por tenant.id (ver lib/db.ts).

export interface PublicCtx {
  ok: true;
  tenant: Tenant;
}
export interface AdminCtx extends PublicCtx {
  role: TenantRole;
  email: string;
}
export interface Fail {
  ok: false;
  res: NextResponse;
}

const fail = (error: string, status: number): Fail => ({
  ok: false,
  res: NextResponse.json({ error }, { status }),
});

export async function publicCtx(): Promise<PublicCtx | Fail> {
  const tenant = await getTenant();
  if (!tenant) return fail("Restaurante no encontrado", 404);
  if (!isTenantServing(tenant)) return fail("Restaurante no disponible", 403);
  return { ok: true, tenant };
}

/**
 * Contexto de administración. `allowUnpaid`: deja entrar aunque la suscripción esté vencida
 * (solo para las rutas de pago, para que el restaurante pueda reactivarse).
 */
export async function adminCtx(opts: { allowUnpaid?: boolean } = {}): Promise<AdminCtx | Fail> {
  let base: PublicCtx | Fail;
  if (opts.allowUnpaid) {
    const tenant = await getTenant();
    base = tenant ? { ok: true, tenant } : fail("Restaurante no encontrado", 404);
  } else {
    base = await publicCtx();
  }
  if (!base.ok) return base;
  const user = await currentUser();
  if (!user) return fail("No autenticado", 401);
  const membership = await getTenantRole(base.tenant);
  if (!membership) return fail("No autorizado", 403);
  return { ...base, role: membership.role, email: membership.email };
}

export interface PlatformCtx {
  ok: true;
  email: string;
}

/** Contexto de las rutas de la plataforma (/api/platform/manage): solo ADMIN_EMAILS. */
export async function platformCtx(): Promise<PlatformCtx | Fail> {
  const emails = await getVerifiedEmails();
  if (emails.length === 0) return fail("No autenticado", 401);
  const platform = platformAdminEmails();
  const email = emails.find((e) => platform.includes(e));
  if (!email) return fail("No autorizado", 403);
  return { ok: true, email };
}
