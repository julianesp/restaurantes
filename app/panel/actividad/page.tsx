import { History } from "lucide-react";
import { all } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/platform-stats";
import { AUDIT_ACTIONS } from "@/lib/platform-admin";
import { PageTitle, Card, SearchForm, formatDateTime, th, td, tableWrap, tbody } from "@/components/platform/ui";

interface AuditRow {
  id: string;
  admin_email: string;
  action: string;
  restaurant_name: string | null;
  detail: string | null;
  created_at: string;
}

const DANGER = new Set(["delete", "suspend", "member_remove", "owner_transfer"]);

// Quién hizo qué desde /panel (suspensiones, borrados, pagos manuales, miembros…)
export default async function ActividadPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePlatformAdmin();
  const { q = "" } = await searchParams;
  const rows = await all<AuditRow>(
    "SELECT id, admin_email, action, restaurant_name, detail, created_at FROM platform_audit ORDER BY created_at DESC LIMIT 500"
  );
  const needle = q.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      !needle ||
      [r.admin_email, r.restaurant_name ?? "", r.detail ?? "", AUDIT_ACTIONS[r.action as keyof typeof AUDIT_ACTIONS] ?? r.action]
        .some((v) => v.toLowerCase().includes(needle))
  );

  return (
    <>
      <PageTitle icon={History} title="Registro de actividad" subtitle="Cada cambio hecho desde este panel: quién, qué y a qué restaurante. Se conserva aunque el restaurante se elimine." />
      <SearchForm q={q} placeholder="Buscar por restaurante, acción o administrador…" />
      <Card>
        <div className={tableWrap}>
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className={th}>Fecha</th>
                <th className={th}>Acción</th>
                <th className={th}>Restaurante</th>
                <th className={th}>Detalle</th>
                <th className={th}>Por</th>
              </tr>
            </thead>
            <tbody className={tbody}>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className={`${td} whitespace-nowrap`}>{formatDateTime(r.created_at)}</td>
                  <td className={`${td} font-medium ${DANGER.has(r.action) ? "text-red-700 dark:text-red-400" : "text-stone-900 dark:text-white"}`}>
                    {AUDIT_ACTIONS[r.action as keyof typeof AUDIT_ACTIONS] ?? r.action}
                  </td>
                  <td className={td}>{r.restaurant_name ?? "—"}</td>
                  <td className={`${td} break-words text-xs`}>{r.detail ?? ""}</td>
                  <td className={`${td} text-xs`}>{r.admin_email}</td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-stone-500">Aún no hay actividad registrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
