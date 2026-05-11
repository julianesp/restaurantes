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
} from "lucide-react";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

interface AdminNavbarProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    emailAddresses: { emailAddress: string }[];
  };
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
];

export default function AdminNavbar({ user }: AdminNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm mb-24">
      <div className="w-full px-4 fixed bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">

        {/* Fila 1: Usuario (desktop) y botón menú (mobile) */}
        <div className="flex items-center justify-between h-11 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold text-primary-500 tracking-wide hidden md:block">Admin</span>

          {/* User info - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Fila 2: Navigation - Desktop (wrap en dos líneas si hace falta) */}
        <div className="hidden md:flex flex-wrap gap-1 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-primary-500 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <div className="flex items-center gap-3 px-4 py-2">
                  <UserButton afterSignOutUrl="/" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
