"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import ShoppingCart from "./ShoppingCart";
import PlateIcon from "./PlateIcon";
import styles from "./CartButton.module.scss";

export default function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const pathname = usePathname();
  // La landing de Brasaya se sirve en "/" (reescrita a /plataforma): se reconoce por su marcador
  const [onPlatform, setOnPlatform] = useState(false);
  useEffect(() => {
    setOnPlatform(!!document.querySelector("[data-platform-landing]"));
  }, [pathname]);

  const btnRef = useRef<HTMLButtonElement>(null);
  const hidden =
    pathname.startsWith("/mesero") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/plataforma") ||
    pathname.startsWith("/registro") ||
    pathname.startsWith("/panel") ||
    onPlatform;

  // El botón sube junto con el borde del footer para no pasar por encima de él
  useEffect(() => {
    if (hidden) return;
    const BOTTOM = 24; // bottom-6
    const GAP = 12;
    let frame = 0;
    let cleanup: (() => void) | undefined;
    const attach = (footer: HTMLElement) => {
      const update = () => {
        frame = 0;
        const btn = btnRef.current;
        if (!btn) return;
        const overlap = window.innerHeight - footer.getBoundingClientRect().top;
        const lift = Math.max(0, overlap - BOTTOM + GAP);
        btn.style.transform = lift > 0 ? `translate3d(0, ${-lift}px, 0)` : "";
        // Tocando el borde del footer (los carbones) el botón se calienta
        if (lift > 0) btn.dataset.heat = "on";
        else delete btn.dataset.heat;
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
      cleanup = () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (frame) cancelAnimationFrame(frame);
      };
    };
    const found = document.querySelector("footer");
    if (found) {
      attach(found);
      return () => cleanup?.();
    }
    // En algunas páginas el footer se monta después: se espera a que aparezca
    const mo = new MutationObserver(() => {
      const footer = document.querySelector("footer");
      if (footer) {
        mo.disconnect();
        attach(footer);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cleanup?.();
    };
  }, [hidden, pathname]);

  // No mostrar el carrito de clientes en el panel del mesero, en admin ni en las páginas de la plataforma
  if (hidden) return null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setIsCartOpen(true)}
        data-cart-target
        className={`${styles.btn} fixed bottom-6 right-4 z-30 bg-primary-600 hover:bg-primary-700 text-white p-1 rounded-full shadow-lg shadow-primary-900/20 group`}
        aria-label="Abrir mi pedido"
      >
        <PlateIcon count={cartCount} className={`${styles.icon} w-11 h-11`} />
        <span aria-hidden className={`${styles.wave} ${styles.w1}`} />
        <span aria-hidden className={`${styles.wave} ${styles.w2}`} />
        <span aria-hidden className={`${styles.wave} ${styles.w3}`} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
            {cartCount}
          </span>
        )}
        {/* Tooltip */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ver mi pedido {cartCount > 0 && `(${cartCount})`}
        </span>
      </button>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
