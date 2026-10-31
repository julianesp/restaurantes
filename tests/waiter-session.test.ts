// Sesión del mesero (token tras el PIN) y chat de cocina para meseros.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { fakeD1 } from "./mocks/cloudflare-workers";
import { sqliteD1 } from "./mocks/sqlite";
import { createWaiterSession, findWaiterByPin, hashPin, WAITER_TOKEN_HEADER } from "@/lib/waiter-session";

let currentTenant = { id: "rest-pizza", slug: "pizza" };
let adminAllowed = false;
jest.mock("@/lib/tenant", () => {
  const { NextResponse } = jest.requireActual("next/server");
  return {
    publicCtx: async () => ({ ok: true, tenant: currentTenant }),
    adminCtx: async () =>
      adminAllowed
        ? { ok: true, tenant: currentTenant, role: "owner", email: "duena@pizza.co" }
        : { ok: false, res: NextResponse.json({ error: "No autenticado" }, { status: 401 }) },
  };
});

let db: DatabaseSync;
beforeEach(async () => {
  fakeD1.reset();
  currentTenant = { id: "rest-pizza", slug: "pizza" };
  adminAllowed = false;
  db = sqliteD1(["0005_payments_waiter_sessions.sql"]);
  db.exec("INSERT INTO restaurants (id, slug, name) VALUES ('rest-pizza', 'pizza', 'Pizza'), ('rest-otro', 'otro', 'Otro')");
  db.prepare("INSERT INTO waiters (id, restaurant_id, name, email, pin, active) VALUES ('w1', 'rest-pizza', 'Ana', 'ana@pizza.co', ?, 1)")
    .run(await hashPin("rest-pizza", "482193"));
});

describe("PIN con hash", () => {
  it("el mismo PIN da hashes distintos en restaurantes distintos", async () => {
    expect(await hashPin("rest-pizza", "482193")).not.toBe(await hashPin("rest-otro", "482193"));
    expect(await hashPin("rest-pizza", "482193")).toMatch(/^h1:[0-9a-f]{64}$/);
  });

  it("encuentra al mesero por su PIN solo en su restaurante", async () => {
    await expect(findWaiterByPin("rest-pizza", "482193")).resolves.toMatchObject({ id: "w1", name: "Ana" });
    await expect(findWaiterByPin("rest-otro", "482193")).resolves.toBeNull();
    await expect(findWaiterByPin("rest-pizza", "000000")).resolves.toBeNull();
  });

  it("un PIN antiguo en texto plano entra una vez y queda convertido a hash", async () => {
    db.exec("INSERT INTO waiters (id, restaurant_id, name, email, pin, active) VALUES ('w2', 'rest-pizza', 'Luis', 'l@p.co', '1234', 1)");
    await expect(findWaiterByPin("rest-pizza", "1234")).resolves.toMatchObject({ id: "w2" });
    const row = db.prepare("SELECT pin FROM waiters WHERE id = 'w2'").get() as { pin: string };
    expect(row.pin).toBe(await hashPin("rest-pizza", "1234"));
    await expect(findWaiterByPin("rest-pizza", "1234")).resolves.toMatchObject({ id: "w2" });
  });

  it("un mesero inactivo no entra", async () => {
    db.exec("UPDATE waiters SET active = 0 WHERE id = 'w1'");
    await expect(findWaiterByPin("rest-pizza", "482193")).resolves.toBeNull();
  });
});

describe("chat de cocina para meseros", () => {
  let chat: typeof import("@/app/api/kitchen-chat/route");
  beforeAll(() => {
    chat = require("@/app/api/kitchen-chat/route");
  });

  const req = (method: string, token?: string, body?: object) =>
    new Request("https://pizza.brasaya.com/api/kitchen-chat", {
      method,
      headers: { "content-type": "application/json", ...(token ? { [WAITER_TOKEN_HEADER]: token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });

  it("sin token ni sesión del panel → 401", async () => {
    expect((await chat.GET(req("GET"))).status).toBe(401);
  });

  it("un mesero con sesión lee y escribe; el servidor fija su rol y su nombre", async () => {
    const token = await createWaiterSession("rest-pizza", "w1");
    const res = await chat.POST(req("POST", token, { sender_role: "chef", sender_name: "Jefe de cocina", message: "Mesa 4 lista?" }));
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toMatchObject({ sender_role: "waiter", sender_name: "Ana", restaurant_id: "rest-pizza" });
    const list = await (await chat.GET(req("GET", token))).json();
    expect(list).toHaveLength(1);
  });

  it("un token inventado o con otro formato → 401", async () => {
    expect((await chat.GET(req("GET", "a".repeat(64)))).status).toBe(401);
    expect((await chat.GET(req("GET", "no-es-hex"))).status).toBe(401);
  });

  it("el token de un restaurante no sirve en otro", async () => {
    const token = await createWaiterSession("rest-pizza", "w1");
    currentTenant = { id: "rest-otro", slug: "otro" };
    expect((await chat.GET(req("GET", token))).status).toBe(401);
  });

  it("desactivar al mesero corta su sesión", async () => {
    const token = await createWaiterSession("rest-pizza", "w1");
    db.exec("UPDATE waiters SET active = 0 WHERE id = 'w1'");
    expect((await chat.GET(req("GET", token))).status).toBe(401);
  });

  it("una sesión vencida no sirve", async () => {
    const token = await createWaiterSession("rest-pizza", "w1", Date.now() - 13 * 3600_000);
    expect((await chat.GET(req("GET", token))).status).toBe(401);
  });

  it("la base guarda el HMAC del token, no el token", async () => {
    const token = await createWaiterSession("rest-pizza", "w1");
    const rows = db.prepare("SELECT token_hash FROM waiter_sessions").all() as Array<{ token_hash: string }>;
    expect(rows.map((r) => r.token_hash)).not.toContain(token);
  });

  it("un miembro del panel sigue pudiendo usar el chat como cocina", async () => {
    adminAllowed = true;
    const res = await chat.POST(req("POST", undefined, { sender_role: "chef", sender_name: "Carlos", message: "Sale en 5" }));
    await expect(res.json()).resolves.toMatchObject({ sender_role: "chef", sender_name: "Carlos" });
  });
});

describe("POST/DELETE /api/waiters/verify", () => {
  let verify: typeof import("@/app/api/waiters/verify/route");
  beforeAll(() => {
    verify = require("@/app/api/waiters/verify/route");
  });

  it("devuelve un token que sirve y cerrar sesión lo invalida", async () => {
    db.exec(readFileSync(join(__dirname, "../migrations/0004_rate_limits.sql"), "utf8"));
    const res = await verify.POST(
      new Request("https://pizza.brasaya.com/api/waiters/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin: "482193" }),
      }),
    );
    const { token, waiter } = await res.json();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(waiter).not.toHaveProperty("pin");

    const headers = { [WAITER_TOKEN_HEADER]: token };
    await verify.DELETE(new Request("https://pizza.brasaya.com/api/waiters/verify", { method: "DELETE", headers }));
    expect(db.prepare("SELECT COUNT(*) AS n FROM waiter_sessions").get()).toEqual({ n: 0 });
  });
});
