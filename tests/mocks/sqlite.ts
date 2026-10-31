// D1 falso respaldado por un SQLite real (node:sqlite) con las migraciones indicadas, para probar el
// SQL tal como corre en D1. Las tablas base mínimas (restaurants, waiters…) se crean aquí.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { fakeD1, type FakeCall } from "./cloudflare-workers";

const BASE_TABLES = `
  CREATE TABLE restaurants (id TEXT PRIMARY KEY, slug TEXT UNIQUE, name TEXT, settings TEXT, updated_at TEXT);
  CREATE TABLE waiters (id TEXT PRIMARY KEY, restaurant_id TEXT, name TEXT, email TEXT, pin TEXT, active INTEGER, created_at TEXT,
                        UNIQUE (restaurant_id, pin));
  CREATE TABLE kitchen_chat (id TEXT PRIMARY KEY, restaurant_id TEXT, sender_role TEXT, sender_name TEXT, message TEXT,
                             order_ref TEXT, created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')));
`;

export function sqliteD1(migrations: string[] = []): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec(BASE_TABLES);
  for (const m of migrations) db.exec(readFileSync(join(__dirname, "../../migrations", m), "utf8"));
  fakeD1.respond = (c: FakeCall) => {
    const stmt = db.prepare(c.sql);
    const params = c.params as SQLInputValue[];
    if (c.method === "first") return stmt.get(...params) ?? null;
    if (c.method === "all") return stmt.all(...params);
    return { changes: Number(stmt.run(...params).changes) };
  };
  return db;
}
