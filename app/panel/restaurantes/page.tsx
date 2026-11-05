import Link from "next/link";
import { BarChart3, ExternalLink, Store } from "lucide-react";
import RestaurantManager from "@/components/platform/RestaurantManager";
import { requirePlatformAdmin, loadRestaurants, money } from "@/lib/platform-stats";
import { tenantUrl } from "@/lib/tenant-host";
import type { BillingStatus } from "@/lib/billing";
import ExportButton from "@/components/platform/ExportButton";
import { PageTitle, Card, StatusBadge, SearchForm, formatDay, th, td, tableWrap, tbody } from "@/components/platform/ui";

const FILTERS: { value: string; label: string; match: (s: BillingStatus) => boolean }[] = [
  { value: "", label: "Todos", match: () => true },
  { value: "prueba", label: "En prueba", match: (s) => s === "trial" },
  { value: "activos", label: "Al día", match: (s) => s === "active" },
  { value: "vencidos", label: "Vencidos o suspendidos", match: (s) => s === "grace" || s === "suspended" },
];

const iconLink = "rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-white";

// Todos los restaurantes: uso del sistema y acciones (Gestionar)
export default async function RestaurantesPage({ searchParams }: { searchParams: Promise<{ q?: string; estado?: string }> }) {
  await requirePlatformAdmin();
  const { q = "", estado = "" } = await searchParams;
  const filter = FILTERS.find((f) => f.value === estado) ?? FILTERS[0];
  const needle = q.trim().toLowerCase();
  const rows = (await loadRestaurants()).filter(
    (r) =>
      filter.match(r.billing.status) &&
      (!needle || [r.name, r.slug, r.owner_email, r.custom_domain ?? ""].some((v) => v.toLowerCase().includes(needle)))
  );

  return (
    <>
      <PageTitle icon={Store} title="Restaurantes" subtitle="Todos los restaurantes registrados. Toque un nombre para ver su ficha de análisis." />
      <div className="mb-3 flex justify-end"><ExportButton tipo="restaurantes" /></div>
      <SearchForm
        q={q}
        placeholder="Buscar por nombre, subdominio o correo…"
        extra={
          <select name="estado" defaultValue={estado} aria-label="Estado" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-white">
            {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        }
      />
      <Card>
        <div className={tableWrap}>
          <table className="w-full min-w-[960px]">
            <thead className="border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className={th}>Restaurante</th>
                <th className={th}>Dueño</th>
                <th className={th}>Estado</th>
                <th className={th}>Acceso hasta</th>
                <th className={`${th} text-right`}>Platos</th>
                <th className={`${th} text-right`}>Pedidos (30 d)</th>
                <th className={`${th} text-right`}>Pagado</th>
                <th className={th}>Registro</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className={tbody}>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className={td}>
                    <Link href={`/panel/restaurantes/${r.id}`} className="font-medium text-stone-900 hover:text-primary-600 hover:underline dark:text-white">{r.name}</Link>
                    <p className="text-xs text-stone-500">{r.custom_domain || r.slug}</p>
                  </td>
                  <td className={td}>{r.owner_email}</td>
                  <td className={td}><StatusBadge status={r.billing.status} /></td>
                  <td className={`${td} whitespace-nowrap`}>
                    {formatDay(r.billing.accessUntil)}
                    {r.billing.daysLeft !== null && r.billing.daysLeft >= 0 && (
                      <p className="text-xs text-stone-500">{r.billing.daysLeft} días</p>
                    )}
                  </td>
                  <td className={`${td} text-right`}>{r.items}</td>
                  <td className={`${td} text-right`} title={r.last_order ? `Último: ${formatDay(r.last_order)}` : "Sin pedidos"}>
                    {r.orders_30d}
                    <p className="text-xs text-stone-500">{r.orders} en total</p>
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>{money(r.paid_total)}</td>
                  <td className={`${td} whitespace-nowrap`}>{formatDay(r.created_at)}</td>
                  <td className={td}>
                    <div className="flex justify-end gap-1">
                      <a href={tenantUrl(r.slug)} target="_blank" rel="noreferrer" className={iconLink} aria-label={`Ver el sitio de ${r.name}`} title="Ver sitio">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Link href={`/panel/restaurantes/${r.id}`} className={iconLink} aria-label={`Analizar ${r.name}`} title="Analizar">
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                      <RestaurantManager
                        restaurant={{ id: r.id, slug: r.slug, name: r.name, plan: r.plan, status: r.status }}
                        accessUntil={formatDay(r.billing.accessUntil)}
                        expired={r.billing.blocked && r.status !== "suspended" && r.status !== "canceled"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-stone-500">No hay restaurantes con ese filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
