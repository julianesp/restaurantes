"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import ThemeModeMenu from "@/components/ThemeModeMenu";

/**
 * Botón de tema del sitio público: abre un menú con automático (por la hora), siempre claro o siempre
 * oscuro (ver ThemeModeMenu). Comparte la preferencia con el admin. Lleva `data-theme-toggle` para que
 * <FloatingThemeToggle /> sepa que la página ya tiene uno.
 */
export default function ThemeToggle({ className = "", floating = false }: { className?: string; floating?: boolean }) {
  return (
    <ThemeModeMenu
      floating={floating}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-800 shadow-sm backdrop-blur hover:bg-white dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100 dark:hover:bg-gray-800 ${className}`}
    >
      {(isDark) => (
        <>
          {/* Los dos íconos se cruzan (opacidad + giro + desenfoque): se percibe como una sola transformación */}
          <Sun
            aria-hidden
            className={`absolute h-[18px] w-[18px] transition-[opacity,transform,filter] duration-200 ease-out ${
              isDark ? "opacity-100 rotate-0 scale-100 blur-0" : "opacity-0 -rotate-90 scale-75 blur-[2px]"
            }`}
          />
          <Moon
            aria-hidden
            className={`absolute h-[18px] w-[18px] transition-[opacity,transform,filter] duration-200 ease-out ${
              isDark ? "opacity-0 rotate-90 scale-75 blur-[2px]" : "opacity-100 rotate-0 scale-100 blur-0"
            }`}
          />
        </>
      )}
    </ThemeModeMenu>
  );
}

/**
 * Botón flotante para las páginas que no traen su propio interruptor (menú, mesa, checkout,
 * mesero…). Si la página ya tiene uno ([data-theme-toggle]) no se muestra. El admin tiene el suyo.
 */
export function FloatingThemeToggle() {
  const pathname = usePathname();
  const [needed, setNeeded] = useState(false);

  useEffect(() => {
    // El admin de cada restaurante y el panel de la plataforma tienen su propio botón
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/panel")) {
      setNeeded(false);
      return;
    }
    const check = () => setNeeded(!document.querySelector("[data-theme-toggle]:not([data-floating])"));
    check();
    // El navbar de algunas páginas se monta un poco después
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  if (!needed) return null;
  return (
    <div className="fixed top-3 right-3 z-40">
      <ThemeToggle floating className="shadow-md" />
    </div>
  );
}
