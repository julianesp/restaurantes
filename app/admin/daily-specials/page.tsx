"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChefHat,
  Home,
  RefreshCw,
  Star,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface DailySpecial {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  created_by: string | null;
  created_at: string;
  image?: string;
}

interface PermanentDish {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  created_at: string;
}

const CATEGORIES = ["Platos Fuertes", "Sopas", "Bebidas", "Postres", "Desayuno", "Almuerzo", "Cena"];

const emptyDailyForm = { name: "", description: "", price: "", category: "Almuerzo", image: "" };
const emptyPermForm = { name: "", description: "", price: "", category: "Platos Fuertes" };

export default function DailySpecialsPage() {
  const [activeTab, setActiveTab] = useState<"daily" | "permanent">("daily");

  // --- Platos del día ---
  const [specials, setSpecials] = useState<DailySpecial[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [savingDaily, setSavingDaily] = useState(false);
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [editingDailyId, setEditingDailyId] = useState<string | null>(null);
  const [dailyForm, setDailyForm] = useState(emptyDailyForm);

  // --- Platos permanentes ---
  const [permanent, setPermanent] = useState<PermanentDish[]>([]);
  const [loadingPerm, setLoadingPerm] = useState(true);
  const [savingPerm, setSavingPerm] = useState(false);
  const [showPermForm, setShowPermForm] = useState(false);
  const [editingPermId, setEditingPermId] = useState<string | null>(null);
  const [permForm, setPermForm] = useState(emptyPermForm);

  // ── Carga ──────────────────────────────────────────────
  const loadSpecials = async () => {
    setLoadingDaily(true);
    try {
      const res = await fetch("/api/daily-specials");
      if (res.ok) setSpecials(await res.json());
    } finally {
      setLoadingDaily(false);
    }
  };

  const loadPermanent = async () => {
    setLoadingPerm(true);
    try {
      const res = await fetch("/api/permanent-dishes");
      if (res.ok) setPermanent(await res.json());
    } finally {
      setLoadingPerm(false);
    }
  };

  useEffect(() => { loadSpecials(); loadPermanent(); }, []);

  // ── Platos del día: handlers ───────────────────────────
  const handleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDaily(true);
    try {
      const method = editingDailyId ? "PATCH" : "POST";
      const body = editingDailyId ? { id: editingDailyId, ...dailyForm } : dailyForm;
      await fetch("/api/daily-specials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await loadSpecials();
      setDailyForm(emptyDailyForm);
      setShowDailyForm(false);
      setEditingDailyId(null);
    } finally {
      setSavingDaily(false);
    }
  };

  const handleDailyEdit = (s: DailySpecial) => {
    setDailyForm({ name: s.name, description: s.description, price: s.price, category: s.category, image: s.image || "" });
    setEditingDailyId(s.id);
    setShowDailyForm(true);
  };

  const handleDailyDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plato del día?")) return;
    await fetch(`/api/daily-specials?id=${id}`, { method: "DELETE" });
    await loadSpecials();
  };

  const toggleDailyAvailability = async (s: DailySpecial) => {
    await fetch("/api/daily-specials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, available: !s.available }),
    });
    await loadSpecials();
  };

  // ── Platos permanentes: handlers ───────────────────────
  const handlePermSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPerm(true);
    try {
      const method = editingPermId ? "PATCH" : "POST";
      const body = editingPermId ? { id: editingPermId, ...permForm } : permForm;
      await fetch("/api/permanent-dishes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await loadPermanent();
      setPermForm(emptyPermForm);
      setShowPermForm(false);
      setEditingPermId(null);
    } finally {
      setSavingPerm(false);
    }
  };

  const handlePermEdit = (d: PermanentDish) => {
    setPermForm({ name: d.name, description: d.description, price: d.price, category: d.category });
    setEditingPermId(d.id);
    setShowPermForm(true);
  };

  const handlePermDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plato permanente?")) return;
    await fetch(`/api/permanent-dishes?id=${id}`, { method: "DELETE" });
    await loadPermanent();
  };

  const togglePermAvailability = async (d: PermanentDish) => {
    await fetch("/api/permanent-dishes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: d.id, available: !d.available }),
    });
    await loadPermanent();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  // ── Formulario compartido ──────────────────────────────
  const DishForm = ({
    form,
    setForm,
    onSubmit,
    saving,
    onCancel,
    editingId,
    showImage = false,
  }: {
    form: Record<string, string>;
    setForm: (f: Record<string, string>) => void;
    onSubmit: (e: React.FormEvent) => void;
    saving: boolean;
    onCancel: () => void;
    editingId: string | null;
    showImage?: boolean;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {editingId ? "Editar Plato" : "Nuevo Plato"}
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Pechuga a la Plancha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio *</label>
            <input
              type="text"
              required
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="$18.000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción *</label>
          <textarea
            required
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Ingredientes y preparación..."
          />
        </div>

        {showImage && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto del plato</label>
            <ImageUploader
              value={form.image || ""}
              onChange={url => setForm({ ...form, image: url })}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-60"
            style={{ backgroundColor: "#DE780D" }}
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : editingId ? "Guardar Cambios" : "Agregar Plato"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  // ── Tarjeta de plato ───────────────────────────────────
  const DishCard = ({
    dish,
    onEdit,
    onDelete,
    onToggle,
  }: {
    dish: DailySpecial | PermanentDish;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
  }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 transition-all ${
      dish.available ? "border-green-500" : "border-gray-300 dark:border-gray-600 opacity-60"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{dish.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              dish.available
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}>
              {dish.available ? "Disponible" : "No disponible"}
            </span>
          </div>
          <span className="inline-block text-xs px-2 py-1 rounded-full font-medium mb-2"
            style={{ backgroundColor: "#DE780D22", color: "#DE780D" }}>
            {dish.category}
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onEdit} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
            <Edit className="w-4 h-4 text-blue-500" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {"image" in dish && dish.image && (
        <img src={dish.image} alt={dish.name} className="w-full h-40 object-cover rounded-xl mb-3" />
      )}

      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{dish.description}</p>

      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold" style={{ color: "#DE780D" }}>{dish.price}</p>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            dish.available
              ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              : "text-white"
          }`}
          style={!dish.available ? { backgroundColor: "#DE780D" } : {}}
        >
          {dish.available ? "Marcar No Disponible" : "Activar"}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Creado: {formatDate(dish.created_at)}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#DE780D" }}>
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Platos</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Platos del día y platos permanentes</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => { loadSpecials(); loadPermanent(); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Ver Sitio</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Pestañas */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-lg transition-all border-b-2 -mb-px ${
              activeTab === "daily"
                ? "border-b-2 text-white"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            style={activeTab === "daily" ? { backgroundColor: "#DE780D", borderColor: "#DE780D" } : {}}
          >
            <ChefHat className="w-4 h-4" />
            Platos del Día
            <span className="ml-1 bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">
              {specials.filter(s => s.available).length}/{specials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("permanent")}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-lg transition-all border-b-2 -mb-px ${
              activeTab === "permanent"
                ? "text-white"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            style={activeTab === "permanent" ? { backgroundColor: "#B8620A", borderColor: "#B8620A" } : {}}
          >
            <Star className="w-4 h-4" />
            Platos Permanentes
            <span className="ml-1 bg-white/30 text-white text-xs px-2 py-0.5 rounded-full hidden">
              {permanent.length}
            </span>
            {activeTab === "permanent" && (
              <span className="ml-1 bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">
                {permanent.filter(d => d.available).length}/{permanent.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Pestaña Platos del Día ── */}
        {activeTab === "daily" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Estos platos aparecen en el modal "Pedir Ahora" junto a los permanentes. Márcalos como no disponibles si se agotan.
              </p>
              <button
                onClick={() => { setShowDailyForm(!showDailyForm); setDailyForm(emptyDailyForm); setEditingDailyId(null); }}
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shrink-0 ml-4"
                style={{ backgroundColor: "#DE780D" }}
              >
                <Plus className="w-5 h-5" />
                Agregar Plato del Día
              </button>
            </div>

            {showDailyForm && (
              <DishForm
                form={dailyForm}
                setForm={f => setDailyForm(f as typeof dailyForm)}
                onSubmit={handleDailySubmit}
                saving={savingDaily}
                onCancel={() => { setShowDailyForm(false); setEditingDailyId(null); setDailyForm(emptyDailyForm); }}
                editingId={editingDailyId}
                showImage
              />
            )}

            {loadingDaily ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#DE780D" }} />
                <p className="text-gray-500 dark:text-gray-400">Cargando platos del día...</p>
              </div>
            ) : specials.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay platos del día</h3>
                <p className="text-gray-600 dark:text-gray-300">Agrega el primer plato especial para hoy</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {specials.map(s => (
                  <DishCard
                    key={s.id}
                    dish={s}
                    onEdit={() => handleDailyEdit(s)}
                    onDelete={() => handleDailyDelete(s.id)}
                    onToggle={() => toggleDailyAvailability(s)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Pestaña Platos Permanentes ── */}
        {activeTab === "permanent" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Platos que siempre están disponibles (ej: pechuga de pollo, pollo frito). Aparecen en el modal junto a los del día.
              </p>
              <button
                onClick={() => { setShowPermForm(!showPermForm); setPermForm(emptyPermForm); setEditingPermId(null); }}
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shrink-0 ml-4"
                style={{ backgroundColor: "#B8620A" }}
              >
                <Plus className="w-5 h-5" />
                Agregar Plato Permanente
              </button>
            </div>

            {showPermForm && (
              <DishForm
                form={permForm}
                setForm={f => setPermForm(f as typeof permForm)}
                onSubmit={handlePermSubmit}
                saving={savingPerm}
                onCancel={() => { setShowPermForm(false); setEditingPermId(null); setPermForm(emptyPermForm); }}
                editingId={editingPermId}
              />
            )}

            {loadingPerm ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#B8620A" }} />
                <p className="text-gray-500 dark:text-gray-400">Cargando platos permanentes...</p>
              </div>
            ) : permanent.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay platos permanentes</h3>
                <p className="text-gray-600 dark:text-gray-300">Agrega los platos que siempre preparas</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {permanent.map(d => (
                  <DishCard
                    key={d.id}
                    dish={d}
                    onEdit={() => handlePermEdit(d)}
                    onDelete={() => handlePermDelete(d.id)}
                    onToggle={() => togglePermAvailability(d)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
