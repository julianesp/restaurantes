"use client";

import { X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";

interface DishDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: {
    id: number;
    name: string;
    description: string;
    price: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge?: string;
    discount?: string;
    special?: string;
    category?: string;
    image?: string;
    ingredients?: string[];
    nutritionalInfo?: {
      calories?: string;
      protein?: string;
      carbs?: string;
      fat?: string;
    };
  } | null;
}

export default function DishDetailModal({
  isOpen,
  onClose,
  dish,
}: DishDetailModalProps) {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  if (!isOpen || !dish) return null;

  const handleAddToCart = () => {
    addToCart({
      id: dish.id,
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category: dish.category || "Platos Destacados",
      image: dish.image,
    });

    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      onClose();
    }, 1500);
  };

  const IconComponent = dish.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Header with icon */}
        <div className="relative pt-12 pb-8 px-8 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30">
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-32 h-32 mb-6 rounded-full bg-gradient-to-br ${
                dish.color === "text-yellow-500"
                  ? "from-yellow-400 to-accent-500"
                  : dish.color === "text-accent"
                  ? "from-accent-400 to-primary-500"
                  : dish.color === "text-primary-500"
                  ? "from-primary-400 to-pink-500"
                  : "from-purple-400 to-indigo-500"
              } flex items-center justify-center shadow-xl`}
            >
              <IconComponent className={`w-16 h-16 ${dish.color}`} />
            </div>

            {/* Badges */}
            {dish.badge && (
              <span className="inline-block px-4 py-1 mb-3 bg-primary-500 text-white text-sm font-bold rounded-full">
                {dish.badge}
              </span>
            )}
            {dish.discount && (
              <span className="inline-block px-4 py-1 mb-3 bg-red-500 text-white text-sm font-bold rounded-full">
                {dish.discount}
              </span>
            )}
            {dish.special && (
              <span className="inline-block px-4 py-1 mb-3 bg-accent-500 text-white text-sm font-bold rounded-full">
                {dish.special}
              </span>
            )}

            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {dish.name}
            </h2>
            <p className="text-5xl font-bold text-primary-500 mb-2">
              {dish.price}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Descripción
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {dish.description}
            </p>
          </div>

          {/* Ingredients */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Ingredientes Principales
              </h3>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutritional Info */}
          {dish.nutritionalInfo && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Información Nutricional (Aproximada)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dish.nutritionalInfo.calories && (
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calorías
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dish.nutritionalInfo.calories}
                    </p>
                  </div>
                )}
                {dish.nutritionalInfo.protein && (
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Proteína
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dish.nutritionalInfo.protein}
                    </p>
                  </div>
                )}
                {dish.nutritionalInfo.carbs && (
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Carbohidratos
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dish.nutritionalInfo.carbs}
                    </p>
                  </div>
                )}
                {dish.nutritionalInfo.fat && (
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Grasas
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dish.nutritionalInfo.fat}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="pt-4">
            <button
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={`w-full py-4 px-6 text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 ${
                addedToCart
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }`}
            >
              {addedToCart ? (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  ¡Agregado al Carrito!
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Agregar al Carrito
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
