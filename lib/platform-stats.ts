import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { all, first } from "@/lib/db";
import { isPlatformAdmin } from "@/lib/tenant";
import { billingState, MONTHLY_PRICE_COP, type BillingState } from "@/lib/billing";

/**
 * Datos del panel de la plataforma (/panel). Solo lo leen páginas que llaman primero a
 * requirePlatformAdmin(); aquí las consultas cruzan restaurantes a propósito.
 */

/** Cada página de /panel lo llama: el layout no se vuelve a ejecutar en cada navegación. */
export async function requirePlatformAdmin() {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/panel");
  // Los dueños de restaurantes que llegan aquí al iniciar sesión siguen a su propio panel
  if (!(await isPlatformAdmin())) redirect("/admin");
  return user;
}

const DAY_MS = 86_400_000;
/** Fecha AAAA-MM-DD en hora de Colombia (UTC-5, sin horario de verano). */
export const colombiaDay = (date = new Date()) => new Date(date.getTime() - 5 * 3600_000).toISOString().slice(0, 10);

export const money = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

// ---------------------------------------------------------------------------
// Restaurantes
// ---------------------------------------------------------------------------

export interface PlatformRestaurant {
  id: string;
  slug: string;
  name: string;
  status: string;
  plan: string;
  trial_ends_at: string | null;
  paid_until: string | null;
  owner_email: string;
  custom_domain: string | null;
  created_at: string;
  settings: Record<string, unknown>;
  items: number;
  specials: number;
  tables: number;
  orders: number;
  orders_7d: number;
  orders_30d: number;
  sales_30d: number;
  last_order: string | null;
  paid_total: number;
  last_payment: string | null;
  members: number;
  billing: BillingState;
}

export async function loadRestaurants(): Promise<PlatformRestaurant[]> {
  const since7 = new Date(Date.now() - 7 * DAY_MS).toISOString();
  const since30 = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const rows = await all<Omit<PlatformRestaurant, "billing">>(
    `SELECT r.id, r.slug, r.name, r.status, r.plan, r.trial_ends_at, r.paid_until, r.owner_email,
            r.custom_domain, r.created_at, r.settings,
            (SELECT COUNT(*) FROM menu_items i WHERE i.restaurant_id = r.id AND i.is_available = 1) AS items,
            (SELECT COUNT(*) FROM daily_specials d WHERE d.restaurant_id = r.id) AS specials,
            (SELECT COUNT(*) FROM restaurant_tables t WHERE t.restaurant_id = r.id) AS tables,
            (SELECT COUNT(*) FROM table_orders o WHERE o.restaurant_id = r.id) AS orders,
            (SELECT COUNT(*) FROM table_orders o WHERE o.restaurant_id = r.id AND o.created_at >= ?) AS orders_7d,
            (SELECT COUNT(*) FROM table_orders o WHERE o.restaurant_id = r.id AND o.created_at >= ?) AS orders_30d,
            (SELECT COALESCE(SUM(total), 0) FROM table_orders o
              WHERE o.restaurant_id = r.id AND o.created_at >= ? AND o.status != 'cancelled') AS sales_30d,
            (SELECT MAX(created_at) FROM table_orders o WHERE o.restaurant_id = r.id) AS last_order,
            (SELECT COALESCE(SUM(amount), 0) FROM subscription_payments p
              WHERE p.restaurant_id = r.id AND p.status = 'approved') AS paid_total,
            (SELECT MAX(created_at) FROM subscription_payments p
              WHERE p.restaurant_id = r.id AND p.status = 'approved') AS last_payment,
            (SELECT COUNT(*) FROM restaurant_members m WHERE m.restaurant_id = r.id) AS members
     FROM restaurants r
     ORDER BY r.created_at DESC`,
    since7, since30, since30
  );
  return rows.map((r) => ({ ...r, settings: r.settings ?? {}, billing: billingState(r) }));
}

// ---------------------------------------------------------------------------
// Métricas del negocio
// ---------------------------------------------------------------------------

export interface PlatformMetrics {
  total: number;
  active: number;
  trial: number;
  grace: number;
  suspended: number;
  mrr: number;
  newToday: number;
  newThisMonth: number;
  /** Restaurantes cuya prueba ya terminó (base de conversión y abandono) */
  finishedTrial: number;
  /** De los que terminaron la prueba, % que pagó alguna vez */
  conversion: number | null;
  /** De los que terminaron la prueba, % que hoy está vencido o suspendido */
  churn: number | null;
  /** Ingresos extra si todos los que están en prueba pagan */
  potential: number;
  withOrders: number;
  withoutMenu: number;
}

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : null);

