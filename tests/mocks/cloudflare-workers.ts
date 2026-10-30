// Sustituto de `cloudflare:workers` para Jest: un binding DB (D1) falso.
// Cada sentencia preparada queda en `fakeD1.calls` (sql + parámetros) y su resultado sale de
// `fakeD1.respond`, que cada test puede reemplazar para simular filas.

export interface FakeCall {
  sql: string;
  params: unknown[];
  method: "all" | "first" | "run" | "batch";
}

type Responder = (call: FakeCall) => unknown;

const defaultResponder: Responder = (call) => {
  if (call.method === "all") return [];
  if (call.method === "run" || call.method === "batch") return { changes: 0 };
  return null;
};

interface FakeD1 {
  calls: FakeCall[];
  respond: Responder;
  reset(): void;
}

// Una sola instancia aunque jest.isolateModules() vuelva a cargar este módulo
const globalStore = globalThis as { __fakeD1?: FakeD1 };
export const fakeD1: FakeD1 = (globalStore.__fakeD1 ??= {
  calls: [],
  respond: defaultResponder,
  reset() {
    this.calls = [];
    this.respond = defaultResponder;
  },
});

function prepare(sql: string) {
  let params: unknown[] = [];
  const exec = (method: FakeCall["method"]) => {
    const call = { sql, params, method };
    fakeD1.calls.push(call);
    return fakeD1.respond(call);
  };
  const stmt = {
    sql,
    get params() {
      return params;
    },
    bind(...values: unknown[]) {
      params = values;
      return stmt;
    },
    async all() {
      return { results: (exec("all") as unknown[]) ?? [] };
    },
    async first() {
      return exec("first") ?? null;
    },
    async run() {
      const res = (exec("run") as { changes?: number }) ?? {};
      return { meta: { changes: res.changes ?? 0 } };
    },
  };
  return stmt;
}

const DB = {
  prepare,
  async batch(statements: Array<ReturnType<typeof prepare>>) {
    for (const s of statements) {
      const call = { sql: s.sql, params: s.params, method: "batch" as const };
      fakeD1.calls.push(call);
      fakeD1.respond(call);
    }
    return [];
  },
};

export const env: Record<string, unknown> = { DB };
