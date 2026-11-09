import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight, Clock, MapPin, Phone, MessageCircle, ImagePlus, Plus, Pencil, Instagram, Facebook,
  UtensilsCrossed, BookOpen, Sparkles, Bike,
} from "lucide-react";
import { all } from "@/lib/db";
import { brandingFor } from "@/lib/branding";
import { getTenantRole, type Tenant } from "@/lib/tenant";
import { platformUrl } from "@/lib/tenant-host";
import { DAYS, colombiaDayKey, formatRange, parseSchedule } from "@/lib/hours";
import FoodSlider from "@/components/FoodSlider";
import EmberEdge from "@/components/EmberEdge";
import TenantHeader from "@/components/home/TenantHeader";

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

/** Recuadros de "Platos estrella" y fotos máximas en el carrusel de portada. */
const FEATURED_SLOTS = 3;
const SLIDES = 5;

/** Fondo de la franja final (igual que en la landing de Brasaya): el humo de las brasas se ve encima. */
const NIGHT = "#141110";

/** Platos estrella: los destacados del restaurante; si no tiene, platos de la carta que tengan foto. */
async function loadFeatured(restaurantId: string) {
  const featured = await all<Featured>(
    `SELECT id, name, description, price, image_url AS image FROM featured_dishes
     WHERE restaurant_id = ? AND is_active = 1 ORDER BY display_order LIMIT ?`,
    restaurantId, SLIDES
  );
  if (featured.length) return featured;
  return all<Featured>(
    `SELECT id, name, description, price, image FROM menu_items
     WHERE restaurant_id = ? AND is_available = 1 AND image IS NOT NULL AND image != ''
     ORDER BY display_order LIMIT ?`,
    restaurantId, SLIDES
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
function MissingText({ href, children, onDark = false }: { href: string; children: React.ReactNode; onDark?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-sm ${
        onDark
          ? "border-white/40 text-white/90 hover:bg-white/10"
          : "border-primary-400 text-primary-700 hover:bg-primary-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-950/40"
      }`}
    >
      <Pencil className="h-3.5 w-3.5" /> {children}
    </Link>
  );
}

const CONFIG = "/admin/configuracion";

/** wa.me exige el indicativo: un celular colombiano de 10 dígitos se completa con 57. */
const waUrl = (digits: string) => `https://wa.me/${digits.length === 10 && digits.startsWith("3") ? `57${digits}` : digits}`;

/**
 * Portada de un restaurante, construida solo con sus propios datos. Sigue el diseño de la landing
 * de Brasaya: portada a pantalla completa, mosaico de la carta, franja oscura y cierre con brasas.
 */
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
  const withPhoto = featured.filter((f): f is Featured & { image: string } => !!f.image);
  const cover = withPhoto[0]?.image ?? null;
  const stars = featured.slice(0, FEATURED_SLOTS);
  const visibleCategories = canEdit ? categories : categories.filter((c) => c.items > 0);
  const place = [b.address, b.city].filter(Boolean).join(", ");
  const socials = [
    { url: b.instagramUrl, label: "Instagram", icon: Instagram },
    { url: b.facebookUrl, label: "Facebook", icon: Facebook },
  ].filter((s): s is typeof s & { url: string } => !!s.url);

  const slides = withPhoto.map((f, i) => ({
    id: i + 1,
    name: f.name,
    description: f.description || b.tagline || "",
    image: f.image,
    price: f.price || undefined,
  }));

  const whatsappButton = b.whatsapp && (
    <a
      href={waUrl(b.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-press inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3.5 font-semibold text-stone-900 shadow-lg shadow-black/20 backdrop-blur hover:bg-white/95"
    >
      <MessageCircle className="h-4 w-4" />
      Pedir por WhatsApp
    </a>
  );

  return (
    // isolate: el humo de las brasas (z-index -1) queda sobre este fondo y detrás del contenido
    <div className="isolate min-h-[100dvh] bg-[rgb(var(--background))]">
      <TenantHeader name={b.name} logoUrl={b.logoUrl} canEdit={canEdit} />

      <main>
        {/* Portada a pantalla completa: carrusel con las fotos de sus platos */}
        <section data-nav-dark className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden bg-[#141110]">
          {slides.length > 0 ? (
            <FoodSlider foods={slides} autoplayInterval={5000} />
          ) : (
            // Sin fotos todavía: fondo oscuro con el color de la marca y el nombre en grande
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgb(var(--primary-700)/0.55),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgb(var(--primary-900)/0.6),transparent_55%)]">
              <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-4 pb-24 sm:px-6">
                <h2 className="mb-3 text-5xl font-bold text-white md:text-6xl">{b.name}</h2>
                {b.tagline && <p className="max-w-xl text-lg text-white/80">{b.tagline}</p>}
                {canEdit && (
                  <Link
                    href="/admin/platos-destacados"
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-2xl border-2 border-dashed border-white/40 px-5 py-4 text-white/90 hover:bg-white/10"
                  >
                    <ImagePlus className="h-5 w-5" />
                    Sube fotos de tus platos destacados: aparecerán aquí, a pantalla completa.
                  </Link>
                )}
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-20 z-30 flex justify-center px-4 md:bottom-16 md:justify-start md:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/menu"
                className="btn-press group inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/30 hover:bg-primary-700"
              >
                Ver la carta
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
              {whatsappButton}
            </div>
          </div>
        </section>

        {/* Bienvenida */}
        <section className="px-4 py-20 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-[1.05] text-gray-950 dark:text-white md:text-5xl lg:text-6xl">
              Bienvenidos a <span className="text-primary-600 dark:text-primary-400">{b.name}</span>
            </h1>
            {b.tagline ? (
              <p className="mb-6 max-w-[56ch] text-lg leading-relaxed text-gray-600 dark:text-gray-300">{b.tagline}</p>
            ) : canEdit ? (
              <p className="mb-6"><MissingText href={CONFIG}>Escribe un eslogan (ej: “Sazón de casa desde 1998”)</MissingText></p>
            ) : null}
            <div className="flex flex-wrap gap-2.5 text-sm">
              {schedule || b.hours ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  <Clock className="h-4 w-4 text-primary-600" /> {schedule ? `Hoy: ${formatRange(schedule[today])}` : b.hours}
                </span>
              ) : canEdit && <MissingText href={CONFIG}>Agregar horario</MissingText>}
              {place ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  <MapPin className="h-4 w-4 text-primary-600" /> {place}
                </span>
              ) : null}
              {!b.address && canEdit && <MissingText href={CONFIG}>Agregar dirección</MissingText>}
            </div>
          </div>
        </section>

        {/* Carta: mosaico */}
        <section id="carta" className="scroll-mt-24 px-4 pb-20 sm:px-6 md:pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="mb-3 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">Nuestra carta</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {totalItems > 0
                  ? `${totalItems} ${totalItems === 1 ? "plato" : "platos"} para pedir en la mesa, para llevar o a domicilio.`
                  : "Estamos preparando nuestra carta en línea."}
              </p>
            </div>

            {totalItems === 0 && canEdit ? (
              <EmptySlot
                href="/admin/menu"
                icon={UtensilsCrossed}
                title="Agrega tus platos"
                hint="Tu carta está vacía. Crea los platos con su precio y foto; las categorías ya están listas."
              />
            ) : totalItems === 0 ? (
              b.whatsapp && (
                <p className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  Mientras tanto, <a href={waUrl(b.whatsapp)} className="font-semibold text-primary-600 hover:underline">escríbenos por WhatsApp</a>.
                </p>
              )
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[200px] lg:grid-cols-4">
                {/* Celda grande: la carta completa, con foto */}
                <Link
                  href="/menu"
                  className="group relative overflow-hidden rounded-3xl bg-gray-900 sm:col-span-2 lg:row-span-2"
                >
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="relative flex h-full min-h-[280px] flex-col justify-end p-7 text-white">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <h3 className="mb-2 text-2xl font-bold">Ver la carta completa</h3>
                    <p className="max-w-sm text-white/80">Fotos, precios y especiales del día. Arma tu pedido en un minuto.</p>
                  </div>
                </Link>

                {visibleCategories.map((c) =>
                  c.items > 0 ? (
                    <Link
                      key={c.id}
                      href="/menu"
                      className="btn-press flex flex-col justify-between gap-6 rounded-3xl border border-gray-200 bg-white p-6 hover:border-primary-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-700"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                        <UtensilsCrossed className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-950 dark:text-white">{c.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{c.items} {c.items === 1 ? "plato" : "platos"}</p>
                      </div>
                    </Link>
                  ) : (
                    <EmptySlot key={c.id} href="/admin/menu" icon={Plus} title={c.name} hint="Agregar platos" className="p-5" />
                  )
                )}

                {/* Celda ancha con el color de marca: domicilios */}
                <Link
                  href="/menu"
                  className="btn-press flex flex-col justify-between gap-6 rounded-3xl bg-primary-600 p-7 text-white hover:bg-primary-700 sm:col-span-2"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Bike className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="mb-1.5 text-xl font-semibold">Pide a domicilio o para llevar</h3>
                    <p className="max-w-md text-white/85">
                      Elige tus platos en la carta{b.whatsapp ? " y te confirmamos el pedido por WhatsApp" : ""}.
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Platos estrella y platos del día */}
        {(stars.length > 0 || specials.length > 0 || canEdit) && (
          <section id="platos" className="scroll-mt-24 px-4 pb-20 sm:px-6 md:pb-28">
            <div className="mx-auto max-w-6xl">
              {(stars.length > 0 || canEdit) && (
                <>
                  <div className="mb-10 max-w-2xl">
                    <h2 className="mb-3 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">Nuestros platos estrella</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Los que más piden nuestros clientes.</p>
                  </div>
                  <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stars.map((dish) => (
                      <Link key={dish.id} href="/menu" className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800">
                        {dish.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={dish.image} alt={dish.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                          <h3 className="text-xl font-bold leading-tight">{dish.name}</h3>
                          {dish.price && <p className="mt-1 font-semibold tabular-nums">{dish.price}</p>}
                        </div>
                      </Link>
                    ))}
                    {canEdit &&
                      Array.from({ length: Math.max(FEATURED_SLOTS - stars.length, 0) }, (_, i) => (
                        <EmptySlot
                          key={i}
                          href="/admin/platos-destacados"
                          title="Agregar imagen"
                          hint={i === 0 && stars.length === 0 ? "Sube fotos de tus platos más pedidos: es lo primero que miran tus clientes." : undefined}
                          className="aspect-[4/3]"
                        />
                      ))}
                  </div>
                </>
              )}

              {(specials.length > 0 || canEdit) && (
                <>
                  <div className="mb-8 max-w-2xl">
                    <h2 className="mb-3 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">Platos del día</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Lo que sale hoy de nuestra cocina.</p>
                  </div>
                  {specials.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {specials.map((dish) => (
                        <article key={dish.id} className="flex gap-4 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                            <Sparkles className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <h3 className="font-semibold text-gray-950 dark:text-white">{dish.name}</h3>
                              {dish.price && <p className="shrink-0 font-semibold tabular-nums text-primary-600 dark:text-primary-400">{dish.price}</p>}
                            </div>
                            {dish.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{dish.description}</p>}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptySlot href="/admin/daily-specials" icon={Plus} title="Publicar el plato del día" hint="El almuerzo o el corrientazo de hoy: lo cambias cada día en un minuto." />
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* Franja oscura hasta las brasas del footer. El fondo va en una capa con z-index -2 (el
            contenedor no crea contexto de apilamiento): así queda detrás del humo (-1) y del contenido. */}
        <div data-nav-dark className="relative pb-24">
          <div aria-hidden className="absolute inset-0 -z-[2]" style={{ backgroundColor: NIGHT }} />

          {/* Nosotros */}
          <section id="nosotros" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">Sobre nosotros</h2>
              {b.about ? (
                <p className="max-w-[65ch] whitespace-pre-line text-lg leading-relaxed text-stone-300">{b.about}</p>
              ) : canEdit ? (
                <MissingText href={CONFIG} onDark>Cuenta tu historia: quiénes son y qué los hace especiales</MissingText>
              ) : (
                <p className="max-w-[65ch] text-lg leading-relaxed text-stone-300">
                  {b.tagline || `Gracias por visitar ${b.name}. Te esperamos.`}
                </p>
              )}
            </div>
          </section>

          {/* Visítanos: tarjeta clara, como la del precio en la landing */}
          <section id="contacto" className="scroll-mt-24 px-4 sm:px-6">
            <div className="mx-auto grid max-w-6xl gap-10 rounded-[32px] border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-900 sm:p-10 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">Visítanos o haz tu pedido</h2>
                <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                    {b.address ? <span>{place}</span> : canEdit ? <MissingText href={CONFIG}>Agregar dirección</MissingText> : <span>{b.city}</span>}
                  </li>
                  {(b.whatsapp || canEdit) && (
                    <li className="flex items-start gap-3">
                      <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                      {b.whatsapp ? (
                        <a href={waUrl(b.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:underline">Pedir por WhatsApp</a>
                      ) : <MissingText href={CONFIG}>Agregar WhatsApp para recibir pedidos</MissingText>}
                    </li>
                  )}
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
                      <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-primary-400 dark:border-gray-700 dark:text-gray-300">
                        <Icon className="h-4 w-4" /> {label}
                      </a>
                    ))}
                    {canEdit && socials.length === 0 && <MissingText href={CONFIG}>Agregar Instagram o Facebook</MissingText>}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                {schedule ? (
                  <table className="text-sm">
                    <caption className="sr-only">Horario de atención</caption>
                    <tbody>
                      {DAYS.map((d) => (
                        <tr key={d.key} className={d.key === today ? "font-semibold text-gray-950 dark:text-white" : ""}>
                          <th scope="row" className="py-1 pr-6 text-left font-[inherit]">
                            {d.long}
                            {d.key === today && <span className="ml-1.5 rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] uppercase text-primary-800 dark:bg-primary-900/50 dark:text-primary-200">hoy</span>}
                          </th>
                          <td className={`py-1 tabular-nums ${schedule[d.key].open ? "" : "text-gray-400"}`}>{formatRange(schedule[d.key])}</td>
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
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Cierre con el carbón encendido */}
      <footer data-nav-dark className="relative bg-primary-700 text-white dark:bg-primary-900">
        <EmberEdge />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6">
          <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-xl">
              <h2 className="mb-3 text-3xl font-bold md:text-4xl">¿Con hambre?</h2>
              <p className="text-lg text-white/80">Arma tu pedido en la carta y te lo preparamos enseguida.</p>
            </div>
            <Link
              href="/menu"
              className="btn-press inline-flex shrink-0 items-center gap-2 rounded-full bg-[#fafaf9] px-7 py-3.5 font-semibold text-[rgb(var(--primary-800))] hover:bg-white"
            >
              Pedir ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-10 border-t border-white/15 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
            <div>
              <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
                {b.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
                )}
                <span className="font-display text-xl font-bold">{b.name}</span>
              </Link>
              {b.tagline && <p className="max-w-xs text-sm leading-relaxed text-white/75">{b.tagline}</p>}
            </div>

            <nav aria-label="Secciones">
              <h3 className="mb-4 text-sm font-semibold text-white">El restaurante</h3>
              <ul className="space-y-2.5 text-sm text-white/75">
                <li><Link href="/menu" className="hover:text-white">Carta</Link></li>
                <li><a href="#platos" className="hover:text-white">Platos del día</a></li>
                <li><a href="#nosotros" className="hover:text-white">Sobre nosotros</a></li>
                <li><a href="#contacto" className="hover:text-white">Horario y ubicación</a></li>
              </ul>
            </nav>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Contacto</h3>
              <ul className="space-y-3 text-sm text-white/75">
                {b.whatsapp && (
                  <li>
                    <a href={waUrl(b.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                      <MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp
                    </a>
                  </li>
                )}
                {b.phone && (
                  <li>
                    <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 hover:text-white">
                      <Phone className="h-4 w-4 shrink-0" /> {b.phone}
                    </a>
                  </li>
                )}
                {place && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {place}
                  </li>
                )}
                {socials.map(({ url, label, icon: Icon }) => (
                  <li key={label}>
                    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                      <Icon className="h-4 w-4 shrink-0" /> {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/15 pt-6 text-sm text-white/60 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} {b.name}</span>
            <a href={platformUrl("/")} className="hover:text-white">Hecho con Brasaya</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
