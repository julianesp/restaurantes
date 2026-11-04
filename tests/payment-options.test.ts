// lib/nequi.ts y lib/payment-options.ts: Nequi directo y formas de pago de los pedidos.
import { formatNequi, normalizeNequi } from "@/lib/nequi";
import { paymentNote, paymentOptions } from "@/lib/payment-options";

describe("normalizeNequi", () => {
  it.each([
    ["3001234567", "3001234567"],
    ["300 123 4567", "3001234567"],
    ["+57 300-123-4567", "3001234567"],
    ["573001234567", "3001234567"],
  ])("acepta %s", (raw, expected) => {
    expect(normalizeNequi(raw)).toBe(expected);
  });

  it.each([
    ["fijo", "6012345678"],
    ["corto", "300123456"],
    ["largo", "30012345678"],
    ["letras", "300abc4567"],
    ["vacío", ""],
  ])("rechaza: %s", (_, raw) => {
    expect(normalizeNequi(raw)).toBeNull();
  });

  it("formatea en grupos", () => {
    expect(formatNequi("3001234567")).toBe("300 123 4567");
  });
});

describe("paymentOptions", () => {
  const ids = (onlinePayments: boolean, nequi: string) => paymentOptions({ onlinePayments, nequi }).map((o) => o.id);

  it("sin ePayco ni Nequi: solo pago al recibir (como antes)", () => {
    expect(ids(false, "")).toEqual(["cash"]);
  });

  it("con ePayco: pago en línea primero y sin pago al recibir", () => {
    expect(ids(true, "")).toEqual(["online"]);
    expect(ids(true, "3001234567")).toEqual(["online", "nequi"]);
  });

  it("solo Nequi: transferencia o pago al recibir", () => {
    expect(ids(false, "3001234567")).toEqual(["nequi", "cash"]);
  });

  it("la nota de WhatsApp lleva el Nequi del restaurante", () => {
    expect(paymentNote("nequi", "3001234567")).toContain("300 123 4567");
    expect(paymentNote("cash", "")).toBe("Pago al recibir.");
    expect(paymentNote("online", "3001234567")).toBeUndefined();
  });
});
