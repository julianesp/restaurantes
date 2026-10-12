"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Loader2, XCircle } from "lucide-react";
import { formatBillingDate, MONTHLY_PRICE_LABEL, type BillingState } from "@/lib/billing";

interface Payment {
  id: string;
  reference: string;
  amount: number;
  months: number;
  status: "pending" | "approved" | "rejected" | "failed";
  payment_method: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

interface BillingData {
  name: string;
  plan: string;
  price: number;
  graceDays: number;
  state: BillingState;
  payments: Payment[];
}

const STATUS_LABEL: Record<BillingState["status"], { text: string; tone: string }> = {
  exempt: { text: "Sin cobro", tone: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200" },
  trial: { text: "Prueba gratis", tone: "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200" },
  active: { text: "Activa", tone: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200" },
  grace: { text: "Vencida", tone: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" },
  suspended: { text: "Suspendida", tone: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" },
};

const PAYMENT_LABEL: Record<Payment["status"], string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  failed: "Fallido",
};

const money = (n: number) => `$${n.toLocaleString("es-CO")}`;

type Notice = { kind: "ok" | "error" | "info"; text: string } | null;

export default function SuscripcionPage() {
  const params = useSearchParams();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/billing", { cache: "no-store" });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  // Script del checkout de ePayco
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.epayco.co/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Al volver de ePayco: validar el pago en el servidor (por si el webhook aún no llegó)
  useEffect(() => {
    const refPayco = params.get("ref_payco");
    if (!refPayco) {
      load();
      return;
    }
    setNotice({ kind: "info", text: "Confirmando tu pago con ePayco…" });
    fetch("/api/billing/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref_payco: refPayco }),
    })
      .then((r) => r.json())
      .then(({ result }) => {
        if (result?.ok && result.status === "approved") {
          setNotice({ kind: "ok", text: `¡Pago aprobado! Tu plan está activo hasta el ${formatBillingDate(result.periodEnd)}.` });
        } else if (result?.ok && result.status === "pending") {
          setNotice({ kind: "info", text: "Tu pago está en proceso. Te avisamos aquí apenas ePayco lo confirme." });
        } else if (result?.ok && result.status === "rejected") {
          setNotice({ kind: "error", text: "El pago fue rechazado. Puedes intentarlo de nuevo con otro medio de pago." });
        } else {
          setNotice({ kind: "error", text: "No pudimos confirmar el pago. Si se descontó el dinero, escríbenos por WhatsApp." });
        }
      })
      .catch(() => setNotice({ kind: "error", text: "No pudimos confirmar el pago. Recarga la página en un momento." }))
      .finally(() => {
        // Quitar los parámetros de ePayco de la URL para no reconfirmar al recargar
        window.history.replaceState(null, "", "/admin/suscripcion");
        load();
      });
  }, [params, load]);

  const pay = async () => {
    setPaying(true);
    setNotice(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const body = await res.json();
      if (!res.ok || !body.sessionId) throw new Error(body.error || "No se pudo iniciar el pago");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (window as any).ePayco?.checkout?.configure({
        sessionId: body.sessionId,
        type: "standard",
        test: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === "true",
      });
      if (!handler) throw new Error("El checkout de ePayco no cargó. Recarga la página e intenta de nuevo.");
      handler.open();
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "No se pudo iniciar el pago" });
    } finally {
      setPaying(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-8 sm:px-6">
        <div className="mb-6 h-9 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-56 rounded-3xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  const { state } = data;
  const label = STATUS_LABEL[state.status];
  const exempt = state.status === "exempt";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-950 dark:text-white">Suscripción</h1>

      {notice && (
        <div
          role="status"
          className={`mb-6 flex items-start gap-2 rounded-2xl border p-4 text-sm ${
            notice.kind === "ok"
              ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100"
              : notice.kind === "error"
                ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
                : "border-gray-200 bg-white text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}
        >
          {notice.kind === "ok" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : notice.kind === "error" ? (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
          )}
          {notice.text}
        </div>
      )}

      {/* Plan y estado */}
      <section className="mb-8 grid gap-6 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">Plan Brasaya</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${label.tone}`}>{label.text}</span>
          </div>
          {exempt ? (
            <p className="text-gray-600 dark:text-gray-300">Este restaurante es de demostración y no paga mensualidad.</p>
          ) : (
            <>
              <p className="mb-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums text-gray-950 dark:text-white">{MONTHLY_PRICE_LABEL}</span>
                <span className="text-gray-600 dark:text-gray-400">COP al mes, todo incluido</span>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {state.status === "trial" && state.accessUntil && `Tu prueba gratis va hasta el ${formatBillingDate(state.accessUntil)}.`}
                {state.status === "active" && state.accessUntil && `Tu plan está pagado hasta el ${formatBillingDate(state.accessUntil)}.`}
                {state.status === "grace" &&
                  (state.graceUntil
                    ? `Tu plan venció. Paga antes del ${formatBillingDate(state.graceUntil)} para que tu sitio siga en línea.`
                    : "Tienes un pago pendiente.")}
                {state.status === "suspended" && "Tu cuenta está suspendida: tu sitio no se muestra hasta que pagues."}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Si pagas antes de tiempo, el mes se suma al final de tu periodo actual: no pierdes días.
              </p>
            </>
          )}
        </div>
        {!exempt && (
          <button
            type="button"
            onClick={pay}
            disabled={paying}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pagar un mes
          </button>
        )}
      </section>

      {/* Historial */}
      {!exempt && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-950 dark:text-white">Pagos</h2>
          {data.payments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Aún no hay pagos. Cuando pagues tu primer mes aparecerá aquí con su comprobante de ePayco.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Periodo</th>
                    <th className="px-4 py-3 font-medium">Valor</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  {data.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatBillingDate(p.created_at)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {p.period_start && p.period_end
                          ? `${formatBillingDate(p.period_start)} al ${formatBillingDate(p.period_end)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-800 dark:text-gray-200">{money(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.status === "approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                              : p.status === "pending"
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                          }`}
                        >
                          {PAYMENT_LABEL[p.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
