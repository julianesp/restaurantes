"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

/** Botón visible de "Cerrar sesión" (Clerk). Tras salir lleva a la portada del sitio actual. */
export default function SignOutButton({ className = "", label = "Cerrar sesión" }: { className?: string; label?: string }) {
  const { signOut } = useClerk();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        signOut({ redirectUrl: "/" }).catch(() => setPending(false));
      }}
      className={`inline-flex items-center gap-2 disabled:opacity-60 ${className}`}
    >
      <LogOut aria-hidden className="h-4 w-4 shrink-0" />
      {pending ? "Cerrando sesión…" : label}
    </button>
  );
}
