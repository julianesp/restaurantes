"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, UserCheck, UserX, KeyRound, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

interface Waiter {
  id: string;
  name: string;
  email: string;
  pin: string;
  active: boolean;
  created_at: string;
}

const emptyForm = { name: "", email: "", pin: "" };

export default function MeserosAdminPage() {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waiters");
      if (res.ok) setWaiters(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin.length < 4) {
      Swal.fire({ icon: "warning", title: "PIN muy corto", text: "El PIN debe tener al menos 4 dígitos.", confirmButtonColor: "#DE780D" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/waiters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load();
      setForm(emptyForm);
      setShowForm(false);
      Swal.fire({ icon: "success", title: "Mesero creado", timer: 2000, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: "#DE780D" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (w: Waiter) => {
    await fetch("/api/waiters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: w.id, active: !w.active }),
    });
    await load();
  };

  const changePin = async (w: Waiter) => {
    const { value: newPin } = await Swal.fire({
      title: `Cambiar PIN de ${w.name}`,
      input: "text",
      inputLabel: "Nuevo PIN (mínimo 4 dígitos)",
      inputAttributes: { maxlength: "8", pattern: "[0-9]*", inputmode: "numeric" },
      showCancelButton: true,
      confirmButtonColor: "#DE780D",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Guardar",
      inputValidator: (v) => (!v || v.length < 4 ? "El PIN debe tener al menos 4 dígitos" : null),
    });
    if (!newPin) return;
    await fetch("/api/waiters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: w.id, pin: newPin }),
    });
    Swal.fire({ icon: "success", title: "PIN actualizado", timer: 1500, showConfirmButton: false });
    await load();
  };

  const eliminar = async (w: Waiter) => {
    const result = await Swal.fire({
      title: "¿Eliminar mesero?",
      html: `Se eliminará a <strong>${w.name}</strong> permanentemente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#DE780D",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    await fetch(`/api/waiters?id=${w.id}`, { method: "DELETE" });
    Swal.fire({ icon: "success", title: "Eliminado", timer: 1500, showConfirmButton: false });
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meseros</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {waiters.filter(w => w.active).length} activos · {waiters.length} total
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-500 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Mesero
            </button>
          </div>
        </div>

        {/* Formulario nuevo mesero */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nuevo mesero</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                <input
                  required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Ej: Carlos López"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  required type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="mesero@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN (4-8 dígitos) *</label>
                <input
                  required value={form.pin} maxLength={8} inputMode="numeric"
                  onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none tracking-widest font-mono"
                  placeholder="1234"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors disabled:opacity-60">
                {saving ? "Guardando..." : "Crear mesero"}
              </button>
            </div>
          </form>
        )}

        {/* Instrucciones de acceso */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 mb-6 text-sm text-primary-800 dark:text-primary-300">
          <p className="font-semibold mb-1">¿Cómo accede el mesero?</p>
          <p>El mesero entra a <code className="bg-white dark:bg-gray-800 px-1 rounded font-mono">/mesero</code> en el navegador e ingresa su PIN. Solo meseros activos pueden acceder.</p>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto" />
          </div>
        ) : waiters.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No hay meseros registrados aún.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waiters.map(w => (
              <div key={w.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0 ${w.active ? "bg-primary-500" : "bg-gray-400"}`}>
                  {w.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{w.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{w.email}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">PIN: {"•".repeat(w.pin.length)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${w.active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                  {w.active ? "Activo" : "Inactivo"}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(w)} title={w.active ? "Desactivar" : "Activar"}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {w.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button onClick={() => changePin(w)} title="Cambiar PIN"
                    className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button onClick={() => eliminar(w)} title="Eliminar"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
