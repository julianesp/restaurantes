"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, ClipboardList, Flame } from "lucide-react";
import SoldMealsPanel from "@/components/admin/SoldMealsPanel";

interface Summary {
  total_orders: number;
  total_revenue: number;
  most_popular_item: string;
  most_popular_item_quantity: number;
}

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

/** Indicadores del día. La navegación vive solo en AdminNavbar (no se repite aquí). */
export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/statistics?type=summary&timeFilter=today").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/orders/table?status=pending").then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([stats, orders]) => {
        if (cancelled) return;
        setSummary((stats.data?.[0] as Summary) ?? null);
        setPending(Array.isArray(orders) ? orders.length : 0);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = !error && summary === null && pending === null;
  const value = (v: string | number | null | undefined) => (loading ? "…" : error || v == null ? "—" : v);

  const cards = [
    { label: "Pedidos pendientes", value: value(pending), hint: "Por atender ahora", icon: ClipboardList, color: "text-primary-500" },
    { label: "Pedidos de hoy", value: value(summary?.total_orders ?? 0), hint: "Sin contar cancelados", icon: ShoppingBag, color: "text-accent-500" },
    { label: "Ventas de hoy", value: value(summary ? cop.format(summary.total_revenue) : cop.format(0)), hint: "Total vendido", icon: DollarSign, color: "text-green-500" },
    {
      label: "Plato más vendido hoy",
      value: value(summary && summary.most_popular_item !== "N/A" ? summary.most_popular_item : "—"),
      hint: summary && summary.most_popular_item !== "N/A" ? `${summary.most_popular_item_quantity} unidades` : "Aún sin ventas",
      icon: Flame,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Administración</h1>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          No se pudieron cargar los indicadores. Recarga la página para intentar de nuevo.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map(({ label, value: v, hint, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</h2>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">{v}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
          </div>
        ))}
      </div>

      <SoldMealsPanel />
    </div>
  );
}
