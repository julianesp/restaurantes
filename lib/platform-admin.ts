import { env } from "cloudflare:workers";
import { first, run, batch, all, nowIso } from "@/lib/db";
import { invalidateTenantCache, isPlatformAdminEmail } from "@/lib/tenant";
import { MONTHLY_PRICE_COP, nextPeriod } from "@/lib/billing";

/**
 * Acciones de los administradores de la plataforma (ADMIN_EMAILS) sobre cualquier restaurante,
 * desde /panel. Las rutas que las usan exigen platformCtx(). El demo (plan legacy) no se puede
 * suspender, extender ni borrar.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_EXTEND_DAYS = 365;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ManagedRestaurant {
  id: string;
  slug: string;
  name: string;
  status: string;
  plan: string;
  trial_ends_at: string | null;
  paid_until: string | null;
}

export type Result = { ok: true } | { ok: false; error: string; status: number };

/** Medios de pago que se registran a mano (lo que no pasa por ePayco). */
export const MANUAL_METHODS = {
  nequi: "Nequi",
  daviplata: "Daviplata",
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo",
  cortesia: "Cortesía (sin cobro)",
} as const;
export type ManualMethod = keyof typeof MANUAL_METHODS;
const err = (error: string, status = 400): Result => ({ ok: false, error, status });

export const findRestaurant = (id: string) =>
  first<ManagedRestaurant>(
    "SELECT id, slug, name, status, plan, trial_ends_at, paid_until FROM restaurants WHERE id = ?",
    id
  );

const later = (a: string | null, b: string | null) => (!a ? b : !b ? a : a > b ? a : b);

/** Nueva fecha de acceso: `days` días desde la mayor entre hoy y el acceso vigente. */
export function extendedDate(r: Pick<ManagedRestaurant, "trial_ends_at" | "paid_until">, days: number, now = new Date()): string {
  const current = later(r.trial_ends_at, r.paid_until);
  const base = current && new Date(current) > now ? new Date(current) : now;
  return new Date(base.getTime() + days * DAY_MS).toISOString();
}

export async function setSuspended(r: ManagedRestaurant, suspended: boolean): Promise<Result> {
  if (r.plan === "legacy") return err("El restaurante de demostración no se puede suspender");
  // Al reactivar, el estado real lo vuelven a decidir las fechas (lib/billing.ts)
  const status = suspended ? "suspended" : r.paid_until ? "active" : "trial";
  await run("UPDATE restaurants SET status = ?, updated_at = ? WHERE id = ?", status, nowIso(), r.id);
  invalidateTenantCache(r.slug);
  return { ok: true };
}

export async function extendAccess(r: ManagedRestaurant, input: { days?: unknown; kind?: unknown }): Promise<Result> {
  if (r.plan === "legacy") return err("El restaurante de demostración no tiene vencimiento");
  const days = Number(input.days);
  if (!Number.isInteger(days) || days < 1 || days > MAX_EXTEND_DAYS) {
    return err(`Los días deben ser un número entero entre 1 y ${MAX_EXTEND_DAYS}`);
  }
  if (input.kind !== "trial" && input.kind !== "paid") return err("Tipo de extensión no válido");
  // Columna fija según el tipo: nunca viene texto del cliente al SQL
  const column = input.kind === "trial" ? "trial_ends_at" : "paid_until";
  await run(`UPDATE restaurants SET ${column} = ?, updated_at = ? WHERE id = ?`, extendedDate(r, days), nowIso(), r.id);
  invalidateTenantCache(r.slug);
  return { ok: true };
}

