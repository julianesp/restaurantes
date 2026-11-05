"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ShieldAlert, X } from "lucide-react";

// /admin devuelve a "/?unauthorized=true" a quien inició sesión con una cuenta que no es miembro
// de este restaurante (app/admin/layout.tsx). Sin este aviso parecía que "Administrar" no hacía nada.
// Se lee de window.location (no de searchParams) porque vive en el layout raíz.

export default function UnauthorizedNotice() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(new URLSearchParams(window.location.search).get("unauthorized") === "true");
  }, []);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("unauthorized");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  };

  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div role="alert" className="fixed inset-x-4 top-20 z-[60] mx-auto max-w-lg rounded-2xl border border-yellow-300 bg-[#fafaf9] p-4 text-sm text-gray-800 shadow-xl dark:border-yellow-700 dark:bg-stone-900 dark:text-stone-100">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
        <div className="flex-1">
          <p className="font-semibold">No tienes acceso a la administración de este restaurante</p>
          <p className="mt-1 text-gray-600 dark:text-stone-300">
            {email ? <>Entraste como <strong>{email}</strong>, que no está</> : "Tu cuenta no está"} entre las personas con acceso.
            Pídele al dueño que te agregue o entra con la cuenta que creó el restaurante.
          </p>
          <Link href="/sign-in?redirect_url=%2Fadmin" className="mt-3 inline-block rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700">
            Entrar con otra cuenta
          </Link>
        </div>
        <button type="button" onClick={close} aria-label="Cerrar aviso" className="h-8 w-8 shrink-0 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-stone-800">
          <X className="mx-auto h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
