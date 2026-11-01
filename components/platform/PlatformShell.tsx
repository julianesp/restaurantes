"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, Users, CreditCard, Receipt, BadgeCheck, RefreshCcw, HeartPulse, MousePointerClick,
  BarChart3, History, Menu, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import BrasayaLogo from "@/components/BrasayaLogo";
import SignOutButton from "@/components/SignOutButton";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";

const NAV = [
  { href: "/panel", label: "Resumen", icon: LayoutDashboard },
  { href: "/panel/restaurantes", label: "Restaurantes", icon: Store },
  { href: "/panel/usuarios", label: "Usuarios", icon: Users },
  { href: "/panel/suscripciones", label: "Suscripciones", icon: CreditCard },
  { href: "/panel/cobros", label: "Historial de cobros", icon: Receipt },
  { href: "/panel/activar", label: "Registrar pago manual", icon: BadgeCheck },
  { href: "/panel/reconciliar", label: "Reconciliar ePayco", icon: RefreshCcw },
  { href: "/panel/salud", label: "Salud de los restaurantes", icon: HeartPulse },
  { href: "/panel/visitas", label: "Visitas al sitio", icon: MousePointerClick },
  { href: "/panel/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/panel/actividad", label: "Registro de actividad", icon: History },
];

const STORAGE_KEY = "panel-sidebar-hidden";

/** Estructura de /panel (administración de Brasaya): barra lateral ocultable + contenido. */
export default function PlatformShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Se lee tras montar (no en el render) para que servidor y cliente coincidan
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const toggle = () =>
    setHidden((prev) => {
      try {
        localStorage.setItem(STORAGE_KEY, prev ? "0" : "1");
      } catch {}
      return !prev;
    });

  const isActive = (href: string) => (href === "/panel" ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const footer = (
    <div className="border-t border-stone-200 p-3 dark:border-stone-800">
      <p className="mb-2 truncate px-2 text-xs text-stone-500 dark:text-stone-400" title={email}>
        {email}
      </p>
      <SignOutButton className="w-full rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Escritorio: barra lateral fija */}
      {!hidden && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 lg:flex">
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <Link href="/panel" aria-label="Panel de Brasaya">
              <BrasayaLogo size={28} />
            </Link>
            <div className="flex items-center">
              <AdminThemeToggle />
              <button
                type="button"
                onClick={toggle}
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Ocultar el menú"
                title="Ocultar el menú"
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
            </div>
          </div>
          {nav}
          {footer}
        </aside>
      )}
      {hidden && (
        <div className="fixed left-3 top-3 z-30 hidden items-center gap-1 rounded-xl bg-white p-1 shadow dark:bg-stone-900 lg:flex">
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Mostrar el menú"
            title="Mostrar el menú"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
          <AdminThemeToggle />
        </div>
      )}

      {/* Celular: barra superior + menú desplegable */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900 lg:hidden">
        <Link href="/panel" aria-label="Panel de Brasaya">
          <BrasayaLogo size={26} />
        </Link>
        <div className="flex items-center">
          <AdminThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Cerrar el menú" : "Abrir el menú"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[57px] z-20 flex flex-col bg-white dark:bg-stone-900 lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      <main className={`px-4 py-6 sm:px-6 lg:py-8 ${hidden ? "lg:pl-20" : "lg:pl-72"} lg:pr-8`}>
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
