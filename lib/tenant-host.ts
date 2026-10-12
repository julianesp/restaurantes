// Utilidades puras para resolver el restaurante a partir del host.
// Sin dependencias de servidor: las usan proxy.ts, rutas y componentes.

/** Dominio raíz de la plataforma, sin protocolo (p. ej. "tusaas.com"). */
export const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").toLowerCase();

export const TENANT_SLUG_HEADER = "x-tenant-slug";
export const TENANT_HOST_HEADER = "x-tenant-host";

/** Subdominios que no pueden registrarse como restaurante. */
export const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "dashboard", "mail", "smtp", "ftp", "static",
  "assets", "cdn", "blog", "docs", "help", "support", "status", "billing",
  "login", "signin", "signup", "registro", "plataforma", "demo", "test", "staging",
]);

export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

export type HostKind =
  | { kind: "platform" }
  | { kind: "tenant"; slug: string }
  | { kind: "custom"; host: string }
  | { kind: "fallback" };

export function parseHost(rawHost: string | null): HostKind {
  const host = (rawHost || "").toLowerCase().split(":")[0];
  if (!host) return { kind: "fallback" };

  if (ROOT_DOMAIN) {
    if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return { kind: "platform" };
    if (host.endsWith(`.${ROOT_DOMAIN}`)) {
      const slug = host.slice(0, -(ROOT_DOMAIN.length + 1));
      // Solo un nivel de subdominio
      if (slug && !slug.includes(".")) return { kind: "tenant", slug };
    }
  }

  // Desarrollo: pizzeria.localhost:3000
  if (host.endsWith(".localhost")) {
    const slug = host.slice(0, -".localhost".length);
    if (slug && !slug.includes(".")) return { kind: "tenant", slug };
  }

  // Hosts de desarrollo/pruebas de las plataformas: sirven el restaurante por defecto
  const isLocalOrPreview =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".workers.dev") ||
    host.endsWith(".pages.dev") ||
    host.endsWith(".vercel.app");
  if (isLocalOrPreview) return { kind: "fallback" };

  // Cualquier otro host se trata como dominio propio de un restaurante
  return { kind: "custom", host };
}

/** URL pública de un restaurante, según el entorno. */
export function tenantUrl(slug: string, path = "/"): string {
  if (ROOT_DOMAIN) return `https://${slug}.${ROOT_DOMAIN}${path}`;
  return `http://${slug}.localhost:3000${path}`;
}
