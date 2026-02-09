"use client";

import { useEffect, useState } from "react";
import {
  ChefHat,
  TrendingUp,
  Clock,
  Users,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Calendar,
  Flame,
  Target,
} from "lucide-react";
import type {
  PredictiveDishAnalysis,
  HourlyOrderPattern,
  CustomerFavoritePattern,
} from "@/types/statistics";

interface PredictiveStatisticsProps {
  daysToAnalyze?: number;
  minFrequency?: number;
}

export default function PredictiveStatistics({
  daysToAnalyze = 30,
  minFrequency = 0.3,
}: PredictiveStatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [predictiveDishes, setPredictiveDishes] = useState<
    PredictiveDishAnalysis[]
  >([]);
  const [hourlyPatterns, setHourlyPatterns] = useState<HourlyOrderPattern[]>(
    []
  );
  const [customerFavorites, setCustomerFavorites] = useState<
    CustomerFavoritePattern[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictiveData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dishesRes, hourlyRes, favoritesRes] = await Promise.all([
        fetch(
          `/api/statistics/predictive?type=dishes&daysToAnalyze=${daysToAnalyze}&minFrequency=${minFrequency}`
        ),
        fetch(`/api/statistics/predictive?type=hourly&timeFilter=week`),
        fetch(
          `/api/statistics/predictive?type=customer-favorites&daysToAnalyze=${daysToAnalyze}`
        ),
      ]);

      if (!dishesRes.ok) {
        const errorData = await dishesRes.json();
        throw new Error(errorData.error || "Failed to load predictive dishes");
      }

      if (!hourlyRes.ok) {
        const errorData = await hourlyRes.json();
        throw new Error(errorData.error || "Failed to load hourly patterns");
      }

      if (!favoritesRes.ok) {
        const errorData = await favoritesRes.json();
        throw new Error(
          errorData.error || "Failed to load customer favorites"
        );
      }

      const dishesData = await dishesRes.json();
      const hourlyData = await hourlyRes.json();
      const favoritesData = await favoritesRes.json();

      setPredictiveDishes(dishesData.data || []);
      setHourlyPatterns(hourlyData.data || []);
      setCustomerFavorites(favoritesData.data || []);
    } catch (err) {
      console.error("Error fetching predictive data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictiveData();
  }, [daysToAnalyze, minFrequency]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConsistencyColor = (rating: string) => {
    switch (rating) {
      case "MUY_ALTA":
        return "bg-green-100 text-green-800 border-green-200";
      case "ALTA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "MEDIA":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "BAJA":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConsistencyLabel = (rating: string) => {
    const labels: Record<string, string> = {
      MUY_ALTA: "Muy Alta",
      ALTA: "Alta",
      MEDIA: "Media",
      BAJA: "Baja",
      MUY_BAJA: "Muy Baja",
    };
    return labels[rating] || rating;
  };

  const getPriorityIcon = (priority: number) => {
    if (priority === 1) return <Flame className="w-5 h-5 text-red-600" />;
    if (priority === 2) return <Target className="w-5 h-5 text-orange-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium">Error al cargar estadísticas predictivas</p>
        </div>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-2">
          Asegúrate de ejecutar el archivo{" "}
          <code className="bg-red-100 px-2 py-1 rounded">
            supabase-predictive-statistics.sql
          </code>{" "}
          en el editor SQL de Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Análisis Predictivo de Platos
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Recomendaciones para preparar con anticipación basadas en{" "}
                {daysToAnalyze} días de datos
              </p>
            </div>
          </div>
          <button
            onClick={fetchPredictiveData}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Platos recomendados para preparar */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">
                Platos para Preparar con Anticipación
              </h3>
              <p className="text-green-100 text-sm mt-1">
                Platos con alta frecuencia de pedido - ordenados por prioridad
              </p>
            </div>
          </div>
        </div>

        {predictiveDishes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ChefHat className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>
              No hay suficientes datos para generar recomendaciones predictivas
            </p>
            <p className="text-sm mt-2">
              Se necesitan más pedidos en el período analizado
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Prioridad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Plato
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                    Consistencia
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                    Frecuencia
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                    Cantidad Recomendada
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                    Hora Pico
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                    Promedio Diario
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {predictiveDishes.map((dish, index) => (
                  <tr
                    key={dish.item_id}
                    className={`hover:bg-slate-50 transition-colors ${
                      dish.preparation_priority === 1 ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(dish.preparation_priority)}
                        <span className="font-bold text-slate-800">
                          #{dish.preparation_priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {dish.item_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatCurrency(dish.item_price)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getConsistencyColor(
                          dish.consistency_rating
                        )}`}
                      >
                        {getConsistencyLabel(dish.consistency_rating)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-slate-800">
                          {(dish.frequency_score * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs text-slate-500">
                          {dish.days_ordered}/{daysToAnalyze} días
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-emerald-600">
                          {dish.recommended_prep_quantity}
                        </span>
                        <span className="text-xs text-slate-500">unidades</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {dish.peak_hour_start}:00 - {dish.peak_hour_end}:00
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-slate-800">
                        {dish.avg_daily_quantity.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patrones por hora */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Patrones de Pedidos por Hora</h3>
              <p className="text-blue-100 text-sm mt-1">
                Última semana - identifica las horas más activas
              </p>
            </div>
          </div>
        </div>

        {hourlyPatterns.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No hay datos de patrones horarios disponibles</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hourlyPatterns
                .filter((pattern) => pattern.total_orders > 0)
                .map((pattern) => (
                  <div
                    key={pattern.hour_of_day}
                    className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-slate-800">
                          {pattern.hour_of_day}:00
                        </span>
                      </div>
                      <span className="text-sm text-slate-600">
                        {pattern.total_orders} pedidos
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Items vendidos:</span>
                        <span className="font-semibold text-slate-800">
                          {pattern.total_items_sold}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Ticket promedio:</span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(pattern.avg_order_value)}
                        </span>
                      </div>
                      {pattern.top_item_name !== "N/A" && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-500 mb-1">
                            Más pedido:
                          </p>
                          <p className="text-sm font-semibold text-blue-600">
                            {pattern.top_item_name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Favoritos de clientes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">
                Platos Favoritos de Clientes Frecuentes
              </h3>
              <p className="text-orange-100 text-sm mt-1">
                Platos que los clientes piden repetidamente
              </p>
            </div>
          </div>
        </div>

        {customerFavorites.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No hay suficientes datos de clientes frecuentes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Plato
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                    Score de Lealtad
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                    Clientes Únicos
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                    Tasa de Repetición
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                    Pedidos Repetidos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customerFavorites.slice(0, 10).map((favorite) => (
                  <tr
                    key={favorite.item_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {favorite.item_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <span className="text-lg font-bold text-orange-600">
                          {favorite.loyalty_score.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-800">
                        {favorite.unique_customers}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        {favorite.repeat_order_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-800">
                        {favorite.total_repeat_orders}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
