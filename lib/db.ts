import { env } from "cloudflare:workers";

// Acceso a Cloudflare D1. Todas las consultas de negocio deben incluir
// `restaurant_id = ?` (ver lib/tenant.ts): no hay RLS que lo haga por nosotros.

type Param = string | number | boolean | null | undefined;
export type Row = Record<string, unknown>;

const d1 = (): D1Database => {
  const binding = (env as unknown as { DB?: D1Database }).DB;
  if (!binding) throw new Error("El binding DB (D1) no está configurado");
  return binding;
};

/** Columnas booleanas: SQLite las guarda como 0/1, el frontend espera true/false. */
const BOOLEAN_COLUMNS = new Set([
  "is_active", "is_available", "is_vegetarian", "is_spicy", "is_read", "is_replied",
  "available", "active", "activa",
]);
/** Columnas JSON guardadas como texto. */
const JSON_COLUMNS = new Set(["settings"]);

function fromDb<T = Row>(row: Row | null | undefined): T | null {
  if (!row) return null;
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) {
    if (BOOLEAN_COLUMNS.has(key) && (value === 0 || value === 1)) out[key] = value === 1;
    else if (JSON_COLUMNS.has(key) && typeof value === "string") {
      try { out[key] = JSON.parse(value); } catch { out[key] = {}; }
    } else out[key] = value;
  }
  return out as T;
}

function toParam(value: Param): string | number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

/** Lista de filas. */
export async function all<T = Row>(sql: string, ...params: Param[]): Promise<T[]> {
  const { results } = await d1().prepare(sql).bind(...params.map(toParam)).all<Row>();
  return results.map((r: Row) => fromDb<T>(r) as T);
}

/** Primera fila o null. */
export async function first<T = Row>(sql: string, ...params: Param[]): Promise<T | null> {
  const row = await d1().prepare(sql).bind(...params.map(toParam)).first<Row>();
  return fromDb<T>(row);
}

/** INSERT/UPDATE/DELETE. Devuelve las filas afectadas. */
export async function run(sql: string, ...params: Param[]): Promise<number> {
  const res = await d1().prepare(sql).bind(...params.map(toParam)).run();
  return res.meta.changes ?? 0;
}

/** Ejecuta varias sentencias de forma atómica (una transacción). */
export async function batch(statements: Array<{ sql: string; params?: Param[] }>): Promise<void> {
  const db = d1();
  await db.batch(statements.map((s) => db.prepare(s.sql).bind(...(s.params ?? []).map(toParam))));
}

export const newId = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();

const IDENT = /^[a-z_][a-z0-9_]*$/;
const assertIdent = (name: string) => {
  if (!IDENT.test(name)) throw new Error(`Identificador SQL no válido: ${name}`);
  return name;
};

/** Toma solo las claves permitidas de un objeto, descartando undefined. */
export function pick(source: Row, allowed: readonly string[]): Record<string, Param> {
  const out: Record<string, Param> = {};
  for (const key of allowed) {
    if (key in source && source[key] !== undefined) out[key] = source[key] as Param;
  }
  return out;
}

/**
 * INSERT con id generado. `values` debe venir ya filtrado con pick() o escrito
 * en el código (los nombres de columna se validan igualmente).
 */
export async function insert<T = Row>(table: string, values: Record<string, Param>): Promise<T> {
  const data = { id: newId(), ...values };
  const cols = Object.keys(data).map(assertIdent);
  const sql = `INSERT INTO ${assertIdent(table)} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")}) RETURNING *`;
  const row = await first<T>(sql, ...Object.values(data));
  if (!row) throw new Error(`No se pudo insertar en ${table}`);
  return row;
}

/**
 * UPDATE de una fila de un restaurante: siempre filtra por id Y restaurant_id.
 * Devuelve la fila actualizada o null si no existe en ese restaurante.
 */
export async function updateOwned<T = Row>(
  table: string,
  restaurantId: string,
  id: string,
  values: Record<string, Param>,
  opts: { touchUpdatedAt?: boolean } = { touchUpdatedAt: true }
): Promise<T | null> {
  const data: Record<string, Param> = { ...values };
  if (opts.touchUpdatedAt !== false && !("updated_at" in data) && TABLES_WITH_UPDATED_AT.has(table)) {
    data.updated_at = nowIso();
  }
  const cols = Object.keys(data).map(assertIdent);
  if (cols.length === 0) {
    return first<T>(`SELECT * FROM ${assertIdent(table)} WHERE id = ? AND restaurant_id = ?`, id, restaurantId);
  }
  const sql = `UPDATE ${assertIdent(table)} SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ? AND restaurant_id = ? RETURNING *`;
  return first<T>(sql, ...Object.values(data), id, restaurantId);
}

/** DELETE de una fila de un restaurante. Devuelve true si se eliminó algo. */
export async function deleteOwned(table: string, restaurantId: string, id: string): Promise<boolean> {
  const changes = await run(`DELETE FROM ${assertIdent(table)} WHERE id = ? AND restaurant_id = ?`, id, restaurantId);
  return changes > 0;
}

/** ¿El error es una violación de UNIQUE? */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed/i.test(error.message);
}

const TABLES_WITH_UPDATED_AT = new Set([
  "restaurants", "menu_categories", "menu_items", "featured_dishes", "permanent_dishes",
  "daily_specials", "restaurant_tables", "table_orders", "customer_suggestions",
  "weekly_featured_dishes",
]);
