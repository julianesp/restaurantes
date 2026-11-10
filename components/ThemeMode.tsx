"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { colombiaPeriod, THEME_MODE_COOKIE, type ThemeMode } from "@/lib/theme-schedule";

interface ThemeModeValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** El sitio se está viendo oscuro ahora mismo (false antes de montar, para no desajustar la hidratación). */
  isDark: boolean;
}

const ThemeModeContext = createContext<ThemeModeValue>({ mode: "auto", setMode: () => {}, isDark: false });

/**
 * Modo de tema elegido: "auto" (claro 7:00-18:00 hora de Colombia, oscuro el resto), "light" o "dark".
 * Se guarda en una cookie de un año: así el servidor pinta el tema correcto sin parpadeo ni scripts
 * propios (ver app/layout.tsx y lib/theme-schedule.ts). Va dentro del ThemeProvider de next-themes.
 */
export function ThemeModeProvider({ initialMode, children }: { initialMode: ThemeMode; children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const setMode = useCallback(
    (next: ThemeMode) => {
      try {
        document.cookie = `${THEME_MODE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      } catch {}
      // Transición breve solo de colores mientras cambia el tema (ver .theme-transition en globals.css)
      const root = document.documentElement;
      root.classList.add("theme-transition");
      window.setTimeout(() => root.classList.remove("theme-transition"), 260);
      setModeState(next);
      setTheme(next === "auto" ? colombiaPeriod().theme : next);
    },
    [setTheme]
  );

  const value = useMemo(
    () => ({ mode, setMode, isDark: mounted && resolvedTheme === "dark" }),
    [mode, setMode, mounted, resolvedTheme]
  );
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export const useThemeMode = () => useContext(ThemeModeContext);
