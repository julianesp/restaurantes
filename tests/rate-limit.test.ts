/**
 * Límite de intentos del PIN de meseros. Aquí el D1 falso ejecuta el SQL en un SQLite real
 * (node:sqlite) con la migración 0004, para probar el UPSERT tal como corre en D1.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { fakeD1, type FakeCall } from "./mocks/cloudflare-workers";
import { hit, purgeRateLimits, release } from "@/lib/rate-limit";

jest.mock("@/lib/tenant", () => ({
  publicCtx: async () => ({ ok: true, tenant: { id: "rest-pizza", slug: "pizza" } }),
}));

const WINDOW = 15 * 60_000;
let sqlite: DatabaseSync;

/** Responde las consultas con SQLite; la tabla waiters es solo para la ruta. */
function useSqlite() {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(join(__dirname, "../migrations/0004_rate_limits.sql"), "utf8"));
  sqlite.exec(`CREATE TABLE waiters (id TEXT, restaurant_id TEXT, name TEXT, email TEXT, pin TEXT, active INTEGER);
               INSERT INTO waiters VALUES ('w1', 'rest-pizza', 'Ana', 'ana@pizza.co', '4821', 1);`);
  fakeD1.respond = (c: FakeCall) => {
    const stmt = sqlite.prepare(c.sql);
    const params = c.params as SQLInputValue[];
    if (c.method === "first") return stmt.get(...params) ?? null;
    if (c.method === "all") return stmt.all(...params);
    return { changes: Number(stmt.run(...params).changes) };
  };
}

const countOf = (key: string) =>
  (sqlite.prepare("SELECT count FROM rate_limits WHERE key = ?").get(key) as { count: number } | undefined)?.count;

beforeEach(() => {
  fakeD1.reset();
  useSqlite();
});

describe("hit / release", () => {
  const T = 1_800_000_000_000;

  it("permite hasta `max` intentos por ventana y bloquea el siguiente", async () => {
    for (let i = 1; i <= 3; i++) {
      await expect(hit("k", 3, WINDOW, T + i)).resolves.toMatchObject({ allowed: true, count: i });
    }
    await expect(hit("k", 3, WINDOW, T + 4)).resolves.toMatchObject({ allowed: false, count: 4 });
  });

  it("informa cuánto falta para reiniciar la ventana", async () => {
    await hit("k", 1, WINDOW, T);
    const blocked = await hit("k", 1, WINDOW, T + 5 * 60_000);
    expect(blocked.retryAfter).toBe(10 * 60);
  });

  it("al vencer la ventana vuelve a empezar", async () => {
    for (let i = 0; i < 5; i++) await hit("k", 3, WINDOW, T);
    await expect(hit("k", 3, WINDOW, T + WINDOW)).resolves.toMatchObject({ allowed: true, count: 1 });
  });

  it("las claves son independientes", async () => {
    await hit("a", 1, WINDOW, T);
    await expect(hit("b", 1, WINDOW, T)).resolves.toMatchObject({ allowed: true });
  });

  it("intentos en paralelo no se saltan el límite", async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => hit("k", 5, WINDOW, T)));
    expect(results.filter((r) => r.allowed)).toHaveLength(5);
  });

  it("release descuenta un intento sin bajar de 0", async () => {
    await hit("k", 3, WINDOW, T);
    await release("k");
    await release("k");
    expect(countOf("k")).toBe(0);
  });

  it("purgeRateLimits borra solo las ventanas viejas", async () => {
    await hit("vieja", 3, WINDOW, T - 2 * 86_400_000);
    await hit("nueva", 3, WINDOW, T);
    await expect(purgeRateLimits(86_400_000, T)).resolves.toBe(1);
    expect(countOf("vieja")).toBeUndefined();
    expect(countOf("nueva")).toBe(1);
  });
});

describe("POST /api/waiters/verify", () => {
  let POST: (req: Request) => Promise<Response>;
  beforeAll(() => {
    POST = require("@/app/api/waiters/verify/route").POST;
  });

  const verify = (pin: string, ip = "1.1.1.1") =>
    POST(
      new Request("https://pizza.brasaya.com/api/waiters/verify", {
        method: "POST",
        headers: { "content-type": "application/json", "cf-connecting-ip": ip },
        body: JSON.stringify({ pin }),
      }),
    );

  it("PIN correcto → 200 con el mesero", async () => {
    const res = await verify("4821");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true, waiter: { name: "Ana" } });
  });

  it("tras 5 fallos desde una IP responde 429, incluso con el PIN correcto", async () => {
    for (let i = 0; i < 5; i++) expect((await verify("0000")).status).toBe(401);
    const blocked = await verify("4821");
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    await expect(blocked.json()).resolves.toMatchObject({ error: expect.stringMatching(/Demasiados intentos/) });
  });

  it("otra IP del mismo restaurante sigue pudiendo entrar", async () => {
    for (let i = 0; i < 6; i++) await verify("0000", "6.6.6.6");
    expect((await verify("4821", "2.2.2.2")).status).toBe(200);
  });

  it("los aciertos no gastan intentos", async () => {
    for (let i = 0; i < 10; i++) expect((await verify("4821")).status).toBe(200);
    expect(countOf("pin:ip:rest-pizza:1.1.1.1")).toBe(0);
  });

  it("muchas IPs distintas topan en el límite por restaurante (30)", async () => {
    for (let i = 0; i < 30; i++) expect((await verify("0000", `10.0.0.${i}`)).status).toBe(401);
    expect((await verify("4821", "10.0.1.1")).status).toBe(429);
  });

  it("los PIN de otro restaurante no cuentan para este", async () => {
    for (let i = 0; i < 5; i++) await verify("0000");
    expect(countOf("pin:rest:rest-pizza")).toBe(5);
    expect(countOf("pin:rest:otro")).toBeUndefined();
  });
});
