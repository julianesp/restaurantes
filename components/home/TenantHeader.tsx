"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavOverDark } from "@/components/useNavOverDark";

/**
 * Cabecera fija y transparente del sitio de cada restaurante (misma idea que la de la landing de
 * Brasaya): el texto se vuelve blanco sobre las zonas marcadas con data-nav-dark.
 * Para el equipo del restaurante muestra arriba el aviso de "vista de dueño".
 */
export default function TenantHeader({
  name, logoUrl, canEdit,
}: { name: string; logoUrl: string | null; canEdit: boolean }) {
  const overDark = useNavOverDark(canEdit ? 100 : 64);
  const link = `rounded-full px-3.5 py-2 transition-colors duration-200 ${
    overDark
      ? "text-white/90 hover:text-white hover:bg-white/[0.12] [text-shadow:0_1px_2px_rgb(0_0_0_/_0.35)]"
      : "text-gray-800 hover:bg-gray-900/[0.06] dark:text-gray-200 dark:hover:bg-white/[0.08]"
  }`;

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {canEdit && (
        <div className="bg-primary-600 px-4 py-1.5 text-center text-xs text-white sm:text-sm">
          Vista de dueño: los recuadros punteados solo los ves tú.{" "}
          <Link href="/admin" className="font-semibold underline underline-offset-2">Ir al panel</Link>
        </div>
      )}
      <div className="rounded-b-3xl border-b-2 border-primary-500 bg-transparent shadow-[0_10px_24px_-12px_rgb(var(--primary-600)/0.55)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" />
            )}
            <span
              className={`truncate font-display text-lg font-bold ${
                overDark ? "text-white [text-shadow:0_1px_2px_rgb(0_0_0_/_0.35)]" : "text-gray-950 dark:text-white"
              }`}
            >
              {name}
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-[15px] font-medium md:flex">
            <a href="#carta" className={link}>Carta</a>
            <a href="#platos" className={link}>Platos</a>
            <a href="#nosotros" className={link}>Nosotros</a>
            <a href="#contacto" className={link}>Contacto</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            {canEdit && (
              <Link href="/admin" className={`hidden text-sm font-semibold sm:inline-flex ${link}`}>
                Administrar
              </Link>
            )}
            <Link href="/menu" className="btn-press rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              Pedir ahora
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
