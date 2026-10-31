"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, KeyRound, Loader2, MessageSquare, LayoutGrid } from "lucide-react";
import { WAITER_SESSION_KEY as SESSION_KEY, WaiterSessionContext, type WaiterSession } from "@/components/mesero/WaiterSession";

export default function MeseroLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<WaiterSession | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      // Las sesiones anteriores al token del servidor no sirven: se pide el PIN de nuevo
      if (parsed?.name && parsed?.token) { setSession(parsed); setAuthed(true); }
    } catch {}
    setChecking(false);
  }, []);

  const logout = () => {
    const token = session?.token;
    if (token) fetch("/api/waiters/verify", { method: "DELETE", headers: { "X-Waiter-Token": token } }).catch(() => {});
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setSession(null);
    setAuthed(false);
    setPin("");
  };

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
      const next: WaiterSession = { name: data.waiter.name, token: data.token };
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch {}
      setSession(next);
      setPin("");
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

  if (!session) return null;

  const tab = (href: string, label: string, Icon: typeof LayoutGrid) => {
    const active = href === "/mesero" ? pathname === "/mesero" || pathname.startsWith("/mesero/mesa") : pathname.startsWith(href);
    return (
      <Link href={href} aria-current={active ? "page" : undefined}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${active ? "bg-white text-primary-700" : "text-white/90 hover:bg-white/15"}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Link>
    );
  };

  return (
    <WaiterSessionContext.Provider value={{ session, logout }}>
      {/* pr-16: deja libre el botón flotante de tema (FloatingThemeToggle) en la esquina */}
      <div className="bg-primary-500 text-white pl-4 pr-16 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold">Mesero: {session.name}</span>
        <nav className="flex items-center gap-1">
          {tab("/mesero", "Mesas", LayoutGrid)}
          {tab("/mesero/chat", "Chat de cocina", MessageSquare)}
        </nav>
        <button onClick={logout} className="text-white/80 hover:text-white underline text-xs">
          Cerrar sesión
        </button>
      </div>
      {children}
    </WaiterSessionContext.Provider>
  );
}

