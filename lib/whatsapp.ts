/**
 * Mensajes automáticos de Brasaya por WhatsApp (API de WhatsApp Cloud de Meta).
 *
 * Un solo número de la plataforma (secretos WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID) envía a
 * cada restaurante sus avisos al número que configuró en /admin/configuracion (settings.whatsapp_alerts;
 * llenarlo es su consentimiento). Los mensajes que inicia un negocio deben usar plantillas aprobadas
 * por Meta: sus nombres están en TEMPLATES y su texto en docs/whatsapp.md.
 *
 * Sin los secretos todo se omite en silencio (igual que Telegram). Cada envío queda en
 * whatsapp_messages: la dedupe_key evita repetir un aviso y el webhook actualiza su estado.
 */
import { all, first, isUniqueViolation, nowIso, run } from "@/lib/db";
import { billingState, formatBillingDate, MONTHLY_PRICE_LABEL } from "@/lib/billing";
import { tenantUrl } from "@/lib/tenant-host";
import type { Tenant } from "@/lib/tenant";

const GRAPH_URL = "https://graph.facebook.com/v23.0";
const LANGUAGE = "es";

/** Plantillas de categoría "Utilidad" registradas en la cuenta de WhatsApp Business de Brasaya. */
export const TEMPLATES = {
  nuevoPedido: "brasaya_nuevo_pedido",
  recordatorioPago: "brasaya_recordatorio_pago",
  prueba: "brasaya_alertas_activadas",
} as const;

/** Tope de avisos de pedido por restaurante y hora (notify-order es público: evita abusos y costos). */
const ORDER_ALERTS_PER_HOUR = 60;

type Kind = "nuevo_pedido" | "recordatorio_pago" | "prueba";

export type SendResult =
  | { ok: true; wamid: string }
  | { ok: false; skipped?: boolean; error: string };

const log = (...args: unknown[]) => console.log("[WHATSAPP]", ...args);

export function whatsappAvailable(): boolean {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Número en formato internacional sin "+" (lo que espera la API). Un celular colombiano de
 * 10 dígitos (3xx…) recibe el indicativo 57. Devuelve null si no parece un número válido.
 */
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  if (/^3\d{9}$/.test(digits)) return `57${digits}`;
  if (/^\d{8,15}$/.test(digits)) return digits;
  return null;
}

/** Número de alertas del restaurante (null si no activó los avisos por WhatsApp). */
export function alertsPhone(tenant: Pick<Tenant, "settings">): string | null {
  return normalizePhone(tenant.settings?.whatsapp_alerts);
}

