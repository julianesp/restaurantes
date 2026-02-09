"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Star,
  MoveUp,
  MoveDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";

interface FeaturedDish {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PlatosDestacadosPage() {
  const [dishes, setDishes] = useState<FeaturedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDish, setEditingDish] = useState<FeaturedDish | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    display_order: 0,
  });

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/featured-dishes");
      if (response.ok) {
        const data = await response.json();
        setDishes(data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar platos destacados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDish = async () => {
    const nameTrim = formData.name?.trim() || "";
    const descriptionTrim = formData.description?.trim() || "";
    const priceTrim = formData.price?.trim() || "";

    if (!nameTrim) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Por favor ingresa el nombre del plato",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (!descriptionTrim) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Por favor ingresa la descripción del plato",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (!priceTrim) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Por favor ingresa el precio",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      const response = await fetch("/api/featured-dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameTrim,
          description: descriptionTrim,
          price: priceTrim,
          image_url: formData.image_url || null,
          display_order: formData.display_order || dishes.length + 1,
        }),
      });

      if (response.ok) {
        await loadDishes();
        resetForm();
        setIsCreating(false);
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Plato destacado creado correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error al crear",
          text: errorData.error || "Ocurrió un error desconocido",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al crear el plato",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleUpdateDish = async () => {
    if (!editingDish) return;

    const nameTrim = formData.name?.trim() || "";
    const descriptionTrim = formData.description?.trim() || "";
    const priceTrim = formData.price?.trim() || "";

    if (!nameTrim || !descriptionTrim || !priceTrim) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos requeridos",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      const response = await fetch(`/api/featured-dishes/${editingDish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameTrim,
          description: descriptionTrim,
          price: priceTrim,
          image_url: formData.image_url || null,
          display_order: formData.display_order,
          is_active: editingDish.is_active,
        }),
      });

      if (response.ok) {
        await loadDishes();
        resetForm();
        setEditingDish(null);
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Plato destacado actualizado correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al actualizar el plato",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar el plato",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleDeleteDish = async (id: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el plato destacado permanentemente",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/featured-dishes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadDishes();
        Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "Plato destacado eliminado correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al eliminar el plato",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al eliminar el plato",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleEditDish = (dish: FeaturedDish) => {
    setEditingDish(dish);
    // Asegurar que el precio tenga el formato correcto al editar
    const formattedPrice = dish.price.startsWith("$") ? dish.price : formatPrice(dish.price);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: formattedPrice,
      image_url: dish.image_url || "",
      display_order: dish.display_order,
    });
    setIsCreating(false);
  };

  const handleToggleActive = async (dish: FeaturedDish) => {
    try {
      const response = await fetch(`/api/featured-dishes/${dish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: !dish.is_active,
        }),
      });

      if (response.ok) {
        await loadDishes();
        Swal.fire({
          icon: "success",
          title: dish.is_active ? "Desactivado" : "Activado",
          text: `Plato ${dish.is_active ? "desactivado" : "activado"} correctamente`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al actualizar el estado",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar el estado",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleMoveUp = async (dish: FeaturedDish, index: number) => {
    if (index === 0) return;

    const prevDish = dishes[index - 1];
    const currentOrder = dish.display_order;
    const prevOrder = prevDish.display_order;

    try {
      await Promise.all([
        fetch(`/api/featured-dishes/${dish.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: prevOrder }),
        }),
        fetch(`/api/featured-dishes/${prevDish.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: currentOrder }),
        }),
      ]);

      await loadDishes();
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cambiar el orden",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleMoveDown = async (dish: FeaturedDish, index: number) => {
    if (index === dishes.length - 1) return;

    const nextDish = dishes[index + 1];
    const currentOrder = dish.display_order;
    const nextOrder = nextDish.display_order;

    try {
      await Promise.all([
        fetch(`/api/featured-dishes/${dish.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: nextOrder }),
        }),
        fetch(`/api/featured-dishes/${nextDish.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: currentOrder }),
        }),
      ]);

      await loadDishes();
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cambiar el orden",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño del archivo (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: "Archivo muy grande",
        text: "La imagen supera el tamaño máximo de 5MB",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Tipo de archivo no permitido",
        text: "Solo se aceptan imágenes (JPEG, PNG, WebP, GIF)",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, image_url: data.url }));
        Swal.fire({
          icon: "success",
          title: "¡Imagen subida!",
          text: "La imagen se subió exitosamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error al subir imagen",
          text: errorData.error || "Ocurrió un error desconocido",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al subir la imagen",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setUploading(false);
    }
  };

  // Función para formatear el precio con $ y separadores de miles
  const formatPrice = (value: string): string => {
    // Eliminar todo excepto números
    const numbers = value.replace(/\D/g, "");

    if (!numbers) return "";

    // Agregar separadores de miles
    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Agregar símbolo de peso
    return `$${formatted}`;
  };

  // Manejador para el cambio de precio
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setFormData({ ...formData, price: formatted });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      display_order: 0,
    });
    setEditingDish(null);
    setIsCreating(false);
  };

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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Platos Destacados Homepage
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Gestiona los platos que aparecen en el carousel de la página
                  principal
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Plato Destacado
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de platos */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {dishes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                  <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay platos destacados aún
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Haz clic en &quot;Nuevo Plato Destacado&quot; para agregar uno
                  </p>
                </div>
              ) : (
                dishes.map((dish, index) => (
                  <div
                    key={dish.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${
                      !dish.is_active ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Imagen */}
                      <div className="flex-shrink-0">
                        {dish.image_url ? (
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={dish.image_url}
                              alt={dish.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {dish.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Orden: #{dish.display_order}
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-primary-500">
                            {dish.price}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                          {dish.description}
                        </p>

                        {/* Acciones */}
                        <div className="flex items-center gap-2">
                          {/* Botones de orden */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleMoveUp(dish, index)}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Mover arriba"
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(dish, index)}
                              disabled={index === dishes.length - 1}
                              className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Mover abajo"
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex-1" />

                          {/* Toggle activo */}
                          <button
                            onClick={() => handleToggleActive(dish)}
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              dish.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {dish.is_active ? "Activo" : "Inactivo"}
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => handleEditDish(dish)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleDeleteDish(dish.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Formulario */}
          {(isCreating || editingDish) && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingDish ? "Editar Plato" : "Nuevo Plato Destacado"}
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
                      Descripción *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Descripción atractiva del plato..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Precio *
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={handlePriceChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ej: $12.000"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Escribe solo números, el formato se aplicará automáticamente
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Imagen del Plato
                    </label>

                    {/* Vista previa de la imagen */}
                    {formData.image_url && (
                      <div className="mb-3 relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={formData.image_url}
                          alt="Vista previa"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Botón de upload */}
                    <div className="space-y-2">
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          uploading
                            ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                            : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Subiendo...
                            </span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Subir desde dispositivo
                            </span>
                          </>
                        )}
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Formatos: JPEG, PNG, WebP, GIF · Máximo: 5MB
                      </p>
                    </div>

                    {/* Opción alternativa: pegar URL */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        O pegar URL de imagen
                      </label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) =>
                          setFormData({ ...formData, image_url: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Orden de Visualización
                    </label>
                    <input
                      type="number"
                      value={formData.display_order === 0 ? "" : formData.display_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Ej: 1, 2, 3..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Menor número aparece primero
                    </p>
                  </div>

                  <button
                    onClick={editingDish ? handleUpdateDish : handleCreateDish}
                    className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    {editingDish ? "Actualizar" : "Crear"}
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
