import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import KitchenShell from "@/components/kitchen/KitchenShell";
import { getStaffMember, getTenant, getTenantRole, isPlatformHost, isTenantServing } from "@/lib/tenant";
import { platformUrl } from "@/lib/tenant-host";

/**
 * /cocina: la vista del chef (pedidos de las mesas y chat con los meseros). Entra con su cuenta
 * (correo verificado, rol "chef" en restaurant_members). Un dueño o administrador también puede verla.
 * El chef NO tiene el panel de administración: solo esto.
 */
export default async function CocinaLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/cocina");

  const tenant = (await isPlatformHost()) ? null : await getTenant();
  if (!tenant || !isTenantServing(tenant)) redirect("/");

  const admin = await getTenantRole(tenant);
  // La cuenta de Brasaya no usa las opciones del restaurante: lo analiza desde /panel
  if (admin?.role === "platform") redirect(platformUrl(`/panel/restaurantes/${tenant.id}`));

  const staff = admin ? null : await getStaffMember(tenant);
  if (!admin && !staff) redirect("/?unauthorized=true");
  // Un mesero con cuenta tiene su propia vista
  if (staff?.role === "waiter") redirect("/mesero");

  const name = staff?.name ?? ([user.firstName, user.lastName].filter(Boolean).join(" ") || "Cocina");
  return (
    <KitchenShell name={name} isAdmin={!!admin}>
      {children}
    </KitchenShell>
  );
}
