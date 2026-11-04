import { currentUser } from "@clerk/nextjs/server";
import AdminShell from "@/components/admin/AdminShell";
import MeseroGate from "@/components/mesero/MeseroGate";
import { getTenant, getTenantRole } from "@/lib/tenant";
import { billingState } from "@/lib/billing";

/**
 * /mesero lo usan los meseros con su PIN (sin cuenta). Si entra un miembro del restaurante desde
 * "Panel Mesero" del admin, se mantiene la barra lateral del panel alrededor de la misma pantalla.
 */
export default async function MeseroLayout({ children }: { children: React.ReactNode }) {
  const [user, tenant] = await Promise.all([currentUser(), getTenant()]);
  const role = user && tenant ? await getTenantRole(tenant) : null;

  if (!user || !tenant || !role) return <MeseroGate>{children}</MeseroGate>;

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
