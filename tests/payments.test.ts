/**
 * Pagos de los clientes con la cuenta de ePayco DE CADA RESTAURANTE (nunca la de Brasaya) y
 * webhook de pedidos validado contra la API de ePayco.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { fakeD1 } from "./mocks/cloudflare-workers";
import { sqliteD1 } from "./mocks/sqlite";
import { paymentAccountStatus, restaurantCredentials, savePaymentAccount } from "@/lib/payment-accounts";
import type { Tenant } from "@/lib/tenant";

const tenant = { id: "rest-pizza", slug: "pizza", name: "Pizza", settings: {} } as unknown as Tenant;

jest.mock("@/lib/tenant", () => ({
  publicCtx: async () => ({ ok: true, tenant }),
  getTenantBySlug: async (slug: string) => (slug === "pizza" ? tenant : null),
  invalidateTenantCache: jest.fn(),
}));
jest.mock("@/lib/notificationService", () => ({
  notifyNewOrder: jest.fn(async () => {}),
  notifyNewReservation: jest.fn(async () => {}),
  notifyPaymentError: jest.fn(async () => {}),
  targetFor: () => ({}),
}));
jest.mock("@/lib/whatsapp", () => ({ whatsappNewOrder: jest.fn(async () => {}) }));

const PUBLIC = "pub_restaurante_1234567890abcdef";
const PRIVATE = "priv_restaurante_1234567890abcdef";

const fetchMock = jest.fn();
let db: DatabaseSync;

/** ePayco falso: login válido solo con las llaves del restaurante; sesión creada; validación configurable. */
let validation: Record<string, unknown> | null = null;
function fakeEpayco() {
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    if (url.endsWith("/login")) {
      const ok = headers.Authorization === `Basic ${btoa(`${PUBLIC}:${PRIVATE}`)}`;
      return { ok: true, json: async () => (ok ? { token: "tok-restaurante" } : { error: "invalid" }) };
    }
    if (url.endsWith("/payment/session/create")) {
      return { ok: true, json: async () => ({ success: true, data: { sessionId: "sess-1", token: "t" } }) };
    }
    if (url.includes("/validation/v1/reference/")) {
      return { ok: true, json: async () => (validation ? { success: true, data: validation } : { success: false }) };
    }
    throw new Error(`URL inesperada ${url}`);
  });
}

beforeEach(() => {
  fakeD1.reset();
  global.fetch = fetchMock as unknown as typeof fetch;
  fakeEpayco();
  validation = null;
  db = sqliteD1(["0004_rate_limits.sql", "0005_payments_waiter_sessions.sql"]);
  db.exec("INSERT INTO restaurants (id, slug, name, settings) VALUES ('rest-pizza', 'pizza', 'Pizza', '{\"phone\":\"300\"}')");
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
  process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY = "pub_PLATAFORMA";
  process.env.EPAYCO_PRIVATE_KEY = "priv_PLATAFORMA";
});

const settings = () => JSON.parse((db.prepare("SELECT settings FROM restaurants WHERE id = 'rest-pizza'").get() as { settings: string }).settings);

