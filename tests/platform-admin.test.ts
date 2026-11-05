// lib/platform-admin.ts y platformCtx(): acciones de los administradores de Brasaya en /panel.

import { fakeD1, type FakeCall } from "./mocks/cloudflare-workers";

jest.mock("next/headers", () => ({ headers: async () => ({ get: () => null }) }));

type FakeEmail = { emailAddress: string; verification: { status: string } | null };
let currentUserValue: { emailAddresses: FakeEmail[] } | null = null;
jest.mock("@clerk/nextjs/server", () => ({ currentUser: async () => currentUserValue }));

import { platformCtx } from "@/lib/tenant";
import {
  extendedDate, setSuspended, extendAccess, deleteRestaurant, addMember, removeMember, transferOwnership,
  registerManualPayment,
  type ManagedRestaurant,
} from "@/lib/platform-admin";

const DAY = 86_400_000;
const pizza: ManagedRestaurant = {
  id: "rest-pizza", slug: "pizza", name: "Pizza", status: "trial", plan: "trial",
  trial_ends_at: new Date(Date.now() + 3 * DAY).toISOString(), paid_until: null,
};
const demo: ManagedRestaurant = { ...pizza, id: "legacy-munay", slug: "restaurante", plan: "legacy" };

const MEMBERS: Record<string, string> = { "duena@pizza.co": "owner", "mesera@pizza.co": "admin" };

beforeEach(() => {
  fakeD1.reset();
  fakeD1.respond = (c: FakeCall) => {
    if (c.method === "first" && c.sql.includes("FROM restaurant_members")) {
      const email = c.params[1] as string;
      return MEMBERS[email] ? { email, role: MEMBERS[email], created_at: "" } : null;
    }
    if (c.method === "all") return [];
    return c.method === "first" ? null : { changes: 1 };
  };
  process.env.ADMIN_EMAILS = "admin@neurai.dev";
  currentUserValue = null;
});

const writes = () => fakeD1.calls.filter((c) => c.method === "run" || c.method === "batch");

describe("platformCtx", () => {
  const as = (email: string, status = "verified") => {
    currentUserValue = { emailAddresses: [{ emailAddress: email, verification: { status } }] };
  };

  it("sin sesión → 401", async () => {
    const ctx = await platformCtx();
    expect(ctx.ok).toBe(false);
    if (!ctx.ok) expect(ctx.res.status).toBe(401);
  });

  it("dueño de un restaurante (no está en ADMIN_EMAILS) → 403", async () => {
    as("duena@pizza.co");
    const ctx = await platformCtx();
    expect(ctx.ok).toBe(false);
    if (!ctx.ok) expect(ctx.res.status).toBe(403);
  });

  it("el correo de ADMIN_EMAILS sin verificar no cuenta", async () => {
    as("admin@neurai.dev", "unverified");
    expect((await platformCtx()).ok).toBe(false);
  });

  it("admin@neurai.dev verificado entra", async () => {
    as("Admin@Neurai.dev");
    expect(await platformCtx()).toEqual({ ok: true, email: "admin@neurai.dev" });
  });
});

describe("estado y acceso", () => {
  it("suspende y reactiva según las fechas", async () => {
    await setSuspended(pizza, true);
    await setSuspended({ ...pizza, paid_until: "2027-01-01T00:00:00.000Z" }, false);
    await setSuspended(pizza, false);
    expect(writes().map((c) => c.params[0])).toEqual(["suspended", "active", "trial"]);
    expect(writes().every((c) => c.params.at(-1) === "rest-pizza")).toBe(true);
  });

  it("el demo no se suspende, no se extiende y no se borra", async () => {
    expect((await setSuspended(demo, true)).ok).toBe(false);
    expect((await extendAccess(demo, { days: 30, kind: "paid" })).ok).toBe(false);
    expect((await deleteRestaurant(demo, "restaurante")).ok).toBe(false);
    expect(writes()).toEqual([]);
  });

  it("extiende desde el acceso vigente, o desde hoy si ya venció", () => {
    const now = new Date("2026-11-01T00:00:00.000Z");
    expect(extendedDate({ trial_ends_at: "2026-11-05T00:00:00.000Z", paid_until: null }, 10, now))
      .toBe("2026-11-15T00:00:00.000Z");
    expect(extendedDate({ trial_ends_at: "2026-10-01T00:00:00.000Z", paid_until: null }, 10, now))
      .toBe("2026-11-11T00:00:00.000Z");
  });

  it("valida los días y el tipo, y escribe solo la columna elegida", async () => {
    expect((await extendAccess(pizza, { days: 0, kind: "paid" })).ok).toBe(false);
    expect((await extendAccess(pizza, { days: 400, kind: "paid" })).ok).toBe(false);
    expect((await extendAccess(pizza, { days: 1.5, kind: "paid" })).ok).toBe(false);
    expect((await extendAccess(pizza, { days: 30, kind: "status = 'active'" })).ok).toBe(false);
    expect(writes()).toEqual([]);

    await extendAccess(pizza, { days: 30, kind: "paid" });
    await extendAccess(pizza, { days: 7, kind: "trial" });
    expect(writes()[0].sql).toContain("SET paid_until = ?");
    expect(writes()[1].sql).toContain("SET trial_ends_at = ?");
  });
});

