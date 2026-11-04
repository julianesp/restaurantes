/**
 * Nequi directo: el restaurante escribe su número de Nequi y el cliente le transfiere desde su app.
 * No pasa por ninguna pasarela: el restaurante revisa el comprobante que le llega por WhatsApp.
 * (Nequi con verificación automática va dentro del checkout de ePayco del restaurante.)
 */

/** Celular colombiano de 10 dígitos que empieza por 3 (acepta +57, espacios y guiones), o null. */
export function normalizeNequi(value: string): string | null {
  let digits = value.replace(/[\s().-]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length === 12 && digits.startsWith("57")) digits = digits.slice(2);
  return /^3\d{9}$/.test(digits) ? digits : null;
}

/** 3001234567 → "300 123 4567" */
export const formatNequi = (n: string) => `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
