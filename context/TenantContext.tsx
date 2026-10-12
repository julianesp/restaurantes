"use client";

import { createContext, useContext } from "react";
import type { Branding } from "@/lib/branding";

const TenantContext = createContext<Branding | null>(null);

export function TenantProvider({ branding, children }: { branding: Branding; children: React.ReactNode }) {
  return <TenantContext.Provider value={branding}>{children}</TenantContext.Provider>;
}

/** Marca del restaurante actual (nombre, logo, contacto…). */
export function useBranding(): Branding {
  const value = useContext(TenantContext);
  if (!value) throw new Error("useBranding debe usarse dentro de <TenantProvider>");
  return value;
}
