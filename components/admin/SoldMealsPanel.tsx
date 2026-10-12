"use client";

import { useEffect, useState } from "react";
import { ChevronDown, UtensilsCrossed } from "lucide-react";
import type { ItemStatistic } from "@/types/statistics";

type Period = "today" | "week" | "month" | "all";

const PERIODS: Array<{ id: Period; label: string; empty: string }> = [
  { id: "today", label: "Hoy", empty: "Aún no se han vendido comidas hoy." },
  { id: "week", label: "Semana", empty: "No hay comidas vendidas esta semana." },
  { id: "month", label: "Mes", empty: "No hay comidas vendidas este mes." },
  { id: "all", label: "Total", empty: "Todavía no hay comidas vendidas." },
];

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const price = (v: number) => (v > 0 ? cop.format(v) : "—");

/**
 * Un mismo plato puede venir en varias filas (pedidos con otro id o descripción): se suman cuando
 * el nombre y el precio coinciden, y se ordenan de mayor a menor cantidad.
 */
function mergeSameDish(rows: ItemStatistic[]): ItemStatistic[] {
  const byKey = new Map<string, ItemStatistic>();
  for (const row of rows) {
    const key = `${row.item_name.trim().toLowerCase()}|${Number(row.item_price) || 0}`;
    const prev = byKey.get(key);
    byKey.set(
      key,
      prev
        ? {
            ...prev,
            total_quantity_sold: Number(prev.total_quantity_sold) + Number(row.total_quantity_sold),
            total_revenue: Number(prev.total_revenue) + Number(row.total_revenue),
          }
        : { ...row }
    );
  }
  return [...byKey.values()].sort((a, b) => Number(b.total_quantity_sold) - Number(a.total_quantity_sold));
}

/**
 * Cuántas comidas se vendieron (por día / semana / mes / total). Al pulsar el resumen se
 * despliega el detalle: nombre del plato, precio, cantidad y subtotal.
 */
export default function SoldMealsPanel() {
  const [period, setPeriod] = useState<Period>("today");
  const [items, setItems] = useState<ItemStatistic[] | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(false);
    fetch(`/api/statistics?type=items&timeFilter=${period}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((body) => !cancelled && setItems(mergeSameDish(Array.isArray(body.data) ? body.data : [])))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [period]);

  const loading = items === null && !error;
  const units = (items ?? []).reduce((sum, i) => sum + (Number(i.total_quantity_sold) || 0), 0);
  const revenue = (items ?? []).reduce((sum, i) => sum + (Number(i.total_revenue) || 0), 0);
  const dishes = items?.length ?? 0;
  const current = PERIODS.find((p) => p.id === period)!;
  const detailsId = "sold-meals-details";

  return (
    <section
      aria-labelledby="sold-meals-title"
      className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <h2 id="sold-meals-title" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <UtensilsCrossed className="w-5 h-5 text-primary-500" />
          Comidas vendidas
        </h2>
        <div role="group" aria-label="Período" className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              aria-pressed={period === p.id}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p.id
                  ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen: al pulsarlo se despliega el detalle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={detailsId}
        disabled={loading || error}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
      >
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? "…" : error ? "—" : units}
            <span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">
              {units === 1 ? "comida vendida" : "comidas vendidas"}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {error
              ? "No se pudo cargar. Recarga la página."
              : loading
                ? "Cargando…"
                : dishes === 0
                  ? current.empty
                  : `${dishes} ${dishes === 1 ? "plato distinto" : "platos distintos"} · ${cop.format(revenue)} · toca para ver el detalle`}
          </p>
        </div>
        {dishes > 0 && (
          <ChevronDown
            className={`w-6 h-6 shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        )}
      </button>

      {open && dishes > 0 && (
        <div id={detailsId} className="border-t border-gray-200 dark:border-gray-700 px-5 pb-4">
          <div className="hidden sm:grid grid-cols-[1fr_7rem_5rem_8rem] gap-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <span>Plato</span>
            <span className="text-right">Precio</span>
            <span className="text-right">Cant.</span>
            <span className="text-right">Subtotal</span>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {items!.map((item) => (
              <li
                key={item.item_id}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_7rem_5rem_8rem] gap-x-3 gap-y-0.5 py-3 text-sm"
              >
                <span className="font-medium text-gray-900 dark:text-white break-words">{item.item_name}</span>
                <span className="text-right font-semibold text-gray-900 dark:text-white sm:order-4">
                  {cop.format(Number(item.total_revenue) || 0)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 sm:text-right sm:text-gray-700 sm:dark:text-gray-300 sm:order-2">
                  <span className="sm:hidden">Precio: </span>
                  {price(Number(item.item_price))}
                </span>
                <span className="text-right text-gray-500 dark:text-gray-400 sm:text-gray-700 sm:dark:text-gray-300 sm:order-3">
                  <span className="sm:hidden">× </span>
                  {item.total_quantity_sold}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
