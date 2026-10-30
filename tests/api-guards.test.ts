/**
 * Guardián estático de las rutas API: toda escritura (POST/PUT/PATCH/DELETE) debe pasar por
 * adminCtx(), salvo las listadas abajo con su motivo; también las lecturas de ADMIN_ONLY_READS.
 * Si añades una ruta pública a propósito, agrégala aquí explicando qué la protege; si este test
 * falla por una ruta nueva, lo normal es que le falte `const ctx = await adminCtx(); if (!ctx.ok) return ctx.res;`.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(__dirname, "..");
const API_DIR = join(ROOT, "app/api");

/** Escrituras públicas intencionales: "ruta METODO" → qué la protege. */
const PUBLIC_WRITES: Record<string, string> = {
  "app/api/epayco/create-payment POST": "pago del cliente en el checkout (el monto lo valida ePayco)",
  "app/api/epayco/webhook POST": "solo confía en validateTransaction() contra la API de ePayco",
  "app/api/whatsapp/webhook POST": "firma HMAC verifySignature()",
  "app/api/notify-order POST": "aviso de pedido del cliente; tope de 60/h en lib/whatsapp.ts",
  "app/api/notify-reservation POST": "reserva hecha por el cliente",
  "app/api/orders/table POST": "pedido desde la mesa por QR",
  "app/api/suggestions POST": "buzón público de sugerencias",
  "app/api/waiters/verify POST": "PIN del mesero, con límite de intentos (lib/rate-limit.ts)",
  "app/api/platform/restaurants POST": "registro de restaurante: exige currentUser() de Clerk",
};

/** Lecturas con datos internos del restaurante: también deben exigir adminCtx(). */
const ADMIN_ONLY_READS = [
  "app/api/orders/table GET", // todos los pedidos, con notas de los clientes
  "app/api/kitchen-chat GET", // chat interno meseros/cocina
  "app/api/waiters GET", // incluye los PIN de los meseros
  "app/api/suggestions GET",
  "app/api/statistics GET",
];

const HANDLER = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b|export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\b/g;
const isWrite = (key: string) => !key.endsWith(" GET");

function routeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return routeFiles(full);
    return name === "route.ts" ? [full] : [];
  });
}

/** Cuerpo de cada handler: desde su `export` hasta el siguiente `export`. */
function routeHandlers(file: string) {
  const src = readFileSync(file, "utf8");
  const route = relative(ROOT, file).replace(/\/route\.ts$/, "");
  const exports = [...src.matchAll(/^export\s/gm)].map((m) => m.index!);
  return [...src.matchAll(HANDLER)].map((m) => {
    const end = exports.find((i) => i > m.index!) ?? src.length;
    return { key: `${route} ${m[1] || m[2]}`, body: src.slice(m.index, end) };
  });
}

const all = routeFiles(API_DIR).flatMap(routeHandlers);
const handlers = all.filter((h) => isWrite(h.key) || ADMIN_ONLY_READS.includes(h.key));

it("encuentra las rutas de escritura", () => {
  expect(handlers.length).toBeGreaterThan(20);
});

describe.each(handlers.map((h) => [h.key, h.body]))("%s", (key, body) => {
  it(PUBLIC_WRITES[key] ? `pública: ${PUBLIC_WRITES[key]}` : "exige adminCtx()", () => {
    if (PUBLIC_WRITES[key]) return;
    expect(body).toMatch(/await\s+adminCtx\(/);
    expect(body).toMatch(/if\s*\(\s*!ctx\.ok\s*\)\s*return\s+ctx\.res/);
  });
});

it("las listas no tienen rutas que ya no existen", () => {
  const keys = new Set(all.map((h) => h.key));
  expect([...Object.keys(PUBLIC_WRITES), ...ADMIN_ONLY_READS].filter((k) => !keys.has(k))).toEqual([]);
});

it("las rutas cron (fuera de Clerk) exigen CRON_SECRET", () => {
  const crons = routeFiles(join(API_DIR, "cron"));
  expect(crons.length).toBeGreaterThan(0);
  for (const file of crons) {
    expect(readFileSync(file, "utf8")).toMatch(/CRON_SECRET/);
  }
});
