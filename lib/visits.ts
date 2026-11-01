/**
 * Visitas anónimas a las páginas públicas de la plataforma (ver migrations/0006 y /panel/visitas).
 * Puro: clasifica el navegador a partir del User-Agent.
 */

export const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch/i;

export function classifyUserAgent(ua: string) {
  const device = /ipad|tablet/i.test(ua) ? "Tablet" : /mobile|android|iphone/i.test(ua) ? "Celular" : "Computador";
  const os = /android/i.test(ua)
    ? "Android"
    : /iphone|ipad|ios/i.test(ua)
      ? "iOS"
      : /windows/i.test(ua)
        ? "Windows"
        : /mac os/i.test(ua)
          ? "macOS"
          : /linux|cros/i.test(ua)
            ? "Linux"
            : "Otro";
  const browser = /FBAN|FBAV|Instagram/i.test(ua)
    ? "Facebook / Instagram (app)"
    : /edg\//i.test(ua)
      ? "Edge"
      : /opr\/|opera/i.test(ua)
        ? "Opera"
        : /samsungbrowser/i.test(ua)
          ? "Samsung Internet"
          : /firefox|fxios/i.test(ua)
            ? "Firefox"
            : /chrome|crios/i.test(ua)
              ? "Chrome"
              : /safari/i.test(ua)
                ? "Safari"
                : "Otro";
  return { device, os, browser };
}

/** Host de una URL de referencia, sin "www."; null si no es una URL o es el propio sitio. */
export function referrerHost(referrer: unknown, ownHost: string): string | null {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host && host !== ownHost.replace(/^www\./, "").split(":")[0] ? host.slice(0, 100) : null;
  } catch {
    return null;
  }
}

/** Páginas públicas de la plataforma que se cuentan, con su nombre para el panel. */
export const TRACKED_PATHS: Record<string, string> = {
  "/": "Inicio (landing)",
  "/registro": "Registro",
};
