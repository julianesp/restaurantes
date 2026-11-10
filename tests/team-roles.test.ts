// Equipo con correo: roles "mesero" y "chef". Un mesero o chef entra con su cuenta pero NUNCA es
// administrador; cada rol ve y cambia solo lo suyo en los pedidos de mesa. SQL real (node:sqlite)
// con todas las migraciones, sobre el código real de tenant, staffCtx y las rutas.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { fakeD1, type FakeCall } from "./mocks/cloudflare-workers";

const headerStore = new Map<string, string>();
jest.mock("next/headers", () => ({
  headers: async () => ({ get: (k: string) => headerStore.get(k.toLowerCase()) ?? null }),
}));

type FakeUser = { emailAddresses: Array<{ emailAddress: string; verification: { status: string } }> };
let currentUserValue: FakeUser | null = null;
jest.mock("@clerk/nextjs/server", () => ({ currentUser: async () => currentUserValue }));

const as = (email: string | null) => {
  currentUserValue = email ? { emailAddresses: [{ emailAddress: email, verification: { status: "verified" } }] } : null;
};

let db: DatabaseSync;
let tenantMod: typeof import("@/lib/tenant");
let staffMod: typeof import("@/lib/waiter-session");
let orders: typeof import("@/app/api/orders/table/route");
let team: typeof import("@/app/api/team/route");

const MIGRATIONS = readdirSync(join(__dirname, "../migrations")).filter((f) => /^0\d+_.*\.sql$/.test(f)).sort();
const REST = "rest-pizza";
const future = new Date(Date.now() + 10 * 86_400_000).toISOString();

beforeEach(() => {
  db = new DatabaseSync(":memory:");
  for (const m of MIGRATIONS) db.exec(readFileSync(join(__dirname, "../migrations", m), "utf8"));
  fakeD1.reset();
  fakeD1.respond = (c: FakeCall) => {
    const stmt = db.prepare(c.sql);
    const params = c.params as SQLInputValue[];
    if (c.method === "first") return stmt.get(...params) ?? null;
    if (c.method === "all") return stmt.all(...params);
    return { changes: Number(stmt.run(...params).changes) };
  };
  db.prepare("INSERT INTO restaurants (id, slug, name, status, plan, paid_until, owner_email, settings) VALUES (?, 'pizza', 'Pizza', 'active', 'monthly', ?, 'duena@pizza.co', '{}')").run(REST, future);
  db.prepare("INSERT INTO restaurants (id, slug, name, status, plan, paid_until, owner_email, settings) VALUES ('rest-otro', 'otro', 'Otro', 'active', 'monthly', ?, 'otro@otro.co', '{}')").run(future);
  const member = db.prepare("INSERT INTO restaurant_members (restaurant_id, email, role, name, active) VALUES (?, ?, ?, ?, ?)");
  member.run(REST, "duena@pizza.co", "owner", null, 1);
  member.run(REST, "ana@pizza.co", "waiter", "Ana", 1);
  member.run(REST, "beto@pizza.co", "waiter", "Beto", 1);
  member.run(REST, "chef@pizza.co", "chef", "Marta", 1);
  member.run(REST, "baja@pizza.co", "waiter", "Baja", 0);
  member.run("rest-otro", "ana@otro.co", "waiter", "Ana Otro", 1);
  // Platos: uno del menú y uno del día
  db.prepare("INSERT INTO menu_items (id, restaurant_id, name, description, price, is_available) VALUES ('m1', ?, 'Bandeja', 'Completa', '$12.000', 1)").run(REST);
  db.prepare("INSERT INTO menu_items (id, restaurant_id, name, price, is_available) VALUES ('m-off', ?, 'Agotado', '$9.000', 0)").run(REST);
  db.prepare("INSERT INTO daily_specials (id, restaurant_id, name, price, available) VALUES ('d1', ?, 'Sopa del día', '$8.000', 1)").run(REST);

  headerStore.clear();
  headerStore.set("x-tenant-slug", "pizza");
  as(null);
  process.env.ADMIN_EMAILS = "plataforma@brasaya.com";
  jest.isolateModules(() => {
    tenantMod = require("@/lib/tenant");
    staffMod = require("@/lib/waiter-session");
    orders = require("@/app/api/orders/table/route");
    team = require("@/app/api/team/route");
  });
});

