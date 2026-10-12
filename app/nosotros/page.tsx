import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenant } from "@/lib/tenant";
import { brandingFor } from "@/lib/branding";
import LegacyAbout from "@/components/home/LegacyAbout";
import Navbar from "@/components/Navbar/page";
import Footer from "@/containers/Footer/page";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  // El restaurante original conserva su página "Nosotros" personalizada
  if (tenant.plan === "legacy") return <LegacyAbout />;

  const b = brandingFor(tenant);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{b.name}</h1>
        {b.tagline && <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{b.tagline}</p>}
        {b.about ? (
          <p className="whitespace-pre-line text-gray-700 dark:text-gray-200 leading-relaxed mb-10">{b.about}</p>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mb-10">
            Pronto compartiremos más sobre nuestra historia. Mientras tanto, te invitamos a conocer nuestro menú.
          </p>
        )}
        <dl className="grid sm:grid-cols-2 gap-6 mb-10 text-sm">
          {b.address && (
            <div><dt className="font-semibold text-gray-900 dark:text-white">Dirección</dt><dd className="text-gray-600 dark:text-gray-300">{[b.address, b.city].filter(Boolean).join(", ")}</dd></div>
          )}
          {b.hours && (
            <div><dt className="font-semibold text-gray-900 dark:text-white">Horario</dt><dd className="text-gray-600 dark:text-gray-300">{b.hours}</dd></div>
          )}
          {b.phone && (
            <div><dt className="font-semibold text-gray-900 dark:text-white">Teléfono</dt><dd className="text-gray-600 dark:text-gray-300">{b.phone}</dd></div>
          )}
        </dl>
        <Link href="/menu" className="inline-block rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 shadow-lg transition-colors">
          Ver el menú
        </Link>
      </main>
      <Footer />
    </div>
  );
}
