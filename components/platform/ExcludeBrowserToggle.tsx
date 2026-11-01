"use client";

import { useEffect, useState } from "react";
import { EXCLUDE_KEY } from "@/components/platform/VisitTracker";

/** Excluye este navegador del contador de visitas (para no contarte a ti mismo). */
export default function ExcludeBrowserToggle() {
  const [excluded, setExcluded] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      setExcluded(localStorage.getItem(EXCLUDE_KEY) === "1");
    } catch {
      setExcluded(null);
    }
  }, []);
  if (excluded === null) return null;

  const toggle = () => {
    try {
      if (excluded) localStorage.removeItem(EXCLUDE_KEY);
      else localStorage.setItem(EXCLUDE_KEY, "1");
      setExcluded(!excluded);
    } catch {}
  };

  return (
    <p className="text-xs text-stone-500">
      {excluded ? "Este navegador no se cuenta." : "Este navegador se cuenta como visitante."}{" "}
      <button type="button" onClick={toggle} className="font-medium text-primary-600 underline-offset-2 hover:underline">
        {excluded ? "Volver a contarlo" : "No contar este navegador"}
      </button>
    </p>
  );
}
