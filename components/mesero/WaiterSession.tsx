"use client";

import { createContext, useContext } from "react";

/** Sesión del mesero tras validar su PIN (la guarda app/mesero/layout.tsx en sessionStorage). */
export interface WaiterSession {
  name: string;
  /** Token para la cabecera X-Waiter-Token (ver lib/waiter-session.ts). */
  token: string;
}

export const WAITER_SESSION_KEY = "mesero_session";

export const WaiterSessionContext = createContext<{ session: WaiterSession; logout: () => void } | null>(null);

export function useWaiterSession() {
  const ctx = useContext(WaiterSessionContext);
  if (!ctx) throw new Error("useWaiterSession debe usarse dentro de app/mesero/layout.tsx");
  return ctx;
}
