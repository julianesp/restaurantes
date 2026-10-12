/**
 * Suscripción de los restaurantes a Brasaya: precio y estado de la cuenta.
 *
 * Modelo: mensualidad prepagada. Cada pago aprobado suma un mes de acceso a partir de la fecha
 * mayor entre hoy y el acceso vigente (prueba o último mes pagado). Al vencer hay unos días de
 * gracia con aviso; después el restaurante se suspende hasta que pague.
 * Puro (sin dependencias de servidor): lo usan el servidor y los componentes.
 */

/** Mensualidad en pesos colombianos. */
export const MONTHLY_PRICE_COP = 69_900;
export const MONTHLY_PRICE_LABEL = "$69.900";

/** Días de prueba gratis al registrarse (ver /api/platform/restaurants). */
export const TRIAL_DAYS = 14;

/** Días de gracia tras vencer, con el sitio aún en línea y avisos para pagar. */
export const GRACE_DAYS = 5;

/** Desde cuántos días antes del vencimiento se avisa en el panel. */
export const WARN_DAYS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

export type BillingStatus =
  | "exempt" // restaurante de demostración / heredado: no paga
  | "trial" // en prueba gratis
  | "active" // mes pagado vigente
  | "grace" // vencido, dentro de los días de gracia
  | "suspended"; // vencido y sin pagar: sitio y panel bloqueados

export interface BillingInfo {
  plan: string;
  status: string; // columna restaurants.status (suspensión manual: suspended / canceled)
  trial_ends_at: string | null;
  paid_until: string | null;
}

export interface BillingState {
  status: BillingStatus;
  /** Hasta cuándo hay acceso pagado o de prueba (ISO), o null si no aplica. */
  accessUntil: string | null;
  /** Días que faltan para que venza el acceso (negativo si ya venció). */
  daysLeft: number | null;
  /** Último día de gracia (ISO) cuando está vencido. */
  graceUntil: string | null;
  /** Mostrar aviso de pago en el panel. */
  shouldWarn: boolean;
  /** Sitio público y panel bloqueados (solo queda la página de pago). */
  blocked: boolean;
}

const later = (a: string | null, b: string | null) => {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) > new Date(b) ? a : b;
};

export function billingState(t: BillingInfo, now: Date = new Date()): BillingState {
  // Suspensión o cancelación manual (desde la plataforma): siempre bloquea
  if (t.status === "suspended" || t.status === "canceled") {
    return { status: "suspended", accessUntil: null, daysLeft: null, graceUntil: null, shouldWarn: true, blocked: true };
  }
  if (t.plan === "legacy") {
    return { status: "exempt", accessUntil: null, daysLeft: null, graceUntil: null, shouldWarn: false, blocked: false };
  }

  const accessUntil = later(t.trial_ends_at, t.paid_until);
  if (!accessUntil) {
    // Sin fechas (datos antiguos): no bloquear, pero pedir el pago
    return { status: "grace", accessUntil: null, daysLeft: null, graceUntil: null, shouldWarn: true, blocked: false };
  }

  const end = new Date(accessUntil);
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / DAY_MS);
  const paidIsLatest = !!t.paid_until && accessUntil === t.paid_until;

  if (now <= end) {
    return {
      status: paidIsLatest ? "active" : "trial",
      accessUntil,
      daysLeft,
      graceUntil: null,
      shouldWarn: daysLeft <= WARN_DAYS,
      blocked: false,
    };
  }

  const graceEnd = new Date(end.getTime() + GRACE_DAYS * DAY_MS);
  const graceUntil = graceEnd.toISOString();
  if (now <= graceEnd) {
    return { status: "grace", accessUntil, daysLeft, graceUntil, shouldWarn: true, blocked: false };
  }
  return { status: "suspended", accessUntil, daysLeft, graceUntil, shouldWarn: true, blocked: true };
}

/** Suma meses de calendario (31 de enero + 1 mes = último día de febrero). */
export function addMonths(fromIso: string, months: number): string {
  const d = new Date(fromIso);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d.toISOString();
}

/**
 * Periodo que cubre un pago nuevo: empieza en la fecha mayor entre hoy y el acceso vigente
 * (pagar antes de tiempo no hace perder días) y dura `months` meses.
 */
export function nextPeriod(t: BillingInfo, months = 1, now: Date = new Date()) {
  const current = later(t.trial_ends_at, t.paid_until);
  const start = current && new Date(current) > now ? current : now.toISOString();
  return { start, end: addMonths(start, months) };
}

/** Fecha en español de Colombia, p. ej. "26 de octubre de 2026". */
export function formatBillingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}
