import { all, batch, first, newId, nowIso, run } from "@/lib/db";
import { createCheckoutSession, validateTransaction } from "@/lib/epayco";
import { MONTHLY_PRICE_COP, nextPeriod } from "@/lib/billing";
import { invalidateTenantCache, type Tenant } from "@/lib/tenant";

/** Marca de las transacciones de suscripción en ePayco (extra2) para distinguirlas de los pedidos. */
export const SUBSCRIPTION_KIND = "suscripcion";

export interface SubscriptionPayment {
  id: string;
  reference: string;
  amount: number;
  months: number;
  status: "pending" | "approved" | "rejected" | "failed";
  ref_payco: string | null;
  payment_method: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

/** Pagos de suscripción de un restaurante, del más reciente al más antiguo. */
export function listPayments(restaurantId: string, limit = 24) {
  return all<SubscriptionPayment>(
    `SELECT id, reference, amount, months, status, ref_payco, payment_method, period_start, period_end, created_at
     FROM subscription_payments WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT ?`,
    restaurantId,
    limit,
  );
}

/**
 * Crea un pago pendiente y su sesión de ePayco Checkout para un mes de Brasaya.
 * `origin` es el origen de la petición (subdominio del restaurante) para las URLs de vuelta.
 */
export async function startSubscriptionCheckout(tenant: Tenant, email: string, origin: string) {
  const months = 1;
  const amount = MONTHLY_PRICE_COP * months;
  // Referencia propia, única y legible: BRSY-<slug>-<fecha>-<aleatorio>
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const reference = `BRSY-${tenant.slug}-${stamp}-${newId().slice(0, 8)}`.toUpperCase();

  await run(
    `INSERT INTO subscription_payments (id, restaurant_id, reference, amount, months, status, created_by)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    newId(),
    tenant.id,
    reference,
    amount,
    months,
    email,
  );

  const session = await createCheckoutSession({
    name: "Brasaya",
    amount,
    description: `Brasaya: mensualidad de ${tenant.name}`,
    invoice: reference,
    responseUrl: `${origin}/admin/suscripcion?pago=${encodeURIComponent(reference)}`,
    confirmationUrl: `${origin}/api/epayco/webhook`,
    extras: { extra1: reference, extra2: SUBSCRIPTION_KIND, extra3: tenant.slug },
    billing: { email, name: tenant.name },
  });

  return { reference, amount, sessionId: session.sessionId };
}

export type ApplyResult =
  | { ok: true; status: "approved"; periodEnd: string; alreadyApplied: boolean }
  | { ok: true; status: "pending" | "rejected" }
  | { ok: false; reason: string };

/**
 * Aplica un pago de suscripción a partir de su ref_payco. Idempotente: si llegan el webhook y la
 * página de respuesta, el mes se suma una sola vez.
 *
 * Solo confía en la API de validación de ePayco: la transacción debe existir, ser de suscripción,
 * corresponder a un pago pendiente del mismo restaurante y por el monto exacto.
 */
export async function applySubscriptionPayment(refPayco: string, expectRestaurantId?: string): Promise<ApplyResult> {
  const tx = await validateTransaction(refPayco);
  if (!tx) return { ok: false, reason: "Transacción no encontrada en ePayco" };
  // La referencia propia viaja en extra1 y como número de factura (empieza por BRSY-); se acepta
  // cualquiera de las dos por si la API de validación no devuelve los campos extra.
  const reference = (tx.extra1 || tx.invoice).toUpperCase();
  const isSubscription = tx.extra2 === SUBSCRIPTION_KIND || reference.startsWith("BRSY-");
  if (!isSubscription || !reference) return { ok: false, reason: "No es un pago de suscripción" };

  const payment = await first<SubscriptionPayment & { restaurant_id: string }>(
    `SELECT id, restaurant_id, reference, amount, months, status, ref_payco, payment_method, period_start, period_end, created_at
     FROM subscription_payments WHERE reference = ?`,
    reference,
  );
  if (!payment) return { ok: false, reason: "Pago no registrado" };
  if (expectRestaurantId && payment.restaurant_id !== expectRestaurantId) {
    return { ok: false, reason: "El pago pertenece a otro restaurante" };
  }

  // Ya aplicado (webhook y página de respuesta, o reintentos de ePayco)
  if (payment.status === "approved") {
    return { ok: true, status: "approved", periodEnd: payment.period_end ?? "", alreadyApplied: true };
  }

  const restaurant = await first<Tenant & { paid_until: string | null }>(
    `SELECT id, slug, name, status, plan, trial_ends_at, paid_until, owner_email, custom_domain, settings
     FROM restaurants WHERE id = ?`,
    payment.restaurant_id,
  );
  if (!restaurant) return { ok: false, reason: "Restaurante no encontrado" };
  if (tx.extra3 && tx.extra3.toLowerCase() !== restaurant.slug.toLowerCase()) {
    return { ok: false, reason: "El pago no corresponde a este restaurante" };
  }

  // En producción no se aceptan transacciones de prueba
  if (tx.isTest && process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE !== "true") {
    return { ok: false, reason: "Transacción de prueba en producción" };
  }

  const now = nowIso();

  if (tx.codResponse === 1) {
    if (tx.amount !== payment.amount || (tx.currency && tx.currency !== "COP")) {
      await run(`UPDATE subscription_payments SET status = 'failed', ref_payco = ?, updated_at = ? WHERE id = ?`, tx.refPayco, now, payment.id);
      return { ok: false, reason: "El monto pagado no coincide" };
    }
    const period = nextPeriod(restaurant, payment.months);
    await batch([
      {
        // Solo si sigue pendiente: evita sumar dos veces si llegan dos confirmaciones a la vez
        sql: `UPDATE subscription_payments
              SET status = 'approved', ref_payco = ?, payment_method = ?, period_start = ?, period_end = ?, updated_at = ?
              WHERE id = ? AND status != 'approved'`,
        params: [tx.refPayco, tx.method || null, period.start, period.end, now, payment.id],
      },
      {
        sql: `UPDATE restaurants
              SET paid_until = ?, status = CASE WHEN status IN ('suspended', 'canceled') THEN status ELSE 'active' END, updated_at = ?
              WHERE id = ? AND EXISTS (SELECT 1 FROM subscription_payments WHERE id = ? AND status = 'approved' AND period_end = ?)`,
        params: [period.end, now, restaurant.id, payment.id, period.end],
      },
    ]);
    invalidateTenantCache(restaurant.slug);
    return { ok: true, status: "approved", periodEnd: period.end, alreadyApplied: false };
  }

  if (tx.codResponse === 2 || tx.codResponse === 4) {
    await run(
      `UPDATE subscription_payments SET status = ?, ref_payco = ?, updated_at = ? WHERE id = ? AND status = 'pending'`,
      tx.codResponse === 2 ? "rejected" : "failed",
      tx.refPayco,
      now,
      payment.id,
    );
    return { ok: true, status: "rejected" };
  }

  return { ok: true, status: "pending" };
}
