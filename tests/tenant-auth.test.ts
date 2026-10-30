// lib/tenant.ts: quién puede administrar qué restaurante.

import { fakeD1, type FakeCall } from "./mocks/cloudflare-workers";

const headerStore = new Map<string, string>();
jest.mock("next/headers", () => ({
  headers: async () => ({ get: (k: string) => headerStore.get(k.toLowerCase()) ?? null }),
}));

type FakeEmail = { emailAddress: string; verification: { status: string } | null };
let currentUserValue: { emailAddresses: FakeEmail[] } | null = null;
jest.mock("@clerk/nextjs/server", () => ({ currentUser: async () => currentUserValue }));

const future = new Date(Date.now() + 10 * 86_400_000).toISOString();
const past = new Date(Date.now() - 30 * 86_400_000).toISOString();

const TENANTS: Record<string, Record<string, unknown>> = {
  pizza: { id: "rest-pizza", slug: "pizza", name: "Pizza", status: "active", plan: "monthly", trial_ends_at: null, paid_until: future, settings: "{}" },
  vencido: { id: "rest-vencido", slug: "vencido", name: "Vencido", status: "active", plan: "monthly", trial_ends_at: past, paid_until: null, settings: "{}" },
};
/** Miembros por restaurante: email → rol */
const MEMBERS: Record<string, Record<string, string>> = {
  "rest-pizza": { "duena@pizza.co": "owner" },
  "rest-vencido": { "dueno@vencido.co": "owner" },
};

function respond(c: FakeCall) {
  if (c.sql.includes("FROM restaurants WHERE slug")) return TENANTS[c.params[0] as string] ?? null;
  if (c.sql.includes("FROM restaurants WHERE custom_domain")) return null;
  if (c.sql.includes("FROM restaurant_members")) {
    const [restaurantId, ...emails] = c.params as string[];
    const email = emails.find((e) => MEMBERS[restaurantId]?.[e]);
    return email ? { email, role: MEMBERS[restaurantId][email] } : null;
  }
  return null;
}

const user = (...emails: Array<string | [string, string]>) => ({
  emailAddresses: emails.map((e) =>
    Array.isArray(e)
      ? { emailAddress: e[0], verification: { status: e[1] } }
      : { emailAddress: e, verification: { status: "verified" } },
  ),
});

let tenantMod: typeof import("@/lib/tenant");

beforeEach(() => {
  fakeD1.reset();
  fakeD1.respond = respond;
  headerStore.clear();
  currentUserValue = null;
  process.env.ADMIN_EMAILS = "Plataforma@Brasaya.com, otro@brasaya.com";
  // Módulo nuevo en cada test: la caché de restaurantes vive en memoria
  jest.isolateModules(() => {
    tenantMod = require("@/lib/tenant");
  });
});

afterAll(() => {
  delete process.env.ADMIN_EMAILS;
});

const asTenant = (slug: string) => headerStore.set("x-tenant-slug", slug);
const status = (ctx: { ok: boolean; res?: Response }) => (ctx.ok ? 200 : ctx.res!.status);

describe("adminCtx", () => {
  it("sin sesión → 401", async () => {
    asTenant("pizza");
    expect(status(await tenantMod.adminCtx())).toBe(401);
  });

  it("restaurante inexistente → 404", async () => {
    asTenant("no-existe");
    currentUserValue = user("duena@pizza.co");
    expect(status(await tenantMod.adminCtx())).toBe(404);
  });

  it("la dueña de su restaurante entra con su rol", async () => {
    asTenant("pizza");
    currentUserValue = user("DUENA@pizza.co");
    const ctx = await tenantMod.adminCtx();
    expect(ctx).toMatchObject({ ok: true, role: "owner", email: "duena@pizza.co", tenant: { id: "rest-pizza" } });
  });

  it("el dueño de otro restaurante no entra → 403", async () => {
    asTenant("pizza");
    currentUserValue = user("dueno@vencido.co");
    expect(status(await tenantMod.adminCtx())).toBe(403);
  });

  it("un correo sin verificar no cuenta como miembro", async () => {
    asTenant("pizza");
    currentUserValue = user(["duena@pizza.co", "unverified"]);
    expect(status(await tenantMod.adminCtx())).toBe(403);
    // y ni siquiera se consulta la tabla de miembros
    expect(fakeD1.calls.some((c) => c.sql.includes("restaurant_members"))).toBe(false);
  });

  it("un admin de plataforma con correo sin verificar no es admin", async () => {
    asTenant("pizza");
    currentUserValue = user(["plataforma@brasaya.com", "unverified"]);
    expect(status(await tenantMod.adminCtx())).toBe(403);
  });

  it("los admins de plataforma (ADMIN_EMAILS, sin importar mayúsculas) entran a cualquier restaurante", async () => {
    asTenant("pizza");
    currentUserValue = user("plataforma@brasaya.com");
    await expect(tenantMod.adminCtx()).resolves.toMatchObject({ ok: true, role: "platform" });
  });

  it("la consulta de miembros filtra por el restaurante actual", async () => {
    asTenant("pizza");
    currentUserValue = user("duena@pizza.co");
    await tenantMod.adminCtx();
    const call = fakeD1.calls.find((c) => c.sql.includes("restaurant_members"))!;
    expect(call.sql).toMatch(/WHERE restaurant_id = \? AND email IN \(\?\)/);
    expect(call.params[0]).toBe("rest-pizza");
  });

  it("restaurante suspendido por falta de pago → 403, salvo en las rutas de pago", async () => {
    asTenant("vencido");
    currentUserValue = user("dueno@vencido.co");
    expect(status(await tenantMod.adminCtx())).toBe(403);
    await expect(tenantMod.adminCtx({ allowUnpaid: true })).resolves.toMatchObject({ ok: true, role: "owner" });
  });

  it("allowUnpaid no salta la autorización", async () => {
    asTenant("vencido");
    currentUserValue = user("duena@pizza.co");
    expect(status(await tenantMod.adminCtx({ allowUnpaid: true }))).toBe(403);
  });
});

describe("publicCtx", () => {
  it("restaurante al día → ok", async () => {
    asTenant("pizza");
    await expect(tenantMod.publicCtx()).resolves.toMatchObject({ ok: true });
  });

  it("restaurante suspendido → 403", async () => {
    asTenant("vencido");
    expect(status(await tenantMod.publicCtx())).toBe(403);
  });
});

describe("getTenant", () => {
  it("sin cabeceras de tenant usa DEFAULT_TENANT_SLUG", async () => {
    process.env.DEFAULT_TENANT_SLUG = "pizza";
    jest.isolateModules(() => {
      tenantMod = require("@/lib/tenant");
    });
    await expect(tenantMod.getTenant()).resolves.toMatchObject({ slug: "pizza" });
    delete process.env.DEFAULT_TENANT_SLUG;
  });

  it("un slug desconocido NO cae al restaurante por defecto", async () => {
    process.env.DEFAULT_TENANT_SLUG = "pizza";
    jest.isolateModules(() => {
      tenantMod = require("@/lib/tenant");
    });
    asTenant("no-existe");
    await expect(tenantMod.getTenant()).resolves.toBeNull();
    delete process.env.DEFAULT_TENANT_SLUG;
  });
});
