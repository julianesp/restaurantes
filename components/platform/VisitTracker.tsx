"use client";

import { useEffect } from "react";

const VISITOR_KEY = "brasaya-visitante";
const SESSION_KEY = "brasaya-visita";
/** Activado desde /panel/visitas: este navegador no se cuenta. */
export const EXCLUDE_KEY = "brasaya-no-contar";

/**
 * Cuenta una visita por sesión de navegador a la landing de Brasaya (ver /api/platform/visit).
 * Anónima: un código aleatorio en el navegador, sin IP. Respeta "No rastrear".
 */
export default function VisitTracker({ path }: { path: string }) {
  useEffect(() => {
    try {
      const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
      if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
      if (localStorage.getItem(EXCLUDE_KEY) === "1" || sessionStorage.getItem(SESSION_KEY)) return;

      let visitor = localStorage.getItem(VISITOR_KEY);
      if (!visitor) {
        visitor = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitor);
      }
      sessionStorage.setItem(SESSION_KEY, "1");

      const params = new URLSearchParams(location.search);
      const utm = params.get("utm_source") || (params.has("fbclid") ? "facebook (anuncio)" : params.has("gclid") ? "google (anuncio)" : "");
      fetch("/api/platform/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor, path, referrer: document.referrer, utm }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Sin almacenamiento (modo privado estricto): no se cuenta
    }
  }, [path]);

  return null;
}
