"use client";

import Link from "next/link";
import BrasayaLogo from "@/components/BrasayaLogo";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Cabecera fija y transparente (solo desenfoque) de la landing de Brasaya. El texto se vuelve
 * legible sobre cualquier fondo gracias al contorno (ver .nav-outline-* en globals.css).
 */
export default function PlatformHeader() {
  // Texto oscuro con contorno blanco en tema claro (se lee sobre foto o fondo claro); claro en tema oscuro
  const link = "rounded-full px-3.5 py-2 transition-colors duration-200 text-gray-900 hover:text-black hover:bg-white/25 nav-outline-white dark:text-gray-100 dark:hover:text-white dark:hover:bg-white/[0.12]";

  return (
    <header className="fixed inset-x-0 top-0 z-40 rounded-b-3xl border-b-2 border-primary-500 bg-transparent shadow-[0_10px_24px_-12px_rgb(var(--primary-600)/0.55)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Brasaya, inicio" className="group">
          <BrasayaLogo size={32} outline />
        </Link>
        <nav className="hidden items-center gap-1 text-[15px] font-medium md:flex">
          <a href="#servicios" className={link}>Servicios</a>
          <a href="#recorrido" className={link}>Recorrido</a>
          <a href="#empezar" className={link}>Cómo empezar</a>
          <a href="#precio" className={link}>Precio</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/sign-in?redirect_url=/panel" className={`hidden text-sm font-semibold sm:inline-flex ${link}`}>
            Iniciar sesión
          </Link>
          <Link href="/registro" className="btn-press rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
            Probar gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
