import Link from "next/link";
import { MousePointerClick } from "lucide-react";
import ExcludeBrowserToggle from "@/components/platform/ExcludeBrowserToggle";
import { requirePlatformAdmin, loadVisitStats, colombiaDay } from "@/lib/platform-stats";
import { TRACKED_PATHS } from "@/lib/visits";
import { PageTitle, StatCard, Card, formatDateTime } from "@/components/platform/ui";

const RANGES = [7, 30, 90] as const;
const countryName = (code: string) => {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try {
    return new Intl.DisplayNames(["es"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

function Breakdown({ title, hint, rows, total, format = (s: string) => s }: {
  title: string; hint: string; rows: { label: string; count: number }[]; total: number; format?: (s: string) => string;
}) {
  return (
    <Card title={title}>
      <p className="px-4 pt-3 text-xs text-stone-500">{hint}</p>
      <ul className="space-y-2 p-4">
        {rows.map((r) => {
          const pct = total ? Math.round((r.count / total) * 100) : 0;
          return (
            <li key={r.label} className="text-sm">
              <div className="mb-1 flex justify-between gap-2">
                <span className="truncate">{format(r.label)}</span>
                <span className="shrink-0 text-stone-500">{r.count} ({pct}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800">
                <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
        {rows.length === 0 && <li className="text-sm text-stone-500">Sin datos.</li>}
      </ul>
    </Card>
  );
}

// Visitas anónimas a la landing y al registro de brasaya.com (ver components/platform/VisitTracker.tsx)
export default async function VisitasPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  await requirePlatformAdmin();
  const { dias } = await searchParams;
  const days = RANGES.find((d) => String(d) === dias) ?? 30;
  const s = await loadVisitStats(days);

  // Serie completa (días sin visitas en 0) para el gráfico
  const byDay = new Map(s.daily.map((d) => [d.day, d]));
  const series = Array.from({ length: days }, (_, i) => {
    const day = colombiaDay(new Date(Date.now() - (days - 1 - i) * 86_400_000));
    return { day, visitors: byDay.get(day)?.visitors ?? 0, visits: byDay.get(day)?.visits ?? 0 };
  });
  const max = Math.max(1, ...series.map((d) => d.visits));
  const W = 720, H = 160, bar = W / series.length;

  return (
    <>
      <PageTitle icon={MousePointerClick} title="Visitas al sitio" subtitle="Navegadores que abren la página de inicio y el registro de Brasaya. Sin IP ni datos personales." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {RANGES.map((d) => (
            <Link
              key={d}
              href={`/panel/visitas?dias=${d}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${d === days ? "bg-primary-600 text-white" : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"}`}
            >
              {d} días
            </Link>
          ))}
        </div>
        <ExcludeBrowserToggle />
      </div>
      <p className="mb-6 text-xs text-stone-500">
        {s.since ? `Registrando visitas desde el ${formatDateTime(s.since)} (hora de Colombia). No hay datos anteriores.` : "Aún no hay visitas registradas."}
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Visitantes únicos" value={s.uniqueVisitors} tone="brand" hint={`Últimos ${days} días`} />
        <StatCard label="Visitas" value={s.visits} hint="Una por sesión del navegador" />
        <StatCard label="Hoy" value={s.today} hint={`${s.todayVisitors} visitantes`} />
        <StatCard label="Nuevos" value={s.newVisitors} tone="green" hint="Primera vez que se ven" />
        <StatCard label="Volvieron" value={s.returning} hint="Ya habían visitado antes" />
        <StatCard label="Con sesión iniciada" value={s.signedIn} hint="Ya son usuarios" />
        <StatCard label="Anónimos" value={Math.max(s.uniqueVisitors - s.signedIn, 0)} hint="Sin sesión iniciada" />
      </div>

      <Card title="Evolución diaria" className="mb-6">
        <div className="p-4">
          <svg viewBox={`0 0 ${W} ${H + 20}`} className="h-48 w-full" role="img" aria-label={`Visitas por día en los últimos ${days} días`}>
            {series.map((d, i) => {
              const h = (d.visits / max) * H;
              const hv = (d.visitors / max) * H;
              return (
                <g key={d.day}>
                  <title>{`${d.day}: ${d.visitors} visitantes, ${d.visits} visitas`}</title>
                  <rect x={i * bar + bar * 0.15} y={H - h} width={bar * 0.7} height={h} style={{ fill: "rgb(var(--primary-500) / 0.3)" }} rx={2} />
                  <rect x={i * bar + bar * 0.3} y={H - hv} width={bar * 0.4} height={hv} style={{ fill: "rgb(var(--primary-600))" }} rx={2} />
                </g>
              );
            })}
            {[0, Math.floor(series.length / 2), series.length - 1].map((i) => (
              <text key={i} x={i * bar + bar / 2} y={H + 15} textAnchor="middle" style={{ fill: "currentColor", fontSize: 10 }} className="text-stone-500">
                {series[i].day.slice(5).split("-").reverse().join("/")}
              </text>
            ))}
          </svg>
          <p className="mt-2 flex gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1"><svg width="10" height="10" aria-hidden><rect width="10" height="10" rx="2" style={{ fill: "rgb(var(--primary-600))" }} /></svg> Visitantes únicos</span>
            <span className="flex items-center gap-1"><svg width="10" height="10" aria-hidden><rect width="10" height="10" rx="2" style={{ fill: "rgb(var(--primary-500) / 0.3)" }} /></svg> Visitas</span>
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Breakdown title="Tipo de dispositivo" hint="Celular, tablet o computador" rows={s.breakdown.device} total={s.uniqueVisitors} />
        <Breakdown title="Sistema operativo" hint="Visitantes únicos" rows={s.breakdown.os} total={s.uniqueVisitors} />
        <Breakdown title="Navegador" hint="Visitantes únicos" rows={s.breakdown.browser} total={s.uniqueVisitors} />
        <Breakdown title="País" hint="Según la red del visitante" rows={s.breakdown.country} total={s.uniqueVisitors} format={countryName} />
        <Breakdown title="Origen" hint="Campaña (utm) o sitio que los trajo" rows={s.breakdown.source} total={s.uniqueVisitors} />
        <Breakdown title="Página" hint="Dónde llegaron" rows={s.breakdown.path} total={s.uniqueVisitors} format={(p) => TRACKED_PATHS[p] ?? p} />
      </div>

      <Card title="Cómo se cuentan" className="mt-6">
        <ul className="list-disc space-y-1 px-8 py-4 text-sm text-stone-600 dark:text-stone-300">
          <li>Se cuenta una visita por sesión del navegador en la página de inicio y en el registro de Brasaya. Las páginas de cada restaurante no se cuentan.</li>
          <li>Cada visitante es un código aleatorio guardado en su navegador: no se guarda la IP ni datos personales.</li>
          <li>Si alguien borra los datos del navegador o usa modo incógnito, cuenta como nuevo: la cifra puede quedar algo por encima de la real.</li>
          <li>No se cuentan los robots, quienes activan “No rastrear” ni los navegadores excluidos.</li>
        </ul>
      </Card>
    </>
  );
}
