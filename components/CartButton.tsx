"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart as CartIcon } from "lucide-react";
import { useCart } from "../context/CartContext";
import ShoppingCart from "./ShoppingCart";

export default function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const pathname = usePathname();

  // No mostrar el carrito de clientes en el panel del mesero ni en admin
  if (pathname.startsWith("/mesero") || pathname.startsWith("/admin")) return null;

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-24 right-4 md:right-8 z-40 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
        aria-label="Abrir carrito"
      >
        <CartIcon className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
            {cartCount}
          </span>
        )}
        {/* Tooltip */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ver Carrito {cartCount > 0 && `(${cartCount})`}
        </span>
      </button>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