export function computeMetrics(rows: PlatformRestaurant[], now = new Date()): PlatformMetrics {
  const real = rows.filter((r) => r.plan !== "legacy");
  const by = (s: BillingState["status"]) => real.filter((r) => r.billing.status === s).length;
  const today = colombiaDay(now);
  const month = today.slice(0, 7);
  const finished = real.filter((r) => r.trial_ends_at && new Date(r.trial_ends_at) < now);
  const converted = finished.filter((r) => r.paid_total > 0).length;
  const lost = finished.filter((r) => r.billing.status === "grace" || r.billing.status === "suspended").length;
  const active = by("active");
  const trial = by("trial");

  return {
    total: real.length,
    active,
    trial,
    grace: by("grace"),
    suspended: by("suspended"),
    mrr: active * MONTHLY_PRICE_COP,
    newToday: real.filter((r) => colombiaDay(new Date(r.created_at)) === today).length,
    newThisMonth: real.filter((r) => colombiaDay(new Date(r.created_at)).startsWith(month)).length,
    finishedTrial: finished.length,
    conversion: pct(converted, finished.length),
    churn: pct(lost, finished.length),
    potential: trial * MONTHLY_PRICE_COP,
    withOrders: real.filter((r) => r.orders > 0).length,
    withoutMenu: real.filter((r) => r.items === 0).length,
  };
}

export const formatPct = (v: number | null) => (v === null ? "—" : `${v.toFixed(1)}%`);

// ---------------------------------------------------------------------------
// Salud de cada restaurante
// ---------------------------------------------------------------------------

export type IssueLevel = "grave" | "ajuste" | "sugerencia";
export interface HealthIssue {
  level: IssueLevel;
  title: string;
  advice: string;
}
export interface Health {
  score: number;
  label: "En riesgo" | "Atención" | "Bien";
  issues: HealthIssue[];
}

const PENALTY: Record<IssueLevel, number> = { grave: 30, ajuste: 12, sugerencia: 4 };
const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;

/** Puntaje 0-100: cada problema grave resta 30, cada ajuste 12 y cada sugerencia 4. */
export function restaurantHealth(r: PlatformRestaurant, now = new Date()): Health {
  const issues: HealthIssue[] = [];
  const s = r.settings;
  const ageDays = (now.getTime() - new Date(r.created_at).getTime()) / DAY_MS;
  const sinceOrder = r.last_order ? (now.getTime() - new Date(r.last_order).getTime()) / DAY_MS : null;

  if (r.items === 0) {
    issues.push({ level: "grave", title: "No tiene platos en el menú", advice: "Su sitio está vacío: ayudarle a cargar el menú en /admin/menu." });
  }
  // Las cuentas con menos de 3 días no se evalúan por pedidos
  if (ageDays >= 3 && r.orders === 0) {
    issues.push({ level: "grave", title: "Nunca ha recibido un pedido", advice: "Mostrarle cómo compartir el enlace del menú y los QR de las mesas." });
  } else if (sinceOrder !== null && sinceOrder > 14) {
    issues.push({ level: "ajuste", title: `Lleva ${Math.floor(sinceOrder)} días sin pedidos`, advice: "Probablemente dejó de usarlo: escribirle para saber por qué." });
  }
  if (r.billing.status === "trial" && r.billing.daysLeft !== null && r.billing.daysLeft <= 3) {
    issues.push({
      level: r.orders === 0 ? "grave" : "ajuste",
      title: `La prueba gratis termina en ${Math.max(r.billing.daysLeft, 0)} ${r.billing.daysLeft === 1 ? "día" : "días"}`,
      advice: "Acompañarle antes de que termine, o no va a pagar.",
    });
  }
  if (r.billing.status === "grace") {
    issues.push({ level: "grave", title: "Suscripción vencida (en días de gracia)", advice: "Recordarle el pago antes de que se suspenda el sitio." });
  }
  if (!filled(s.whatsapp) && !filled(s.phone)) {
    issues.push({ level: "ajuste", title: "Sin WhatsApp ni teléfono", advice: "Sin WhatsApp los clientes no pueden enviar pedidos sin pago en línea." });
  }
  if (!filled(s.logo_url)) {
    issues.push({ level: "ajuste", title: "Sin logo", advice: "Subirlo en Configuración: el sitio se ve más confiable." });
  }
  if (!filled(s.address)) {
    issues.push({ level: "sugerencia", title: "Sin dirección", advice: "Completarla en Configuración para que aparezca en el sitio." });
  }
  if (s.online_payments !== true) {
    issues.push({ level: "sugerencia", title: "Sin pagos en línea", advice: "Conectar ePayco para cobrar los pedidos desde el sitio." });
  }
  if (r.tables === 0) {
    issues.push({ level: "sugerencia", title: "Sin mesas con QR", advice: "Crear las mesas para que pidan desde la mesa." });
  }
  if (!filled(s.whatsapp_alerts) && !filled(s.telegram_chat_id)) {
    issues.push({ level: "sugerencia", title: "Sin avisos de pedidos", advice: "Activar avisos por WhatsApp o Telegram para no perder pedidos." });
  }

  const score = Math.max(0, 100 - issues.reduce((sum, i) => sum + PENALTY[i.level], 0));
  const order: IssueLevel[] = ["grave", "ajuste", "sugerencia"];
  issues.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
  return { score, label: score < 50 ? "En riesgo" : score < 80 ? "Atención" : "Bien", issues };
}

