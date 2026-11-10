"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LayoutGrid, MessageSquare } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import { KitchenStaffContext } from "@/components/kitchen/KitchenStaff";

/** Barra superior de la vista del chef: solo sus opciones (pedidos y chat). */
export default function KitchenShell({ name, isAdmin, children }: { name: string; isAdmin: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const tab = (href: string, label: string, Icon: typeof LayoutGrid) => {
    const active = href === "/cocina" ? pathname === "/cocina" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${active ? "bg-white text-primary-700" : "text-white/90 hover:bg-white/15"}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Link>
    );
  };

  return (
    <KitchenStaffContext.Provider value={{ name }}>
      {/* pr-16: deja libre el botón flotante de tema en la esquina */}
      <div className="bg-primary-500 text-white pl-4 pr-16 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold">
          <ChefHat className="w-4 h-4" />
          Cocina: {name}
        </span>
        <nav className="flex items-center gap-1">
          {tab("/cocina", "Pedidos", LayoutGrid)}
          {tab("/cocina/chat", "Chat con meseros", MessageSquare)}
        </nav>
        <span className="flex items-center gap-3 text-xs">
          {isAdmin && (
            <Link href="/admin" className="text-white/80 hover:text-white underline">
              Ir al panel
            </Link>
          )}
          <SignOutButton label="Cerrar sesión" className="text-white/80 hover:text-white underline" />
        </span>
      </div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
    </KitchenStaffContext.Provider>
  );
}
