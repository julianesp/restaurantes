// Resolución del restaurante por el host: es lo que decide qué datos ve cada petición.

type TenantHostModule = typeof import("@/lib/tenant-host");

/** Carga el módulo con un NEXT_PUBLIC_ROOT_DOMAIN concreto (se lee al importar). */
function load(rootDomain: string): TenantHostModule {
  const prev = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  process.env.NEXT_PUBLIC_ROOT_DOMAIN = rootDomain;
  let mod!: TenantHostModule;
  jest.isolateModules(() => {
    mod = require("@/lib/tenant-host");
  });
  if (prev === undefined) delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  else process.env.NEXT_PUBLIC_ROOT_DOMAIN = prev;
  return mod;
}

describe("parseHost con dominio raíz (producción)", () => {
  const { parseHost } = load("brasaya.com");

  it("el dominio raíz y www son la plataforma", () => {
    expect(parseHost("brasaya.com")).toEqual({ kind: "platform" });
    expect(parseHost("www.brasaya.com")).toEqual({ kind: "platform" });
    expect(parseHost("BRASAYA.COM:443")).toEqual({ kind: "platform" });
  });

  it("un subdominio es un restaurante, en minúsculas y sin puerto", () => {
    expect(parseHost("pizzeria.brasaya.com")).toEqual({ kind: "tenant", slug: "pizzeria" });
    expect(parseHost("PiZZeria.Brasaya.com:8080")).toEqual({ kind: "tenant", slug: "pizzeria" });
  });

  it("no acepta más de un nivel de subdominio", () => {
    // a.b.brasaya.com no puede hacerse pasar por el restaurante "a.b" ni por "b"
    expect(parseHost("a.b.brasaya.com")).toEqual({ kind: "custom", host: "a.b.brasaya.com" });
  });

  it("un dominio que solo termina en el texto del raíz no es un subdominio", () => {
    // evilbrasaya.com no debe resolverse como tenant "evil"
    expect(parseHost("evilbrasaya.com")).toEqual({ kind: "custom", host: "evilbrasaya.com" });
    expect(parseHost("brasaya.com.evil.net")).toEqual({ kind: "custom", host: "brasaya.com.evil.net" });
  });

  it("hosts vacíos, locales y de previews usan el restaurante por defecto", () => {
    expect(parseHost(null)).toEqual({ kind: "fallback" });
    expect(parseHost("")).toEqual({ kind: "fallback" });
    expect(parseHost("localhost:3000")).toEqual({ kind: "fallback" });
    expect(parseHost("127.0.0.1")).toEqual({ kind: "fallback" });
    expect(parseHost("restaurantes.julii1295.workers.dev")).toEqual({ kind: "fallback" });
    expect(parseHost("x.pages.dev")).toEqual({ kind: "fallback" });
    expect(parseHost("x.vercel.app")).toEqual({ kind: "fallback" });
  });

  it("cualquier otro host se busca como dominio propio", () => {
    expect(parseHost("www.mirestaurante.co")).toEqual({ kind: "custom", host: "www.mirestaurante.co" });
  });

  it("tenantUrl usa https y el dominio raíz", () => {
    const { tenantUrl } = load("brasaya.com");
    expect(tenantUrl("pizzeria", "/menu")).toBe("https://pizzeria.brasaya.com/menu");
  });
});

describe("parseHost sin dominio raíz (desarrollo)", () => {
  const { parseHost, tenantUrl } = load("");

  it("<slug>.localhost es un restaurante", () => {
    expect(parseHost("pizzeria.localhost:3000")).toEqual({ kind: "tenant", slug: "pizzeria" });
    expect(parseHost("a.b.localhost")).toEqual({ kind: "custom", host: "a.b.localhost" });
  });

  it("tenantUrl apunta a localhost", () => {
    expect(tenantUrl("pizzeria")).toBe("http://pizzeria.localhost:3000/");
  });
});

describe("SLUG_REGEX y RESERVED_SLUGS", () => {
  const { SLUG_REGEX, RESERVED_SLUGS } = load("brasaya.com");

  it.each(["abc", "mi-restaurante", "r2d2", "a".repeat(30)])("acepta %s", (slug) => {
    expect(SLUG_REGEX.test(slug)).toBe(true);
  });

  it.each([
    "ab", // demasiado corto
    "a".repeat(31), // demasiado largo
    "-abc",
    "abc-",
    "Mayus",
    "con espacio",
    "con.punto", // crearía un segundo nivel de subdominio
    "ñandú",
    "abc\n",
    "../etc",
  ])("rechaza %j", (slug) => {
    expect(SLUG_REGEX.test(slug)).toBe(false);
  });

  it("reserva los subdominios de la plataforma", () => {
    for (const s of ["www", "admin", "api", "registro", "plataforma", "billing"]) {
      expect(RESERVED_SLUGS.has(s)).toBe(true);
    }
  });
});
