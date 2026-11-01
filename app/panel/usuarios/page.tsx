import { Users, Crown, ShieldCheck } from "lucide-react";
import { requirePlatformAdmin, listAllMembers, loadRestaurants } from "@/lib/platform-stats";
import { PageTitle, StatCard, Card, StatusBadge, SearchForm, formatDay, th, td, tableWrap, tbody } from "@/components/platform/ui";

const platformAdmins = () =>
  (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

// Todas las personas con acceso a algún panel: miembros de restaurantes y administradores de Brasaya
export default async function UsuariosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePlatformAdmin();
  const { q = "" } = await searchParams;
  const [members, restaurants] = await Promise.all([listAllMembers(), loadRestaurants()]);
  const billing = new Map(restaurants.map((r) => [r.id, r.billing.status]));
  const admins = platformAdmins();
  const needle = q.trim().toLowerCase();
  const rows = members.filter(
    (m) => !needle || [m.email, m.restaurant_name, m.slug].some((v) => v.toLowerCase().includes(needle))
  );
  const unique = new Set(members.map((m) => m.email)).size;

  return (
    <>
      <PageTitle icon={Users} title="Usuarios" subtitle="Quién puede entrar al panel de cada restaurante. Para agregar o quitar, usa Gestionar en Restaurantes." />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Personas" value={unique} hint="Correos distintos" />
        <StatCard label="Dueños" value={members.filter((m) => m.role === "owner").length} tone="brand" hint="Uno por restaurante" />
        <StatCard label="Administradores" value={members.filter((m) => m.role === "admin").length} hint="Invitados por el dueño o por ti" />
        <StatCard label="Administradores de Brasaya" value={admins.length} tone="green" hint="ADMIN_EMAILS: entran a todo" />
      </div>

      <Card title="Administradores de Brasaya" className="mb-6">
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {admins.map((email) => (
            <li key={email} className="flex items-center gap-2 px-4 py-3 text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> {email}
            </li>
          ))}
        </ul>
      </Card>

      <SearchForm q={q} placeholder="Buscar por correo o restaurante…" />
      <Card>
        <div className={tableWrap}>
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className={th}>Correo</th>
                <th className={th}>Rol</th>
                <th className={th}>Restaurante</th>
                <th className={th}>Estado</th>
                <th className={th}>Desde</th>
              </tr>
            </thead>
            <tbody className={tbody}>
              {rows.map((m) => (
                <tr key={`${m.restaurant_id}:${m.email}`}>
                  <td className={td}>{m.email}</td>
                  <td className={td}>
                    {m.role === "owner" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                        <Crown className="h-3 w-3" /> Dueño
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">Administrador</span>
                    )}
                  </td>
                  <td className={td}>
                    {m.restaurant_name}
                    <p className="text-xs text-stone-500">{m.slug}</p>
                  </td>
                  <td className={td}>{billing.has(m.restaurant_id) && <StatusBadge status={billing.get(m.restaurant_id)!} />}</td>
                  <td className={`${td} whitespace-nowrap`}>{formatDay(m.created_at)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-stone-500">Sin resultados.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
