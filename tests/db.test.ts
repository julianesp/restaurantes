// lib/db.ts: D1 no tiene RLS, así que estos helpers son la barrera entre restaurantes.

import { fakeD1 } from "./mocks/cloudflare-workers";
import { all, deleteOwned, first, insert, isUniqueViolation, pick, run, updateOwned } from "@/lib/db";

beforeEach(() => fakeD1.reset());

describe("pick", () => {
  const ALLOWED = ["name", "price", "is_available"] as const;

  it("descarta restaurant_id, id y cualquier campo no permitido del cuerpo", () => {
    const body = {
      name: "Bandeja",
      price: 25000,
      restaurant_id: "otro-restaurante",
      id: "otro-id",
      created_at: "2020-01-01",
      "name = 'x'; --": "inyección",
    };
    expect(pick(body, ALLOWED)).toEqual({ name: "Bandeja", price: 25000 });
  });

  it("omite valores undefined pero conserva null y false", () => {
    expect(pick({ name: undefined, price: null, is_available: false }, ALLOWED)).toEqual({
      price: null,
      is_available: false,
    });
  });

  it("no se deja engañar por claves heredadas del prototipo", () => {
    const body = JSON.parse('{"__proto__": {"restaurant_id": "x"}, "name": "a"}');
    expect(pick(body, [...ALLOWED, "restaurant_id"])).not.toHaveProperty("restaurant_id", "x");
  });
});

describe("updateOwned", () => {
  it("siempre filtra por id Y restaurant_id, con parámetros (no interpolación)", async () => {
    fakeD1.respond = () => ({ id: "item-1" });
    await updateOwned("menu_items", "rest-A", "item-1", { name: "Nuevo" });

    const [call] = fakeD1.calls;
    expect(call.sql).toMatch(/^UPDATE menu_items SET name = \?, updated_at = \? WHERE id = \? AND restaurant_id = \? RETURNING \*$/);
    expect(call.params[0]).toBe("Nuevo");
    expect(call.params.slice(-2)).toEqual(["item-1", "rest-A"]);
  });

  it("sin columnas solo lee la fila del mismo restaurante", async () => {
    await updateOwned("menu_items", "rest-A", "item-1", {}, { touchUpdatedAt: false });
    expect(fakeD1.calls[0].sql).toBe("SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ?");
    expect(fakeD1.calls[0].params).toEqual(["item-1", "rest-A"]);
  });

  it("devuelve null si la fila no es de ese restaurante", async () => {
    fakeD1.respond = () => null;
    await expect(updateOwned("menu_items", "rest-A", "item-de-B", { name: "x" })).resolves.toBeNull();
  });

  it.each([
    ["nombre de tabla", "menu_items; DROP TABLE restaurants", { name: "x" }],
    ["nombre de columna", "menu_items", { "name = 'x', restaurant_id": "y" }],
    ["columna con mayúsculas/espacios", "menu_items", { "Name ": "y" }],
  ])("rechaza identificadores SQL no válidos (%s)", async (_label, table, values) => {
    await expect(updateOwned(table, "rest-A", "id", values)).rejects.toThrow(/Identificador SQL no válido/);
    expect(fakeD1.calls).toHaveLength(0);
  });

  it("no añade updated_at a tablas que no lo tienen", async () => {
    await updateOwned("restaurant_members", "rest-A", "m-1", { role: "admin" });
    expect(fakeD1.calls[0].sql).not.toContain("updated_at");
  });
});

describe("deleteOwned", () => {
  it("filtra por id Y restaurant_id", async () => {
    fakeD1.respond = () => ({ changes: 1 });
    await expect(deleteOwned("menu_items", "rest-A", "item-1")).resolves.toBe(true);
    expect(fakeD1.calls[0].sql).toBe("DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?");
    expect(fakeD1.calls[0].params).toEqual(["item-1", "rest-A"]);
  });

  it("devuelve false si no borró nada (fila de otro restaurante)", async () => {
    await expect(deleteOwned("menu_items", "rest-A", "item-de-B")).resolves.toBe(false);
  });

  it("rechaza nombres de tabla no válidos", async () => {
    await expect(deleteOwned("menu_items WHERE 1=1 --", "rest-A", "x")).rejects.toThrow();
    expect(fakeD1.calls).toHaveLength(0);
  });
});

describe("insert", () => {
  it("genera el id en el servidor y valida columnas", async () => {
    fakeD1.respond = (c) => ({ id: c.params[0] });
    await insert("menu_items", { name: "x", restaurant_id: "rest-A" });
    const [call] = fakeD1.calls;
    expect(call.sql).toBe("INSERT INTO menu_items (id, name, restaurant_id) VALUES (?, ?, ?) RETURNING *");
    expect(call.params[0]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("un id del cuerpo no sustituye al generado si se pasa por pick()", async () => {
    fakeD1.respond = () => ({ id: "ok" });
    await insert("menu_items", pick({ id: "elegido-por-el-cliente", name: "x" }, ["name"]));
    expect(fakeD1.calls[0].params[0]).not.toBe("elegido-por-el-cliente");
  });

  it("rechaza columnas no válidas", async () => {
    await expect(insert("menu_items", { "name) VALUES ('x'); --": "y" })).rejects.toThrow();
  });
});

describe("conversión de valores", () => {
  it("booleanos van como 0/1 y undefined como null", async () => {
    await run("UPDATE t SET a = ?, b = ?, c = ?", true, false, undefined);
    expect(fakeD1.calls[0].params).toEqual([1, 0, null]);
  });

  it("columnas booleanas y settings se convierten al leer", async () => {
    fakeD1.respond = () => [{ is_available: 1, active: 0, settings: '{"demo":true}', other: 1 }];
    await expect(all("SELECT")).resolves.toEqual([{ is_available: true, active: false, settings: { demo: true }, other: 1 }]);
  });

  it("settings con JSON corrupto se lee como objeto vacío", async () => {
    fakeD1.respond = () => ({ settings: "{no es json" });
    await expect(first("SELECT")).resolves.toEqual({ settings: {} });
  });
});

it("isUniqueViolation reconoce el error de SQLite", () => {
  expect(isUniqueViolation(new Error("D1_ERROR: UNIQUE constraint failed: restaurants.slug"))).toBe(true);
  expect(isUniqueViolation(new Error("otro"))).toBe(false);
  expect(isUniqueViolation("UNIQUE constraint failed")).toBe(false);
});
