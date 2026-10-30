// Tipos mínimos de node:sqlite (Node 22) para tests/rate-limit.test.ts: @types/node 20 no los trae.
declare module "node:sqlite" {
  export type SQLInputValue = null | number | bigint | string | Uint8Array;
  interface StatementSync {
    get(...params: SQLInputValue[]): unknown;
    all(...params: SQLInputValue[]): unknown[];
    run(...params: SQLInputValue[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  }
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
