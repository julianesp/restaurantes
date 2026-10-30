// PIN de los meseros: mínimo 6 dígitos al crearlo o cambiarlo (validado en el servidor).

import { fakeD1 } from "./mocks/cloudflare-workers";
import { isValidPin } from "@/lib/waiter-pin";

jest.mock("@/lib/tenant", () => ({
  adminCtx: async () => ({ ok: true, tenant: { id: "rest-pizza" }, role: "owner", email: "duena@pizza.co" }),
}));

describe("isValidPin", () => {
  it.each(["123456", "1234567", "12345678"])("acepta %s", (pin) => expect(isValidPin(pin)).toBe(true));

  it.each(["", "1234", "12345", "123456789", "12345a", " 123456", "123 456", "１２３４５６", 123456, null, undefined])(
    "rechaza %j",
    (pin) => expect(isValidPin(pin)).toBe(false),
  );
});

describe("/api/waiters", () => {
  let route: typeof import("@/app/api/waiters/route");
  beforeAll(() => {
    route = require("@/app/api/waiters/route");
  });
  beforeEach(() => {
    fakeD1.reset();
    fakeD1.respond = (c) => (c.method === "first" ? { id: "w1" } : null);
  });

  const req = (method: string, body: object) =>
    new Request("https://pizza.brasaya.com/api/waiters", {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  it("POST rechaza un PIN de 4 dígitos sin tocar la base", async () => {
    const res = await route.POST(req("POST", { name: "Ana", email: "ana@pizza.co", pin: "1234" }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: expect.stringMatching(/entre 6 y 8 dígitos/) });
    expect(fakeD1.calls).toHaveLength(0);
  });

  it("POST acepta un PIN de 6 dígitos (también si llega como número)", async () => {
    expect((await route.POST(req("POST", { name: "Ana", email: "ana@pizza.co", pin: "482193" }))).status).toBe(201);
    expect((await route.POST(req("POST", { name: "Ana", email: "ana@pizza.co", pin: 482193 }))).status).toBe(201);
  });

  it("PATCH rechaza un PIN corto pero permite activar/desactivar sin PIN", async () => {
    expect((await route.PATCH(req("PATCH", { id: "w1", pin: "12345" }))).status).toBe(400);
    expect(fakeD1.calls).toHaveLength(0);
    expect((await route.PATCH(req("PATCH", { id: "w1", active: false }))).status).toBe(200);
  });

  it("PATCH acepta un PIN de 6 dígitos", async () => {
    expect((await route.PATCH(req("PATCH", { id: "w1", pin: "905172" }))).status).toBe(200);
  });
});