describe("eliminar", () => {
  it("exige escribir el subdominio exacto", async () => {
    expect((await deleteRestaurant(pizza, "Pizza")).ok).toBe(false);
    expect((await deleteRestaurant(pizza, undefined)).ok).toBe(false);
    expect(writes()).toEqual([]);
  });

  it("borra solo ese restaurante", async () => {
    expect((await deleteRestaurant(pizza, "pizza")).ok).toBe(true);
    expect(writes()).toHaveLength(1);
    expect(writes()[0].sql).toBe("DELETE FROM restaurants WHERE id = ?");
    expect(writes()[0].params).toEqual(["rest-pizza"]);
  });
});

describe("miembros", () => {
  it("agrega un correo válido como administrador (nunca como dueño)", async () => {
    expect((await addMember(pizza, "no-es-correo")).ok).toBe(false);
    expect(await addMember(pizza, " Nuevo@Pizza.co ")).toEqual({ ok: true });
    const insert = writes()[0];
    expect(insert.sql).toContain("'admin'");
    expect(insert.params).toContain("nuevo@pizza.co");
    expect(insert.params).toContain("rest-pizza");
  });

  it("no agrega dos veces al mismo correo", async () => {
    expect(await addMember(pizza, "mesera@pizza.co")).toMatchObject({ ok: false, status: 409 });
  });

  it("no quita al dueño, sí a un administrador", async () => {
    expect((await removeMember(pizza, "duena@pizza.co")).ok).toBe(false);
    expect((await removeMember(pizza, "mesera@pizza.co")).ok).toBe(true);
    expect(writes()[0].params).toEqual(["rest-pizza", "mesera@pizza.co"]);
  });

  it("pasa la propiedad solo a un miembro existente y actualiza owner_email", async () => {
    expect((await transferOwnership(pizza, "extrano@x.co")).ok).toBe(false);
    expect((await transferOwnership(pizza, "mesera@pizza.co")).ok).toBe(true);
    const sqls = writes().map((c) => c.sql);
    expect(sqls).toHaveLength(3);
    expect(sqls[2]).toContain("UPDATE restaurants SET owner_email");
    expect(writes().every((c) => c.params.includes("rest-pizza"))).toBe(true);
  });

  it("la cuenta de Brasaya (ADMIN_EMAILS) nunca queda como miembro ni dueña de un restaurante", async () => {
    expect(await addMember(pizza, " Admin@Neurai.dev ")).toMatchObject({ ok: false, status: 400 });
    expect(await transferOwnership(pizza, "admin@neurai.dev")).toMatchObject({ ok: false });
    expect(writes()).toHaveLength(0);
  });
});

describe("un pago reactiva solo una cuenta vencida", () => {
  // Importación diferida: el módulo de billing es puro
  const { billingState } = jest.requireActual("@/lib/billing") as typeof import("@/lib/billing");
  const now = new Date("2026-11-01T12:00:00.000Z");
  const vencido: ManagedRestaurant = {
    ...pizza, status: "trial", trial_ends_at: "2026-10-01T00:00:00.000Z", paid_until: null,
  };

  it("vencida y suspendida por falta de pago → queda al día desde hoy", async () => {
    expect(billingState(vencido, now).blocked).toBe(true);
    const result = await registerManualPayment(vencido, { months: 1, method: "nequi", amount: 69900 }, "admin@neurai.dev", now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.periodEnd.startsWith("2026-12-01")).toBe(true);
    const after = billingState({ ...vencido, paid_until: result.periodEnd }, now);
    expect(after).toMatchObject({ status: "active", blocked: false });

    const [insert, update] = writes();
    expect(insert.sql).toContain("INSERT INTO subscription_payments");
    expect(insert.sql).toContain("'approved'");
    expect(update.sql).toContain("SET paid_until = ?");
    expect(update.params).toEqual([result.periodEnd, now.toISOString(), "rest-pizza"]);
  });

  it("con acceso vigente, el mes se suma al final del periodo actual", async () => {
    const vigente = { ...vencido, paid_until: "2026-11-20T00:00:00.000Z" };
    const result = await registerManualPayment(vigente, { months: 1, method: "efectivo", amount: 69900 }, "admin@neurai.dev", now);
    expect(result.ok && result.periodEnd.startsWith("2026-12-20")).toBe(true);
  });

  it("valida medio, meses y monto, y el demo no paga", async () => {
    expect((await registerManualPayment(vencido, { months: 1, method: "bitcoin", amount: 1 }, "a@b.co", now)).ok).toBe(false);
    expect((await registerManualPayment(vencido, { months: 13, method: "nequi", amount: 1 }, "a@b.co", now)).ok).toBe(false);
    expect((await registerManualPayment(vencido, { months: 1, method: "nequi", amount: 0 }, "a@b.co", now)).ok).toBe(false);
    expect((await registerManualPayment(demo, { months: 1, method: "nequi", amount: 69900 }, "a@b.co", now)).ok).toBe(false);
    expect(writes()).toEqual([]);
    expect((await registerManualPayment(vencido, { months: 1, method: "cortesia" }, "a@b.co", now)).ok).toBe(true);
  });
});

describe("registro de actividad", () => {
  it("guarda quién hizo qué y nunca rompe la acción", async () => {
    const { logPlatformAction } = await import("@/lib/platform-admin");
    await logPlatformAction("admin@neurai.dev", "suspend", pizza, "x".repeat(400));
    const call = writes()[0];
    expect(call.sql).toContain("INSERT INTO platform_audit");
    expect(call.params.slice(1, 5)).toEqual(["admin@neurai.dev", "suspend", "rest-pizza", "Pizza"]);
    expect((call.params[5] as string).length).toBe(300);

    fakeD1.respond = () => { throw new Error("D1 caído"); };
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(logPlatformAction("admin@neurai.dev", "delete", null)).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
