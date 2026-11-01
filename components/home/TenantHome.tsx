import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight, Clock, MapPin, Phone, MessageCircle, ImagePlus, Plus, Pencil, Instagram, Facebook, UtensilsCrossed,
} from "lucide-react";
import { all } from "@/lib/db";
import { brandingFor } from "@/lib/branding";
import { getTenantRole, type Tenant } from "@/lib/tenant";
import ThemeToggle from "@/components/ThemeToggle";
import { DAYS, colombiaDayKey, formatRange, parseSchedule } from "@/lib/hours";

interface Featured {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  image: string | null;
}
interface Special {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
}
interface Category {
  id: string;
  name: string;
  items: number;
}

const FEATURED_SLOTS = 3;

/** Platos estrella: los destacados del restaurante; si no tiene, platos de la carta que tengan foto. */
async function loadFeatured(restaurantId: string) {
  const featured = await all<Featured>(
    `SELECT id, name, description, price, image_url AS image FROM featured_dishes
     WHERE restaurant_id = ? AND is_active = 1 ORDER BY display_order LIMIT ?`,
    restaurantId, FEATURED_SLOTS
  );
  if (featured.length) return featured;
  return all<Featured>(
    `SELECT id, name, description, price, image FROM menu_items
     WHERE restaurant_id = ? AND is_available = 1 AND image IS NOT NULL AND image != ''
     ORDER BY display_order LIMIT ?`,
    restaurantId, FEATURED_SLOTS
  );
}

/** ¿Quien mira es dueño o administrador de este restaurante? Solo consulta a Clerk si hay sesión. */
async function viewerCanEdit(tenant: Tenant) {
  const { userId } = await auth();
  return userId ? !!(await getTenantRole(tenant)) : false;
}

/**
 * Recuadro punteado para lo que falta llenar. Solo lo ve el equipo del restaurante:
 * a los clientes nunca se les muestra "Agregar…".
 */
function EmptySlot({
  href, title, hint, icon: Icon = ImagePlus, className = "",
}: { href: string; title: string; hint?: string; icon?: typeof ImagePlus; className?: string }) {
  return (
    <Link
      href={href}
      className={`group flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary-300 bg-primary-50/50 p-6 text-center text-primary-700 transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-primary-800 dark:bg-primary-950/20 dark:text-primary-300 dark:hover:border-primary-600 ${className}`}
    >
      <Icon className="h-8 w-8 transition-transform duration-200 ease-out group-hover:scale-110" strokeWidth={1.5} />
      <span className="font-semibold">{title}</span>
      {hint && <span className="max-w-xs text-sm text-primary-700/80 dark:text-primary-300/80">{hint}</span>}
    </Link>
  );
}

/** Texto que falta, en línea (eslogan, dirección…): solo para el equipo. */
function MissingText({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary-400 px-3 py-1 text-sm text-primary-700 hover:bg-primary-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-950/40">
      <Pencil className="h-3.5 w-3.5" /> {children}
    </Link>
  );
}

const CONFIG = "/admin/configuracion";

/** wa.me exige el indicativo: un celular colombiano de 10 dígitos se completa con 57. */
const waUrl = (digits: string) => `https://wa.me/${digits.length === 10 && digits.startsWith("3") ? `57${digits}` : digits}`;

