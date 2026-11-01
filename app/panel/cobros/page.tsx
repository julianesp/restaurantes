import { Receipt } from "lucide-react";
import { requirePlatformAdmin, listAllPayments, money, colombiaDay } from "@/lib/platform-stats";
import { MANUAL_METHODS } from "@/lib/platform-admin";
import ExportButton from "@/components/platform/ExportButton";
import { PageTitle, StatCard, Card, SearchForm, formatDateTime, th, td, tableWrap, tbody } from "@/components/platform/ui";

const STATUS = {
  approved: { text: "Aprobado", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  pending: { text: "Pendiente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  rejected: { text: "Rechazado", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
  failed: { text: "Fallido", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
} as const;

const methodLabel = (m: string | null) => {
  if (!m) return "ePayco";
  if (m.startsWith("manual:")) return `${MANUAL_METHODS[m.slice(7) as keyof typeof MANUAL_METHODS] ?? m.slice(7)} (manual)`;
  return `ePayco · ${m}`;
};

// Todos los pagos de suscripción (ePayco y manuales)
export default async function CobrosPage({ searchParams }: { searchParams: Promise<{ q?: string; estado?: string }> }) {
  await requirePlatformAdmin();
  const { q = "", estado = "" } = await searchParams;
  const payments = await listAllPayments();
  const month = colombiaDay().slice(0, 7);
  const approved = payments.filter((p) => p.status === "approved");
  const needle = q.trim().toLowerCase();
  const rows = payments.filter(
    (p) =>
      (!estado || p.status === estado) &&
      (!needle || [p.restaurant_name ?? "", p.slug ?? "", p.reference, p.ref_payco ?? "", p.notes ?? ""].some((v) => v.toLowerCase().includes(needle)))
  );

  return (
    <>
      <PageTitle icon={Receipt} title="Historial de cobros" subtitle="Todos los pagos de la mensualidad: en línea (ePayco) y registrados a mano." />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total cobrado" value={money(approved.reduce((s, p) => s + p.amount, 0))} tone="green" hint={`${approved.length} pagos aprobados`} />
        <StatCard
          label="Este mes"
          value={money(approved.filter((p) => colombiaDay(new Date(p.created_at)).startsWith(month)).reduce((s, p) => s + p.amount, 0))}
          tone="brand"
        />
        <StatCard label="Pendientes" value={payments.filter((p) => p.status === "pending").length} tone="amber" hint="Checkouts sin terminar" />
        <StatCard label="Rechazados o fallidos" value={payments.filter((p) => p.status === "rejected" || p.status === "failed").length} tone="red" />
      </div>
      <div className="mb-3 flex justify-end"><ExportButton tipo="cobros" /></div>
      <SearchForm
        q={q}
        placeholder="Buscar restaurante, referencia o ref_payco…"
        extra={
          <select name="estado" defaultValue={estado} aria-label="Estado" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-white">
            <option value="">Todos los estados</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
          </select>
        }
      />
      <Card>
        <div className={tableWrap}>
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className={th}>Fecha</th>
                <th className={th}>Restaurante</th>
                <th className={`${th} text-right`}>Monto</th>
                <th className={th}>Medio</th>
                <th className={th}>Estado</th>
                <th className={th}>Referencia</th>
              </tr>
            </thead>
            <tbody className={tbody}>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className={`${td} whitespace-nowrap`}>{formatDateTime(p.created_at)}</td>
                  <td className={td}>{p.restaurant_name ?? "(eliminado)"}<p className="text-xs text-stone-500">{p.months} {p.months === 1 ? "mes" : "meses"}</p></td>
                  <td className={`${td} whitespace-nowrap text-right font-semibold`}>{money(p.amount)}</td>
                  <td className={td}>{methodLabel(p.payment_method)}{p.created_by?.includes("@") && p.payment_method?.startsWith("manual:") && <p className="text-xs text-stone-500">por {p.created_by}</p>}</td>
                  <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[p.status].className}`}>{STATUS[p.status].text}</span></td>
                  <td className={`${td} max-w-xs break-all font-mono text-xs`}>
                    {p.reference}
                    {p.ref_payco && <p className="text-stone-500">ref_payco {p.ref_payco}</p>}
                    {p.notes && <p className="font-sans text-stone-500">{p.notes}</p>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-stone-500">Aún no hay cobros.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