describe("savePaymentAccount", () => {
  it("rechaza llaves con formato inválido sin llamar a ePayco", async () => {
    await expect(savePaymentAccount(tenant, { publicKey: "x", privateKey: "y" })).resolves.toMatchObject({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rechaza llaves que ePayco no acepta", async () => {
    const res = await savePaymentAccount(tenant, { publicKey: PUBLIC, privateKey: "priv_otra_cuenta_1234567890" });
    expect(res).toMatchObject({ ok: false, error: expect.stringMatching(/rechazó/) });
    await expect(restaurantCredentials("rest-pizza")).resolves.toBeNull();
  });

  it("guarda la privada cifrada, activa online_payments sin borrar otros ajustes", async () => {
    await expect(savePaymentAccount(tenant, { publicKey: ` ${PUBLIC} `, privateKey: PRIVATE })).resolves.toMatchObject({
      ok: true,
      status: { configured: true, publicKeyHint: "••••cdef" },
    });
    const row = db.prepare("SELECT private_key_enc FROM restaurant_payment_accounts").get() as { private_key_enc: string };
    expect(row.private_key_enc).not.toContain(PRIVATE);
    await expect(restaurantCredentials("rest-pizza")).resolves.toEqual({ publicKey: PUBLIC, privateKey: PRIVATE });
    expect(settings()).toEqual({ phone: "300", online_payments: true });
  });

  it("el estado nunca incluye las llaves", async () => {
    await savePaymentAccount(tenant, { publicKey: PUBLIC, privateKey: PRIVATE });
    const status = JSON.stringify(await paymentAccountStatus("rest-pizza"));
    expect(status).not.toContain(PRIVATE);
    expect(status).not.toContain(PUBLIC);
  });
});

describe("POST /api/epayco/create-payment", () => {
  let route: typeof import("@/app/api/epayco/create-payment/route");
  beforeAll(() => {
    route = require("@/app/api/epayco/create-payment/route");
  });

  const pay = (body: object = {}, ip = "1.1.1.1") =>
    route.POST(
      new Request("https://pizza.brasaya.com/api/epayco/create-payment", {
        method: "POST",
        headers: { "content-type": "application/json", "cf-connecting-ip": ip },
        body: JSON.stringify({ amount: 25000, reference: "PEDIDO-1", description: "Pedido", ...body }),
      }),
    );

  it("sin cuenta del restaurante → 409 y NO usa la cuenta de Brasaya", async () => {
    const res = await pay();
    expect(res.status).toBe(409);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("con cuenta, inicia sesión en ePayco con las llaves DEL RESTAURANTE", async () => {
    await savePaymentAccount(tenant, { publicKey: PUBLIC, privateKey: PRIVATE });
    fetchMock.mockClear();
    const res = await pay();
    expect(res.status).toBe(200);
    const login = fetchMock.mock.calls.find(([url]) => String(url).endsWith("/login"))!;
    expect((login[1].headers as Record<string, string>).Authorization).toBe(`Basic ${btoa(`${PUBLIC}:${PRIVATE}`)}`);
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("PLATAFORMA");
  });

  it("no permite redirigir a otro sitio tras pagar", async () => {
    await savePaymentAccount(tenant, { publicKey: PUBLIC, privateKey: PRIVATE });
    await pay({ redirectUrl: "https://evil.com/robo" });
    const session = fetchMock.mock.calls.find(([url]) => String(url).endsWith("/session/create"))!;
    expect(JSON.parse(session[1].body as string).response).toBe("https://pizza.brasaya.com/payment/success");
  });

  it("rechaza montos no válidos", async () => {
    await savePaymentAccount(tenant, { publicKey: PUBLIC, privateKey: PRIVATE });
    expect((await pay({ amount: -5 })).status).toBe(400);
    expect((await pay({ amount: "abc" })).status).toBe(400);
  });

  it("limita las sesiones de pago por IP", async () => {
    for (let i = 0; i < 20; i++) await pay();
    expect((await pay()).status).toBe(429);
    expect((await pay({}, "2.2.2.2")).status).not.toBe(429);
  });
});

describe("webhook de pedidos", () => {
  let route: typeof import("@/app/api/epayco/webhook/route");
  let notify: jest.Mock;
  beforeAll(() => {
    route = require("@/app/api/epayco/webhook/route");
    notify = require("@/lib/notificationService").notifyNewOrder;
  });

  const webhook = (body: Record<string, string>) =>
    route.POST(
      new Request("https://pizza.brasaya.com/api/epayco/webhook", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(body).toString(),
      }),
    );

  const forged = { x_ref_payco: "999", x_transaction_state: "Aceptada", x_amount: "1000000", x_invoice: "PEDIDO-X", x_extra3: "pizza" };

  it("un webhook falsificado (la transacción no existe en ePayco) no avisa de un pedido pagado", async () => {
    validation = null;
    await webhook(forged);
    expect(notify).not.toHaveBeenCalled();
  });

  it("usa el estado y el monto de ePayco, no los del cuerpo", async () => {
    validation = { x_ref_payco: "999", x_cod_response: 3, x_amount: "25000", x_id_invoice: "PEDIDO-X", x_extra2: "pedido", x_extra3: "pizza" };
    await webhook(forged);
    expect(notify).not.toHaveBeenCalled(); // pendiente en ePayco, aunque el cuerpo diga "Aceptada"

    validation = { ...validation, x_cod_response: 1 };
    await webhook(forged);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ total: 25000, reference: "PEDIDO-X" }), expect.anything());
  });

  it("ignora transacciones de prueba en producción", async () => {
    validation = { x_ref_payco: "999", x_cod_response: 1, x_amount: "25000", x_extra3: "pizza", x_test_request: "TRUE" };
    await webhook(forged);
    expect(notify).not.toHaveBeenCalled();
  });
});

it("la migración 0005 crea las tablas", () => {
  const sql = readFileSync(join(__dirname, "../migrations/0005_payments_waiter_sessions.sql"), "utf8");
  expect(sql).toMatch(/CREATE TABLE restaurant_payment_accounts/);
  expect(sql).toMatch(/CREATE TABLE waiter_sessions/);
});
