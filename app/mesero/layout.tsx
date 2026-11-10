import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import MeseroGate from "@/components/mesero/MeseroGate";
import { getStaffMember, getTenant, getTenantRole } from "@/lib/tenant";
import { billingState } from "@/lib/billing";

/**
 * /mesero lo usan los meseros con su PIN o con su cuenta (correo verificado, rol "waiter": entran
 * directo, sin PIN, y no ven nada de administración). Si entra un miembro del restaurante desde
 * "Panel Mesero" del admin, se mantiene la barra lateral del panel alrededor de la misma pantalla.
 */
export default async function MeseroLayout({ children }: { children: React.ReactNode }) {
  const [user, tenant] = await Promise.all([currentUser(), getTenant()]);
  const role = user && tenant ? await getTenantRole(tenant) : null;

  // Mesero con su cuenta: entra sin PIN. Un chef tiene su propia vista (/cocina).
  const staff = user && tenant && !role ? await getStaffMember(tenant) : null;
  if (staff?.role === "chef") redirect("/cocina");
  if (staff) return <MeseroGate account={{ name: staff.name }}>{children}</MeseroGate>;

  // La cuenta de Brasaya no tiene el panel del restaurante (app/admin/layout.tsx)
  if (!user || !tenant || !role || role.role === "platform") return <MeseroGate>{children}</MeseroGate>;

  const serializedUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map((email) => ({ emailAddress: email.emailAddress })),
  };

  return (
    <AdminShell user={serializedUser} billing={billingState(tenant)}>
      <MeseroGate>{children}</MeseroGate>
    </AdminShell>
  );
}
