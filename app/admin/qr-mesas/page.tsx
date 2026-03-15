"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, ChefHat, Clock, CheckCircle, XCircle, UtensilsCrossed } from "lucide-react";

interface OrderItem {
  id: string;
  item_name: string;
  item_price: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  table_id: string;
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  customer_notes: string | null;
  created_at: string;
  items: OrderItem[];
}

const NUM_TABLES = 12;

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  preparing: { label: "Preparando", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: ChefHat },
  ready: { label: "Listo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  delivered: { label: "Entregado", color: "bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

export default function MesasPedidosPage() {
  const [ordersByTable, setOrdersByTable] = useState<Record<string, Order[]>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const audioCtx = useRef<AudioContext | null>(null);

  const playNotification = useCallback(() => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new AudioContext();
      }
      const ctx = audioCtx.current;
      // Dos pitidos cortos
      [0, 0.25].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.18);
      });
    } catch (e) {
      // AudioContext puede bloquearse antes de interacción del usuario
    }
  }, []);

  const loadOrders = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch("/api/orders/table");
      if (!res.ok) return;
      const all: Order[] = await res.json();

      const active = all.filter((o) => ["pending", "preparing", "ready"].includes(o.status));

      // Detectar pedidos nuevos (solo después de la carga inicial)
      if (!isInitial && soundEnabled) {
        const newOrders = active.filter((o) => !knownOrderIds.current.has(o.id));
        if (newOrders.length > 0) playNotification();
      }

      // Actualizar IDs conocidos
      active.forEach((o) => knownOrderIds.current.add(o.id));

      const grouped: Record<string, Order[]> = {};
      for (let t = 1; t <= NUM_TABLES; t++) {
        grouped[t.toString()] = active.filter((o) => o.table_id === t.toString());
      }
      setOrdersByTable(grouped);
    } catch (e) {
      console.error("Error cargando pedidos:", e);
    } finally {
      setLoading(false);
    }
  }, [soundEnabled, playNotification]);

  useEffect(() => {
    loadOrders(true);
    const interval = setInterval(() => loadOrders(false), 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const changeStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await fetch("/api/orders/table", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      await loadOrders();
    } catch (e) {
      console.error("Error actualizando estado:", e);
    } finally {
      setUpdating(null);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  const activeTables = Object.entries(ordersByTable).filter(([, orders]) => orders.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Pedidos por Mesa
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vista en tiempo real para cocina · se actualiza cada 15 seg
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? "Silenciar notificaciones" : "Activar notificaciones"}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                soundEnabled
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                  : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {soundEnabled ? "🔔 Sonido ON" : "🔕 Sonido OFF"}
            </button>
            <button
              onClick={() => loadOrders(false)}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando pedidos...</p>
          </div>
        )}

        {/* Sin pedidos activos */}
        {!loading && activeTables.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay pedidos activos
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Cuando los clientes hagan pedidos aparecerán aquí por mesa
            </p>
          </div>
        )}

        {/* Grid de mesas con pedidos */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTables.map(([tableId, orders]) => (
              <div
                key={tableId}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-primary-400 dark:border-primary-600 overflow-hidden"
              >
                {/* Cabecera de mesa */}
                <div className="bg-primary-500 text-white px-5 py-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Mesa {tableId}</h2>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                    {orders.length} pedido{orders.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Pedidos de esta mesa */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map((order) => {
                    const sc = statusConfig[order.status];
                    const StatusIcon = sc.icon;
                    return (
                      <div key={order.id} className="p-4">
                        {/* Info pedido */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                              {order.order_number}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                              · {formatTime(order.created_at)}
                            </span>
                          </div>
                          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </div>

                        {/* Items */}
                        <ul className="space-y-1 mb-3">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-800 dark:text-gray-200 font-medium">
                                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold px-1.5 py-0.5 rounded mr-1.5">
                                  ×{item.quantity}
                                </span>
                                {item.item_name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {item.item_price}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Nota del cliente */}
                        {order.customer_notes && (
                          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded px-2 py-1 mb-3">
                            Nota: {order.customer_notes}
                          </p>
                        )}

                        {/* Acciones de estado */}
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <button
                              onClick={() => changeStatus(order.id, "preparing")}
                              disabled={updating === order.id}
                              className="flex-1 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-lg transition-colors disabled:opacity-60"
                            >
                              {updating === order.id ? "..." : "Preparando"}
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button
                              onClick={() => changeStatus(order.id, "ready")}
                              disabled={updating === order.id}
                              className="flex-1 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg transition-colors disabled:opacity-60"
                            >
                              {updating === order.id ? "..." : "Listo para servir"}
                            </button>
                          )}
                          {order.status === "ready" && (
                            <button
                              onClick={() => changeStatus(order.id, "delivered")}
                              disabled={updating === order.id}
                              className="flex-1 text-xs font-semibold bg-gray-500 hover:bg-gray-600 text-white py-1.5 rounded-lg transition-colors disabled:opacity-60"
                            >
                              {updating === order.id ? "..." : "Entregado"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
