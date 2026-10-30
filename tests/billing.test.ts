// lib/billing.ts: decide si un restaurante sirve contenido o queda bloqueado por falta de pago.

import { addMonths, billingState, GRACE_DAYS, nextPeriod, type BillingInfo } from "@/lib/billing";

const NOW = new Date("2026-10-15T12:00:00.000Z");
const days = (n: number) => new Date(NOW.getTime() + n * 86_400_000).toISOString();
const info = (over: Partial<BillingInfo> = {}): BillingInfo => ({
  plan: "monthly",
  status: "active",
  trial_ends_at: null,
  paid_until: null,
  ...over,
});

describe("billingState", () => {
  it("la suspensión o cancelación manual bloquea siempre, aunque esté pagado o sea legacy", () => {
    for (const status of ["suspended", "canceled"]) {
      expect(billingState(info({ status, paid_until: days(30) }), NOW).blocked).toBe(true);
      expect(billingState(info({ status, plan: "legacy" }), NOW).blocked).toBe(true);
    }
  });

  it("el plan legacy (demo) está exento", () => {
    expect(billingState(info({ plan: "legacy" }), NOW)).toMatchObject({ status: "exempt", blocked: false });
  });

  it("prueba vigente", () => {
    expect(billingState(info({ trial_ends_at: days(10) }), NOW)).toMatchObject({
      status: "trial",
      blocked: false,
      shouldWarn: false,
      daysLeft: 10,
    });
  });

  it("avisa en los últimos días", () => {
    expect(billingState(info({ trial_ends_at: days(3) }), NOW)).toMatchObject({ status: "trial", shouldWarn: true });
  });

  it("mes pagado vigente gana sobre una prueba más corta", () => {
    expect(billingState(info({ trial_ends_at: days(2), paid_until: days(20) }), NOW)).toMatchObject({
      status: "active",
      accessUntil: days(20),
    });
  });

  it("vencido dentro de la gracia: en línea pero con aviso", () => {
    expect(billingState(info({ paid_until: days(-2) }), NOW)).toMatchObject({
      status: "grace",
      blocked: false,
      shouldWarn: true,
    });
  });

  it("pasada la gracia queda suspendido", () => {
    expect(billingState(info({ trial_ends_at: days(-(GRACE_DAYS + 1)) }), NOW)).toMatchObject({
      status: "suspended",
      blocked: true,
    });
  });

  it("el límite exacto de la gracia todavía sirve; un milisegundo después bloquea", () => {
    const end = days(-GRACE_DAYS);
    const graceEnd = new Date(new Date(end).getTime() + GRACE_DAYS * 86_400_000);
    expect(billingState(info({ paid_until: end }), graceEnd).blocked).toBe(false);
    expect(billingState(info({ paid_until: end }), new Date(graceEnd.getTime() + 1)).blocked).toBe(true);
  });

  it("sin fechas no bloquea pero pide el pago", () => {
    expect(billingState(info(), NOW)).toMatchObject({ status: "grace", blocked: false, shouldWarn: true });
  });
});

describe("addMonths", () => {
  it("suma meses de calendario", () => {
    expect(addMonths("2026-10-15T12:00:00.000Z", 1)).toBe("2026-11-15T12:00:00.000Z");
    expect(addMonths("2026-12-15T00:00:00.000Z", 1)).toBe("2027-01-15T00:00:00.000Z");
  });

  it("ajusta al último día del mes", () => {
    expect(addMonths("2027-01-31T00:00:00.000Z", 1)).toBe("2027-02-28T00:00:00.000Z");
    expect(addMonths("2028-01-31T00:00:00.000Z", 1)).toBe("2028-02-29T00:00:00.000Z");
  });
});

describe("nextPeriod", () => {
  it("pagar antes de tiempo no hace perder días", () => {
    const p = nextPeriod(info({ paid_until: days(10) }), 1, NOW);
    expect(p.start).toBe(days(10));
    expect(p.end).toBe(addMonths(days(10), 1));
  });

  it("si ya venció empieza hoy (no se cobra el tiempo suspendido)", () => {
    const p = nextPeriod(info({ paid_until: days(-40) }), 1, NOW);
    expect(p.start).toBe(NOW.toISOString());
  });
});
