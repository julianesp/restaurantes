"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Loader2,
  Coffee,
  Soup,
  Salad,
  UtensilsCrossed,
  Pizza,
  IceCream,
  Cake,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: string;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_available: boolean;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
}

const iconMap: Record<string, any> = {
  Coffee,
  Soup,
  Salad,
  UtensilsCrossed,
  Pizza,
  IceCream,
  Cake,
};

export default function AdminMenuPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    is_vegetarian: false,
    is_spicy: false,
    display_order: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar categorías
      const catResponse = await fetch("/api/menu/categories");
      if (catResponse.ok) {
        const catData = await catResponse.json();
        setCategories(catData);
        if (catData.length > 0 && !selectedCategory) {
          setSelectedCategory(catData[0].id);
        }
      }

      // Cargar items
      const itemsResponse = await fetch("/api/menu/items");
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!formData.name || !formData.price || !selectedCategory) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const response = await fetch("/api/menu/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategory,
          ...formData,
        }),
      });

      if (response.ok) {
        await loadData();
        resetForm();
        setIsCreating(false);
      } else {
        alert("Error al crear el item");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el item");
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/menu/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategory,
          ...formData,
          is_available: editingItem.is_available,
        }),
      });

      if (response.ok) {
        await loadData();
        resetForm();
        setEditingItem(null);
      } else {
        alert("Error al actualizar el item");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el item");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este item?")) return;

    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadData();
      } else {
        alert("Error al eliminar el item");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el item");
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      is_vegetarian: item.is_vegetarian,
      is_spicy: item.is_spicy,
      display_order: item.display_order,
    });
    setIsCreating(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      is_vegetarian: false,
      is_spicy: false,
      display_order: 0,
    });
    setEditingItem(null);
    setIsCreating(false);
  };

  const filteredItems = items.filter(
    (item) => item.category_id === selectedCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Menú
              </h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Item
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de items */}
          <div className="lg:col-span-2">
            {/* Categorías */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Categorías
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = iconMap[category.icon] || UtensilsCrossed;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCategory === category.id
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Items del menú */}
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay items en esta categoría
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary-500">
                            {item.price}
                          </span>
                          {item.is_vegetarian && (
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                              🌱 Veggie
                            </span>
                          )}
                          {item.is_spicy && (
                            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full">
                              🌶️ Picante
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Formulario */}
          {(isCreating || editingItem) && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingItem ? "Editar Item" : "Nuevo Item"}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ej: Bandeja Paisa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Descripción del plato"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Precio *
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ej: $28.000"
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_vegetarian}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_vegetarian: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-500 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Vegetariano
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_spicy}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_spicy: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-500 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Picante
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Orden
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={editingItem ? handleUpdateItem : handleCreateItem}
                    className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    {editingItem ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
