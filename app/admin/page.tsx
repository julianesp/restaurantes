import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboard from "../../components/admin/AdminDashboard";

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Verificar si el usuario es administrador autorizado
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
  const userEmail = user.emailAddresses[0]?.emailAddress;

  if (!userEmail || !adminEmails.includes(userEmail)) {
    // Redirigir a la página principal si no es administrador
    redirect("/?unauthorized=true");
  }

  // Serializar solo los datos necesarios para el Client Component
  const serializedUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map(email => ({
      emailAddress: email.emailAddress
    }))
  };

  return <AdminDashboard user={serializedUser} />;
}
