import AdminDashboard from "../../components/admin/AdminDashboard";

export default async function AdminPage() {
  // La autenticación y verificación de admin se hace en el layout.tsx
  // Solo necesitamos renderizar el dashboard
  return <AdminDashboard />;
}
