"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Ticket, UtensilsCrossed, RefreshCw, LogIn } from "lucide-react";
import Link from "next/link";

interface Tiquetera {
  id: string;
  cliente_nombre: string;
  cliente_email: string;
  comidas_total: number;
  comidas_usadas: number;
  activa: boolean;
  created_at: string;
}

interface Movimiento {
  id: string;
  tipo: "descuento" | "recarga";
  cantidad: number;
  comidas_restantes: number;
  registrado_por: string;
  nota: string | null;
  created_at: string;
}

export default function MiTiqueteraPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [tiqueteras, setTiqueteras] = useState<Tiquetera[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tiqueteras?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data: Tiquetera[] = await res.json();
          setTiqueteras(data);
          if (data.length > 0) {
            setSelectedId(data[0].id);
            loadMovimientos(data[0].id);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, isSignedIn, user]);

  const loadMovimientos = async (id: string) => {
    const res = await fetch(`/api/tiqueteras/movimientos?tiquetera_id=${id}`);
    if (res.ok) setMovimientos(await res.json());
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMovimientos([]);
    loadMovimientos(id);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  // No autenticado
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Ticket className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mi Tiquetera</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Inicia sesión o crea una cuenta para consultar el saldo de tu tiquetera.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/sign-in"
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </Link>
            <Link href="/sign-up"
              className="flex items-center justify-center gap-2 border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-6 py-3 rounded-xl font-semibold transition-all">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tiquetera = tiqueteras.find((t) => t.id === selectedId);
  const restantes = tiquetera ? tiquetera.comidas_total - tiquetera.comidas_usadas : 0;
  const pct = tiquetera ? Math.round((restantes / tiquetera.comidas_total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Tiquetera</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Hola, {user?.firstName || user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        {/* Cargando */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-3" />
            <p className="text-gray-400">Consultando tu tiquetera...</p>
          </div>
        )}

        {/* Sin tiquetera */}
        {!loading && tiqueteras.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <UtensilsCrossed className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No tienes una tiquetera activa
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Habla con el personal del restaurante para adquirir tu tiquetera de 30 comidas.
            </p>
          </div>
        )}

        {/* Tiquetera activa */}
        {!loading && tiquetera && (
          <>
            {/* Selector si tiene más de una */}
            {tiqueteras.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {tiqueteras.map((t, i) => (
                  <button key={t.id} onClick={() => handleSelect(t.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedId === t.id
                        ? "bg-primary-500 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    }`}>
                    Tiquetera #{i + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Card principal */}
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6 border-2 ${
              tiquetera.activa ? "border-primary-200 dark:border-primary-800" : "border-gray-200 dark:border-gray-700"
            }`}>
              {/* Banner estado */}
              <div className={`px-5 py-2 text-sm font-semibold text-center ${
                tiquetera.activa
                  ? restantes === 0
                    ? "bg-red-500 text-white"
                    : "bg-primary-500 text-white"
                  : "bg-gray-400 text-white"
              }`}>
                {!tiquetera.activa ? "Tiquetera inactiva" :
                 restantes === 0 ? "Sin saldo — habla con el restaurante" :
                 restantes <= 5 ? `¡Solo te quedan ${restantes} comidas!` :
                 "Tiquetera activa"}
              </div>

              <div className="p-6">
                {/* Contador grande */}
                <div className="text-center mb-6">
                  <p className={`text-8xl font-black leading-none ${
                    restantes === 0 ? "text-red-500" :
                    restantes <= 5 ? "text-orange-500" : "text-primary-500"
                  }`}>
                    {restantes}
                  </p>
                  <p className="text-gray-400 mt-1 text-lg">
                    comidas disponibles
                  </p>
                  <p className="text-sm text-gray-400">
                    {tiquetera.comidas_usadas} usadas de {tiquetera.comidas_total}
                  </p>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 50 ? "bg-green-500" : pct > 20 ? "bg-orange-400" : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>{tiquetera.comidas_total}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Tiquetera desde {formatDate(tiquetera.created_at)}
                </p>
              </div>
            </div>

            {/* Historial */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white">Historial de consumo</h2>
                <button onClick={() => loadMovimientos(tiquetera.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {movimientos.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Sin movimientos aún</p>
              ) : (
                <div className="space-y-3">
                  {movimientos.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm border-b border-gray-50 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          m.tipo === "descuento" ? "bg-primary-500" : "bg-green-500"
                        }`}>
                          {m.tipo === "descuento" ? "−1" : "+30"}
                        </span>
                        <div>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">
                            {m.tipo === "descuento" ? "Comida consumida" : "Recarga de tiquetera"}
                          </p>
                          {m.nota && <p className="text-gray-400 text-xs">{m.nota}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Saldo: {m.comidas_restantes}
                        </p>
                        <p className="text-xs text-gray-400">{formatDateTime(m.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
