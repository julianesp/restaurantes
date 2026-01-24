"use client";

import { useState } from "react";
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
} from "lucide-react";

interface DailySpecial {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  createdAt: string;
}

export default function DailySpecialsPage() {
  const [specials, setSpecials] = useState<DailySpecial[]>([
    {
      id: 1,
      name: "Sancocho Especial",
      description:
        "Sancocho tradicional con carne de res, pollo, yuca y plátano",
      price: "$18.000",
      category: "Almuerzo",
      available: true,
      createdAt: "2026-01-21",
    },
    {
      id: 2,
      name: "Bandeja Paisa Completa",
      description: "Bandeja paisa con todos sus ingredientes tradicionales",
      price: "$28.000",
      category: "Almuerzo",
      available: true,
      createdAt: "2026-01-21",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Almuerzo",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Editar existente
      setSpecials(
        specials.map((special) =>
          special.id === editingId
            ? {
                ...special,
                ...formData,
              }
            : special
        )
      );
    } else {
      // Crear nuevo
      const newSpecial: DailySpecial = {
        id: Date.now(),
        ...formData,
        available: true,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setSpecials([newSpecial, ...specials]);
    }

    // Reset form
    setFormData({ name: "", description: "", price: "", category: "Almuerzo" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (special: DailySpecial) => {
    setFormData({
      name: special.name,
      description: special.description,
      price: special.price,
      category: special.category,
    });
    setEditingId(special.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este plato del día?")) {
      setSpecials(specials.filter((special) => special.id !== id));
    }
  };

  const toggleAvailability = (id: number) => {
    setSpecials(
      specials.map((special) =>
        special.id === id
          ? { ...special, available: !special.available }
          : special
      )
    );
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", price: "", category: "Almuerzo" });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Platos del Día
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Gestiona los especiales diarios
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Ver Sitio</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Plato del Día
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? "Editar Plato" : "Nuevo Plato del Día"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Plato
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Sancocho Especial"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio
                  </label>
                  <input
                    type="text"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    placeholder="$18.000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Desayuno">Desayuno</option>
                  <option value="Almuerzo">Almuerzo</option>
                  <option value="Cena">Cena</option>
                  <option value="Postre">Postre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe los ingredientes y preparación..."
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "Guardar Cambios" : "Agregar Plato"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Specials List */}
        <div className="grid md:grid-cols-2 gap-6">
          {specials.map((special) => (
            <div
              key={special.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 transition-all ${
                special.available
                  ? "border-green-500 dark:border-green-600"
                  : "border-gray-300 dark:border-gray-600 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {special.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        special.available
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {special.available ? "Disponible" : "No disponible"}
                    </span>
                  </div>
                  <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full font-medium mb-2">
                    {special.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(special)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(special.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {special.description}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-primary-500">
                  {special.price}
                </p>
                <button
                  onClick={() => toggleAvailability(special.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    special.available
                      ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {special.available ? "Marcar No Disponible" : "Activar"}
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Creado: {special.createdAt}
              </p>
            </div>
          ))}
        </div>

        {specials.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay platos del día
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Agrega tu primer plato especial para empezar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
