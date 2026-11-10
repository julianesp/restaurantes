"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { themeCss, validHex } from "@/lib/branding";

/** Color por defecto de Brasaya ("llama"): lo que se muestra mientras el restaurante no elige otro. */
export const DEFAULT_BRAND_COLOR = "#eb810f";

const PRESETS: Array<{ name: string; hex: string }> = [
  { name: "Llama", hex: DEFAULT_BRAND_COLOR },
  { name: "Ají", hex: "#dc2626" },
  { name: "Guayaba", hex: "#db2777" },
  { name: "Uva", hex: "#7c3aed" },
  { name: "Mar", hex: "#2563eb" },
  { name: "Lulo", hex: "#0d9488" },
  { name: "Hoja", hex: "#16a34a" },
  { name: "Panela", hex: "#92400e" },
];

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Contraste del texto blanco sobre el tono 600 del color (el de los botones principales). */
function whiteContrast(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.85));
  const lum = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return 1.05 / (lum + 0.05);
}

interface Props {
  /** "#rrggbb" elegido, o "" para el color por defecto */
  value: string;
  onChange: (hex: string) => void;
  /** Recolorea la página mientras se elige (en la configuración); en el registro solo hay vista previa */
  livePreview?: boolean;
}

/**
 * Selector del color principal del restaurante: paleta de colores listos, selector libre y vista
 * previa. El color se aplica a todo el sitio (lib/branding.ts → themeCss en el layout).
 */
export default function ColorChooser({ value, onChange, livePreview = false }: Props) {
  const hex = validHex(value) ?? "";
  const shown = hex || DEFAULT_BRAND_COLOR;

  // Vista previa en vivo: se añade al final del body para ganarle al tema guardado (mismo selector)
  useEffect(() => {
    if (!livePreview || !hex) return;
    const style = document.createElement("style");
    style.dataset.brandPreview = "";
    style.textContent = themeCss(hex);
    document.body.appendChild(style);
    return () => style.remove();
  }, [livePreview, hex]);

  const poorContrast = hex !== "" && whiteContrast(hex) < 4.5;

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Colores sugeridos" className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = shown === p.hex;
          return (
            <button
              key={p.hex}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={p.name}
              title={p.name}
              onClick={() => onChange(p.hex === DEFAULT_BRAND_COLOR ? "" : p.hex)}
              style={{ backgroundColor: p.hex }}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-white ring-offset-2 transition-transform ring-offset-white dark:ring-offset-gray-900 ${
                active ? "ring-2 ring-gray-900 dark:ring-white" : "hover:scale-110"
              }`}
            >
              {active && <Check aria-hidden className="h-4 w-4" />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          Otro color
          <input
            type="color"
            value={shown}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 rounded border border-gray-300 dark:border-gray-600"
          />
        </label>
        <span className="text-sm text-gray-600 dark:text-gray-300">{hex || "Color por defecto (llama)"}</span>
        {hex && (
          <button type="button" onClick={() => onChange("")} className="text-sm text-primary-600 underline">
            Restablecer
          </button>
        )}
      </div>

      {/* Vista previa con el color elegido, sin depender del tema de la página */}
      <div className="flex items-center gap-3">
        <span
          style={{ backgroundColor: shown }}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow"
        >
          Pedir Ahora
        </span>
        <span style={{ color: shown }} className="text-sm font-semibold">
          Así se verán tus botones y enlaces
        </span>
      </div>

      {poorContrast && (
        <p role="status" className="text-sm text-yellow-700 dark:text-yellow-400">
          Este color es muy claro: el texto blanco de los botones se leerá mal. Prueba con uno más oscuro.
        </p>
      )}
    </div>
  );
}
