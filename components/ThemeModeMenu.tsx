"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Moon, Sun, SunMoon } from "lucide-react";
import { useThemeMode } from "@/components/ThemeMode";
import type { ThemeMode } from "@/lib/theme-schedule";

const OPTIONS: Array<{ mode: ThemeMode; label: string; hint: string; Icon: typeof Sun }> = [
  { mode: "auto", label: "Automático", hint: "Claro de día, oscuro de noche", Icon: SunMoon },
  { mode: "light", label: "Siempre claro", hint: "", Icon: Sun },
  { mode: "dark", label: "Siempre oscuro", hint: "", Icon: Moon },
];

interface Props {
  /** Clases del botón (cada barra tiene su propio estilo) */
  className: string;
  /** Contenido del botón: recibe si el sitio está oscuro ahora */
  children: (isDark: boolean) => React.ReactNode;
  floating?: boolean;
}

/**
 * Botón de tema con menú de tres opciones: automático (por la hora), siempre claro, siempre oscuro.
 * El menú es `fixed` y se coloca junto al botón, así no lo recortan las barras con overflow.
 */
export default function ThemeModeMenu({ className, children, floating = false }: Props) {
  const { mode, setMode, isDark } = useThemeMode();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const top = r.bottom + 8;
      // Si el botón está en la mitad derecha, el menú se alinea a su borde derecho
      setPos(r.left > window.innerWidth / 2 ? { top, right: Math.max(8, window.innerWidth - r.right) } : { top, left: Math.max(8, r.left) });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.mode === mode)!;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-theme-toggle
        data-floating={floating || undefined}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Tema: ${current.label}`}
        title={`Tema: ${current.label}`}
        className={className}
      >
        {children(isDark)}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Modo de color del sitio"
          style={{ top: pos.top, left: pos.left, right: pos.right }}
          className="fixed z-[70] w-64 origin-top rounded-2xl border border-gray-900/[0.08] bg-white p-1.5 shadow-xl shadow-gray-900/10 dark:border-white/10 dark:bg-gray-900 dark:shadow-black/40"
        >
          {OPTIONS.map(({ mode: m, label, hint, Icon }) => {
            const active = m === mode;
            return (
              <button
                key={m}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setMode(m);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${
                  active
                    ? "bg-primary-50 text-primary-800 dark:bg-white/[0.08] dark:text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.06]"
                }`}
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{label}</span>
                  {hint && <span className="block text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
                </span>
                {active && <Check aria-hidden className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
