// lib/epayco.ts validateTransaction: la única fuente de verdad para aprobar pagos.

import { validateTransaction } from "@/lib/epayco";

const fetchMock = jest.fn();
beforeEach(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
  jest.spyOn(console, "error").mockImplementation(() => {});
});

const reply = (body: unknown, ok = true) => fetchMock.mockResolvedValueOnce({ ok, json: async () => body });

describe("validateTransaction", () => {
  it.each(["", "../../admin", "abc/def", "a b", "x".repeat(65), "1?x=1", "1#"])(
    "no llama a ePayco con una referencia mal formada (%j)",
    async (ref) => {
      await expect(validateTransaction(ref)).resolves.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("consulta la API oficial de validación", async () => {
    reply({ success: true, data: { x_ref_payco: "123" } });
    await validateTransaction("123");
    expect(fetchMock).toHaveBeenCalledWith("https://secure.epayco.co/validation/v1/reference/123", expect.anything());
  });

  it("referencia inexistente (200 con status false) → null", async () => {
    reply({ success: true, status: false, data: {} });
    await expect(validateTransaction("999")).resolves.toBeNull();
  });

  it("respuesta sin x_ref_payco → null", async () => {
    reply({ success: true, data: { x_amount: "69900" } });
    await expect(validateTransaction("999")).resolves.toBeNull();
  });

  it("error HTTP o de red → null", async () => {
    reply({}, false);
    await expect(validateTransaction("1")).resolves.toBeNull();
    fetchMock.mockRejectedValueOnce(new Error("red"));
    await expect(validateTransaction("1")).resolves.toBeNull();
  });

  it("normaliza la transacción", async () => {
    reply({
      success: true,
      data: {
        x_ref_payco: 555,
        x_cod_response: "1",
        x_amount: "69900.00",
        x_currency_code: "COP",
        x_id_invoice: "BRSY-PIZZA-1",
        x_extra1: "BRSY-PIZZA-1",
        x_extra2: "suscripcion",
        x_extra3: "pizza",
        x_franchise: "VS",
        x_test_request: "TRUE",
      },
    });
    await expect(validateTransaction("555")).resolves.toMatchObject({
      refPayco: "555",
      codResponse: 1,
      amount: 69900,
      currency: "COP",
      invoice: "BRSY-PIZZA-1",
      extra2: "suscripcion",
      extra3: "pizza",
      isTest: true,
    });
  });
});
