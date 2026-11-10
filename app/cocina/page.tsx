import OrdersBoard from "@/components/kitchen/OrdersBoard";

export default function CocinaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Pedidos de las mesas</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Lo más antiguo primero: marca cada pedido a medida que avanza.</p>
      <OrdersBoard />
    </div>
  );
}
