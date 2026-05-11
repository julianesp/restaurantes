"use client";

import { useState, useEffect } from "react";
import { UtensilsCrossed, KeyRound, Loader2 } from "lucide-react";

const SESSION_KEY = "mesero_session";

export default function MeseroLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [waiterName, setWaiterName] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) { setWaiterName(parsed.name); setAuthed(true); }
      } catch {}
    }
    setChecking(false);
  }, []);

  const handlePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/waiters/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "PIN incorrecto"); return; }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.waiter));
      setWaiterName(data.waiter.name);
      setAuthed(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (d: string) => { if (pin.length < 8) setPin(p => p + d); };
  const deleteDigit = () => setPin(p => p.slice(0, -1));

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!authed) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel del Mesero</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ingresa tu PIN para continuar</p>
        </div>

        <form onSubmit={handlePin}>
          {/* Indicador de dígitos */}
          <div className="flex justify-center gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > i
                  ? "bg-primary-500 border-primary-500"
                  : "bg-transparent border-gray-300 dark:border-gray-600"
              }`} />
            ))}
          </div>

          {/* Teclado numérico */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} type="button" onClick={() => addDigit(n.toString())}
                className="h-14 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 text-gray-900 dark:text-white font-bold text-xl transition-all active:scale-95">
                {n}
              </button>
            ))}
            <div />
            <button type="button" onClick={() => addDigit("0")}
              className="h-14 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 text-gray-900 dark:text-white font-bold text-xl transition-all active:scale-95">
              0
            </button>
            <button type="button" onClick={deleteDigit}
              className="h-14 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-gray-500 dark:text-gray-400 font-bold text-lg transition-all active:scale-95">
              ←
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

          <button type="submit" disabled={pin.length < 4 || loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-lg transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <div className="bg-primary-500 text-white px-4 py-2 flex items-center justify-between text-sm">
        <span className="font-semibold">Mesero: {waiterName}</span>
        <button onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); setPin(""); }}
          className="text-white/80 hover:text-white underline text-xs">
          Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  );
}

