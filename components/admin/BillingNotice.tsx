"use client";

import Link from "next/link";
import { AlertTriangle, Clock, Lock } from "lucide-react";
import { formatBillingDate, GRACE_DAYS, MONTHLY_PRICE_LABEL, type BillingState } from "@/lib/billing";

/** Aviso en la parte superior del panel cuando la prueba o el mes pagado están por vencer o vencieron. */
export function BillingBanner({ state }: { state: BillingState }) {
  if (!state.shouldWarn || state.blocked) return null;
  const grace = state.status === "grace";
  const days = state.daysLeft ?? 0;
  const text = grace
    ? `Tu ${state.accessUntil ? "plan venció" : "suscripción está pendiente"}. Paga antes del ${
        state.graceUntil ? formatBillingDate(state.graceUntil) : "fin del periodo de gracia"
      } para que tu sitio siga en línea.`
    : state.status === "trial"
      ? `Tu prueba gratis termina ${days <= 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`}.`
      : `Tu mes pagado vence ${days <= 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`}.`;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 text-sm sm:px-6 ${
        grace
          ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
          : "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900/50 dark:bg-yellow-950/40 dark:text-yellow-100"
      }`}
    >
      <span className="flex items-center gap-2">
        {grace ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
        {text}
      </span>
      <Link
        href="/admin/suscripcion"
        className="btn-press rounded-full bg-primary-600 px-4 py-1.5 font-semibold text-white hover:bg-primary-700"
      >
        Pagar {MONTHLY_PRICE_LABEL}
      </Link>
    </div>
  );
}

/** Pantalla que reemplaza el panel cuando la cuenta está suspendida por falta de pago. */
export function BillingBlocked({ state }: { state: BillingState }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mb-2 text-2xl font-bold text-gray-950 dark:text-white">Tu cuenta está suspendida</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {state.accessUntil
            ? `Tu plan venció el ${formatBillingDate(state.accessUntil)} y pasaron los ${GRACE_DAYS} días de gracia. `
            : ""}
          Tu sitio no se muestra a los clientes hasta que pagues la mensualidad. Tus datos siguen guardados.
        </p>
        <Link
          href="/admin/suscripcion"
          className="btn-press inline-flex rounded-full bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
        >
          Pagar {MONTHLY_PRICE_LABEL} y reactivar
        </Link>
      </div>
    </div>
  );
}
