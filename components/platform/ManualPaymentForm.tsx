"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  name: string;
  slug: string;
  owner: string;
  accessUntil: string;
}

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-stone-700 dark:bg-stone-950 dark:text-white";
const label = "mb-1 block text-sm font-medium text-stone-800 dark:text-stone-200";

/** Registra un pago recibido por Nequi, transferencia, efectivo… y suma los meses (ver lib/platform-admin.ts). */
export default function ManualPaymentForm({
  restaurants, methods, monthlyPrice, initialId,
}: { restaurants: Option[]; methods: Record<string, string>; monthlyPrice: number; initialId: string }) {
  const router = useRouter();
  const [id, setId] = useState(restaurants.some((r) => r.id === initialId) ? initialId : "");
  const [months, setMonths] = useState(1);
  const [method, setMethod] = useState("nequi");
  const [amount, setAmount] = useState(String(monthlyPrice));
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const selected = restaurants.find((r) => r.id === id);
  const courtesy = method === "cortesia";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/platform/manage/${encodeURIComponent(id)}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months, method, amount: courtesy ? 0 : Number(amount), notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: data.error || "No se pudo registrar el pago" });
        return;
      }
      const until = new Date(data.periodEnd).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" });
      setMessage({ ok: true, text: `Pago registrado (${data.reference}). ${selected.name} tiene acceso hasta el ${until}.` });
      setNotes("");
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Error de conexión. Inténtalo de nuevo." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-4 sm:p-6">
      {message && (
        <p role="status" className={`rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
          {message.text}
        </p>
      )}
      <div>
        <label htmlFor="restaurant" className={label}>Restaurante</label>
        <select id="restaurant" required value={id} onChange={(e) => setId(e.target.value)} className={input}>
          <option value="">Elige el restaurante que pagó…</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name} ({r.slug}) · {r.owner}</option>
          ))}
        </select>
        {selected && <p className="mt-1 text-xs text-stone-500">Acceso actual hasta: {selected.accessUntil}. Los meses se suman desde esa fecha (o desde hoy si ya venció).</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="method" className={label}>Medio de pago</label>
          <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} className={input}>
            {Object.entries(methods).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="months" className={label}>Meses</label>
          <input
            id="months" type="number" min={1} max={12} required value={months}
            onChange={(e) => {
              const m = Math.max(1, Math.min(12, Number(e.target.value) || 1));
              setMonths(m);
              setAmount(String(m * monthlyPrice));
            }}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="amount" className={label}>Monto recibido (COP)</label>
          <input id="amount" type="number" min={0} step={100} required={!courtesy} disabled={courtesy} value={courtesy ? 0 : amount} onChange={(e) => setAmount(e.target.value)} className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className={label}>Nota (opcional)</label>
        <input id="notes" maxLength={200} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: comprobante Nequi M1234567" className={input} />
      </div>
      <button type="submit" disabled={busy || !selected} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
        {busy ? "Registrando…" : "Registrar pago y activar"}
      </button>
    </form>
  );
}
