"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { BillingBanner, BillingBlocked } from "@/components/admin/BillingNotice";
import type { BillingState } from "@/lib/billing";

type User = Parameters<typeof AdminNavbar>[0]["user"];

const STORAGE_KEY = "admin-sidebar-hidden";

/** Estructura del admin: navegación + contenido. Recuerda si la barra lateral está oculta. */
export default function AdminShell({
  user,
  billing,
  children,
}: {
  user: User;
  billing: BillingState;
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  // Cuenta suspendida por falta de pago: solo queda disponible la página de suscripción
  const blocked = billing.blocked && pathname !== "/admin/suscripcion";

  // Se lee tras montar (no en el render) para que servidor y cliente coincidan
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
  }, []);

  const toggle = () =>
    setHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <AdminNavbar user={user} sidebarHidden={hidden} onToggleSidebar={toggle} />
      {/* md:pl-64 = ancho de la barra lateral; pt-12 = barra superior del celular;
          con la barra oculta se deja aire arriba para los botones flotantes */}
      <main
        className={`pt-12 transition-[padding] duration-200 ${hidden ? "md:pt-14 md:pl-0" : "md:pt-0 md:pl-64"}`}
      >
        {!blocked && pathname !== "/admin/suscripcion" && <BillingBanner state={billing} />}
        {blocked ? <BillingBlocked state={billing} /> : children}
      </main>
    </div>
  );
}
