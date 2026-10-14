"use client";

import Link from "next/link";
import BrasayaLogo from "@/components/BrasayaLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavOverDark } from "@/components/useNavOverDark";

/**
 * Cabecera fija y transparente (solo desenfoque) de la landing de Brasaya. El texto se vuelve
 * blanco cuando detrás hay una foto o zona oscura (data-nav-dark).
 */
export default function PlatformHeader() {
  const overDark = useNavOverDark(64);
  const link = `rounded-full px-3.5 py-2 transition-colors duration-200 ${
    overDark
      ? "text-white/90 hover:text-white hover:bg-white/[0.12] [text-shadow:0_1px_2px_rgb(0_0_0_/_0.35)]"
      : "text-gray-800 hover:bg-gray-900/[0.06] dark:text-gray-200 dark:hover:bg-white/[0.08]"
  }`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 rounded-b-3xl border-b-2 border-primary-500 bg-transparent shadow-[0_10px_24px_-12px_rgb(var(--primary-600)/0.55)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Brasaya, inicio" className={overDark ? "group [&_.font-display]:!text-white" : "group"}>
          <BrasayaLogo size={32} />
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