// Los parámetros de plantilla no admiten saltos de línea, tabulaciones ni más de 4 espacios seguidos
const param = (value: string | number) => {
  const text = String(value).replace(/[\n\r\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 300);
  return { type: "text", text: text || "-" };
};

async function sendTemplate(to: string, template: string, params: Array<string | number>): Promise<SendResult> {
  try {
    const res = await fetch(`${GRAPH_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: LANGUAGE },
          components: params.length ? [{ type: "body", parameters: params.map(param) }] : [],
        },
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      messages?: Array<{ id: string }>;
      error?: { message?: string; code?: number };
    };
    const wamid = body.messages?.[0]?.id;
    if (!res.ok || !wamid) {
      return { ok: false, error: body.error?.message || `HTTP ${res.status}` };
    }
    return { ok: true, wamid };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Error de conexión" };
  }
}

/** Envía una plantilla y la registra. Con `dedupeKey`, un segundo intento del mismo aviso se omite. */
async function deliver(opts: {
  restaurantId: string | null;
  kind: Kind;
  to: string;
  template: string;
  params: Array<string | number>;
  dedupeKey?: string;
}): Promise<SendResult> {
  if (!whatsappAvailable()) return { ok: false, skipped: true, error: "WhatsApp no está configurado en la plataforma" };

  const id = crypto.randomUUID();
  try {
    await run(
      "INSERT INTO whatsapp_messages (id, restaurant_id, kind, dedupe_key, to_phone, template) VALUES (?, ?, ?, ?, ?, ?)",
      id, opts.restaurantId, opts.kind, opts.dedupeKey ?? null, opts.to, opts.template
    );
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, skipped: true, error: "Aviso ya enviado" };
    throw error;
  }

  const result = await sendTemplate(opts.to, opts.template, opts.params);
  await run(
    "UPDATE whatsapp_messages SET wamid = ?, status = ?, error = ?, updated_at = ? WHERE id = ?",
    result.ok ? result.wamid : null,
    result.ok ? "sent" : "failed",
    result.ok ? null : result.error,
    nowIso(),
    id
  );
  log(opts.kind, opts.template, result.ok ? "enviado" : `falló: ${result.error}`);
  return result;
}

const cop = (n: number) =>
  n.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** Aviso de pedido nuevo al número de alertas del restaurante (una vez por referencia). */
export async function whatsappNewOrder(
  tenant: Tenant,
  order: { reference: string; customerName: string; total: number; serviceType?: string }
): Promise<SendResult> {
  const to = alertsPhone(tenant);
  if (!to) return { ok: false, skipped: true, error: "El restaurante no activó las alertas por WhatsApp" };
  if (!order.reference) return { ok: false, skipped: true, error: "Pedido sin referencia" };
  if (!whatsappAvailable()) return { ok: false, skipped: true, error: "WhatsApp no está configurado en la plataforma" };

  const since = new Date(Date.now() - 3600_000).toISOString();
  const recent = await first<{ n: number }>(
    "SELECT COUNT(*) AS n FROM whatsapp_messages WHERE restaurant_id = ? AND kind = 'nuevo_pedido' AND created_at >= ?",
    tenant.id, since
  );
  if ((recent?.n ?? 0) >= ORDER_ALERTS_PER_HOUR) {
    return { ok: false, skipped: true, error: "Límite de avisos por hora alcanzado" };
  }

  return deliver({
    restaurantId: tenant.id,
    kind: "nuevo_pedido",
    to,
    template: TEMPLATES.nuevoPedido,
    dedupeKey: `order:${tenant.id}:${order.reference}`,
    params: [
      tenant.name,
      order.reference,
      order.customerName || "Cliente",
      order.serviceType === "recoger" ? "Para recoger" : "Domicilio",
      cop(order.total),
    ],
  });
}

/** Mensaje de prueba al número de alertas (desde /admin/configuracion). */
export async function whatsappTest(tenant: Tenant): Promise<SendResult> {
  const to = alertsPhone(tenant);
  if (!to) return { ok: false, error: "Primero guarda el número de WhatsApp para alertas" };
  return deliver({ restaurantId: tenant.id, kind: "prueba", to, template: TEMPLATES.prueba, params: [tenant.name] });
}

/** Qué recordatorio de pago le toca hoy a un restaurante, o null si ninguno. */
function billingReminder(t: Tenant, now: Date): { stage: string; text: string } | null {
  // La suspensión manual (status suspended/canceled) la decide la plataforma: no se le cobra por aquí
  if (t.status === "suspended" || t.status === "canceled") return null;
  const state = billingState(t, now);
  if (!state.accessUntil) return null;
  const end = formatBillingDate(state.accessUntil);

  if ((state.status === "trial" || state.status === "active") && state.daysLeft !== null && state.daysLeft >= 1 && state.daysLeft <= 3) {
    const what = state.status === "trial" ? "Tu prueba gratis de Brasaya" : "Tu mensualidad de Brasaya";
    return { stage: "por_vencer", text: `${what} vence el ${end}.` };
  }
  if (state.status === "grace" && state.graceUntil) {
    return {
      stage: "vencido",
      text: `Tu acceso a Brasaya venció el ${end}. Tienes hasta el ${formatBillingDate(state.graceUntil)} antes de que tu sitio se suspenda.`,
    };
  }
  // Solo se avisa la suspensión en los 3 días siguientes (no cada día para siempre)
  if (state.status === "suspended" && state.graceUntil && now.getTime() - new Date(state.graceUntil).getTime() <= 3 * 86400_000) {
    return { stage: "suspendido", text: `Tu sitio en Brasaya se suspendió el ${formatBillingDate(state.graceUntil)} por falta de pago.` };
  }
  return null;
}

export interface ReminderResult {
  slug: string;
  stage: string;
  status: "sent" | "skipped" | "failed";
  error?: string;
}

/**
 * Recordatorios de la mensualidad por WhatsApp (cron diario). Cada etapa (por vencer, vencido,
 * suspendido) se envía una sola vez por periodo gracias a la dedupe_key con la fecha de vencimiento.
 */
export async function sendBillingReminders(now = new Date()): Promise<ReminderResult[]> {
  if (!whatsappAvailable()) return [];

  // all() ya convierte la columna settings de JSON a objeto
  const restaurants = await all<Tenant>(
    `SELECT id, slug, name, status, plan, trial_ends_at, paid_until, owner_email, custom_domain, settings
     FROM restaurants WHERE plan <> 'legacy'`
  );

  const results: ReminderResult[] = [];
  for (const tenant of restaurants) {
    const reminder = billingReminder(tenant, now);
    const to = alertsPhone(tenant);
    if (!reminder || !to) continue;

    try {
      const accessUntil = billingState(tenant, now).accessUntil;
      const result = await deliver({
        restaurantId: tenant.id,
        kind: "recordatorio_pago",
        to,
        template: TEMPLATES.recordatorioPago,
        dedupeKey: `billing:${tenant.id}:${reminder.stage}:${accessUntil}`,
        params: [tenant.name, reminder.text, MONTHLY_PRICE_LABEL, tenantUrl(tenant.slug, "/admin/suscripcion")],
      });
      results.push({
        slug: tenant.slug,
        stage: reminder.stage,
        status: result.ok ? "sent" : result.skipped ? "skipped" : "failed",
        error: result.ok ? undefined : result.error,
      });
    } catch (error) {
      results.push({ slug: tenant.slug, stage: reminder.stage, status: "failed", error: error instanceof Error ? error.message : "Error" });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Webhook de Meta: firma y estados de entrega
// ---------------------------------------------------------------------------

/** Verifica la cabecera X-Hub-Signature-256 (HMAC-SHA256 del cuerpo con el App Secret). */
export async function verifySignature(rawBody: string, header: string | null): Promise<boolean> {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  const given = header.slice("sha256=".length).toLowerCase();
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

const STATUS_RANK: Record<string, number> = { pending: 0, sent: 1, delivered: 2, read: 3 };

/** Aplica un estado reportado por Meta (sent/delivered/read/failed) al mensaje registrado. */
export async function applyStatus(wamid: string, status: string, error?: string) {
  if (status === "failed") {
    await run("UPDATE whatsapp_messages SET status = 'failed', error = ?, updated_at = ? WHERE wamid = ?", error ?? null, nowIso(), wamid);
    return;
  }
  const rank = STATUS_RANK[status];
  if (rank === undefined) return;
  // Los estados pueden llegar desordenados: nunca se retrocede (read no vuelve a delivered)
  const ranks = Object.entries(STATUS_RANK).filter(([, r]) => r < rank).map(([s]) => `'${s}'`).join(", ");
  await run(
    `UPDATE whatsapp_messages SET status = ?, updated_at = ? WHERE wamid = ? AND status IN (${ranks})`,
    status, nowIso(), wamid
  );
}
