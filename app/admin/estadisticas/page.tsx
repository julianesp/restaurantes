"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Calendar,
  BarChart3,
  RefreshCw,
  Star,
  Send
} from "lucide-react";
import type {
  ItemStatistic,
  TopItem,
  SalesSummary,
  TimeFilter
} from "@/types/statistics";

export default function EstadisticasPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [loading, setLoading] = useState(true);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [allItems, setAllItems] = useState<ItemStatistic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Cargar datos
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch top items, summary, and all items in parallel
      const [topResponse, summaryResponse, itemsResponse] = await Promise.all([
        fetch(`/api/statistics?type=top&timeFilter=${timeFilter}&limit=10`),
        fetch(`/api/statistics?type=summary&timeFilter=${timeFilter}`),
        fetch(`/api/statistics?type=items&timeFilter=${timeFilter}`)
      ]);

      // Check each response individually to provide specific error info
      const errors: string[] = [];

      // Log response status for debugging
      console.log('Response status:', {
        top: topResponse.status,
        summary: summaryResponse.status,
        items: itemsResponse.status
      });

      if (!topResponse.ok) {
        const errorText = await topResponse.text();
        console.error('Top items error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          errors.push(`Top items: ${errorData.error || errorData.details || errorText}`);
        } catch {
          errors.push(`Top items: ${errorText || "Failed to load"}`);
        }
      }

      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        console.error('Summary error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          errors.push(`Summary: ${errorData.error || errorData.details || errorText}`);
        } catch {
          errors.push(`Summary: ${errorText || "Failed to load"}`);
        }
      }

      if (!itemsResponse.ok) {
        const errorText = await itemsResponse.text();
        console.error('Items error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          errors.push(`Items: ${errorData.error || errorData.details || errorText}`);
        } catch {
          errors.push(`Items: ${errorText || "Failed to load"}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join(" | "));
      }

      const topData = await topResponse.json();
      const summaryData = await summaryResponse.json();
      const itemsData = await itemsResponse.json();

      console.log('Data received:', {
        topCount: topData.data?.length || 0,
        summaryExists: !!summaryData.data,
        itemsCount: itemsData.data?.length || 0
      });

      setTopItems(topData.data || []);
      setSummary(summaryData.data?.[0] || null);
      setAllItems(itemsData.data || []);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [timeFilter]);

  // Obtener etiqueta del filtro
  const getFilterLabel = (filter: TimeFilter) => {
    const labels: Record<TimeFilter, string> = {
      today: "Hoy",
      week: "Esta Semana",
      month: "Este Mes",
      all: "Histórico"
    };
    return labels[filter];
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Publicar plato de la semana
  const publishWeeklyWinner = async () => {
    if (!topItems || topItems.length === 0 || timeFilter !== "week") {
      alert("Solo puedes publicar el ganador de la semana actual. Cambia el filtro a 'Esta Semana'.");
      return;
    }

    if (!confirm("¿Estás seguro de publicar este plato como ganador de la semana?")) {
      return;
    }

    setPublishing(true);
    setPublishSuccess(null);
    setError(null);

    try {
      const winner = topItems[0];

      // Calcular fechas de inicio y fin de semana
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1); // Lunes
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Domingo

      const response = await fetch('/api/weekly-dishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: winner.item_id,
          item_name: winner.item_name,
          item_description: winner.item_description || '',
          item_price: winner.item_price,
          item_image: null, // Puedes agregar campo de imagen después
          total_orders: winner.order_count,
          total_quantity_sold: winner.total_quantity_sold,
          total_revenue: winner.total_revenue,
          week_start_date: weekStart.toISOString().split('T')[0],
          week_end_date: weekEnd.toISOString().split('T')[0],
          published_by: 'admin', // Puedes obtener del contexto de usuario
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al publicar');
      }

      setPublishSuccess(`¡"${winner.item_name}" ha sido publicado como plato de la semana!`);
      setTimeout(() => setPublishSuccess(null), 5000);
    } catch (err) {
      console.error('Error publishing winner:', err);
      setError(err instanceof Error ? err.message : 'Error al publicar');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Estadísticas de Ventas
            </h1>
            <p className="text-slate-600 mt-2">
              Análisis de platos más pedidos y métricas de ventas
            </p>
          </div>

          <button
            onClick={fetchStatistics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Filtros de Tiempo */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span className="font-medium text-slate-700">Período:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["today", "week", "month", "all"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeFilter === filter
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {getFilterLabel(filter)}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
            <p className="font-medium">Error al cargar datos</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Success State */}
        {publishSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
            <p className="font-medium flex items-center gap-2">
              <Star className="w-5 h-5" />
              {publishSuccess}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Total Pedidos</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">
                        {summary.total_orders}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Items Vendidos</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">
                        {summary.total_items_sold}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Ingresos Totales</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">
                        {formatCurrency(summary.total_revenue)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Ticket Promedio</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">
                        {formatCurrency(summary.avg_order_value)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top 10 Platos Más Pedidos */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Top 10 Platos Más Pedidos - {getFilterLabel(timeFilter)}
                  </h2>

                  {/* Botón para publicar ganador de la semana */}
                  {timeFilter === "week" && topItems.length > 0 && (
                    <button
                      onClick={publishWeeklyWinner}
                      disabled={publishing}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {publishing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Publicar Ganador de la Semana
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                {topItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>No hay datos de ventas para este período</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Posición
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Plato
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Precio
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Veces Pedido
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Unidades Vendidas
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Ingresos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {topItems.map((item, index) => (
                        <tr
                          key={item.item_id}
                          className={`hover:bg-slate-50 transition-colors ${
                            index === 0 ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Award className="w-5 h-5 text-yellow-500" />
                              )}
                              {index === 1 && (
                                <Award className="w-5 h-5 text-slate-400" />
                              )}
                              {index === 2 && (
                                <Award className="w-5 h-5 text-orange-600" />
                              )}
                              <span className="font-bold text-slate-800">
                                #{item.rank_position}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.item_name}
                              </p>
                              {item.item_description && (
                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                  {item.item_description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {formatCurrency(item.item_price)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {item.order_count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {item.total_quantity_sold}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-800">
                            {formatCurrency(item.total_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Plato Más Popular */}
            {summary && summary.most_popular_item !== 'N/A' && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-6 border-2 border-yellow-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-7 h-7 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      Plato Estrella de {getFilterLabel(timeFilter)}
                    </h3>
                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
                      {summary.most_popular_item}
                    </p>
                    <p className="text-slate-700">
                      Vendido <span className="font-bold">{summary.most_popular_item_quantity}</span> veces
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Estadísticas Detalladas */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">
                  Estadísticas Detalladas de Todos los Platos
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Total de platos diferentes: {allItems.length}
                </p>
              </div>

              <div className="overflow-x-auto">
                {allItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>No hay datos disponibles</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Plato
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                          Veces Pedido
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                          Total Vendido
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                          Promedio/Pedido
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                          Ingresos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allItems.map((item) => (
                        <tr key={item.item_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">{item.item_name}</p>
                            <p className="text-sm text-slate-500">{formatCurrency(item.item_price)}</p>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-700">
                            {item.order_count}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-slate-800">
                            {item.total_quantity_sold}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-700">
                            {item.avg_quantity_per_order}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-800">
                            {formatCurrency(item.total_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
