import Link from "next/link";
import { HeartPulse, AlertOctagon, AlertTriangle, Info, MessageCircle, Settings } from "lucide-react";
import { requirePlatformAdmin, loadRestaurants, restaurantHealth, whatsappLink, money, type IssueLevel } from "@/lib/platform-stats";
import { tenantUrl } from "@/lib/tenant-host";
import { PageTitle, StatusBadge, formatDay } from "@/components/platform/ui";

const LEVEL_ICON: Record<IssueLevel, { icon: typeof Info; className: string }> = {
  grave: { icon: AlertOctagon, className: "text-red-600" },
  ajuste: { icon: AlertTriangle, className: "text-yellow-600" },
  sugerencia: { icon: Info, className: "text-sky-600" },
};
const LABEL_STYLE = {
  "En riesgo": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Atención: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  Bien: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
} as const;
const TABS = [
  { value: "", label: "Todos" },
  { value: "riesgo", label: "En riesgo" },
  { value: "atencion", label: "Atención" },
  { value: "bien", label: "Bien" },
] as const;
const TAB_LABEL = { riesgo: "En riesgo", atencion: "Atención", bien: "Bien" } as const;

// Qué tan bien usa cada restaurante Brasaya y qué debería ajustar. Los peores primero.
export default async function SaludPage({ searchParams }: { searchParams: Promise<{ f?: string; vencidos?: string }> }) {
  await requirePlatformAdmin();
  const { f = "", vencidos = "" } = await searchParams;
  const showExpired = vencidos === "1";
  const now = new Date();
  const all = (await loadRestaurants())
    .filter((r) => r.plan !== "legacy" && (showExpired || r.billing.status !== "suspended"))
    .map((r) => ({ r, h: restaurantHealth(r, now) }))
    .sort((a, b) => a.h.score - b.h.score);
  const count = (label: string) => all.filter(({ h }) => h.label === label).length;
  const wanted = TAB_LABEL[f as keyof typeof TAB_LABEL];
  const rows = wanted ? all.filter(({ h }) => h.label === wanted) : all;
  const href = (next: Record<string, string>) => {
    const p = new URLSearchParams({ f, vencidos, ...next });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/panel/salud?${s}` : "/panel/salud";
  };

  return (
    <>
      <PageTitle icon={HeartPulse} title="Salud de los restaurantes" subtitle="Qué tan bien usa cada restaurante Brasaya y qué le falta. Los que están peor van primero." />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const n = t.value ? count(TAB_LABEL[t.value]) : all.length;
          const active = f === t.value;
          return (
            <Link
              key={t.value}
              href={href({ f: t.value })}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${active ? "bg-primary-600 text-white" : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"}`}
            >
              {t.label} ({n})
            </Link>
          );
        })}
        <Link href={href({ vencidos: showExpired ? "" : "1" })} className="ml-auto text-sm text-stone-600 underline-offset-2 hover:underline dark:text-stone-400">
          {showExpired ? "Ocultar suspendidos" : "Mostrar también los suspendidos"}
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map(({ r, h }) => {
          const wa = whatsappLink(r.settings);
          return (
            <article key={r.id} className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <header className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-stone-900 dark:text-white">{r.name}</h2>
                  <p className="truncate text-xs text-stone-500">{r.owner_email}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LABEL_STYLE[h.label]}`}>{h.label} · {h.score}</span>
                  <StatusBadge status={r.billing.status} />
                </div>
              </header>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div
                  className={`h-full rounded-full ${h.score < 50 ? "bg-red-500" : h.score < 80 ? "bg-yellow-500" : "bg-emerald-500"}`}
                  style={{ width: `${h.score}%` }}
                />
              </div>
              <dl className="mb-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div><dt className="text-stone-500">Último pedido</dt><dd className="font-medium">{r.last_order ? formatDay(r.last_order) : "Nunca"}</dd></div>
                <div><dt className="text-stone-500">Pedidos 7 / 30 d</dt><dd className="font-medium">{r.orders_7d} / {r.orders_30d}</dd></div>
                <div><dt className="text-stone-500">Vendido 30 d</dt><dd className="font-medium">{money(r.sales_30d)}</dd></div>
                <div><dt className="text-stone-500">Platos activos</dt><dd className="font-medium">{r.items}</dd></div>
              </dl>
              {h.issues.length === 0 ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">Todo en orden.</p>
              ) : (
                <ul className="space-y-2">
                  {h.issues.map((i) => {
                    const { icon: Icon, className } = LEVEL_ICON[i.level];
                    return (
                      <li key={i.title} className="flex gap-2 text-sm">
                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${className}`} />
                        <span>
                          <span className="font-medium text-stone-900 dark:text-white">{i.title}</span>
                          <span className="block text-xs text-stone-500 dark:text-stone-400">{i.advice}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <footer className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                    <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
                  </a>
                )}
                <a href={tenantUrl(r.slug, "/admin")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800">
                  <Settings className="h-4 w-4" /> Entrar a su panel
                </a>
              </footer>
            </article>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-stone-500">No hay restaurantes en este grupo.</p>}
      </div>

      <p className="mt-6 text-xs text-stone-500">
        Puntaje de 0 a 100: cada problema grave resta 30, cada ajuste 12 y cada sugerencia 4. A los restaurantes con menos de 3 días no se les
        cuenta la falta de pedidos.
      </p>
    </>
  );
}
