// Webhook de Meta (/api/whatsapp/webhook): es público, solo lo protege la firma HMAC.

import { createHmac } from "node:crypto";
import { normalizePhone, verifySignature } from "@/lib/whatsapp";

const SECRET = "app-secret-de-prueba";
const sign = (body: string, secret = SECRET) => "sha256=" + createHmac("sha256", secret).update(body).digest("hex");

describe("verifySignature", () => {
  const body = JSON.stringify({ entry: [{ changes: [{ value: { statuses: [{ id: "wamid.1", status: "read" }] } }] }] });

  beforeEach(() => {
    process.env.WHATSAPP_APP_SECRET = SECRET;
  });
  afterAll(() => {
    delete process.env.WHATSAPP_APP_SECRET;
  });

  it("acepta una firma válida (también en mayúsculas)", async () => {
    await expect(verifySignature(body, sign(body))).resolves.toBe(true);
    await expect(verifySignature(body, "sha256=" + sign(body).slice(7).toUpperCase())).resolves.toBe(true);
  });

  it("rechaza un cuerpo alterado", async () => {
    await expect(verifySignature(body.replace("read", "failed"), sign(body))).resolves.toBe(false);
  });

  it("rechaza una firma hecha con otro secreto", async () => {
    await expect(verifySignature(body, sign(body, "otro"))).resolves.toBe(false);
  });

  it.each([null, "", "sha256=", "sha1=abc", sign("x").slice(0, 20), "sha256=" + "0".repeat(64)])(
    "rechaza la cabecera %j",
    async (header) => {
      await expect(verifySignature(body, header)).resolves.toBe(false);
    },
  );

  it("sin App Secret configurado rechaza todo (no acepta firmas con secreto vacío)", async () => {
    delete process.env.WHATSAPP_APP_SECRET;
    await expect(verifySignature(body, sign(body, ""))).resolves.toBe(false);
  });
});

describe("normalizePhone", () => {
  it("añade el indicativo 57 a celulares colombianos", () => {
    expect(normalizePhone("300 123 4567")).toBe("573001234567");
    expect(normalizePhone("+57 (300) 123-4567")).toBe("573001234567");
  });

  it.each([undefined, null, 3001234567, "", "abc", "123", "1".repeat(16)])("rechaza %j", (value) => {
    expect(normalizePhone(value)).toBeNull();
  });
});