/** Borra el restaurante y todo lo suyo (las tablas cuelgan de restaurants con ON DELETE CASCADE) y sus imágenes de R2. */
export async function deleteRestaurant(r: ManagedRestaurant, confirm: unknown): Promise<Result> {
  if (r.plan === "legacy") return err("El restaurante de demostración no se puede eliminar");
  if (confirm !== r.slug) return err("Escribe el subdominio exacto del restaurante para confirmar");

  await run("DELETE FROM restaurants WHERE id = ?", r.id);
  invalidateTenantCache(r.slug);

  // Después de la base de datos: si R2 falla quedan imágenes huérfanas, no un restaurante a medias
  const bucket = (env as unknown as { MEDIA?: R2Bucket }).MEDIA;
  if (bucket) {
    try {
      let cursor: string | undefined;
      do {
        const page = await bucket.list({ prefix: `${r.id}/`, cursor });
        if (page.objects.length) await bucket.delete(page.objects.map((o) => o.key));
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);
    } catch (error) {
      console.error("[platform] No se pudieron borrar las imágenes de", r.id, error);
    }
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Miembros (quién puede entrar al panel del restaurante)
// ---------------------------------------------------------------------------

export interface Member {
  email: string;
  role: "owner" | "admin";
  created_at: string;
}

export const listMembers = (restaurantId: string) =>
  all<Member>(
    // Solo quienes administran: meseros y chefs (rol waiter/chef) son equipo, no miembros del panel
    "SELECT email, role, created_at FROM restaurant_members WHERE restaurant_id = ? AND role IN ('owner', 'admin') ORDER BY role DESC, created_at",
    restaurantId
  );

// La cuenta de Brasaya analiza todos los restaurantes desde /panel: nunca es dueña ni miembro de uno
const PLATFORM_EMAIL_ERROR = "Ese correo es de administración de Brasaya: analiza los restaurantes desde el panel, no puede ser miembro";

const normalizeEmail = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");

export async function addMember(r: ManagedRestaurant, rawEmail: unknown): Promise<Result> {
  const email = normalizeEmail(rawEmail);
  if (!EMAIL_REGEX.test(email) || email.length > 254) return err("Correo no válido");
  if (isPlatformAdminEmail(email)) return err(PLATFORM_EMAIL_ERROR);
  const exists = await first("SELECT 1 AS x FROM restaurant_members WHERE restaurant_id = ? AND email = ?", r.id, email);
  if (exists) return err("Ese correo ya es miembro del restaurante", 409);
  await run(
    "INSERT INTO restaurant_members (id, restaurant_id, email, role, created_at) VALUES (?, ?, ?, 'admin', ?)",
    crypto.randomUUID(), r.id, email, nowIso()
  );
  return { ok: true };
}

export async function removeMember(r: ManagedRestaurant, rawEmail: unknown): Promise<Result> {
  const email = normalizeEmail(rawEmail);
  const member = await first<Member>(
    "SELECT email, role, created_at FROM restaurant_members WHERE restaurant_id = ? AND email = ?",
    r.id, email
  );
  if (!member) return err("Ese correo no es miembro del restaurante", 404);
  if (member.role === "owner") return err("No se puede quitar al dueño: primero pasa la propiedad a otro miembro");
  await run("DELETE FROM restaurant_members WHERE restaurant_id = ? AND email = ?", r.id, email);
  return { ok: true };
}

/** Pasa la propiedad a otro miembro: el dueño anterior queda como administrador. */
export async function transferOwnership(r: ManagedRestaurant, rawEmail: unknown): Promise<Result> {
  const email = normalizeEmail(rawEmail);
  const member = await first<Member>(
    "SELECT email, role, created_at FROM restaurant_members WHERE restaurant_id = ? AND email = ?",
    r.id, email
  );
  if (isPlatformAdminEmail(email)) return err(PLATFORM_EMAIL_ERROR);
  if (!member) return err("Primero agrega ese correo como miembro", 404);
  if (member.role === "owner") return { ok: true };
  // Un mesero o chef no puede heredar el restaurante sin pasar por administrador
  if ((member.role as string) === "waiter" || (member.role as string) === "chef") {
    return err("Esa persona es mesero o chef del equipo: quítala y agrégala como administrador primero");
  }
  const now = nowIso();
  await batch([
    { sql: "UPDATE restaurant_members SET role = 'admin' WHERE restaurant_id = ? AND role = 'owner'", params: [r.id] },
    { sql: "UPDATE restaurant_members SET role = 'owner' WHERE restaurant_id = ? AND email = ?", params: [r.id, email] },
    { sql: "UPDATE restaurants SET owner_email = ?, updated_at = ? WHERE id = ?", params: [email, now, r.id] },
  ]);
  invalidateTenantCache(r.slug);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Pagos registrados a mano
// ---------------------------------------------------------------------------

export type ManualPaymentResult =
  | { ok: true; reference: string; periodEnd: string }
  | { ok: false; error: string; status: number };

/**
 * Registra un pago recibido por fuera de ePayco (tras verificarlo en Nequi, el banco…) y suma los meses
 * de la misma forma que un pago en línea: desde la fecha mayor entre hoy y el acceso vigente.
 */
export async function registerManualPayment(
  r: ManagedRestaurant,
  input: { months?: unknown; amount?: unknown; method?: unknown; notes?: unknown },
  adminEmail: string,
  now = new Date()
): Promise<ManualPaymentResult> {
  if (r.plan === "legacy") return { ok: false, error: "El restaurante de demostración no paga", status: 400 };
  const months = Number(input.months);
  if (!Number.isInteger(months) || months < 1 || months > 12) {
    return { ok: false, error: "Los meses deben ser un número entero entre 1 y 12", status: 400 };
  }
  if (typeof input.method !== "string" || !(input.method in MANUAL_METHODS)) {
    return { ok: false, error: "Medio de pago no válido", status: 400 };
  }
  const method = input.method as ManualMethod;
  const amount = method === "cortesia" ? 0 : Number(input.amount);
  if (!Number.isInteger(amount) || amount < 0 || amount > MONTHLY_PRICE_COP * 12 * 2) {
    return { ok: false, error: "Monto no válido", status: 400 };
  }
  if (method !== "cortesia" && amount === 0) return { ok: false, error: "Escribe el monto recibido", status: 400 };
  const notes = typeof input.notes === "string" ? input.notes.trim().slice(0, 200) || null : null;

  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const reference = `MANUAL-${r.slug}-${stamp}-${crypto.randomUUID().slice(0, 8)}`.toUpperCase();
  const period = nextPeriod(r, months, now);
  const at = now.toISOString();

  await batch([
    {
      sql: `INSERT INTO subscription_payments
              (id, restaurant_id, reference, amount, months, status, payment_method, period_start, period_end, created_by, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'approved', ?, ?, ?, ?, ?, ?, ?)`,
      params: [crypto.randomUUID(), r.id, reference, amount, months, `manual:${method}`, period.start, period.end, adminEmail, notes, at, at],
    },
    {
      // Igual que un pago en línea: no levanta una suspensión manual
      sql: `UPDATE restaurants
            SET paid_until = ?, status = CASE WHEN status IN ('suspended', 'canceled') THEN status ELSE 'active' END, updated_at = ?
            WHERE id = ?`,
      params: [period.end, at, r.id],
    },
  ]);
  invalidateTenantCache(r.slug);
  return { ok: true, reference, periodEnd: period.end };
}

// ---------------------------------------------------------------------------
// Registro de actividad (/panel/actividad)
// ---------------------------------------------------------------------------

export const AUDIT_ACTIONS = {
  suspend: "Suspendió",
  reactivate: "Reactivó",
  extend: "Extendió el acceso",
  delete: "Eliminó el restaurante",
  member_add: "Agregó un miembro",
  member_remove: "Quitó un miembro",
  owner_transfer: "Cambió el dueño",
  manual_payment: "Registró un pago manual",
  reconcile: "Reconcilió un pago de ePayco",
} as const;
export type AuditAction = keyof typeof AUDIT_ACTIONS;

/** Guarda una acción de un administrador de la plataforma. Nunca hace fallar la acción. */
export async function logPlatformAction(
  adminEmail: string,
  action: AuditAction,
  restaurant: Pick<ManagedRestaurant, "id" | "name"> | null,
  detail?: string
): Promise<void> {
  try {
    await run(
      `INSERT INTO platform_audit (id, admin_email, action, restaurant_id, restaurant_name, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      crypto.randomUUID(), adminEmail, action, restaurant?.id ?? null, restaurant?.name ?? null,
      detail ? detail.slice(0, 300) : null, nowIso()
    );
  } catch (error) {
    console.error("[platform] No se pudo guardar la actividad:", error);
  }
}
