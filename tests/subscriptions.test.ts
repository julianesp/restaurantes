// applySubscriptionPayment: un webhook o una página de respuesta falsificados no deben dar acceso.

import { fakeD1, type FakeCall } from "./mocks/cloudflare-workers";
import { validateTransaction, type EpaycoTransaction } from "@/lib/epayco";
import { applySubscriptionPayment } from "@/lib/subscriptions";

jest.mock("@/lib/epayco", () => ({ validateTransaction: jest.fn(), createCheckoutSession: jest.fn() }));
jest.mock("@/lib/tenant", () => ({ invalidateTenantCache: jest.fn() }));

const validate = validateTransaction as jest.MockedFunction<typeof validateTransaction>;

const REF = "BRSY-PIZZA-20261015-ABCD1234";

const tx = (over: Partial<EpaycoTransaction> = {}): EpaycoTransaction => ({
  refPayco: "777",
  codResponse: 1,
  state: "Aceptada",
  amount: 69_900,
  currency: "COP",
  invoice: REF,
  extra1: REF,
  extra2: "suscripcion",
  extra3: "pizza",
  method: "VS",
  isTest: false,
  ...over,
});

const pendingPayment = { id: "pay-1", restaurant_id: "rest-pizza", reference: REF, amount: 69_900, months: 1, status: "pending", period_end: null };
const restaurant = { id: "rest-pizza", slug: "pizza", status: "active", plan: "monthly", trial_ends_at: null, paid_until: null, settings: "{}" };

/** Simula D1: el pago y el restaurante que devuelven los SELECT. */
function db(payment: object | null = pendingPayment, rest: object | null = restaurant) {
  fakeD1.respond = (c: FakeCall) => {
    if (c.method !== "first") return c.method === "all" ? [] : { changes: 1 };
    if (c.sql.includes("FROM subscription_payments")) return payment;
    if (c.sql.includes("FROM restaurants")) return rest;
    return null;
  };
}

const writes = () => fakeD1.calls.filter((c) => c.method !== "first");
const extendsAccess = () => fakeD1.calls.some((c) => c.sql.includes("UPDATE restaurants") && c.sql.includes("paid_until"));

beforeEach(() => {
  fakeD1.reset();
  validate.mockReset();
  delete process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE;
});

it("aplica un pago válido: marca aprobado y extiende el acceso de forma atómica", async () => {
  validate.mockResolvedValue(tx());
  db();
  const res = await applySubscriptionPayment("777");
  expect(res).toMatchObject({ ok: true, status: "approved", alreadyApplied: false });

  const batch = fakeD1.calls.filter((c) => c.method === "batch");
  expect(batch).toHaveLength(2);
  // Solo si seguía pendiente (evita doble suma si llegan webhook y página a la vez)
  expect(batch[0].sql).toMatch(/WHERE id = \? AND status != 'approved'/);
  expect(batch[1].sql).toMatch(/UPDATE restaurants/);
  expect(batch[1].params).toContain("rest-pizza");
});

it("la transacción debe existir en ePayco", async () => {
  validate.mockResolvedValue(null);
  db();
  await expect(applySubscriptionPayment("777")).resolves.toEqual({ ok: false, reason: expect.stringMatching(/no encontrada/) });
  expect(fakeD1.calls).toHaveLength(0);
});

it("ignora transacciones que no son de suscripción (pedidos de clientes)", async () => {
  validate.mockResolvedValue(tx({ extra1: "", invoice: "PEDIDO-123", extra2: "" }));
  db();
  await expect(applySubscriptionPayment("777")).resolves.toMatchObject({ ok: false });
  expect(writes()).toHaveLength(0);
});

it("la referencia debe estar registrada como pago pendiente", async () => {
  validate.mockResolvedValue(tx());
  db(null);
  await expect(applySubscriptionPayment("777")).resolves.toMatchObject({ ok: false, reason: "Pago no registrado" });
  expect(writes()).toHaveLength(0);
});

it("desde el panel de un restaurante no se puede aplicar el pago de otro", async () => {
  validate.mockResolvedValue(tx());
  db();
  await expect(applySubscriptionPayment("777", "rest-otro")).resolves.toMatchObject({ ok: false });
  expect(writes()).toHaveLength(0);
});

it("rechaza si extra3 (slug) no coincide con el dueño del pago", async () => {
  validate.mockResolvedValue(tx({ extra3: "otro-restaurante" }));
  db();
  await expect(applySubscriptionPayment("777")).resolves.toMatchObject({ ok: false });
  expect(extendsAccess()).toBe(false);
});

it("en producción rechaza transacciones de prueba", async () => {
  validate.mockResolvedValue(tx({ isTest: true }));
  db();
  await expect(applySubscriptionPayment("777")).resolves.toMatchObject({ ok: false, reason: expect.stringMatching(/prueba/) });
  expect(extendsAccess()).toBe(false);
});

it("en modo de pruebas sí acepta transacciones de prueba", async () => {
  process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE = "true";
  validate.mockResolvedValue(tx({ isTest: true }));
  db();
  await expect(applySubscriptionPayment("777")).resolves.toMatchObject({ ok: true, status: "approved" });
});

it.each([
  ["monto menor", { amount: 100 }],
  ["monto mayor", { amount: 699_000 }],
  ["otra moneda", { currency: "USD" }],
])("con %s marca el pago como fallido y no da acceso", async (_label, over) => {
  validate.mockResolvedValue(tx(over));
  db();
  await expect(applySubscriptionPayment("777")).resolves.toMatchObject({ ok: false, reason: expect.stringMatching(/monto/) });
  expect(extendsAccess()).toBe(false);
  expect(writes()[0].sql).toMatch(/status = 'failed'/);
});

it("es idempotente: un pago ya aprobado no suma otro mes", async () => {
  validate.mockResolvedValue(tx());
  db({ ...pendingPayment, status: "approved", period_end: "2026-11-15T00:00:00.000Z" });
  await expect(applySubscriptionPayment("777")).resolves.toMatchObject({ ok: true, alreadyApplied: true });
  expect(writes()).toHaveLength(0);
});

it.each([
  [2, "rejected"],
  [4, "failed"],
])("código %i: se registra como %s sin dar acceso", async (code, status) => {
  validate.mockResolvedValue(tx({ codResponse: code }));
  db();
  await expect(applySubscriptionPayment("777")).resolves.toEqual({ ok: true, status: "rejected" });
  expect(writes()[0].params[0]).toBe(status);
  expect(extendsAccess()).toBe(false);
});

it("pendiente en ePayco: no cambia nada", async () => {
  validate.mockResolvedValue(tx({ codResponse: 3 }));
  db();
  await expect(applySubscriptionPayment("777")).resolves.toEqual({ ok: true, status: "pending" });
  expect(writes()).toHaveLength(0);
});
