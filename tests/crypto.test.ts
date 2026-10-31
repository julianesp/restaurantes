// lib/crypto.ts: cifrado de llaves de pago y HMAC de PIN y sesiones.

import { decryptText, encryptText, hmacHex, randomToken } from "@/lib/crypto";

const SECRET = process.env.APP_SECRET!;
afterEach(() => {
  process.env.APP_SECRET = SECRET;
});

describe("encryptText / decryptText", () => {
  it("cifra y descifra", async () => {
    const payload = await encryptText("PRIVATE-KEY-123");
    expect(payload).toMatch(/^v1:/);
    expect(payload).not.toContain("PRIVATE-KEY-123");
    await expect(decryptText(payload)).resolves.toBe("PRIVATE-KEY-123");
  });

  it("cada cifrado usa un IV distinto", async () => {
    expect(await encryptText("x")).not.toBe(await encryptText("x"));
  });

  it("detecta datos alterados", async () => {
    const [v, iv, data] = (await encryptText("secreto")).split(":");
    const tampered = `${v}:${iv}:${data.slice(0, -4)}AAAA`;
    await expect(decryptText(tampered)).rejects.toThrow();
  });

  it("con otro APP_SECRET no se puede descifrar", async () => {
    const payload = await encryptText("secreto");
    process.env.APP_SECRET = "otro-secreto-distinto-con-mas-de-32-caracteres!!";
    await expect(decryptText(payload)).rejects.toThrow();
  });

  it("rechaza formatos desconocidos", async () => {
    await expect(decryptText("texto-plano")).rejects.toThrow(/Formato/);
  });
});

describe("hmacHex", () => {
  it("es determinista y depende del uso", async () => {
    expect(await hmacHex("waiter-pin", "a")).toBe(await hmacHex("waiter-pin", "a"));
    expect(await hmacHex("waiter-pin", "a")).not.toBe(await hmacHex("waiter-session", "a"));
    expect(await hmacHex("waiter-pin", "a")).toMatch(/^[0-9a-f]{64}$/);
  });
});

it("sin APP_SECRET (o demasiado corto) falla en vez de usar una clave débil", async () => {
  delete process.env.APP_SECRET;
  await expect(hmacHex("x", "y")).rejects.toThrow(/APP_SECRET/);
  process.env.APP_SECRET = "corto";
  await expect(encryptText("y")).rejects.toThrow(/APP_SECRET/);
});

it("randomToken da 64 caracteres hexadecimales distintos", () => {
  const a = randomToken();
  expect(a).toMatch(/^[0-9a-f]{64}$/);
  expect(randomToken()).not.toBe(a);
});
