"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, ArrowRight, ChefHat } from "lucide-react";

const NUM_TABLES = 12;

export default function MeseroHomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

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

      {/* Link a admin */}
      <a
        href="/admin"
        className="mt-10 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
      >
        <ChefHat className="w-4 h-4" />
        Ir al panel de administración
      </a>
    </div>
  );
}