afterAll(() => {
  delete process.env.ADMIN_EMAILS;
});

const status = (ctx: { ok: boolean; res?: Response }) => (ctx.ok ? 200 : ctx.res!.status);
const json = (method: string, body?: object, url = "https://pizza.brasaya.com/api/x") =>
  new Request(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });

describe("migración 0008", () => {
  it("el rol acepta owner/admin/waiter/chef y rechaza otros", () => {
    const ins = (role: string) => db.prepare("INSERT INTO restaurant_members (restaurant_id, email, role) VALUES (?, ?, ?)").run(REST, `${role}@x.co`, role);
    expect(() => ins("admin")).not.toThrow();
    expect(() => ins("superuser")).toThrow();
  });
});

describe("un mesero o chef NUNCA es administrador", () => {
  it.each([["ana@pizza.co"], ["chef@pizza.co"]])("adminCtx(%s) → 403", async (email) => {
    as(email);
    expect(status(await tenantMod.adminCtx())).toBe(403);
    expect(await tenantMod.getTenantRole((await tenantMod.getTenant())!)).toBeNull();
  });

  it("la dueña sigue entrando como dueña", async () => {
    as("duena@pizza.co");
    await expect(tenantMod.adminCtx()).resolves.toMatchObject({ ok: true, role: "owner" });
  });

  it("getStaffMember: devuelve rol y nombre; ignora inactivos y otros restaurantes", async () => {
    const tenant = (await tenantMod.getTenant())!;
    as("ana@pizza.co");
    await expect(tenantMod.getStaffMember(tenant)).resolves.toMatchObject({ role: "waiter", name: "Ana" });
    as("chef@pizza.co");
    await expect(tenantMod.getStaffMember(tenant)).resolves.toMatchObject({ role: "chef", name: "Marta" });
    as("baja@pizza.co");
    await expect(tenantMod.getStaffMember(tenant)).resolves.toBeNull();
    as("ana@otro.co"); // mesera de OTRO restaurante
    await expect(tenantMod.getStaffMember(tenant)).resolves.toBeNull();
  });

  it("staffCtx: 401 sin sesión, 403 si no es del equipo, y el tipo correcto si lo es", async () => {
    const req = json("GET");
    expect(status(await staffMod.staffCtx(req))).toBe(401);
    as("nadie@x.co");
    expect(status(await staffMod.staffCtx(req))).toBe(403);
    as("baja@pizza.co");
    expect(status(await staffMod.staffCtx(req))).toBe(403);
    as("ana@pizza.co");
    await expect(staffMod.staffCtx(req)).resolves.toMatchObject({ ok: true, kind: "waiter", via: "account", waiter: { name: "Ana", email: "ana@pizza.co" } });
    as("chef@pizza.co");
    await expect(staffMod.staffCtx(req)).resolves.toMatchObject({ ok: true, kind: "chef", staff: { name: "Marta" } });
    as("duena@pizza.co");
    await expect(staffMod.staffCtx(req)).resolves.toMatchObject({ ok: true, kind: "admin", role: "owner" });
  });
});

const order = (extra: object = {}) => ({
  tableId: "15",
  items: [{ id: "m1", name: "Bandeja", price: "$1", quantity: 2 }],
  total: 1,
  ...extra,
});

