"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import MyOrders from "@/components/mesero/MyOrders";

const NUM_TABLES = 12;

export default function MeseroHomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [otherTable, setOtherTable] = useState("");

  const goToTable = (tableId: number) => {
    router.push(`/mesero/mesa/${tableId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-start pt-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <UtensilsCrossed className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Panel del Mesero
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Selecciona la mesa para tomar el pedido
        </p>
      </div>

      {/* Pedidos que este mesero envió a cocina y su estado */}
      <MyOrders />

      {/* Grid de mesas */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full max-w-lg mb-8">
        {Array.from({ length: NUM_TABLES }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setSelected(num)}
            className={`aspect-square rounded-2xl font-bold text-xl shadow transition-all flex flex-col items-center justify-center gap-1 border-2 ${
              selected === num
                ? "bg-primary-500 text-white border-primary-600 scale-105 shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:shadow-md"
            }`}
          >
            <span className="text-2xl font-extrabold">{num}</span>
            <span className="text-xs font-medium opacity-70">Mesa</span>
          </button>
        ))}
      </div>

      {/* Mesas con otro número (más de 12, barra, terraza...) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = parseInt(otherTable, 10);
          if (n >= 1 && n <= 999) goToTable(n);
        }}
        className="mb-8 flex items-center gap-2"
      >
        <input
          type="number" min={1} max={999} value={otherTable} onChange={(e) => setOtherTable(e.target.value)}
          placeholder="Otra mesa"
          aria-label="Número de otra mesa"
          className="w-32 rounded-xl border border-gray-300 bg-white px-3 py-2 text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button type="submit" disabled={!otherTable} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-gray-900">
          Ir
        </button>
      </form>

      {/* Botón ir */}
      {selected && (
        <button
          onClick={() => goToTable(selected)}
          className="flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4"
        >
          <UtensilsCrossed className="w-5 h-5" />
          Tomar pedido — Mesa {selected}
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}
