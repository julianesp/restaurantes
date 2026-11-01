/**
 * CSV para Excel en español: separador ";" (la coma es el separador decimal), BOM para que respete las
 * tildes, y los valores que empiezan por = + - @ van con un apóstrofo para que Excel no los ejecute como fórmula.
 */
export function toCsv(header: string[], rows: unknown[][]): string {
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
}
