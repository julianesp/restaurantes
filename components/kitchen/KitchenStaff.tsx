"use client";

import { createContext, useContext } from "react";

/** Quién está en la vista de cocina (lo pone app/cocina/layout.tsx). */
export const KitchenStaffContext = createContext<{ name: string }>({ name: "Cocina" });
export const useKitchenStaff = () => useContext(KitchenStaffContext);
