/**
 * Tema automático según la hora de Colombia (UTC-5, sin horario de verano):
 * claro de 7:00 a 18:00, oscuro el resto.
 *
 * Cómo se respeta la elección manual sin scripts propios: el ThemeProvider (app/layout.tsx) usa una
 * clave de localStorage distinta por franja (`restaurant-theme-<inicio de la franja>`) y el tema de
 * la franja como valor por defecto. Si el usuario cambia el tema, next-themes lo guarda en la clave
 * de la franja actual; cuando empieza la siguiente franja la clave es otra, así que vuelve el horario.
 */
export const THEME_KEY_PREFIX = "restaurant-theme-";

const OFFSET_MS = 5 * 60 * 60 * 1000; // Colombia = UTC-5
const DAY_START = 7;
const NIGHT_START = 18;

export interface ThemePeriod {
  theme: "light" | "dark";
  /** Inicio de la franja actual (ms UTC): identifica la franja. */
  id: string;
  /** Milisegundos hasta el próximo cambio de franja. */
  msUntilNext: number;
}

export function colombiaPeriod(now = Date.now()): ThemePeriod {
  const local = new Date(now - OFFSET_MS); // sus campos UTC son la hora de Colombia
  const hour = local.getUTCHours();
  const isDay = hour >= DAY_START && hour < NIGHT_START;

  const start = new Date(local);
  start.setUTCMinutes(0, 0, 0);
  if (isDay) {
    start.setUTCHours(DAY_START);
  } else {
    if (hour < DAY_START) start.setUTCDate(start.getUTCDate() - 1);
    start.setUTCHours(NIGHT_START);
  }
  const startUtc = start.getTime() + OFFSET_MS;
  const length = (isDay ? NIGHT_START - DAY_START : 24 - NIGHT_START + DAY_START) * 3600 * 1000;

  return {
    theme: isDay ? "light" : "dark",
    id: String(startUtc),
    msUntilNext: startUtc + length - now,
  };
}

/** Clave de localStorage de la franja actual. */
export const themeStorageKey = (period: ThemePeriod) => THEME_KEY_PREFIX + period.id;
