"use client";

import { useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-CO")}`;
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Carrito de Compras
            </h2>
            {getCartCount() > 0 && (
              <span className="bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {getCartCount()} {getCartCount() === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Agrega algunos platos deliciosos para continuar
              </p>
              <Link
                href="/menu"
                onClick={onClose}
                className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Ver Menú
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">🍽️</div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <p className="text-lg font-bold text-primary-500">
                      {item.price}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                    >
                      <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white min-w-[30px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                    >
                      <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}

              {/* Clear Cart Button */}
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-all"
                >
                  Vaciar Carrito
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Total:
              </span>
              <span className="text-2xl font-bold text-primary-500">
                {formatPrice(getCartTotal())}
              </span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-lg font-bold transition-all w-full"
            >
              <CreditCard className="w-5 h-5" />
              Pagar Online
            </Link>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Los costos de envío se calcularán según tu ubicación
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