/** Portada genérica de un restaurante, construida solo con sus propios datos. */
export default async function TenantHome({ tenant }: { tenant: Tenant }) {
  const b = brandingFor(tenant);
  const [featured, specials, categories, canEdit] = await Promise.all([
    loadFeatured(tenant.id),
    all<Special>(
      `SELECT id, name, description, price FROM daily_specials
       WHERE restaurant_id = ? AND available = 1 ORDER BY created_at DESC LIMIT 6`,
      tenant.id
    ),
    // Categorías activas con su número de platos, más los platos sin categoría como "Otros platos"
    all<Category>(
      `SELECT c.id, c.name, COUNT(i.id) AS items, c.display_order AS ord FROM menu_categories c
       LEFT JOIN menu_items i ON i.category_id = c.id AND i.is_available = 1
       WHERE c.restaurant_id = ? AND c.is_active = 1
       GROUP BY c.id
       UNION ALL
       SELECT 'sin-categoria', 'Otros platos', COUNT(*), 9999 FROM menu_items
       WHERE restaurant_id = ? AND is_available = 1 AND category_id IS NULL
       HAVING COUNT(*) > 0
       ORDER BY ord`,
      tenant.id, tenant.id
    ),
    viewerCanEdit(tenant),
  ]);

  const totalItems = categories.reduce((sum, c) => sum + c.items, 0);
  const schedule = parseSchedule(tenant.settings?.hours_schedule);
  const today = colombiaDayKey();
  const cover = featured.find((f) => f.image)?.image ?? null;
  const visibleCategories = canEdit ? categories : categories.filter((c) => c.items > 0);
  const hasContact = b.address || b.hours || b.phone || b.whatsapp;
  const socials = [
    { url: b.instagramUrl, label: "Instagram", icon: Instagram },
    { url: b.facebookUrl, label: "Facebook", icon: Facebook },
  ].filter((s) => s.url);

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {canEdit && (
        <div className="bg-primary-600 px-4 py-2 text-center text-sm text-white">
          Estás viendo tu sitio como dueño: los recuadros punteados solo los ves tú y te llevan a donde se llenan.{" "}
          <Link href="/admin" className="font-semibold underline underline-offset-2">Ir al panel</Link>
        </div>
      )}

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {b.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.logoUrl} alt={`Logo de ${b.name}`} className="h-11 w-11 rounded-xl object-cover" />
          ) : canEdit ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-dashed border-primary-400 text-primary-600" title="Agrega tu logo en Configuración">
              <ImagePlus className="h-5 w-5" />
            </span>
          ) : null}
          <span className="text-xl font-bold text-gray-900 dark:text-white">{b.name}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-700 dark:text-gray-200">
          <Link href="/menu" className="hover:text-primary-600">Menú</Link>
          <Link href="/admin" className="hover:text-primary-600">Administrar</Link>
          <ThemeToggle />
        </nav>
      </header>

      <main>
        {/* Portada: foto del plato estrella o, para el dueño, el espacio para subirla */}
        <section className="px-4 pb-16 pt-4 sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_1fr]">
            <div>
              <h1 className="mb-4 text-4xl font-bold leading-[1.05] text-gray-950 dark:text-white md:text-5xl lg:text-6xl">
                Bienvenidos a <span className="text-primary-600 dark:text-primary-400">{b.name}</span>
              </h1>
              {b.tagline ? (
                <p className="mb-6 max-w-[52ch] text-lg leading-relaxed text-gray-600 dark:text-gray-300">{b.tagline}</p>
              ) : canEdit ? (
                <p className="mb-6"><MissingText href={CONFIG}>Escribe un eslogan (ej: “Sazón de casa desde 1998”)</MissingText></p>
              ) : null}
              <div className="mb-8 flex flex-wrap gap-2.5 text-sm">
                {schedule || b.hours ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    <Clock className="h-4 w-4 text-primary-600" /> {schedule ? `Hoy: ${formatRange(schedule[today])}` : b.hours}
                  </span>
                ) : canEdit && <MissingText href={CONFIG}>Agregar horario</MissingText>}
                {b.address || b.city ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    <MapPin className="h-4 w-4 text-primary-600" /> {[b.address, b.city].filter(Boolean).join(", ")}
                  </span>
                ) : null}
                {!b.address && canEdit && <MissingText href={CONFIG}>Agregar dirección</MissingText>}
              </div>
              <Link
                href="/menu"
                className="btn-press group inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-900/15 hover:bg-primary-700"
              >
                Ver la carta
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </div>

            {cover ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-200 shadow-xl dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={featured[0]?.name ?? b.name} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            ) : canEdit ? (
              <EmptySlot
                href="/admin/platos-destacados"
                title="Agregar foto de portada"
                hint="Sube la foto de tu plato estrella en Platos destacados: aparecerá aquí, en grande."
                className="aspect-[4/3]"
              />
            ) : null}
          </div>
        </section>

        {/* Categorías de la carta (siempre: si está vacía, el cliente ve un aviso y el dueño el recuadro) */}
        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-3xl font-bold text-gray-950 dark:text-white">Nuestra carta</h2>
            {totalItems === 0 && canEdit ? (
              <EmptySlot
                href="/admin/menu"
                icon={UtensilsCrossed}
                title="Agrega tus platos"
                hint="Tu carta está vacía. Crea los platos con su precio y foto; las categorías ya están listas."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {visibleCategories.map((c) =>
                  c.items > 0 ? (
                    <Link
                      key={c.id}
                      href="/menu"
                      className="btn-press rounded-3xl border border-gray-200 bg-white p-5 hover:border-primary-300 hover:bg-primary-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-700"
                    >
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.items} {c.items === 1 ? "plato" : "platos"}</p>
                    </Link>
                  ) : (
                    <EmptySlot key={c.id} href="/admin/menu" icon={Plus} title={c.name} hint="Agregar platos" className="p-5" />
                  )
                )}
              </div>
            )}
            {totalItems === 0 && !canEdit && (
              <p className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                Estamos preparando nuestra carta en línea.
                {b.whatsapp && <> Mientras tanto, <a href={waUrl(b.whatsapp)} className="font-semibold text-primary-600 hover:underline">escríbenos por WhatsApp</a>.</>}
              </p>
            )}
          </div>
        </section>

        {/* Platos estrella (con foto) */}
        {(featured.length > 0 || canEdit) && (
          <section className="px-4 pb-16 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-950 dark:text-white">Nuestros platos estrella</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((dish) => (
                  <Link key={dish.id} href="/menu" className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800">
                    {dish.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={dish.image} alt={dish.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <h3 className="text-xl font-bold leading-tight">{dish.name}</h3>
                      {dish.price && <p className="mt-1 font-semibold tabular-nums">{dish.price}</p>}
                    </div>
                  </Link>
                ))}
                {canEdit &&
                  Array.from({ length: Math.max(FEATURED_SLOTS - featured.length, 0) }, (_, i) => (
                    <EmptySlot
                      key={i}
                      href="/admin/platos-destacados"
                      title="Agregar imagen"
                      hint={i === 0 && featured.length === 0 ? "Sube fotos de tus platos más pedidos: es lo primero que miran tus clientes." : undefined}
                      className="aspect-[4/3]"
                    />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Platos del día */}
        {(specials.length > 0 || canEdit) && (
          <section className="px-4 pb-16 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-950 dark:text-white">Platos del día</h2>
              {specials.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {specials.map((dish) => (
                    <article key={dish.id} className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                      <h3 className="font-bold text-gray-900 dark:text-white">{dish.name}</h3>
                      {dish.description && <p className="mb-3 mt-1 text-sm text-gray-600 dark:text-gray-300">{dish.description}</p>}
                      {dish.price && <p className="font-semibold text-primary-600">{dish.price}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <EmptySlot href="/admin/daily-specials" icon={Plus} title="Publicar el plato del día" hint="El almuerzo o el corrientazo de hoy: lo cambias cada día en un minuto." />
              )}
            </div>
          </section>
        )}

        {/* Nosotros */}
        {(b.about || canEdit) && (
          <section className="px-4 pb-16 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-950 dark:text-white">Sobre nosotros</h2>
              {b.about ? (
                <p className="max-w-[65ch] whitespace-pre-line text-lg leading-relaxed text-gray-600 dark:text-gray-300">{b.about}</p>
              ) : (
                <EmptySlot href={CONFIG} icon={Pencil} title="Cuenta tu historia" hint="Quiénes son, desde cuándo cocinan y qué los hace especiales." />
              )}
            </div>
          </section>
        )}

        {/* Visítanos */}
        {(hasContact || socials.length > 0 || canEdit) && (
          <section className="px-4 pb-20 sm:px-6">
            <div className="mx-auto max-w-6xl rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
              <h2 className="mb-5 text-2xl font-bold text-gray-950 dark:text-white">Visítanos o haz tu pedido</h2>
              <ul className="grid gap-4 text-gray-700 dark:text-gray-300 sm:grid-cols-2">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                  {b.address ? <span>{[b.address, b.city].filter(Boolean).join(", ")}</span> : canEdit ? <MissingText href={CONFIG}>Agregar dirección</MissingText> : <span>{b.city}</span>}
                </li>
                <li className="flex items-start gap-3 sm:row-span-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                  {schedule ? (
                    <table className="text-sm">
                      <caption className="sr-only">Horario de atención</caption>
                      <tbody>
                        {DAYS.map((d) => (
                          <tr key={d.key} className={d.key === today ? "font-semibold text-gray-950 dark:text-white" : ""}>
                            <th scope="row" className="py-0.5 pr-4 text-left font-[inherit]">
                              {d.long}
                              {d.key === today && <span className="ml-1.5 rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] uppercase text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">hoy</span>}
                            </th>
                            <td className={`py-0.5 tabular-nums ${schedule[d.key].open ? "" : "text-gray-400"}`}>{formatRange(schedule[d.key])}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : b.hours ? (
                    <span>{b.hours}</span>
                  ) : canEdit ? (
                    <MissingText href={CONFIG}>Agregar horario</MissingText>
                  ) : (
                    <span>Consulta nuestro horario por WhatsApp</span>
                  )}
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                  {b.whatsapp ? (
                    <a href={waUrl(b.whatsapp)} className="font-semibold text-primary-600 hover:underline">Pedir por WhatsApp</a>
                  ) : canEdit ? <MissingText href={CONFIG}>Agregar WhatsApp para recibir pedidos</MissingText> : null}
                </li>
                {b.phone && (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                    <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">{b.phone}</a>
                  </li>
                )}
              </ul>
              {(socials.length > 0 || canEdit) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {socials.map(({ url, label, icon: Icon }) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-primary-400 dark:border-gray-700">
                      <Icon className="h-4 w-4" /> {label}
                    </a>
                  ))}
                  {canEdit && socials.length === 0 && <MissingText href={CONFIG}>Agregar Instagram o Facebook</MissingText>}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <p>© {new Date().getFullYear()} {b.name} · Hecho con Brasaya</p>
      </footer>
    </div>
  );
}
