"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, ChefHat, Package, XCircle, RefreshCw } from "lucide-react";

interface OrderItem {
  id: string;
  item_name: string;
  item_description: string;
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
  updated_at: string;
  items: OrderItem[];
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    bgColor: "bg-yellow-50",
  },
  preparing: {
    label: "En Preparación",
    icon: ChefHat,
    color: "bg-blue-100 text-blue-800 border-blue-300",
    bgColor: "bg-blue-50",
  },
  ready: {
    label: "Listo",
    icon: Package,
    color: "bg-green-100 text-green-800 border-green-300",
    bgColor: "bg-green-50",
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    color: "bg-gray-100 text-gray-800 border-gray-300",
    bgColor: "bg-gray-50",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-300",
    bgColor: "bg-red-50",
  },
};

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadOrders = async () => {
    try {
      const url =
        filterStatus === "all"
          ? "/api/orders/table"
          : `/api/orders/table?status=${filterStatus}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, filterStatus]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/orders/table", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        loadOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
    });
  };

  const filteredOrders = orders.filter((order) =>
    filterStatus === "all" ? true : order.status === filterStatus
  );

  const groupedOrders = {
    pending: filteredOrders.filter((o) => o.status === "pending"),
    preparing: filteredOrders.filter((o) => o.status === "preparing"),
    ready: filteredOrders.filter((o) => o.status === "ready"),
    delivered: filteredOrders.filter((o) => o.status === "delivered"),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gestión de Pedidos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Panel de control para pedidos de mesas
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  autoRefresh
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                />
                Auto-refresh {autoRefresh ? "ON" : "OFF"}
              </button>
              <button
                onClick={loadOrders}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Actualizar
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filterStatus === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Todos ({orders.length})
            </button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    filterStatus === status
                      ? config.color
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Vista de tablero (Kanban) */}
        {filterStatus === "all" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["pending", "preparing", "ready", "delivered"].map((status) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              const statusOrders = groupedOrders[status as keyof typeof groupedOrders];
              const Icon = config.icon;

              return (
                <div key={status} className="flex flex-col">
                  <div className={`${config.color} rounded-t-xl p-4 border-b-2`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-bold text-lg">{config.label}</h3>
                      <span className="ml-auto bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-sm font-bold">
                        {statusOrders.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-b-xl p-4 space-y-4 min-h-[400px]">
                    {statusOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={updateOrderStatus}
                        formatTime={formatTime}
                        formatDate={formatDate}
                      />
                    ))}
                    {statusOrders.length === 0 && (
                      <p className="text-center text-gray-400 py-8">
                        No hay pedidos
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Vista de lista
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                formatTime={formatTime}
                formatDate={formatDate}
                expanded
              />
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <p className="text-gray-400 text-lg">
                  No hay pedidos con este estado
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  formatTime: (date: string) => string;
  formatDate: (date: string) => string;
  expanded?: boolean;
}

function OrderCard({
  order,
  onUpdateStatus,
  formatTime,
  formatDate,
  expanded = false,
}: OrderCardProps) {
  const [showDetails, setShowDetails] = useState(expanded);
  const config = statusConfig[order.status];
  const Icon = config.icon;

  const getNextStatus = (currentStatus: string) => {
    const flow = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivered",
      delivered: "delivered",
    };
    return flow[currentStatus as keyof typeof flow];
  };

  const nextStatus = getNextStatus(order.status);
  const canAdvance = order.status !== "delivered" && order.status !== "cancelled";

  return (
    <div
      className={`${config.bgColor} border-2 ${config.color.split(" ")[2]} rounded-xl p-4 hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Mesa {order.table_id}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
              <Icon className="w-3 h-3 inline mr-1" />
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(order.created_at)} • {formatTime(order.created_at)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{order.order_number}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            ${order.total.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* Items del pedido */}
      <div className="space-y-2 mb-3">
        {order.items.slice(0, showDetails ? undefined : 2).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm bg-white dark:bg-gray-700 rounded-lg p-2"
          >
            <span className="font-medium">
              {item.quantity}x {item.item_name}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              ${item.subtotal.toLocaleString("es-CO")}
            </span>
          </div>
        ))}
        {!showDetails && order.items.length > 2 && (
          <button
            onClick={() => setShowDetails(true)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver {order.items.length - 2} más...
          </button>
        )}
      </div>

      {order.customer_notes && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Nota: {order.customer_notes}
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2">
        {canAdvance && (
          <button
            onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-all"
          >
            {nextStatus === "preparing" && "Iniciar Preparación"}
            {nextStatus === "ready" && "Marcar como Listo"}
            {nextStatus === "delivered" && "Marcar como Entregado"}
          </button>
        )}
        {order.status === "pending" && (
          <button
            onClick={() => onUpdateStatus(order.id, "cancelled")}
            className="px-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-all"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
