import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, CheckCircle2, Circle, ExternalLink, MessageCircle } from "lucide-react";
import RestaurantManager from "@/components/platform/RestaurantManager";
import {
  requirePlatformAdmin, loadRestaurants, restaurantHealth, whatsappLink, money,
  salesByDay, restaurantPayments, restaurantAudit,
} from "@/lib/platform-stats";
import { listMembers, AUDIT_ACTIONS } from "@/lib/platform-admin";
import { topItems } from "@/lib/stats";
import { tenantUrl } from "@/lib/tenant-host";
import { normalizeNequi } from "@/lib/nequi";
import { PageTitle, StatCard, Card, StatusBadge, formatDay, formatDateTime, th, td, tableWrap, tbody } from "@/components/platform/ui";

// Ficha de análisis de UN restaurante para el equipo de Brasaya: uso, ventas, salud, configuración,
// equipo y cobros. La cuenta de Brasaya llega aquí también desde el "Administrar" del restaurante
// (app/admin/layout.tsx), porque no usa las opciones del panel del restaurante.

const LEVEL_STYLE = {
  grave: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  ajuste: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  sugerencia: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
} as const;

const PAYMENT_STATUS: Record<string, string> = { approved: "Aprobado", pending: "Pendiente", rejected: "Rechazado", failed: "Fallido" };

const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;

