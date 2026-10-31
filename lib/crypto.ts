/**
 * Criptografía de la plataforma a partir de un solo secreto, APP_SECRET (wrangler secret put).
 * De él se derivan claves distintas por uso, así que filtrar una no compromete las demás.
 *
 * - hmacHex(): hash determinista con clave (PIN de meseros, tokens de sesión). Sin el secreto,
 *   una copia de la base de datos no permite probar PIN fuera de línea.
 * - encryptText()/decryptText(): AES-GCM para guardar llaves privadas (ePayco de cada restaurante).
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

function appSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 32) throw new Error("APP_SECRET no está configurado (mínimo 32 caracteres)");
  return secret;
}

const toHex = (bytes: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromB64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

/** Clave derivada de APP_SECRET para un uso concreto (`purpose`). */
async function derivedKey(purpose: string): Promise<ArrayBuffer> {
  const master = await crypto.subtle.importKey("raw", enc.encode(appSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", master, enc.encode(`brasaya:${purpose}`));
}

/** HMAC-SHA256 en hexadecimal de `value` con la clave del uso `purpose`. */
export async function hmacHex(purpose: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", await derivedKey(purpose), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}

const aesKey = async () =>
  crypto.subtle.importKey("raw", await derivedKey("aes-gcm-v1"), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);

/** Cifra texto con AES-GCM. Formato: "v1:<iv base64>:<cifrado base64>". */
export async function encryptText(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(), enc.encode(plain));
  return `v1:${toB64(iv)}:${toB64(new Uint8Array(cipher))}`;
}

/** Descifra lo producido por encryptText(). Lanza error si fue alterado o la clave cambió. */
export async function decryptText(payload: string): Promise<string> {
  const [version, iv, data] = payload.split(":");
  if (version !== "v1" || !iv || !data) throw new Error("Formato de dato cifrado no válido");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv) }, await aesKey(), fromB64(data));
  return dec.decode(plain);
}

/** Token aleatorio de 32 bytes en hexadecimal (sesiones). */
export function randomToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}
