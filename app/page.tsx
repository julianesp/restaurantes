import { notFound } from "next/navigation";
import { getTenant, isTenantServing } from "@/lib/tenant";
import LegacyHome from "@/components/home/LegacyHome";
import TenantHome from "@/components/home/TenantHome";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // En el dominio raíz proxy.ts reescribe "/" hacia /plataforma, así que aquí
  // siempre llega una petición de un restaurante.
  const tenant = await getTenant();
  if (!tenant) notFound();

  if (!isTenantServing(tenant)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">{tenant.name}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Este sitio no está disponible por el momento.
          </p>
        </div>
      </main>
    );
  }

  // El restaurante original conserva su portada personalizada;
  // los nuevos usan la portada genérica basada en sus datos.
  if (tenant.plan === "legacy") return <LegacyHome />;
  return <TenantHome tenant={tenant} />;
}
