import Link from "next/link";
import { all } from "@/lib/db";
import type { Tenant } from "@/lib/tenant";

interface Special {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string | null;
}

const getAvailableSpecials = (restaurantId: string) =>
  all<Special>(
    `SELECT id, name, description, price, category FROM daily_specials
     WHERE restaurant_id = ? AND available = 1 ORDER BY created_at DESC LIMIT 6`,
    restaurantId
  );

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Portada genérica de un restaurante, construida solo con sus propios datos. */
export default async function TenantHome({ tenant }: { tenant: Tenant }) {
  const specials = await getAvailableSpecials(tenant.id);
  const tagline = text(tenant.settings?.tagline);
  const city = text(tenant.settings?.city);
  const phone = text(tenant.settings?.phone);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <header className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900 dark:text-white">{tenant.name}</span>
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Link href="/menu" className="hover:text-primary-600">Menú</Link>
          <Link href="/admin" className="hover:text-primary-600">Administrar</Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6">
        <section className="py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {tenant.name}
          </h1>
          {(tagline || city) && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {[tagline, city].filter(Boolean).join(" · ")}
            </p>
          )}
          <Link
            href="/menu"
            className="inline-block rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 shadow-lg transition-colors"
          >
            Ver el menú
          </Link>
        </section>

        {specials.length > 0 && (
          <section className="pb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platos del día</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {specials.map((dish) => (
                <article
                  key={dish.id}
                  className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white">{dish.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-3">{dish.description}</p>
                  <p className="font-semibold text-primary-600">{dish.price}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {phone && <p className="mb-1">Contacto: {phone}</p>}
        <p>© {new Date().getFullYear()} {tenant.name}</p>
      </footer>
    </div>
  );
}
