"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Plus, Search, RefreshCw, Ticket, UtensilsCrossed,
  CheckCircle, XCircle, ChevronDown, ChevronUp, X, Trash2,
} from "lucide-react";

interface Tiquetera {
  id: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string | null;
  comidas_total: number;
  comidas_usadas: number;
  activa: boolean;
  registrada_por: string;
  notas: string | null;
  created_at: string;
}

interface Movimiento {
  id: string;
  tipo: "descuento" | "recarga" | "anulacion";
  cantidad: number;
  comidas_restantes: number;
  registrado_por: string;
  nota: string | null;
  created_at: string;
}

const emptyForm = {
  cliente_nombre: "",
  cliente_email: "",
  cliente_telefono: "",
  registrada_por: "",
  notas: "",
};

export default function TiqueterasAdminPage() {
  const [tiqueteras, setTiqueteras] = useState<Tiquetera[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [movimientos, setMovimientos] = useState<Record<string, Movimiento[]>>({});
  const [descuentoId, setDescuentoId] = useState<string | null>(null);
  const [descuentoCantidad, setDescuentoCantidad] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tiqueteras");
      if (res.ok) setTiqueteras(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadMovimientos = async (id: string) => {
    if (movimientos[id]) return;
    const res = await fetch(`/api/tiqueteras/movimientos?tiquetera_id=${id}`);
    if (res.ok) {
      const data = await res.json();
      setMovimientos((prev) => ({ ...prev, [id]: data }));
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadMovimientos(id);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/tiqueteras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await load();
        setForm(emptyForm);
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const descontar = async (t: Tiquetera) => {
    const cantidad = Math.min(descuentoCantidad, t.comidas_total - t.comidas_usadas);
    for (let i = 0; i < cantidad; i++) {
      await fetch("/api/tiqueteras", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id, accion: "descontar", registrado_por: "Admin" }),
      });
    }
    setDescuentoId(null);
    setDescuentoCantidad(1);
    setMovimientos((prev) => { const n = { ...prev }; delete n[t.id]; return n; });
    await load();
  };

  const recargar = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Recargar tiquetera?",
      text: "Se reiniciará a 30 comidas disponibles.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, recargar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#DE780D",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    await fetch("/api/tiqueteras", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, accion: "recargar", registrado_por: "Admin" }),
    });
    setMovimientos((prev) => { const n = { ...prev }; delete n[id]; return n; });
    await load();
  };

  const eliminar = async (t: Tiquetera) => {
    const result = await Swal.fire({
      title: "¿Eliminar tiquetera?",
      html: `Se eliminará la tiquetera de <strong>${t.cliente_nombre}</strong>. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#DE780D",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    await fetch(`/api/tiqueteras?id=${t.id}`, { method: "DELETE" });
    Swal.fire({ title: "Eliminada", text: "La tiquetera fue eliminada.", icon: "success", confirmButtonColor: "#DE780D", timer: 2000, showConfirmButton: false });
    await load();
  };

  const toggleActiva = async (t: Tiquetera) => {
    await fetch("/api/tiqueteras", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, accion: t.activa ? "desactivar" : "activar" }),
    });
    await load();
  };

  const filtered = tiqueteras.filter((t) =>
    t.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
    t.cliente_email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Ticket className="w-8 h-8 text-primary-500" />
              Tiqueteras
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {tiqueteras.filter((t) => t.activa).length} activas · {tiqueteras.length} total
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              Nueva Tiquetera
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        {/* Formulario nueva tiquetera */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nueva Tiquetera (30 comidas)</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del cliente *</label>
                <input required type="text" value={form.cliente_nombre}
                  onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: María García" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email del cliente *</label>
                <input required type="email" value={form.cliente_email}
                  onChange={(e) => setForm({ ...form, cliente_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                <input type="text" value={form.cliente_telefono}
                  onChange={(e) => setForm({ ...form, cliente_telefono: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: 3001234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registrada por *</label>
                <input required type="text" value={form.registrada_por}
                  onChange={(e) => setForm({ ...form, registrada_por: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de compra</label>
                <input
                  type="text"
                  readOnly
                  value={new Date().toLocaleDateString("es-CO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-default"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas (opcional)</label>
                <input type="text" value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Pagó en efectivo el 14 marzo" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-60">
                  {saving ? "Guardando..." : "Crear Tiquetera"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-semibold transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-3" />
            <p className="text-gray-400">Cargando tiqueteras...</p>
          </div>
        )}

        {/* Lista */}
        {!loading && (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay tiqueteras registradas</p>
              </div>
            )}

            {filtered.map((t) => {
              const restantes = t.comidas_total - t.comidas_usadas;
              const pct = Math.round(((t.comidas_total - t.comidas_usadas) / t.comidas_total) * 100);
              const isExpanded = expandedId === t.id;

              return (
                <div key={t.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 transition-all ${
                  t.activa ? "border-gray-100 dark:border-gray-700" : "border-gray-200 dark:border-gray-700 opacity-60"
                }`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Info cliente */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                            {t.cliente_nombre}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                            t.activa
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}>
                            {t.activa ? "Activa" : "Inactiva"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.cliente_email}</p>
                        {t.cliente_telefono && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t.cliente_telefono}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Registrada por {t.registrada_por}
                        </p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                          📅 Compra: {new Date(t.created_at).toLocaleDateString("es-CO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>

                      {/* Saldo */}
                      <div className="text-center flex-shrink-0">
                        <p className={`text-4xl font-extrabold ${
                          restantes === 0 ? "text-red-500" : restantes <= 5 ? "text-orange-500" : "text-primary-500"
                        }`}>
                          {restantes}
                        </p>
                        <p className="text-xs text-gray-400">de {t.comidas_total}</p>
                        <p className="text-xs text-gray-400">comidas</p>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-3 mb-4">
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct > 50 ? "bg-green-500" : pct > 20 ? "bg-orange-400" : "bg-red-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{restantes} restantes · {t.comidas_usadas} usadas</p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      {/* Descontar */}
                      {t.activa && restantes > 0 && (
                        descuentoId === t.id ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-300">¿Descontar</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setDescuentoCantidad(Math.max(1, descuentoCantidad - 1))}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-xl font-bold transition-all"
                              >
                                −
                              </button>
                              <span className="w-10 text-center text-2xl font-bold text-gray-900 dark:text-white">
                                {descuentoCantidad}
                              </span>
                              <button
                                onClick={() => setDescuentoCantidad(Math.min(restantes, descuentoCantidad + 1))}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-xl font-bold transition-all"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              comida{descuentoCantidad !== 1 ? "s" : ""}?
                            </span>
                            <button
                              onClick={() => descontar(t)}
                              className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                            >
                              Confirmar
                            </button>
                            <button onClick={() => { setDescuentoId(null); setDescuentoCantidad(1); }}
                              className="text-gray-400 hover:text-gray-600 p-1.5">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDescuentoId(t.id)}
                            className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                            Descontar comida
                          </button>
                        )
                      )}

                      {/* Recargar */}
                      {restantes === 0 && t.activa && (
                        <button
                          onClick={() => recargar(t.id)}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Recargar 30 comidas
                        </button>
                      )}

                      {/* Activar/Desactivar */}
                      <button
                        onClick={() => toggleActiva(t)}
                        className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      >
                        {t.activa ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {t.activa ? "Desactivar" : "Activar"}
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => eliminar(t)}
                        className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>

                      {/* Ver historial */}
                      <button
                        onClick={() => toggleExpand(t.id)}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-500 px-3 py-1.5 rounded-lg text-sm transition-all ml-auto"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Historial
                      </button>
                    </div>
                  </div>

                  {/* Historial de movimientos */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Historial de movimientos
                      </h4>
                      {!movimientos[t.id] ? (
                        <p className="text-sm text-gray-400">Cargando...</p>
                      ) : movimientos[t.id].length === 0 ? (
                        <p className="text-sm text-gray-400">Sin movimientos aún</p>
                      ) : (
                        <div className="space-y-2">
                          {movimientos[t.id].map((m) => (
                            <div key={m.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  m.tipo === "descuento" ? "bg-primary-500" :
                                  m.tipo === "recarga" ? "bg-green-500" : "bg-red-500"
                                }`} />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {m.tipo === "descuento" ? "−1 comida" :
                                   m.tipo === "recarga" ? "+30 comidas" : "Anulación"}
                                </span>
                                <span className="text-gray-400 text-xs">· {m.registrado_por}</span>
                                {m.nota && <span className="text-gray-400 text-xs">· {m.nota}</span>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="font-semibold text-gray-600 dark:text-gray-300">
                                  Saldo: {m.comidas_restantes}
                                </span>
                                <span>{formatDateTime(m.created_at)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
