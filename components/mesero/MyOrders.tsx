"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, CheckCircle, ChefHat, Clock } from "lucide-react";
import { useWaiterSession } from "@/components/mesero/WaiterSession";

// Pedidos en curso del mesero (los que él envió a cocina), con su estado. Cuando la cocina marca uno
// como listo avisa con un pitido y un recuadro, y el mesero lo marca como entregado.

interface MyOrder {
  id: string;
  table_id: string;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  created_at: string;
  items: Array<{ id: string; item_name: string; quantity: number }>;
}

const POLL_MS = 8_000;

const badge = {
  pending: { label: "Enviado a cocina", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", Icon: Clock },
  preparing: { label: "Preparando", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", Icon: ChefHat },
  ready: { label: "¡Listo para servir!", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", Icon: BellRing },
  delivered: { label: "Entregado", cls: "bg-gray-100 text-gray-500", Icon: CheckCircle },
  cancelled: { label: "Cancelado", cls: "bg-red-100 text-red-700", Icon: Clock },
} as const;

export default function MyOrders() {
  const { session, logout } = useWaiterSession();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [justReady, setJustReady] = useState<string[]>([]);
  const lastStatus = useRef<Map<string, string> | null>(null);
  const audio = useRef<AudioContext | null>(null);

  const headers = useCallback(
    (extra: Record<string, string> = {}) => ({ ...extra, ...(session.token ? { "X-Waiter-Token": session.token } : {}) }),
    [session.token]
  );

  const beep = useCallback(() => {
    try {
      audio.current ??= new AudioContext();
      const ctx = audio.current;
      void ctx.resume();
      [0, 0.2, 0.4].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.35, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
      navigator.vibrate?.(200);
    } catch {}
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/table?active=1", { headers: headers() });
      if (res.status === 401) return logout(); // sesión vencida o mesero desactivado
      if (!res.ok) return setError("No se pudieron cargar tus pedidos.");
      const data: MyOrder[] = await res.json();
      setError("");

      // ¿Algún pedido pasó a "listo" desde la última vez?
      if (lastStatus.current) {
        const nowReady = data.filter((o) => o.status === "ready" && lastStatus.current!.get(o.id) !== "ready").map((o) => o.table_id);
        if (nowReady.length > 0) {
          beep();
          setJustReady((prev) => [...new Set([...prev, ...nowReady])]);
        }
      }
      lastStatus.current = new Map(data.map((o) => [o.id, o.status]));
      setOrders(data);
    } catch {
      setError("Sin conexión: se reintentará solo.");
    } finally {
      setLoading(false);
    }
  }, [headers, logout, beep]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const deliver = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch("/api/orders/table", {
        method: "PATCH",
        headers: headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ orderId: id, status: "delivered" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo marcar como entregado.");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (loading || (orders.length === 0 && !error)) return null;

  return (
    <section className="w-full max-w-lg mb-8" aria-label="Mis pedidos en curso">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Mis pedidos en curso</h2>

      {justReady.length > 0 && (
        <div role="status" className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-green-600 px-4 py-3 text-white shadow-lg">
          <span className="flex items-center gap-2 font-semibold">
            <BellRing className="h-5 w-5" />
            {justReady.length === 1 ? `Mesa ${justReady[0]} lista para servir` : `Listos: mesas ${justReady.join(", ")}`}
          </span>
          <button onClick={() => setJustReady([])} className="text-sm underline">Entendido</button>
        </div>
      )}

      {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}

      <ul className="space-y-3">
        {orders.map((o) => {
          const b = badge[o.status];
          const Icon = b.Icon;
          return (
            <li key={o.id} className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-gray-800 ${o.status === "ready" ? "border-green-500 ring-2 ring-green-200 dark:ring-green-900" : "border-gray-200 dark:border-gray-700"}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Mesa {o.table_id}</span>
                <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${b.cls}`}>
                  <Icon className="h-3 w-3" />
                  {b.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {o.items.map((i) => `${i.quantity}× ${i.item_name}`).join(" · ")}
              </p>
              {o.status === "ready" && (
                <button
                  onClick={() => deliver(o.id)}
                  disabled={busy === o.id}
                  className="mt-3 w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {busy === o.id ? "..." : "Ya lo entregué"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