describe("POST /api/orders/table", () => {
  it("el servidor recalcula nombre, precio y total (no se fía del navegador)", async () => {
    const res = await orders.POST(json("POST", order({ items: [{ id: "m1", name: "Otro nombre", price: "$1", quantity: 2 }, { id: "d1", price: "$0", quantity: 1 }] })));
    expect(res.status).toBe(200);
    const { order: o } = await res.json();
    expect(o.total).toBe(32_000); // 2 × 12.000 + 8.000
    expect(o.items.map((i: { item_name: string; item_price: string }) => [i.item_name, i.item_price])).toEqual(
      expect.arrayContaining([["Bandeja", "$12.000"], ["Sopa del día", "$8.000"]]),
    );
  });

  it.each([
    ["un plato que no existe", { items: [{ id: "x", price: "$1", quantity: 1 }] }],
    ["un plato agotado", { items: [{ id: "m-off", price: "$1", quantity: 1 }] }],
    ["cantidad 0", { items: [{ id: "m1", quantity: 0 }] }],
    ["cantidad enorme", { items: [{ id: "m1", quantity: 1000 }] }],
    ["sin platos", { items: [] }],
    ["mesa con caracteres raros", { tableId: "1; DROP TABLE x" }],
  ])("rechaza %s", async (_label, patch) => {
    expect((await orders.POST(json("POST", order(patch)))).status).toBe(400);
    expect(db.prepare("SELECT COUNT(*) AS n FROM table_orders").get()).toEqual({ n: 0 });
  });

  it("un plato de OTRO restaurante no se puede pedir", async () => {
    db.prepare("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('m-otro', 'rest-otro', 'Ajeno', '$100')").run();
    expect((await orders.POST(json("POST", order({ items: [{ id: "m-otro", quantity: 1 }] })))).status).toBe(400);
  });

  it("un cliente anónimo (QR) no deja mesero; una mesera con cuenta sí queda como autora", async () => {
    await orders.POST(json("POST", order()));
    as("ana@pizza.co");
    await orders.POST(json("POST", order({ tableId: "3" })));
    const rows = db.prepare("SELECT table_id, waiter_name, waiter_email FROM table_orders ORDER BY table_id").all();
    expect(rows).toEqual([
      { table_id: "15", waiter_name: null, waiter_email: null },
      { table_id: "3", waiter_name: "Ana", waiter_email: "ana@pizza.co" },
    ]);
  });

  it("un token de mesero vencido → 401 (la pantalla pide el PIN otra vez)", async () => {
    const req = new Request("https://pizza.brasaya.com/api/orders/table", {
      method: "POST", headers: { "content-type": "application/json", [staffMod.WAITER_TOKEN_HEADER]: "a".repeat(64) }, body: JSON.stringify(order()),
    });
    expect((await orders.POST(req)).status).toBe(401);
  });
});

describe("pedidos: cada rol ve y cambia solo lo suyo", () => {
  let anaOrder: string;
  let betoOrder: string;
  beforeEach(async () => {
    as("ana@pizza.co");
    anaOrder = (await (await orders.POST(json("POST", order({ tableId: "1" })))).json()).order.id;
    as("beto@pizza.co");
    betoOrder = (await (await orders.POST(json("POST", order({ tableId: "2" })))).json()).order.id;
    as(null);
    await orders.POST(json("POST", order({ tableId: "9" }))); // cliente por QR
  });

  const get = async (email: string | null, qs = "") => {
    as(email);
    const res = await orders.GET(json("GET", undefined, `https://pizza.brasaya.com/api/orders/table${qs}`));
    return { status: res.status, body: res.status === 200 ? ((await res.json()) as Array<{ table_id: string }>) : null };
  };
  const patch = async (email: string, body: object) => {
    as(email);
    return orders.PATCH(json("PATCH", body));
  };

  it("sin sesión no se leen pedidos; el chef y la dueña ven todos; la mesera, solo los suyos", async () => {
    expect((await get(null)).status).toBe(401);
    expect((await get("nadie@x.co")).status).toBe(403);
    expect((await get("chef@pizza.co")).body).toHaveLength(3);
    expect((await get("duena@pizza.co")).body).toHaveLength(3);
    expect((await get("ana@pizza.co")).body!.map((o) => o.table_id)).toEqual(["1"]);
    expect((await get("beto@pizza.co")).body!.map((o) => o.table_id)).toEqual(["2"]);
  });

  it("?active=1 deja fuera los entregados", async () => {
    await patch("chef@pizza.co", { orderId: anaOrder, status: "delivered" });
    expect((await get("chef@pizza.co", "?active=1")).body).toHaveLength(2);
    expect((await get("chef@pizza.co")).body).toHaveLength(3);
  });

  it("el chef cambia cualquier estado, pero no las notas", async () => {
    expect((await patch("chef@pizza.co", { orderId: betoOrder, status: "preparing" })).status).toBe(200);
    expect((await patch("chef@pizza.co", { orderId: betoOrder, status: "ready" })).status).toBe(200);
    expect((await patch("chef@pizza.co", { orderId: betoOrder, customerNotes: "x" })).status).toBe(403);
    expect((await patch("chef@pizza.co", { orderId: betoOrder, status: "inventado" })).status).toBe(400);
  });

  it("la mesera solo entrega SUS pedidos y solo cuando la cocina los dejó listos", async () => {
    // pendiente → todavía no
    expect((await patch("ana@pizza.co", { orderId: anaOrder, status: "delivered" })).status).toBe(404);
    await patch("chef@pizza.co", { orderId: anaOrder, status: "ready" });
    await patch("chef@pizza.co", { orderId: betoOrder, status: "ready" });
    // el pedido de otra mesera → no
    expect((await patch("ana@pizza.co", { orderId: betoOrder, status: "delivered" })).status).toBe(404);
    // el suyo, ya listo → sí
    expect((await patch("ana@pizza.co", { orderId: anaOrder, status: "delivered" })).status).toBe(200);
    expect(db.prepare("SELECT status FROM table_orders WHERE id = ?").get(betoOrder)).toEqual({ status: "ready" });
  });

  it("la mesera no puede marcar otros estados ni editar notas", async () => {
    await patch("chef@pizza.co", { orderId: anaOrder, status: "ready" });
    for (const body of [{ status: "ready" }, { status: "cancelled" }, { status: "delivered", customerNotes: "x" }]) {
      expect((await patch("ana@pizza.co", { orderId: anaOrder, ...body })).status).toBe(403);
    }
  });

  it("una mesera desactivada ya no ve ni cambia nada", async () => {
    db.prepare("UPDATE restaurant_members SET active = 0 WHERE email = 'ana@pizza.co'").run();
    expect((await get("ana@pizza.co")).status).toBe(403);
  });
});

