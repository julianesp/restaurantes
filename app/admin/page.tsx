import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboard from "../../components/admin/AdminDashboard";

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
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
