"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, Settings, X, LogIn } from "lucide-react";
import Link from "next/link";
import BrandLogo from "../BrandLogo";
import ReservationModal from "../ReservationModal";
import OrderModal from "../OrderModal";
import FloatingActionButtons from "../FloatingActionButtons";
import ThemeToggle from "../ThemeToggle";
import { UserButton, useUser } from "@clerk/nextjs";
import { useBranding } from "@/context/TenantContext";

type NavLink = { href: string; label: string };
type NavGroup = { label: string; href: string; children: NavLink[] };

// Misma estructura de navegación de siempre (anclas y rutas sin cambios)
const GROUPS: NavGroup[] = [
  {
    label: "Inicio",
    href: "/#inicio",
    children: [
      { href: "/#especialidades", label: "Especialidades" },
      { href: "/#destacadas", label: "Destacados" },
    ],
  },
  {
    label: "Nosotros",
    href: "/nosotros",
    children: [
      { href: "/galeria", label: "Galería" },
      { href: "/#contacto", label: "Contacto" },
    ],
  },
];

const LINKS: NavLink[] = [
  { href: "/#menu-comidas", label: "Menú" },
  { href: "/blog", label: "Blog" },
  { href: "/#delivery", label: "Domicilios" },
];

const MOBILE_LINKS: NavLink[] = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#especialidades", label: "Especialidades" },
  { href: "/#menu-comidas", label: "Menú" },
  { href: "/#destacadas", label: "Destacados" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/galeria", label: "Galería" },
  { href: "/blog", label: "Blog" },
  { href: "/#delivery", label: "Domicilios" },
  { href: "/#contacto", label: "Contacto" },
];

const linkClass =
  "rounded-full px-3.5 py-2 text-[15px] font-medium text-gray-700 hover:text-gray-950 hover:bg-gray-900/[0.05] dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/[0.07] transition-colors duration-150";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const { name } = useBranding();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El usuario es administrador si pertenece a ESTE restaurante (lo decide el servidor)
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!isSignedIn) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    fetch("/api/tenant")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setIsAdmin(!!data?.isAdmin);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  // Cerrar el menú móvil al tocar fuera o con Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setIsMobileMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setIsMobileMenuOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isMobileMenuOpen]);

  // Submenús: se abren al instante y se cierran con un pequeño margen para poder llegar a ellos
  const openGroup = (label: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(label);
  };
  const closeGroupSoon = () => {
    closeTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 160);
  };

  return (
    <nav ref={navRef} className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-full border border-gray-900/[0.08] bg-white/70 pl-2.5 pr-2.5 shadow-[0_8px_30px_-12px_rgb(28_25_23_/_0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/65 dark:shadow-[0_8px_30px_-12px_rgb(0_0_0_/_0.6)]">
        {/* Marca */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-full pr-2" title="Ir a inicio">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px]">
            <BrandLogo size={36} className="h-9 w-9 object-contain" />
          </span>
          <span className="truncate font-display text-lg font-semibold tracking-tight text-gray-950 dark:text-white">
            {name}
          </span>
        </Link>

        {/* Enlaces (escritorio) */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {GROUPS.map((group) => {
            const open = openDropdown === group.label;
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => openGroup(group.label)}
                onMouseLeave={closeGroupSoon}
              >
                <Link
                  href={group.href}
                  className={`${linkClass} inline-flex items-center gap-1`}
                  aria-expanded={open}
                  onFocus={() => openGroup(group.label)}
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden
                    className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
                  />
                </Link>
                {/* Submenú: crece desde el enlace que lo abre */}
                <div
                  className={`absolute left-0 top-full z-10 mt-2 w-52 origin-top-left rounded-2xl border border-gray-900/[0.08] bg-white p-1.5 shadow-xl shadow-gray-900/10 transition-[opacity,transform] duration-150 ease-out dark:border-white/10 dark:bg-gray-900 dark:shadow-black/40 ${
                    open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                  }`}
                >
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpenDropdown(null)}
                      className="block rounded-xl px-3.5 py-2.5 text-[15px] text-gray-700 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          {isSignedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="btn-press hidden items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 sm:inline-flex"
                >
                  <Settings aria-hidden className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="btn-press hidden items-center gap-1.5 rounded-full bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 sm:inline-flex"
            >
              <LogIn aria-hidden className="h-4 w-4" />
              Iniciar sesión
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white lg:hidden"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        className={`mx-auto mt-2 max-w-6xl origin-top transition-[opacity,transform] duration-200 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="rounded-3xl border border-gray-900/[0.08] bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/95">
          <div className="grid grid-cols-2 gap-1">
            {MOBILE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.06]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-2 border-t border-gray-100 pt-2 dark:border-white/10">
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-press flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 font-semibold text-white"
              >
                <Settings aria-hidden className="h-5 w-5" />
                Panel de administración
              </Link>
            ) : (
              !isSignedIn && (
                <Link
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-press flex items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-3 font-semibold text-white dark:bg-white dark:text-gray-950"
                >
                  <LogIn aria-hidden className="h-5 w-5" />
                  Iniciar sesión
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <ReservationModal isOpen={isReservationModalOpen} onClose={() => setIsReservationModalOpen(false)} />
      <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />

      {/* Botones flotantes */}
      <FloatingActionButtons
        onReservaClick={() => setIsReservationModalOpen(true)}
        onPedirClick={() => setIsOrderModalOpen(true)}
      />
    </nav>
  );
};

export default Navbar;
