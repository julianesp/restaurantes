// lib/csv.ts: exportaciones del panel que se abren en Excel.
import { toCsv } from "@/lib/csv";

it("usa ; como separador, BOM y CRLF", () => {
  expect(toCsv(["a", "b"], [[1, "x"]])).toBe("﻿a;b\r\n1;x");
});

it("escapa comillas, separadores y saltos de línea", () => {
  expect(toCsv(["n"], [['La "Brasa"; sede 2\nnorte']]).split("\r\n")[1]).toBe('"La ""Brasa""; sede 2\nnorte"');
});

it("neutraliza fórmulas (inyección de CSV) y deja vacíos los nulos", () => {
  const [, row] = toCsv(["a", "b", "c", "d"], [["=HYPERLINK(\"x\")", "+57300", "@SUM(A1)", null]]).split("\r\n");
  expect(row).toBe(`"'=HYPERLINK(""x"")";'+57300;'@SUM(A1);`);
});
