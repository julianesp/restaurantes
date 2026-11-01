// lib/hours.ts: horario por días del restaurante.
import { defaultSchedule, parseSchedule, summarizeSchedule, formatTime, colombiaDayKey, type Schedule } from "@/lib/hours";

const week = (patch: Partial<Schedule> = {}): Schedule => ({ ...defaultSchedule(), ...patch });

describe("parseSchedule", () => {
  it("acepta un horario completo y válido", () => {
    expect(parseSchedule(JSON.stringify(week()))).toEqual(week());
  });

  it.each([
    ["vacío", ""],
    ["no es JSON", "Lun-Dom 11 a 6"],
    ["falta un día", JSON.stringify({ ...week(), sun: undefined })],
    ["hora mal escrita", JSON.stringify(week({ mon: { open: true, from: "25:00", to: "18:00" } }))],
    ["open no booleano", JSON.stringify(week({ mon: { open: "sí" as unknown as boolean, from: "11:00", to: "18:00" } }))],
    ["inyección en la hora", JSON.stringify(week({ mon: { open: true, from: "11:00<script>", to: "18:00" } }))],
  ])("rechaza: %s", (_, raw) => {
    expect(parseSchedule(raw)).toBeNull();
  });
});

describe("formatos", () => {
  it("12 horas con a. m. / p. m.", () => {
    expect(formatTime("00:00")).toBe("12:00 a. m.");
    expect(formatTime("11:05")).toBe("11:05 a. m.");
    expect(formatTime("12:30")).toBe("12:30 p. m.");
    expect(formatTime("18:00")).toBe("6:00 p. m.");
  });

  it("resume días seguidos con el mismo horario", () => {
    expect(summarizeSchedule(week())).toBe("Todos los días: 11:00 a. m. – 6:00 p. m.");
    const s = week({
      sat: { open: true, from: "12:00", to: "22:00" },
      sun: { open: false, from: "11:00", to: "18:00" },
    });
    expect(summarizeSchedule(s)).toBe("Lun–Vie: 11:00 a. m. – 6:00 p. m. · Sáb: 12:00 p. m. – 10:00 p. m. · Dom: Cerrado");
  });

  it("dos días seguidos se unen con «y»", () => {
    const s = week({ sat: { open: false, from: "11:00", to: "18:00" }, sun: { open: false, from: "11:00", to: "18:00" } });
    expect(summarizeSchedule(s)).toBe("Lun–Vie: 11:00 a. m. – 6:00 p. m. · Sáb y Dom: Cerrado");
  });
});

it("el día de hoy se calcula en hora de Colombia", () => {
  // Lunes 2 de noviembre de 2026, 2:00 a. m. UTC = domingo 1 de noviembre, 9:00 p. m. en Colombia
  expect(colombiaDayKey(new Date("2026-11-02T02:00:00Z"))).toBe("sun");
  expect(colombiaDayKey(new Date("2026-11-02T06:00:00Z"))).toBe("mon");
});
