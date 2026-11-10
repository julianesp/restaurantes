"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, ChefHat, Clock, CheckCircle, XCircle, UtensilsCrossed } from "lucide-react";

// Tablero de pedidos de mesa en curso, agrupados por mesa. Lo usan el panel (/admin/qr-mesas) y la
// cocina (/cocina). Las mesas salen de los propios pedidos: un pedido de cualquier mesa aparece.

interface OrderItem {
  id: string;
  item_name: string;
  item_price: string;
  quantity: number;
  subtotal: number;
}

export interface BoardOrder {
  id: string;
  order_number: string;
  table_id: string;
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  customer_notes: string | null;
  waiter_name: string | null;
  created_at: string;
  items: OrderItem[];
}

const POLL_MS = 10_000;

export const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  preparing: { label: "Preparando", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: ChefHat },
  ready: { label: "Listo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  delivered: { label: "Entregado", color: "bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

/** Mesas en orden numérico cuando lo son ("2" antes que "10"). */
const byTable = (a: string, b: string) => a.localeCompare(b, "es", { numeric: true });

export default function OrdersBoard() {
  const [orders, setOrders] = useState<BoardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundRef = useRef(true);
  const known = useRef<Set<string> | null>(null); // null = todavía no hubo una primera carga
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  // El navegador bloquea el audio hasta que el usuario toca la página: se crea al primer gesto
  const unlockAudio = useCallback(() => {
    try {
      audioCtx.current ??= new AudioContext();
      if (audioCtx.current.state === "suspended") void audioCtx.current.resume();
    } catch {}
  }, []);
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    return () => window.removeEventListener("pointerdown", unlockAudio);
  }, [unlockAudio]);

  const beep = useCallback(() => {
    try {
      unlockAudio();
      const ctx = audioCtx.current;
      if (!ctx) return;
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
    } catch {}
  }, [unlockAudio]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/table?active=1");
      if (!res.ok) {
        setError(res.status === 401 || res.status === 403 ? "No tienes acceso a los pedidos de este restaurante." : "No se pudieron cargar los pedidos.");
        return;
      }
      const active: BoardOrder[] = await res.json();
      setError("");

      // Pedidos nuevos desde la última carga (no en la primera)
      if (known.current) {
        const added = active.filter((o) => !known.current!.has(o.id)).map((o) => o.id);
        if (added.length > 0) {
          if (soundRef.current) beep();
          setFresh((prev) => new Set([...prev, ...added]));
          setTimeout(() => setFresh((prev) => new Set([...prev].filter((id) => !added.includes(id)))), 15_000);
        }
      }
      known.current = new Set([...(known.current ?? []), ...active.map((o) => o.id)]);
      setOrders(active);
    } catch {
      setError("Sin conexión: se reintentará solo.");
    } finally {
      setLoading(false);
    }
  }, [beep]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const changeStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    setError("");
    try {
      const res = await fetch("/api/orders/table", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo cambiar el estado del pedido.");
        return;
      }
      await load();
    } catch {
      setError("Sin conexión: el estado no se cambió. Inténtalo de nuevo.");
    } finally {
      setUpdating(null);
    }
  };

  const tables = [...new Set(orders.map((o) => o.table_id))].sort(byTable);
  const action = (order: BoardOrder) =>
    order.status === "pending" ? { to: "preparing", label: "Preparando", cls: "bg-blue-500 hover:bg-blue-600" }
    : order.status === "preparing" ? { to: "ready", label: "Listo para servir", cls: "bg-green-500 hover:bg-green-600" }
    : order.status === "ready" ? { to: "delivered", label: "Entregado", cls: "bg-gray-500 hover:bg-gray-600" }
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} en curso · se actualiza solo cada {POLL_MS / 1000} s
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSoundEnabled((v) => !v); unlockAudio(); }}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              soundEnabled
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
            }`}
          >
            {soundEnabled ? "🔔 Sonido ON" : "🔕 Sonido OFF"}
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}

      {loading && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Cargando pedidos...</p>
        </div>
      )}

      {!loading && tables.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <UtensilsCrossed className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay pedidos activos</h3>
          <p className="text-gray-500 dark:text-gray-400">Cuando lleguen pedidos de las mesas aparecerán aquí</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((tableId) => {
            // Lo más viejo primero: es lo que la cocina debe sacar antes
            const tableOrders = orders.filter((o) => o.table_id === tableId).sort((a, b) => a.created_at.localeCompare(b.created_at));
            return (
              <div key={tableId} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-primary-400 dark:border-primary-600 overflow-hidden">
                <div className="bg-primary-500 text-white px-5 py-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Mesa {tableId}</h2>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                    {tableOrders.length} pedido{tableOrders.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {tableOrders.map((order) => {
                    const sc = statusConfig[order.status];
                    const StatusIcon = sc.icon;
                    const next = action(order);
                    return (
                      <div key={order.id} className="p-4">
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{formatTime(order.created_at)}</span>
                            {order.waiter_name && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">· {order.waiter_name}</span>
                            )}
                            {fresh.has(order.id) && (
                              <span className="ml-2 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Nuevo</span>
                            )}
                          </div>
                          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </div>

                        <ul className="space-y-1 mb-3">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-800 dark:text-gray-200 font-medium">
                                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold px-1.5 py-0.5 rounded mr-1.5">
                                  ×{item.quantity}
                                </span>
                                {item.item_name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">{item.item_price}</span>
                            </li>
                          ))}
                        </ul>

                        {order.customer_notes && (
                          <p className="text-xs text-yellow-800 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded px-2 py-1 mb-3">
                            Nota: {order.customer_notes}
                          </p>
                        )}

                        {next && (
                          <button
                            onClick={() => changeStatus(order.id, next.to)}
                            disabled={updating === order.id}
                            className={`w-full text-xs font-semibold text-white py-1.5 rounded-lg transition-colors disabled:opacity-60 ${next.cls}`}
                          >
                            {updating === order.id ? "..." : next.label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