// Día AAAA-MM-DD → "lun, 3 nov" (UTC para no correr el día)
const shortDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export default async function RestauranteFichaPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await params;
  const [r] = await loadRestaurants(id);
  if (!r) notFound();

  const [days, top, members, payments, audit] = await Promise.all([
    salesByDay(r.id, 30),
    topItems(r.id, "month", 5),
    listMembers(r.id),
    restaurantPayments(r.id),
    restaurantAudit(r.id),
  ]);
  const health = restaurantHealth(r);
  const s = r.settings;
  const wa = whatsappLink(s);
  const sold = days.reduce((sum, d) => sum + d.orders, 0);
  const avgTicket = sold > 0 ? r.sales_30d / sold : 0;
  const activeDays = days.filter((d) => d.orders > 0).length;

  const setup = [
    { label: "Platos en el menú", done: r.items > 0, detail: `${r.items} activos` },
    { label: "Logo", done: filled(s.logo_url) },
    { label: "Dirección", done: filled(s.address), detail: filled(s.address) ? String(s.address) : undefined },
    { label: "WhatsApp o teléfono", done: filled(s.whatsapp) || filled(s.phone) },
    { label: "Horario por días", done: filled(s.hours_schedule), detail: filled(s.hours) ? String(s.hours) : undefined },
    { label: "Pagos en línea (ePayco propio)", done: s.online_payments === true },
    { label: "Nequi para transferencias", done: !!normalizeNequi(filled(s.nequi_number) ? String(s.nequi_number) : "") },
    { label: "Avisos de pedidos (Telegram o WhatsApp)", done: filled(s.telegram_chat_id) || filled(s.whatsapp_alerts) },
    { label: "Mesas con QR", done: r.tables > 0, detail: `${r.tables} mesas` },
    { label: "Menú del día", done: r.specials > 0, detail: `${r.specials} platos` },
  ];

  return (
    <>
      <Link href="/panel/restaurantes" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Restaurantes
      </Link>
      <PageTitle icon={BarChart3} title={r.name} subtitle={`${r.custom_domain || tenantUrl(r.slug).replace(/^https?:\/\//, "").replace(/\/$/, "")} · registrado el ${formatDay(r.created_at)}`} />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge status={r.billing.status} />
        <span className="text-sm text-stone-500">
          Acceso hasta {formatDay(r.billing.accessUntil)}
          {r.billing.daysLeft !== null && r.billing.daysLeft >= 0 && ` (${r.billing.daysLeft} días)`}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <a href={tenantUrl(r.slug)} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700">
            <ExternalLink className="h-4 w-4" /> Ver sitio
          </a>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700">
              <MessageCircle className="h-4 w-4" /> Escribirle
            </a>
          )}
          <RestaurantManager
            restaurant={{ id: r.id, slug: r.slug, name: r.name, plan: r.plan, status: r.status }}
            accessUntil={formatDay(r.billing.accessUntil)}
            expired={r.billing.blocked && r.status !== "suspended" && r.status !== "canceled"}
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Ventas (30 días)" value={money(r.sales_30d)} hint={`${sold} pedidos, sin cancelados`} tone="brand" />
        <StatCard label="Ticket promedio" value={sold > 0 ? money(avgTicket) : "—"} hint="Últimos 30 días" />
        <StatCard label="Días con pedidos" value={`${activeDays} de 30`} hint={r.last_order ? `Último: ${formatDay(r.last_order)}` : "Nunca ha recibido pedidos"} />
        <StatCard
          label="Salud"
          value={`${health.score}/100`}
          hint={health.label}
          tone={health.score < 50 ? "red" : health.score < 80 ? "amber" : "green"}
        />
        <StatCard label="Pedidos (7 días)" value={r.orders_7d} hint={`${r.orders} en total`} />
        <StatCard label="Platos activos" value={r.items} />
        <StatCard label="Mensualidad pagada" value={money(r.paid_total)} hint={r.last_payment ? `Último pago: ${formatDay(r.last_payment)}` : "Nunca ha pagado"} />
        <StatCard label="Personas con acceso" value={r.members} hint={r.owner_email} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="Qué le falta o debe mejorar">
          {health.issues.length === 0 ? (
            <p className="px-4 py-6 text-sm text-stone-500">Todo en orden.</p>
          ) : (
            <ul className={tbody}>
              {health.issues.map((i) => (
                <li key={i.title} className="flex gap-3 px-4 py-3">
                  <span className={`h-fit whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_STYLE[i.level]}`}>{i.level}</span>
                  <div className="text-sm">
                    <p className="font-medium text-stone-900 dark:text-white">{i.title}</p>
                    <p className="text-stone-500">{i.advice}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Configuración del sitio">
          <ul className={tbody}>
            {setup.map((item) => (
              <li key={item.label} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                {item.done
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-label="Listo" />
                  : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-label="Pendiente" />}
                <span className={item.done ? "text-stone-900 dark:text-white" : "text-stone-500"}>{item.label}</span>
                {item.detail && <span className="ml-auto truncate pl-2 text-right text-xs text-stone-500">{item.detail}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="Pedidos por día (últimos 30 días)">
          <div className={`${tableWrap} max-h-96 overflow-y-auto`}>
            <table className="w-full">
              <thead className="border-b border-stone-200 dark:border-stone-800">
                <tr><th className={th}>Día</th><th className={`${th} text-right`}>Pedidos</th><th className={`${th} text-right`}>Ventas</th></tr>
              </thead>
              <tbody className={tbody}>
                {days.map((d) => (
                  <tr key={d.day}>
                    <td className={td}>{shortDay(d.day)}</td>
                    <td className={`${td} text-right`}>{d.orders}</td>
                    <td className={`${td} text-right`}>{money(d.sales)}</td>
                  </tr>
                ))}
                {days.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-stone-500">Sin pedidos en los últimos 30 días.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Platos más vendidos (este mes)">
          <div className={tableWrap}>
            <table className="w-full">
              <thead className="border-b border-stone-200 dark:border-stone-800">
                <tr><th className={th}>Plato</th><th className={`${th} text-right`}>Unidades</th><th className={`${th} text-right`}>Ventas</th></tr>
              </thead>
              <tbody className={tbody}>
                {top.map((t) => (
                  <tr key={String(t.item_id ?? t.item_name)}>
                    <td className={td}>{String(t.item_name)}</td>
                    <td className={`${td} text-right`}>{Number(t.total_quantity_sold)}</td>
                    <td className={`${td} text-right`}>{money(Number(t.total_revenue))}</td>
                  </tr>
                ))}
                {top.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-stone-500">Todavía no ha vendido platos este mes.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="Personas con acceso">
          <ul className={tbody}>
            {members.map((m) => (
              <li key={m.email} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="truncate text-stone-900 dark:text-white">{m.email}</span>
                <span className="ml-auto text-xs text-stone-500">{m.role === "owner" ? "Dueño" : "Administrador"} · desde {formatDay(m.created_at)}</span>
              </li>
            ))}
            {members.length === 0 && <li className="px-4 py-6 text-sm text-stone-500">Nadie tiene acceso.</li>}
          </ul>
        </Card>

        <Card title="Cobros de la mensualidad">
          <div className={tableWrap}>
            <table className="w-full">
              <thead className="border-b border-stone-200 dark:border-stone-800">
                <tr><th className={th}>Fecha</th><th className={th}>Estado</th><th className={`${th} text-right`}>Valor</th></tr>
              </thead>
              <tbody className={tbody}>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>{formatDay(p.created_at)}<p className="text-xs text-stone-500">{p.payment_method ?? p.reference}</p></td>
                    <td className={td}>{PAYMENT_STATUS[p.status] ?? p.status}</td>
                    <td className={`${td} text-right`}>{money(p.amount)}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-stone-500">Sin cobros todavía.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Lo que ha hecho el equipo de Brasaya con este restaurante">
        <ul className={tbody}>
          {audit.map((a, i) => (
            <li key={`${a.created_at}-${i}`} className="px-4 py-2.5 text-sm">
              <span className="text-stone-900 dark:text-white">{AUDIT_ACTIONS[a.action as keyof typeof AUDIT_ACTIONS] ?? a.action}</span>
              {a.detail && <span className="text-stone-500"> · {a.detail}</span>}
              <p className="text-xs text-stone-500">{formatDateTime(a.created_at)} · {a.admin_email}</p>
            </li>
          ))}
          {audit.length === 0 && <li className="px-4 py-6 text-sm text-stone-500">Sin acciones registradas.</li>}
        </ul>
      </Card>
    </>
  );
}
