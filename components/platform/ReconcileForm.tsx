"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Lookup {
  transaction: {
    refPayco: string;
    reference: string;
    amount: number;
    currency: string;
    approved: boolean;
    state: string;
    method: string;
    isTest: boolean;
  };
  payment: { status: string; amount: number; name: string; slug: string } | null;
}

const money = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

/** Busca una transacción por ref_payco y, si corresponde a un pago pendiente, la aplica (misma lógica del webhook). */
export default function ReconcileForm() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const call = async (apply: boolean) => {
    setBusy(true);
    setMessage(null);
    if (!apply) setLookup(null);
    try {
      const res = await fetch("/api/platform/manage/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refPayco: ref.trim(), apply }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMessage({ ok: false, text: data.error || "No se pudo consultar ePayco" });
      if (!apply) return setLookup(data);
      setMessage(
        data.status === "approved"
          ? { ok: true, text: data.alreadyApplied ? "Ese pago ya estaba aplicado." : "Pago aplicado: se sumó el mes al restaurante." }
          : { ok: false, text: data.status === "pending" ? "ePayco aún lo tiene pendiente." : "ePayco lo reporta rechazado: quedó marcado así." }
      );
      setLookup(null);
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Error de conexión. Inténtalo de nuevo." });
    } finally {
      setBusy(false);
    }
  };

  const tx = lookup?.transaction;
  const payment = lookup?.payment;
  const canApply = tx?.approved && payment && payment.status !== "approved";

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          call(false);
        }}
      >
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          required
          placeholder="ref_payco, p. ej. 389210699"
          aria-label="Referencia de ePayco (ref_payco)"
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-stone-700 dark:bg-stone-950 dark:text-white"
        />
        <button type="submit" disabled={busy} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900">
          {busy && !lookup ? "Consultando…" : "Verificar"}
        </button>
      </form>

      {message && (
        <p role="status" className={`rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
          {message.text}
        </p>
      )}

      {tx && (
        <div className="rounded-xl border border-stone-200 p-4 text-sm dark:border-stone-800">
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
            <dt className="text-stone-500">Estado en ePayco</dt>
            <dd className={tx.approved ? "font-medium text-emerald-600" : "font-medium text-red-600"}>{tx.state || (tx.approved ? "Aceptada" : "No aceptada")}{tx.isTest && " (prueba)"}</dd>
            <dt className="text-stone-500">Monto</dt>
            <dd>{money(tx.amount)} {tx.currency}</dd>
            <dt className="text-stone-500">Medio</dt>
            <dd>{tx.method || "—"}</dd>
            <dt className="text-stone-500">Referencia</dt>
            <dd className="break-all font-mono text-xs">{tx.reference || "—"}</dd>
            <dt className="text-stone-500">Restaurante</dt>
            <dd>{payment ? `${payment.name} (${payment.slug})` : "No corresponde a ningún pago de suscripción registrado"}</dd>
            {payment && (
              <>
                <dt className="text-stone-500">Pago en Brasaya</dt>
                <dd>{payment.status === "approved" ? "Ya aplicado" : `${payment.status} · esperado ${money(payment.amount)}`}</dd>
              </>
            )}
          </dl>
          {canApply && (
            <button type="button" disabled={busy} onClick={() => call(true)} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              Aplicar el pago a {payment!.name}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
