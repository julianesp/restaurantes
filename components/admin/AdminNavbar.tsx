"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  BookOpen,
  ShoppingBag,
  Menu,
  X,
  BarChart3,
  Star,
  MessageSquare,
  ChefHat,
  Ticket,
  Users,
  Settings,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";

interface AdminNavbarProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    emailAddresses: { emailAddress: string }[];
  };
  /** Escritorio: barra lateral oculta */
  sidebarHidden: boolean;
  onToggleSidebar: () => void;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Panel Chef",
    href: "/admin/cocina",
    icon: ChefHat,
  },
  {
    name: "Tiqueteras",
    href: "/admin/tiqueteras",
    icon: Ticket,
  },
  {
    name: "Menú",
    href: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    name: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
  },
  {
    name: "Estadísticas",
    href: "/admin/estadisticas",
    icon: BarChart3,
  },
  {
    name: "Sugerencias",
    href: "/admin/sugerencias",
    icon: MessageSquare,
  },
  {
    name: "Platos Destacados",
    href: "/admin/platos-destacados",
    icon: Star,
  },
  {
    name: "Mesas",
    href: "/admin/qr-mesas",
    icon: UtensilsCrossed,
  },
  {
    name: "Panel Mesero",
    href: "/mesero",
    icon: ShoppingBag,
  },
  {
    name: "Meseros",
    href: "/admin/meseros",
    icon: Users,
  },
  {
    name: "Destacados",
    href: "/admin/daily-specials",
    icon: CalendarDays,
  },
  {
    name: "Chat Cocina",
    href: "/admin/chat",
    icon: ChefHat,
  },
  {
    name: "Blog",
    href: "/admin/blog",
    icon: BookOpen,
  },
  {
    name: "Ver sitio",
    href: "/",
    icon: Globe,
    external: true,
  },
  {
    name: "Suscripción",
    href: "/admin/suscripcion",
    icon: CreditCard,
  },
  {
    name: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
];

const isActiveLink = (pathname: string, href: string) =>
  pathname === href || (href !== "/admin" && href !== "/" && pathname.startsWith(`${href}/`));

/**
 * Navegación del admin (única en todo el panel):
 *  - Escritorio (md+): barra lateral izquierda fija, con las opciones desplazables y el usuario al pie.
 *  - Celular: barra superior con menú hamburguesa; las opciones se desplazan y el usuario queda fijo abajo.
 * El contenido debe dejar espacio: `md:pl-64` (lateral) y `pt-12 md:pt-0` (barra superior móvil); ver app/admin/layout.tsx.
 */
export default function AdminNavbar({ user, sidebarHidden, onToggleSidebar }: AdminNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkProps = (item: (typeof navItems)[number]) =>
    item.external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  const userBlock = (
    <div className="flex items-center gap-3 px-4 py-1">
      <UserButton afterSignOutUrl="/" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {user.emailAddresses[0]?.emailAddress}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Escritorio: barra lateral izquierda */}
      <aside
        aria-hidden={sidebarHidden}
        className={`hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-[transform,visibility] duration-200 ${
          sidebarHidden ? "-translate-x-full invisible" : "translate-x-0"
        }`}
      >
        <div className="h-14 shrink-0 flex items-center justify-between pl-5 pr-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm font-semibold text-primary-500 tracking-wide">Admin</span>
          <div className="flex items-center gap-1">
            <AdminThemeToggle />
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Ocultar menú lateral"
              title="Ocultar menú lateral"
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav aria-label="Administración" className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 px-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveLink(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    {...linkProps(item)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-primary-500 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 py-3">{userBlock}</div>
      </aside>

      {/* Escritorio con la barra oculta: botones flotantes para mostrarla y cambiar el tema */}
      {sidebarHidden && (
        <div className="hidden md:flex fixed top-3 left-3 z-50 items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-sm backdrop-blur p-0.5">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Mostrar menú lateral"
            title="Mostrar menú lateral"
            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <AdminThemeToggle />
        </div>
      )}

      {/* Celular: barra superior + menú hamburguesa */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-11 px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <AdminThemeToggle />
        </div>

        {mobileMenuOpen && (
          // Altura limitada al alto visible (menos la barra, h-11); dvh evita que la barra del navegador
          // móvil lo tape. Solo la lista hace scroll (min-h-0 es necesario en un flex column).
          <div className="flex flex-col max-h-[calc(100dvh-2.75rem)] border-t border-gray-200 dark:border-gray-700">
            <nav aria-label="Administración" className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-2 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveLink(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    {...linkProps(item)}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      active
                        ? "bg-primary-500 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3">
              {userBlock}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
