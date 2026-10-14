import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getTenant, getTenantRole, getVerifiedEmails, isPlatformAdmin } from "@/lib/tenant";
import { tenantUrl } from "@/lib/tenant-host";
import { first } from "@/lib/db";
import { billingState } from "@/lib/billing";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const tenant = await getTenant();

  if (!tenant) {
    // Dominio raíz de la plataforma: los administradores de Brasaya van al panel de la plataforma;
    // los demás, a su restaurante o al registro
    if (await isPlatformAdmin()) redirect("/panel");
    const emails = await getVerifiedEmails();
    const owned = emails.length
      ? await first<{ slug: string }>(
          `SELECT r.slug FROM restaurant_members m JOIN restaurants r ON r.id = m.restaurant_id
           WHERE m.email IN (${emails.map(() => "?").join(", ")}) LIMIT 1`,
          ...emails
        )
      : null;
    const slug = owned?.slug;
    redirect(slug ? tenantUrl(slug, "/admin") : "/registro");
  }

  // Solo miembros de ESTE restaurante (o administradores de la plataforma) pueden entrar
  const role = await getTenantRole(tenant);
  if (!role) {
    redirect("/?unauthorized=true");
  }

  // Serializar solo los datos necesarios para el Client Component
  const serializedUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map((email) => ({
      emailAddress: email.emailAddress,
    })),
  };

  // Estado de la suscripción: aviso de pago o bloqueo del panel (ver lib/billing.ts)
  const billing = billingState(tenant);

  return (
    <AdminShell user={serializedUser} billing={billing}>
      {children}
    </AdminShell>
  );
}
