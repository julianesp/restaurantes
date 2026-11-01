import Link from "next/link";
import { CreditCard } from "lucide-react";
import RestaurantManager from "@/components/platform/RestaurantManager";
import { requirePlatformAdmin, loadRestaurants, computeMetrics, money } from "@/lib/platform-stats";
import { MONTHLY_PRICE_LABEL } from "@/lib/billing";
import { PageTitle, StatCard, Card, StatusBadge, SearchForm, formatDay, th, td, tableWrap, tbody } from "@/components/platform/ui";

// Estado de la suscripción de cada restaurante: vencimientos, pagos y acciones
export default async function SuscripcionesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePlatformAdmin();
  const { q = "" } = await searchParams;
  const all = (await loadRestaurants()).filter((r) => r.plan !== "legacy");
  const m = computeMetrics(all);
  const needle = q.trim().toLowerCase();
  // Primero los que vencen antes
  const rows = all
    .filter((r) => !needle || [r.name, r.slug, r.owner_email].some((v) => v.toLowerCase().includes(needle)))
    .sort((a, b) => (a.billing.daysLeft ?? -999) - (b.billing.daysLeft ?? -999));

  return (
    <>
      <PageTitle icon={CreditCard} title="Suscripciones" subtitle={`Mensualidad de ${MONTHLY_PRICE_LABEL} por restaurante. Los que vencen antes aparecen primero.`} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Al día" value={m.active} tone="green" hint="Pagando" />
        <StatCard label="En prueba" value={m.trial} tone="amber" hint="14 días gratis" />
        <StatCard label="Vencidos o suspendidos" value={m.grace + m.suspended} tone={m.grace + m.suspended ? "red" : "default"} />
        <StatCard label="Ingreso mensual" value={money(m.mrr)} tone="brand" hint={`Potencial: ${money(m.mrr + m.potential)}`} />
      </div>
      <SearchForm q={q} placeholder="Buscar restaurante o correo…" />
      <Card>
        <div className={tableWrap}>
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className={th}>Restaurante</th>
                <th className={th}>Estado</th>
                <th className={th}>Vence</th>
                <th className={th}>Último pago</th>
                <th className={`${th} text-right`}>Total pagado</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className={tbody}>
              {rows.map((r) => {
                const d = r.billing.daysLeft;
                return (
                  <tr key={r.id}>
                    <td className={td}>
                      <p className="font-medium text-stone-900 dark:text-white">{r.name}</p>
                      <p className="text-xs text-stone-500">{r.owner_email}</p>
                    </td>
                    <td className={td}><StatusBadge status={r.billing.status} /></td>
                    <td className={`${td} whitespace-nowrap`}>
                      {formatDay(r.billing.accessUntil)}
                      {d !== null && (
                        <p className={`text-xs ${d < 0 ? "text-red-600" : d <= 5 ? "text-yellow-600" : "text-stone-500"}`}>
                          {d < 0 ? `Venció hace ${-d} días` : `${d} días restantes`}
                        </p>
                      )}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>{r.last_payment ? formatDay(r.last_payment) : "Nunca"}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>{money(r.paid_total)}</td>
                    <td className={td}>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/panel/activar?r=${encodeURIComponent(r.id)}`} className="whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950/40">
                          Registrar pago
                        </Link>
                        <RestaurantManager
                          restaurant={{ id: r.id, slug: r.slug, name: r.name, plan: r.plan, status: r.status }}
                          accessUntil={formatDay(r.billing.accessUntil)}
                          expired={r.billing.blocked && r.status !== "suspended" && r.status !== "canceled"}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-stone-500">Sin resultados.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
