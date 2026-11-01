import type { LucideIcon } from "lucide-react";
import type { BillingStatus } from "@/lib/billing";

/** Piezas comunes de las páginas de /panel (sin estado: sirven en componentes de servidor). */

export function PageTitle({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <Icon className="mt-1 h-6 w-6 shrink-0 text-primary-600" />
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{title}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
      </div>
    </div>
  );
}

const TONES = {
  default: "text-stone-900 dark:text-white",
  green: "text-emerald-600 dark:text-emerald-400",
  amber: "text-yellow-600 dark:text-yellow-400",
  red: "text-red-600 dark:text-red-400",
  brand: "text-primary-600 dark:text-primary-400",
} as const;

export function StatCard({
  label, value, hint, tone = "default",
}: { label: string; value: React.ReactNode; hint?: string; tone?: keyof typeof TONES }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${TONES[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{hint}</p>}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900 ${className}`}>
      {title && <h2 className="border-b border-stone-200 px-4 py-3 text-sm font-semibold text-stone-900 dark:border-stone-800 dark:text-white">{title}</h2>}
      {children}
    </section>
  );
}

const STATUS: Record<BillingStatus, { text: string; className: string }> = {
  exempt: { text: "Demo", className: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300" },
  trial: { text: "En prueba", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  active: { text: "Al día", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  grace: { text: "Vencido (gracia)", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  suspended: { text: "Suspendido", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
};

export function StatusBadge({ status }: { status: BillingStatus }) {
  const s = STATUS[status];
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.text}</span>;
}

export const th = "px-4 py-3 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400";
export const td = "px-4 py-3 align-top text-sm text-stone-700 dark:text-stone-300";
export const tableWrap = "overflow-x-auto";
export const tbody = "divide-y divide-stone-100 dark:divide-stone-800";

/** Buscador por GET (?q=): funciona sin JavaScript. */
export function SearchForm({ q, placeholder, extra }: { q: string; placeholder: string; extra?: React.ReactNode }) {
  return (
    <form method="get" className="mb-4 flex flex-wrap gap-2">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
      />
      {extra}
      <button type="submit" className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 dark:bg-white dark:text-stone-900">
        Buscar
      </button>
    </form>
  );
}

export const formatDay = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" }) : "—";
export const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" })
    : "—";
