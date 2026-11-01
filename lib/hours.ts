/**
 * Horario de atención por día (restaurants.settings.hours_schedule, JSON).
 * Puro: lo usan el panel (editor), la API (validación) y la portada (presentación).
 * Al guardarlo, la API también genera `settings.hours` (texto corto) para las partes del sitio que
 * muestran el horario en una sola línea.
 */

export const DAYS = [
  { key: "mon", short: "Lun", long: "Lunes" },
  { key: "tue", short: "Mar", long: "Martes" },
  { key: "wed", short: "Mié", long: "Miércoles" },
  { key: "thu", short: "Jue", long: "Jueves" },
  { key: "fri", short: "Vie", long: "Viernes" },
  { key: "sat", short: "Sáb", long: "Sábado" },
  { key: "sun", short: "Dom", long: "Domingo" },
] as const;
export type DayKey = (typeof DAYS)[number]["key"];

export interface DayHours {
  open: boolean;
  /** "HH:MM" en 24 horas */
  from: string;
  to: string;
}
export type Schedule = Record<DayKey, DayHours>;

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function defaultSchedule(): Schedule {
  return Object.fromEntries(DAYS.map((d) => [d.key, { open: true, from: "11:00", to: "18:00" }])) as Schedule;
}

/** Lee el horario guardado; null si no hay o no es válido. */
export function parseSchedule(raw: unknown): Schedule | null {
  if (typeof raw !== "string" || !raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const out: Partial<Schedule> = {};
  for (const { key } of DAYS) {
    const d = (data as Record<string, unknown>)[key] as Partial<DayHours> | undefined;
    if (!d || typeof d.open !== "boolean" || typeof d.from !== "string" || typeof d.to !== "string") return null;
    if (!TIME.test(d.from) || !TIME.test(d.to)) return null;
    out[key] = { open: d.open, from: d.from, to: d.to };
  }
  return out as Schedule;
}

/** "13:30" → "1:30 p. m." */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const formatRange = (d: DayHours) => (d.open ? `${formatTime(d.from)} – ${formatTime(d.to)}` : "Cerrado");

/** Resumen en una línea, agrupando días seguidos con el mismo horario: "Lun–Vie: 11:00 a. m. – 6:00 p. m. · Dom: Cerrado". */
export function summarizeSchedule(s: Schedule): string {
  const groups: { from: number; to: number; text: string }[] = [];
  DAYS.forEach((day, i) => {
    const text = formatRange(s[day.key]);
    const last = groups[groups.length - 1];
    if (last && last.text === text && last.to === i - 1) last.to = i;
    else groups.push({ from: i, to: i, text });
  });
  if (groups.length === 1) return `Todos los días: ${groups[0].text}`;
  return groups
    .map((g) => {
      const days = g.from === g.to ? DAYS[g.from].short : g.to === g.from + 1 ? `${DAYS[g.from].short} y ${DAYS[g.to].short}` : `${DAYS[g.from].short}–${DAYS[g.to].short}`;
      return `${days}: ${g.text}`;
    })
    .join(" · ");
}

/** Día de la semana en Colombia (UTC-5). */
export function colombiaDayKey(now = new Date()): DayKey {
  const dow = new Date(now.getTime() - 5 * 3600_000).getUTCDay(); // 0 = domingo
  return DAYS[(dow + 6) % 7].key;
}
