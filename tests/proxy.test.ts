/**
 * proxy.ts: el restaurante sale SOLO del host. Un cliente no puede elegir otro restaurante
 * enviando sus propias cabeceras x-tenant-*.
 */

import { NextRequest, type NextResponse } from "next/server";

let userId: string | null = null;
const protect = jest.fn(async () => {
  if (!userId) throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
});

jest.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: (handler: unknown) => handler,
  // Mismo formato de patrones que usa proxy.ts: "(.*)" como comodín
  createRouteMatcher: (patterns: string[]) => {
    const regexes = patterns.map((p) => new RegExp(`^${p}$`));
    return (req: NextRequest) => regexes.some((r) => r.test(req.nextUrl.pathname));
  },
}));

type Handler = (auth: unknown, req: NextRequest) => Promise<NextResponse>;

function loadProxy(rootDomain: string): Handler {
  process.env.NEXT_PUBLIC_ROOT_DOMAIN = rootDomain;
  let handler!: Handler;
  jest.isolateModules(() => {
    handler = require("@/proxy").default;
  });
  delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  return handler;
}

const auth = Object.assign(async () => ({ userId }), { protect });

function request(host: string, path: string, opts: { method?: string; headers?: Record<string, string> } = {}) {
  return new NextRequest(`https://${host}${path}`, {
    method: opts.method ?? "GET",
    headers: { host, ...opts.headers },
  });
}

/** Cabecera que vinext/Next reenvía a la ruta tras NextResponse.next({ request: { headers } }). */
const forwarded = (res: NextResponse, name: string) => res.headers.get(`x-middleware-request-${name}`);

const proxy = loadProxy("brasaya.com");

beforeEach(() => {
  userId = null;
});

describe("cabeceras de tenant", () => {
  it("el subdominio define x-tenant-slug", async () => {
    const res = await proxy(auth, request("pizza.brasaya.com", "/menu"));
    expect(forwarded(res, "x-tenant-slug")).toBe("pizza");
    expect(forwarded(res, "x-tenant-host")).toBeNull();
  });

  it("descarta x-tenant-slug enviado por el cliente y usa el del host", async () => {
    const res = await proxy(
      auth,
      request("pizza.brasaya.com", "/api/menu/items", { headers: { "x-tenant-slug": "victima", "x-tenant-host": "victima.co" } }),
    );
    expect(forwarded(res, "x-tenant-slug")).toBe("pizza");
    expect(forwarded(res, "x-tenant-host")).toBeNull();
  });

  it("en el dominio raíz no deja pasar ninguna cabecera de tenant del cliente", async () => {
    const res = await proxy(auth, request("brasaya.com", "/menu", { headers: { "x-tenant-slug": "victima" } }));
    expect(forwarded(res, "x-tenant-slug")).toBeNull();
    const overridden = res.headers.get("x-middleware-override-headers") ?? "";
    expect(overridden.split(",")).not.toContain("x-tenant-slug");
  });

  it("un dominio propio viaja como x-tenant-host (no como slug)", async () => {
    const res = await proxy(auth, request("www.mirestaurante.co", "/menu", { headers: { "x-tenant-slug": "victima" } }));
    expect(forwarded(res, "x-tenant-host")).toBe("www.mirestaurante.co");
    expect(forwarded(res, "x-tenant-slug")).toBeNull();
  });

  it("la portada del dominio raíz se reescribe a la landing de la plataforma", async () => {
    const res = await proxy(auth, request("brasaya.com", "/"));
    expect(res.headers.get("x-middleware-rewrite")).toContain("/plataforma");
  });
});

describe("protección de rutas", () => {
  it("/admin sin sesión redirige a /sign-in", async () => {
    const res = await proxy(auth, request("pizza.brasaya.com", "/admin/menu"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toMatch(/\/sign-in\?redirect_url=/);
  });

  it("/admin con sesión pasa (la pertenencia se valida en el layout)", async () => {
    userId = "user_1";
    const res = await proxy(auth, request("pizza.brasaya.com", "/admin/menu"));
    expect(forwarded(res, "x-tenant-slug")).toBe("pizza");
  });

  it("el menú pasa el proxy sin sesión: las escrituras las protege adminCtx() en la ruta", async () => {
    // "/api/menu/(.*)" está en isPublicRoute, así que el bloque isApiAdminRoute de proxy.ts no llega
    // a ejecutarse. La protección real de POST/PUT/DELETE la vigila tests/api-guards.test.ts.
    const write = await proxy(auth, request("pizza.brasaya.com", "/api/menu/items", { method: "POST" }));
    expect(write.status).toBe(200);
    expect(forwarded(write, "x-tenant-slug")).toBe("pizza");
  });

  it("rutas no públicas exigen sesión (auth.protect)", async () => {
    await expect(proxy(auth, request("pizza.brasaya.com", "/api/statistics"))).rejects.toThrow();
    expect(protect).toHaveBeenCalled();
  });

  it("los cron no pasan por Clerk ni reciben tenant", async () => {
    const res = await proxy(auth, request("pizza.brasaya.com", "/api/cron/weekly", { headers: { "x-tenant-slug": "victima" } }));
    expect(protect).not.toHaveBeenCalled();
    expect(forwarded(res, "x-tenant-slug")).toBeNull();
  });
});
