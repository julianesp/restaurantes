"use client";

import { useEffect, useState } from "react";
import { Award, Flame, ShoppingBag, UtensilsCrossed } from "lucide-react";
import type { WeeklyFeaturedDish } from "@/app/api/weekly-dishes/route";

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", timeZone: "UTC" });

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { month: "short", year: "numeric", timeZone: "UTC" });

/** Plato más vendido de la semana (lo elige el cron de los lunes) y los ganadores anteriores. */
export default function PlatoDeLaSemana() {
  const [currentDish, setCurrentDish] = useState<WeeklyFeaturedDish | null>(null);
  const [history, setHistory] = useState<WeeklyFeaturedDish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/weekly-dishes?type=current").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/weekly-dishes?type=history&limit=10").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([current, past]) => {
        if (cancelled) return;
        setCurrentDish(current?.data?.[0] ?? null);
        setHistory(past?.data ?? []);
      })
      .catch((error) => console.error("Error cargando el plato de la semana:", error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeleton />;
  if (!currentDish && history.length === 0) return null; // Sin datos no se muestra la sección

  const winners = history.filter((d) => d.id !== currentDish?.id);

  return (
    <section className="bg-gray-50 px-4 py-20 dark:bg-gray-950 sm:px-6 md:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {currentDish && (
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-14">
            {/* Foto */}
            <div className="relative" data-aos="fade-up">
              <div className="aspect-[4/5] overflow-hidden rounded-[28px] bg-gray-200 shadow-[0_30px_60px_-30px_rgb(28_25_23_/_0.45)] dark:bg-gray-800 sm:aspect-[5/5]">
                {currentDish.item_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentDish.item_image}
                    alt={currentDish.item_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/60 dark:to-gray-900">
                    <UtensilsCrossed className="h-24 w-24 text-primary-600/40 dark:text-primary-300/30" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              {currentDish.win_count > 1 && (
                <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-semibold text-gray-900 shadow-md backdrop-blur dark:bg-gray-900/90 dark:text-white">
                  <Award className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  Ha ganado {currentDish.win_count} veces
                </div>
              )}
            </div>

            {/* Texto */}
            <div data-aos="fade-up" data-aos-delay="80">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-400">
                El plato de la semana
              </p>
              <h2 className="mb-4 text-4xl font-bold leading-[1.05] text-gray-950 dark:text-white md:text-5xl">
                {currentDish.item_name}
              </h2>
              <p className="mb-7 max-w-[52ch] text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                {currentDish.item_description ||
                  "El que más pidieron nuestros comensales esta semana. Si todavía no lo ha probado, este es el momento."}
              </p>

              <p className="mb-8 text-4xl font-bold tabular-nums text-gray-950 dark:text-white">
                {money.format(currentDish.item_price)}
              </p>

              <dl className="mb-8 grid max-w-md grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <dt className="mb-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <ShoppingBag className="h-4 w-4" /> Pedidos
                  </dt>
                  <dd className="text-2xl font-bold tabular-nums text-gray-950 dark:text-white">
                    {currentDish.total_orders}
                  </dd>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <dt className="mb-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Flame className="h-4 w-4" /> Porciones vendidas
                  </dt>
                  <dd className="text-2xl font-bold tabular-nums text-gray-950 dark:text-white">
                    {currentDish.total_quantity_sold}
                  </dd>
                </div>
              </dl>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Semana del {day(currentDish.week_start_date)} al {day(currentDish.week_end_date)}
              </p>
            </div>
          </div>
        )}

        {/* Ganadores anteriores: fila deslizable */}
        {winners.length > 0 && (
          <div className={currentDish ? "mt-20 md:mt-24" : ""}>
            <h3 className="mb-6 text-2xl font-bold text-gray-950 dark:text-white md:text-3xl">
              Ganadores de semanas anteriores
            </h3>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {winners.map((dish) => (
                <article
                  key={dish.id}
                  className="group w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[calc((100%-3rem)/4)]"
                >
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800">
                    {dish.item_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dish.item_image}
                        alt={dish.item_name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-gray-900">
                        <UtensilsCrossed className="h-10 w-10 text-primary-600/40 dark:text-primary-300/30" strokeWidth={1.5} />
                      </div>
                    )}
                    {dish.win_count > 1 && (
                      <span className="absolute right-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-900 dark:bg-gray-900/90 dark:text-white">
                        {dish.win_count} veces
                      </span>
                    )}
                  </div>
                  <h4 className="line-clamp-1 font-semibold text-gray-950 dark:text-white">{dish.item_name}</h4>
                  <div className="mt-0.5 flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold tabular-nums text-primary-700 dark:text-primary-400">
                      {money.format(dish.item_price)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{monthYear(dish.week_start_date)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Esqueleto con la misma forma que la sección, mientras cargan los datos. */
function Skeleton() {
  return (
    <section aria-busy className="bg-gray-50 px-4 py-20 dark:bg-gray-950 sm:px-6 md:py-28 lg:px-8">
      <div className="mx-auto grid max-w-6xl animate-pulse items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-14">
        <div className="aspect-square rounded-[28px] bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-4">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-20 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </section>
  );
}
