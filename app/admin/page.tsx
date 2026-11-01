import AdminDashboard from "../../components/admin/AdminDashboard";
import OnboardingChecklist from "@/components/admin/OnboardingChecklist";
import { getTenant } from "@/lib/tenant";

export default async function AdminPage() {
  // La autenticación y verificación de admin se hace en el layout.tsx
  const tenant = await getTenant();
  return (
    <AdminDashboard>{tenant && <OnboardingChecklist tenant={tenant} />}</AdminDashboard>
  );
}
