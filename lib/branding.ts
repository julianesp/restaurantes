import type { Tenant } from "@/lib/tenant";

/** Marca y datos de contacto públicos de un restaurante. */
export interface Branding {
  name: string;
  slug: string;
  tagline: string;
  about: string;
  city: string;
  address: string;
  hours: string;
  phone: string;
  /** Solo dígitos con indicativo, p. ej. 573001234567 (para wa.me). */
  whatsapp: string;
  logoUrl: string | null;
  primaryColor: string | null;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  /** Restaurante de demostración de la plataforma (settings.demo): muestra un aviso y un enlace para crear uno. */
  isDemo: boolean;
}

/** Claves de `restaurants.settings` que el restaurante puede editar. */
export const EDITABLE_SETTINGS = [
  "tagline", "about", "city", "address", "hours", "phone", "whatsapp",
  "logo_url", "primary_color", "instagram_url", "facebook_url", "tiktok_url",
  "telegram_chat_id",
  // Número que recibe los avisos de Brasaya por WhatsApp (pedidos, pagos). Llenarlo = consentimiento.
  "whatsapp_alerts",
] as const;

// El restaurante original conserva los valores que antes estaban fijos en el código.
const LEGACY_DEFAULTS: Partial<Branding> = {
  // Valores de ejemplo: cada restaurante pone los suyos en /admin/configuracion
  tagline: "Comida deliciosa, ingredientes frescos y atención de primera.",
  city: "Bogotá, Colombia",
  address: "Carrera 7 # 32-16, Centro",
  hours: "Lun–Dom: 11:00 am – 6:00 pm",
  phone: "+57 300 000 0000",
  whatsapp: "573174503604",
  logoUrl: "/brand/brasaya-mark.svg",
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export function brandingFor(tenant: Tenant): Branding {
  const s = tenant.settings ?? {};
  const d = tenant.plan === "legacy" ? LEGACY_DEFAULTS : {};
  const pick = (key: string, fallback: string | undefined = "") => str(s[key]) || fallback || "";

  return {
    name: tenant.name,
    slug: tenant.slug,
    tagline: pick("tagline", d.tagline),
    about: pick("about"),
    city: pick("city", d.city),
    address: pick("address", d.address),
    hours: pick("hours", d.hours),
    phone: pick("phone", d.phone),
    whatsapp: pick("whatsapp", d.whatsapp).replace(/\D/g, ""),
    logoUrl: pick("logo_url", d.logoUrl ?? undefined) || null,
    primaryColor: validHex(str(s.primary_color)),
    instagramUrl: pick("instagram_url"),
    facebookUrl: pick("facebook_url"),
    tiktokUrl: pick("tiktok_url"),
    isDemo: s.demo === true,
  };
}

/** Acepta solo colores #RRGGBB (se inyectan en un <style>: nada de texto libre). */
export function validHex(value: string): string | null {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : null;
}

// ---------------------------------------------------------------------------
// Tema: escala de color primario a partir de un solo color
// ---------------------------------------------------------------------------

const toRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const mix = (a: [number, number, number], b: [number, number, number], t: number) =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t)) as [number, number, number];

/**
 * CSS que redefine las variables --primary-* (50–900) a partir de un color base (= 500).
 * Los tonos claros se mezclan con blanco y los oscuros con negro. Devuelve "" sin color válido.
 */
export function themeCss(primary: string | null): string {
  if (!primary) return "";
  const base = toRgb(primary);
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];
  const scale: Record<number, [number, number, number]> = {
    50: mix(base, white, 0.9), 100: mix(base, white, 0.8), 200: mix(base, white, 0.6),
    300: mix(base, white, 0.4), 400: mix(base, white, 0.2), 500: base,
    600: mix(base, black, 0.15), 700: mix(base, black, 0.3),
    800: mix(base, black, 0.45), 900: mix(base, black, 0.6),
  };
  const vars = Object.entries(scale).map(([k, [r, g, b]]) => `--primary-${k}:${r} ${g} ${b}`).join(";");
  return `:root{${vars}}`;
}
