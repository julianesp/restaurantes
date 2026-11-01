import { BarChart3, Lightbulb } from "lucide-react";
import { requirePlatformAdmin, loadRestaurants, computeMetrics, listAllPayments, money, formatPct, colombiaDay } from "@/lib/platform-stats";
import { PageTitle, StatCard, Card } from "@/components/platform/ui";

// Métricas del negocio: conversión, abandono, proyecciones y recomendaciones
export default async function ReportesPage() {
  await requirePlatformAdmin();
  const [rows, payments] = await Promise.all([loadRestaurants(), listAllPayments()]);
  const m = computeMetrics(rows);
  const real = rows.filter((r) => r.plan !== "legacy");
  const approved = payments.filter((p) => p.status === "approved");

  // Cobrado por mes (últimos 6 meses, hora de Colombia)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    return colombiaDay(d).slice(0, 7);
  });
  const byMonth = months.map((month) => ({
    month,
    total: approved.filter((p) => colombiaDay(new Date(p.created_at)).startsWith(month)).reduce((s, p) => s + p.amount, 0),
    signups: real.filter((r) => colombiaDay(new Date(r.created_at)).startsWith(month)).length,
  }));
  const maxTotal = Math.max(1, ...byMonth.map((b) => b.total));
  const prevMonthSignups = byMonth[4].signups;
  const growth = prevMonthSignups ? ((m.newThisMonth - prevMonthSignups) / prevMonthSignups) * 100 : null;
  const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const monthName = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

  const tips: string[] = [];
  if (m.trial) tips.push(`${m.trial} restaurante(s) en prueba: escríbeles antes de que termine (Salud de los restaurantes muestra a quién primero).`);
  if (m.grace) tips.push(`${m.grace} restaurante(s) vencido(s) en días de gracia: recuérdales el pago antes de que se suspenda su sitio.`);
  if (m.withoutMenu) tips.push(`${m.withoutMenu} restaurante(s) sin platos en el menú: su sitio está vacío y difícilmente van a pagar.`);
  if (m.conversion !== null && m.conversion < 30) tips.push("La conversión de prueba a pago está por debajo del 30%: revisa qué les falta a los que no pagaron.");
  if (m.conversion !== null && m.conversion >= 50) tips.push("Buena conversión de prueba a pago: enfócate en conseguir más registros.");
  if (m.newThisMonth === 0) tips.push("No hay registros este mes: revisa Visitas al sitio para ver si llega gente a la landing.");

  return (
    <>
      <PageTitle icon={BarChart3} title="Reportes" subtitle="Métricas del negocio (sin contar el restaurante de demostración)." />

      <h2 className="mb-3 text-sm font-semibold text-stone-900 dark:text-white">Resumen general</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Restaurantes" value={m.total} />
        <StatCard label="Al día" value={m.active} tone="green" />
        <StatCard label="Ingreso mensual" value={money(m.mrr)} tone="brand" />
        <StatCard label="Nuevos este mes" value={m.newThisMonth} hint={`${m.newToday} hoy`} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-stone-900 dark:text-white">Conversión</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="En prueba" value={m.trial} tone="amber" />
        <StatCard label="Conversión" value={formatPct(m.conversion)} tone="green" hint={`De ${m.finishedTrial} que terminaron la prueba, % que pagó`} />
        <StatCard label="Vencidos o suspendidos" value={m.grace + m.suspended} tone="red" />
        <StatCard label="Abandono" value={formatPct(m.churn)} tone="red" hint="De los que terminaron la prueba, % hoy sin pagar" />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-stone-900 dark:text-white">Proyecciones</h2>
      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        <StatCard label="Si todos los que están en prueba pagan" value={money(m.mrr + m.potential)} tone="brand" hint={`+${money(m.potential)} al mes`} />
        <StatCard label="Crecimiento de registros" value={growth === null ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`} hint={`${m.newThisMonth} este mes vs. ${prevMonthSignups} el anterior`} />
        <StatCard label="Restaurantes con pedidos" value={formatPct(m.total ? (m.withOrders / m.total) * 100 : null)} tone="green" hint={`${m.withOrders} de ${m.total} ya recibieron pedidos`} />
      </div>

      <Card title="Cobrado y registros por mes" className="mb-6">
        <ul className="space-y-2 p-4 text-sm">
          {byMonth.map((b) => (
            <li key={b.month} className="grid grid-cols-[4.5rem_1fr_6.5rem] items-center gap-3 sm:grid-cols-[5rem_1fr_7rem_6rem]">
              <span className="text-stone-500">{monthName(b.month)}</span>
              <span className="h-4 rounded bg-stone-100 dark:bg-stone-800">
                <span className="block h-full rounded bg-emerald-500" style={{ width: `${(b.total / maxTotal) * 100}%` }} />
              </span>
              <span className="text-right font-medium">{money(b.total)}</span>
              <span className="hidden text-right text-stone-500 sm:block">{b.signups} {b.signups === 1 ? "registro" : "registros"}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Recomendaciones">
        <ul className="space-y-2 p-4">
          {tips.map((t) => (
            <li key={t} className="flex gap-2 text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" /> {t}
            </li>
          ))}
          {tips.length === 0 && <li className="text-sm text-stone-500">Nada urgente por ahora.</li>}
        </ul>
      </Card>
    </>
  );
}
