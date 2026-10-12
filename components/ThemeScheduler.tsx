"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { colombiaPeriod, THEME_KEY_PREFIX } from "@/lib/theme-schedule";

/**
 * Si la página sigue abierta cuando cambia la franja (7:00 / 18:00, hora de Colombia), aplica el
 * tema que toca. La carga inicial la resuelve el servidor (ver lib/theme-schedule.ts).
 */
export default function ThemeScheduler({ periodId }: { periodId: string }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Limpiar claves de franjas anteriores
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(THEME_KEY_PREFIX) && key !== THEME_KEY_PREFIX + periodId) localStorage.removeItem(key);
      }
      localStorage.removeItem("restaurant-theme"); // clave antigua, anterior al horario
      localStorage.removeItem("restaurant-theme-manual");
    } catch {}

    let current = periodId;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const period = colombiaPeriod();
      if (period.id !== current) {
        current = period.id;
        setTheme(period.theme); // franja nueva: manda el horario
      }
      clearTimeout(timer);
      timer = setTimeout(check, period.msUntilNext + 1000);
    };
    check();
    // Los temporizadores se congelan en pestañas en segundo plano: revisar al volver
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [periodId, setTheme]);

  return null;
}
