import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Verificar si el usuario es administrador autorizado
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];
  const userEmail = user.emailAddresses[0]?.emailAddress;

  if (!userEmail || !adminEmails.includes(userEmail)) {
    // Redirigir a la página principal si no es administrador
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <AdminNavbar user={serializedUser} />
      <main>{children}</main>
    </div>
  );
}
