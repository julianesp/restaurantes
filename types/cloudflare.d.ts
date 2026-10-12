// Tipos mínimos de Cloudflare usados por el proyecto.
// No se incluyen los tipos completos de @cloudflare/workers-types porque redefinen
// Response.json() como `unknown` y rompen el código de cliente.

declare module "cloudflare:workers" {
  /** Bindings del Worker (DB, MEDIA, secretos y variables). */
  export const env: Record<string, unknown>;
}

interface D1Meta {
  changes?: number;
  last_row_id?: number;
}
interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

interface R2HTTPMetadata {
  contentType?: string;
  cacheControl?: string;
}
interface R2ObjectBody {
  body: ReadableStream;
  httpEtag: string;
  httpMetadata?: R2HTTPMetadata;
}
interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: ArrayBuffer | ReadableStream | string, options?: { httpMetadata?: R2HTTPMetadata }): Promise<unknown>;
  delete(key: string): Promise<void>;
}

interface ScheduledController {
  scheduledTime: number;
  cron: string;
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}
