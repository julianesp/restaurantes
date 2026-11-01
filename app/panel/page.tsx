import Link from "next/link";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import {
  requirePlatformAdmin, loadRestaurants, computeMetrics, restaurantHealth, listAllPayments, money, formatPct,
} from "@/lib/platform-stats";
import { PageTitle, StatCard, Card, StatusBadge, formatDay } from "@/components/platform/ui";

// Resumen del negocio: indicadores, restaurantes que necesitan atención y últimos movimientos
export default async function PanelHomePage() {
  await requirePlatformAdmin();
  const [rows, payments] = await Promise.all([loadRestaurants(), listAllPayments(5)]);
  const m = computeMetrics(rows);
  const approved = payments.filter((p) => p.status === "approved");
  const attention = rows
    .filter((r) => r.plan !== "legacy" && r.billing.status !== "suspended")
    .map((r) => ({ r, h: restaurantHealth(r) }))
    .filter(({ h }) => h.label !== "Bien")
    .sort((a, b) => a.h.score - b.h.score)
    .slice(0, 5);

  return (
    <>
      <PageTitle icon={LayoutDashboard} title="Resumen" subtitle="Cómo va Brasaya hoy (sin contar el restaurante de demostración)." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Restaurantes" value={m.total} hint={`${m.newThisMonth} nuevos este mes`} />
        <StatCard label="Al día (pagando)" value={m.active} tone="green" hint="Suscripción vigente" />
        <StatCard label="En prueba" value={m.trial} tone="amber" hint="Clientes potenciales" />
        <StatCard label="Vencidos o suspendidos" value={m.grace + m.suspended} tone={m.grace + m.suspended ? "red" : "default"} hint="Requieren seguimiento" />
        <StatCard label="Ingreso mensual" value={money(m.mrr)} tone="brand" hint="Restaurantes al día × mensualidad" />
        <StatCard label="Nuevos hoy" value={m.newToday} hint="Registros de hoy" />
        <StatCard label="Conversión" value={formatPct(m.conversion)} tone="green" hint={`Prueba → pago (de ${m.finishedTrial})`} />
        <StatCard label="Sin menú" value={m.withoutMenu} tone={m.withoutMenu ? "amber" : "default"} hint="Su sitio está vacío" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Necesitan atención">
          {attention.length === 0 ? (
            <p className="px-4 py-6 text-sm text-stone-500">Todos los restaurantes están bien.</p>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {attention.map(({ r, h }) => (
                <li key={r.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900 dark:text-white">{r.name}</p>
                    <p className="truncate text-xs text-stone-500">{h.issues[0]?.title}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${h.label === "En riesgo" ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"}`}>
                    {h.label} · {h.score}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/panel/salud" className="flex items-center gap-1 border-t border-stone-200 px-4 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 dark:border-stone-800">
            Ver la salud de todos <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card title="Últimos registros">
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {rows.filter((r) => r.plan !== "legacy").slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 dark:text-white">{r.name}</p>
                  <p className="truncate text-xs text-stone-500">{r.owner_email} · {formatDay(r.created_at)}</p>
                </div>
                <StatusBadge status={r.billing.status} />
              </li>
            ))}
            {rows.length <= 1 && <li className="px-4 py-6 text-sm text-stone-500">Aún no hay restaurantes registrados.</li>}
          </ul>
          <Link href="/panel/restaurantes" className="flex items-center gap-1 border-t border-stone-200 px-4 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 dark:border-stone-800">
            Ver todos los restaurantes <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card title="Últimos cobros" className="lg:col-span-2">
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {approved.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 truncate">{p.restaurant_name ?? "(eliminado)"} · {formatDay(p.created_at)}</span>
                <span className="font-semibold text-emerald-600">{money(p.amount)}</span>
              </li>
            ))}
            {approved.length === 0 && <li className="px-4 py-6 text-sm text-stone-500">Aún no hay cobros aprobados.</li>}
          </ul>
          <Link href="/panel/cobros" className="flex items-center gap-1 border-t border-stone-200 px-4 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 dark:border-stone-800">
            Ver el historial de cobros <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </>
  );
}