/** Enlace de WhatsApp al restaurante (número de 10 dígitos colombiano o con indicativo). */
export function whatsappLink(settings: Record<string, unknown>): string | null {
  const raw = [settings.whatsapp, settings.phone].find(filled) as string | undefined;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) return `https://wa.me/57${digits}`;
  return digits.length >= 11 ? `https://wa.me/${digits}` : null;
}

// ---------------------------------------------------------------------------
// Usuarios y cobros
// ---------------------------------------------------------------------------

export interface PlatformUser {
  email: string;
  role: "owner" | "admin";
  created_at: string;
  restaurant_id: string;
  restaurant_name: string;
  slug: string;
}

export const listAllMembers = () =>
  all<PlatformUser>(
    `SELECT m.email, m.role, m.created_at, r.id AS restaurant_id, r.name AS restaurant_name, r.slug
     FROM restaurant_members m JOIN restaurants r ON r.id = m.restaurant_id
     ORDER BY m.created_at DESC`
  );

export interface PlatformPayment {
  id: string;
  reference: string;
  amount: number;
  months: number;
  status: "pending" | "approved" | "rejected" | "failed";
  ref_payco: string | null;
  payment_method: string | null;
  period_start: string | null;
  period_end: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  restaurant_name: string | null;
  slug: string | null;
}

export const listAllPayments = (limit = 500) =>
  all<PlatformPayment>(
    `SELECT p.id, p.reference, p.amount, p.months, p.status, p.ref_payco, p.payment_method, p.period_start,
            p.period_end, p.created_by, p.notes, p.created_at, r.name AS restaurant_name, r.slug
     FROM subscription_payments p LEFT JOIN restaurants r ON r.id = p.restaurant_id
     ORDER BY p.created_at DESC LIMIT ?`,
    limit
  );

// ---------------------------------------------------------------------------
// Visitas a la landing
// ---------------------------------------------------------------------------

export interface VisitStats {
  since: string | null;
  uniqueVisitors: number;
  visits: number;
  today: number;
  todayVisitors: number;
  newVisitors: number;
  returning: number;
  signedIn: number;
  daily: { day: string; visitors: number; visits: number }[];
  breakdown: Record<"device" | "os" | "browser" | "country" | "source" | "path", { label: string; count: number }[]>;
}

export async function loadVisitStats(days: number, now = new Date()): Promise<VisitStats> {
  const from = colombiaDay(new Date(now.getTime() - (days - 1) * DAY_MS));
  const today = colombiaDay(now);

  const [totals, firstSeen, todayRow, since, daily] = await Promise.all([
    first<{ visitors: number; visits: number; signed: number }>(
      `SELECT COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS visits,
              COUNT(DISTINCT CASE WHEN signed_in = 1 THEN visitor_id END) AS signed
       FROM site_visits WHERE day >= ?`,
      from
    ),
    first<{ fresh: number }>(
      `SELECT COUNT(*) AS fresh FROM (
         SELECT visitor_id, MIN(day) AS first_day FROM site_visits GROUP BY visitor_id
       ) WHERE first_day >= ?`,
      from
    ),
    first<{ visitors: number; visits: number }>(
      "SELECT COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS visits FROM site_visits WHERE day = ?",
      today
    ),
    first<{ since: string | null }>("SELECT MIN(created_at) AS since FROM site_visits"),
    all<{ day: string; visitors: number; visits: number }>(
      `SELECT day, COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS visits
       FROM site_visits WHERE day >= ? GROUP BY day ORDER BY day`,
      from
    ),
  ]);

  // Columna fija por clave: nunca entra texto del cliente al SQL
  const COLUMNS = {
    device: "device",
    os: "os",
    browser: "browser",
    country: "country",
    source: "COALESCE(utm_source, referrer)",
    path: "path",
  } as const;
  const entries = await Promise.all(
    (Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]).map(async (key) => {
      // Primera página de cada visitante para "path"; dispositivos únicos para el resto
      const rows = await all<{ label: string | null; count: number }>(
        `SELECT ${COLUMNS[key]} AS label, COUNT(DISTINCT visitor_id) AS count
         FROM site_visits WHERE day >= ? GROUP BY label ORDER BY count DESC LIMIT 8`,
        from
      );
      return [key, rows.map((r) => ({ label: r.label || "Directo / desconocido", count: r.count }))] as const;
    })
  );

  const unique = totals?.visitors ?? 0;
  const fresh = firstSeen?.fresh ?? 0;
  return {
    since: since?.since ?? null,
    uniqueVisitors: unique,
    visits: totals?.visits ?? 0,
    today: todayRow?.visits ?? 0,
    todayVisitors: todayRow?.visitors ?? 0,
    newVisitors: fresh,
    returning: Math.max(unique - fresh, 0),
    signedIn: totals?.signed ?? 0,
    daily,
    breakdown: Object.fromEntries(entries) as VisitStats["breakdown"],
  };
}
