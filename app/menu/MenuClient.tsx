"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Coffee,
  Soup,
  Salad,
  UtensilsCrossed,
  Pizza,
  IceCream,
  Cake,
  Plus,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

// Tipos de datos
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: MenuItem[];
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

interface MenuClientProps {
  initialMenuData: MenuCategory[];
}

export default function MenuClient({ initialMenuData }: MenuClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialMenuData[0]?.id || ""
  );
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const currentCategory = initialMenuData.find(
    (cat) => cat.id === selectedCategory
  );

  const handleAddToCart = (item: MenuItem, categoryId: string) => {
    addToCart({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: categoryId,
    });

    // Mostrar feedback visual
    setAddedItems(new Set(addedItems).add(item.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 2000);
  };

  const handleDownloadMenu = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/menu/download");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "menu-restaurante-munay.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Error al descargar el menú");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al descargar el menú");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Link>
            <button
              onClick={handleDownloadMenu}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 bg-white text-primary-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {isDownloading ? "Descargando..." : "Descargar Menú"}
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Menú 🍽️
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Descubre todos nuestros platos y bebidas. Preparados con ingredientes
            frescos y mucho amor.
          </p>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="sticky top-16 z-30 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {initialMenuData.map((category) => {
              const Icon = iconMap[category.icon] || UtensilsCrossed;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-primary-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isSelected ? "text-white" : category.color}`}
                  />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentCategory && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              {(() => {
                const Icon = iconMap[currentCategory.icon] || UtensilsCrossed;
                return <Icon className={`w-10 h-10 ${currentCategory.color}`} />;
              })()}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentCategory.name}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCategory.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <div className="flex gap-2">
                      {item.isVegetarian && (
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                          🌱 Veggie
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full">
                          🌶️ Picante
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-2xl font-bold text-primary-500">
                      {item.price}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item, selectedCategory)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          addedItems.has(item.id)
                            ? "bg-green-500 text-white"
                            : "bg-primary-500 hover:bg-primary-600 text-white"
                        }`}
                      >
                        {addedItems.has(item.id) ? (
                          <>✓ Agregado</>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Carrito
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
