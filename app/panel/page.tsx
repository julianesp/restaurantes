import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ExternalLink, Settings } from "lucide-react";
import BrasayaLogo from "@/components/BrasayaLogo";
import { all } from "@/lib/db";
import { isPlatformAdmin } from "@/lib/tenant";
import { tenantUrl } from "@/lib/tenant-host";
import { billingState, formatBillingDate, type BillingStatus } from "@/lib/billing";

export const metadata = { title: "Panel de Brasaya" };
export const dynamic = "force-dynamic";

interface RestaurantRow {
  id: string;
  slug: string;
  name: string;
  status: string;
  plan: string;
  trial_ends_at: string | null;
  paid_until: string | null;
  owner_email: string;
  custom_domain: string | null;
  created_at: string;
  items: number;
  orders: number;
  last_order: string | null;
  paid_total: number;
}

const STATUS_LABEL: Record<BillingStatus, { text: string; className: string }> = {
  exempt: { text: "Demo", className: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300" },
  trial: { text: "En prueba", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  active: { text: "Al día", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  grace: { text: "Vencido (gracia)", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  suspended: { text: "Suspendido", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
};

const money = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

// Panel de la plataforma: todos los restaurantes registrados. Solo administradores de Brasaya (ADMIN_EMAILS).
export default async function PlatformPanelPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/panel");
  // Los dueños de restaurantes que llegan aquí al iniciar sesión siguen a su propio panel
  if (!(await isPlatformAdmin())) redirect("/admin");

  const restaurants = await all<RestaurantRow>(
    `SELECT r.id, r.slug, r.name, r.status, r.plan, r.trial_ends_at, r.paid_until, r.owner_email,
            r.custom_domain, r.created_at,
            (SELECT COUNT(*) FROM menu_items i WHERE i.restaurant_id = r.id) AS items,
            (SELECT COUNT(*) FROM table_orders o WHERE o.restaurant_id = r.id) AS orders,
            (SELECT MAX(created_at) FROM table_orders o WHERE o.restaurant_id = r.id) AS last_order,
            (SELECT COALESCE(SUM(amount), 0) FROM subscription_payments p
              WHERE p.restaurant_id = r.id AND p.status = 'approved') AS paid_total
     FROM restaurants r
     ORDER BY r.created_at DESC`
  );

  const rows = restaurants.map((r) => ({ ...r, billing: billingState(r) }));
  const count = (s: BillingStatus) => rows.filter((r) => r.billing.status === s).length;
  const totalPaid = rows.reduce((sum, r) => sum + r.paid_total, 0);

  const summary = [
    { label: "Restaurantes", value: rows.length },
    { label: "En prueba", value: count("trial") },
    { label: "Al día", value: count("active") },
    { label: "Vencidos o suspendidos", value: count("grace") + count("suspended") },
    { label: "Recaudado", value: money(totalPaid) },
  ];

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Brasaya, ir al inicio">
              <BrasayaLogo size={32} />
            </Link>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Panel de la plataforma</h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {summary.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm dark:bg-stone-900">
              <p className="text-xs text-stone-500 dark:text-stone-400">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-stone-900 dark:text-white">{s.value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-stone-900">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500 dark:border-stone-800 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3">Restaurante</th>
                <th className="px-4 py-3">Dueño</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acceso hasta</th>
                <th className="px-4 py-3 text-right">Platos</th>
                <th className="px-4 py-3 text-right">Pedidos</th>
                <th className="px-4 py-3 text-right">Pagado</th>
                <th className="px-4 py-3">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {rows.map((r) => {
                const label = STATUS_LABEL[r.billing.status];
                return (
                  <tr key={r.id} className="text-stone-700 dark:text-stone-300">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-900 dark:text-white">{r.name}</p>
                      <p className="text-xs text-stone-500">{r.custom_domain || r.slug}</p>
                    </td>
                    <td className="px-4 py-3">{r.owner_email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${label.className}`}>
                        {label.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.billing.accessUntil ? formatBillingDate(r.billing.accessUntil) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">{r.items}</td>
                    <td className="px-4 py-3 text-right" title={r.last_order ? `Último: ${formatBillingDate(r.last_order)}` : undefined}>
                      {r.orders}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{money(r.paid_total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatBillingDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <a
                          href={tenantUrl(r.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-white"
                          aria-label={`Ver el sitio de ${r.name}`}
                          title="Ver sitio"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a
                          href={tenantUrl(r.slug, "/admin")}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-white"
                          aria-label={`Entrar a la administración de ${r.name}`}
                          title="Administrar"
                        >
                          <Settings className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-stone-500">
                    Aún no hay restaurantes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