describe("/api/team (solo administradores)", () => {
  const send = (method: "POST" | "PATCH" | "DELETE", body: object, qs = "") =>
    team[method](json(method, body, `https://pizza.brasaya.com/api/team${qs}`));

  it.each(["ana@pizza.co", "chef@pizza.co"])("%s no puede ver ni cambiar el equipo (403)", async (email) => {
    as(email);
    expect((await team.GET()).status).toBe(403);
    expect((await send("POST", { name: "Yo", email: "yo@x.co", role: "chef" })).status).toBe(403);
    expect((await send("DELETE", {}, "?email=chef@pizza.co")).status).toBe(403);
    expect(db.prepare("SELECT COUNT(*) AS n FROM restaurant_members WHERE restaurant_id = ?").get(REST)).toEqual({ n: 5 });
  });

  it("sin sesión → 401", async () => {
    expect((await team.GET()).status).toBe(401);
  });

  describe("como dueña", () => {
    beforeEach(() => as("duena@pizza.co"));

    it("agrega una mesera con correo y PIN: queda como miembro y con PIN (hasheado)", async () => {
      const res = await send("POST", { name: " Carla ", email: "Carla@Pizza.co", role: "waiter", pin: "482193" });
      expect(res.status).toBe(201);
      expect(db.prepare("SELECT role, name, active FROM restaurant_members WHERE email = 'carla@pizza.co'").get()).toEqual({ role: "waiter", name: "Carla", active: 1 });
      const w = db.prepare("SELECT pin FROM waiters WHERE email = 'carla@pizza.co'").get() as { pin: string };
      expect(w.pin).toMatch(/^h1:/);
      expect(w.pin).not.toContain("482193");
    });

    it("agrega un chef solo con correo; el PIN es solo para meseros", async () => {
      expect((await send("POST", { name: "Chef Nuevo", email: "nuevo@pizza.co", role: "chef" })).status).toBe(201);
      expect((await send("POST", { name: "Chef Dos", email: "dos@pizza.co", role: "chef", pin: "482193" })).status).toBe(400);
    });

    it.each([
      ["rol inventado", { name: "X Y", email: "x@y.co", role: "admin" }, 400],
      ["correo inválido", { name: "X Y", email: "no-es-correo", role: "chef" }, 400],
      ["nombre corto", { name: "X", email: "x@y.co", role: "chef" }, 400],
      ["PIN corto", { name: "X Y", email: "x@y.co", role: "waiter", pin: "123" }, 400],
      ["la dueña misma", { name: "La dueña", email: "duena@pizza.co", role: "waiter" }, 409],
      ["correo repetido", { name: "Otra Ana", email: "ana@pizza.co", role: "waiter" }, 409],
      ["cuenta de Brasaya", { name: "Plataforma", email: "plataforma@brasaya.com", role: "chef" }, 400],
    ])("rechaza %s", async (_label, body, expected) => {
      expect((await send("POST", body)).status).toBe(expected);
    });

    it("un PIN repetido en el mismo restaurante → 409", async () => {
      await send("POST", { name: "Carla Uno", email: "c1@pizza.co", role: "waiter", pin: "482193" });
      expect((await send("POST", { name: "Carla Dos", email: "c2@pizza.co", role: "waiter", pin: "482193" })).status).toBe(409);
    });

    it("el equipo se lista por correo, sin PIN, incluyendo meseros antiguos con solo PIN", async () => {
      db.prepare("INSERT INTO waiters (id, restaurant_id, name, email, pin, active) VALUES ('w-viejo', ?, 'Viejo', 'viejo@pizza.co', 'h1:abc', 1)").run(REST);
      const list = (await (await team.GET()).json()) as Array<Record<string, unknown>>;
      expect(list.map((p) => p.email)).toEqual(expect.arrayContaining(["ana@pizza.co", "chef@pizza.co", "viejo@pizza.co"]));
      expect(list.find((p) => p.email === "viejo@pizza.co")).toMatchObject({ role: "waiter", account: false, pin: true });
      expect(list.find((p) => p.email === "chef@pizza.co")).toMatchObject({ role: "chef", account: true, pin: false });
      expect(list.some((p) => p.email === "duena@pizza.co")).toBe(false); // la dueña no es "equipo"
      expect(JSON.stringify(list)).not.toContain("h1:");
    });

    it("desactivar corta su acceso por correo y por PIN", async () => {
      await send("POST", { name: "Carla Uno", email: "c1@pizza.co", role: "waiter", pin: "482193" });
      expect((await send("PATCH", { email: "c1@pizza.co", active: false })).status).toBe(200);
      expect(db.prepare("SELECT active FROM restaurant_members WHERE email = 'c1@pizza.co'").get()).toEqual({ active: 0 });
      expect(db.prepare("SELECT active FROM waiters WHERE email = 'c1@pizza.co'").get()).toEqual({ active: 0 });
      as("c1@pizza.co");
      expect(status(await staffMod.staffCtx(json("GET")))).toBe(403);
    });

    it("pone y cambia el PIN de una mesera con cuenta; a un chef no", async () => {
      expect((await send("PATCH", { email: "ana@pizza.co", pin: "111222" })).status).toBe(200);
      expect(db.prepare("SELECT COUNT(*) AS n FROM waiters WHERE email = 'ana@pizza.co'").get()).toEqual({ n: 1 });
      expect((await send("PATCH", { email: "ana@pizza.co", pin: "333444" })).status).toBe(200);
      expect(db.prepare("SELECT COUNT(*) AS n FROM waiters WHERE email = 'ana@pizza.co'").get()).toEqual({ n: 1 });
      expect((await send("PATCH", { email: "chef@pizza.co", pin: "111222" })).status).toBe(400);
    });

    it("quitar a alguien borra cuenta y PIN, y nunca toca a la dueña ni a otro restaurante", async () => {
      expect((await send("DELETE", {}, "?email=ana@pizza.co")).status).toBe(200);
      expect(db.prepare("SELECT COUNT(*) AS n FROM restaurant_members WHERE email = 'ana@pizza.co' AND restaurant_id = ?").get(REST)).toEqual({ n: 0 });
      await send("DELETE", {}, "?email=duena@pizza.co");
      expect(db.prepare("SELECT COUNT(*) AS n FROM restaurant_members WHERE email = 'duena@pizza.co'").get()).toEqual({ n: 1 });
      await send("DELETE", {}, "?email=ana@otro.co"); // es de otro restaurante
      expect(db.prepare("SELECT COUNT(*) AS n FROM restaurant_members WHERE email = 'ana@otro.co'").get()).toEqual({ n: 1 });
    });

    it("PATCH a alguien que no es del equipo → 404", async () => {
      expect((await send("PATCH", { email: "duena@pizza.co", active: false })).status).toBe(404);
      expect((await send("PATCH", { email: "nadie@x.co", active: false })).status).toBe(404);
    });
  });
});
