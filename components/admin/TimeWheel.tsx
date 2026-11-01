"use client";

import { useEffect, useRef } from "react";

const ITEM = 40; // alto de cada número (px)
const VISIBLE = 5; // números visibles: el del centro es el elegido

/**
 * Columna de números que se desliza hacia arriba o hacia abajo (dedo, rueda del mouse o arrastrando)
 * y se detiene en el valor del centro. Con teclado: flechas arriba/abajo.
 */
function WheelColumn({
  items, index, onChange, label,
}: { items: string[]; index: number; onChange: (i: number) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{ y: number; top: number } | null>(null);
  const clamp = (i: number) => Math.max(0, Math.min(items.length - 1, i));

  // Coloca la columna en el valor actual (al abrir, o si cambia desde fuera)
  useEffect(() => {
    const el = ref.current;
    if (el && Math.abs(el.scrollTop - index * ITEM) > 2 && !drag.current) el.scrollTop = index * ITEM;
  }, [index]);

  useEffect(() => () => {
    if (settle.current) clearTimeout(settle.current);
  }, []);

  const snapTo = (i: number, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: i * ITEM, behavior: smooth ? "smooth" : "auto" });
    if (i !== index) onChange(i);
  };

  // Cuando el deslizamiento se detiene, se elige el número que quedó en el centro
  const onScroll = () => {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const el = ref.current;
      if (!el || drag.current) return;
      snapTo(clamp(Math.round(el.scrollTop / ITEM)));
    }, 110);
  };

  // Arrastrar con el mouse (en celular el desplazamiento táctil ya es nativo)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    drag.current = { y: e.clientY, top: ref.current.scrollTop };
    ref.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !ref.current) return;
    ref.current.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const onPointerUp = () => {
    if (!drag.current || !ref.current) return;
    drag.current = null;
    snapTo(clamp(Math.round(ref.current.scrollTop / ITEM)));
  };

  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={index}
      aria-valuetext={items[index]}
      aria-valuemin={0}
      aria-valuemax={items.length - 1}
      onScroll={onScroll}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          snapTo(clamp(index + (e.key === "ArrowUp" ? -1 : 1)));
        }
      }}
      className="relative w-16 cursor-grab touch-pan-y snap-y snap-mandatory overflow-y-scroll overscroll-contain rounded-lg outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-primary-500 active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      style={{
        height: ITEM * VISIBLE,
        maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
      }}
    >
      <div style={{ height: ITEM * Math.floor(VISIBLE / 2) }} aria-hidden />
      {items.map((item, i) => (
        <div
          key={item}
          onClick={() => snapTo(i)}
          className={`flex snap-center select-none items-center justify-center tabular-nums transition-[color,font-size] duration-150 ${
            i === index ? "text-xl font-semibold text-gray-950 dark:text-white" : "text-base text-gray-400 dark:text-gray-500"
          }`}
          style={{ height: ITEM }}
        >
          {item}
        </div>
      ))}
      <div style={{ height: ITEM * Math.floor(VISIBLE / 2) }} aria-hidden />
    </div>
  );
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS = ["a. m.", "p. m."];

/** Selector de hora en ruedas (hora, minutos de 5 en 5, a. m./p. m.). `value` y `onChange` en "HH:MM" de 24 horas. */
export default function TimeWheel({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [h24, m] = value.split(":").map(Number);
  const hourIndex = (h24 % 12 === 0 ? 12 : h24 % 12) - 1;
  const minuteIndex = Math.min(11, Math.round(m / 5));
  const periodIndex = h24 < 12 ? 0 : 1;

  const emit = (hi: number, mi: number, pi: number) => {
    const h12 = hi + 1;
    const h = pi === 0 ? h12 % 12 : (h12 % 12) + 12;
    onChange(`${String(h).padStart(2, "0")}:${MINUTES[mi]}`);
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
      <div className="relative flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 dark:border-gray-700 dark:bg-gray-900">
        {/* Franja que marca el valor elegido */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-1 rounded-lg bg-primary-50 dark:bg-primary-950/50"
          style={{ top: ITEM * Math.floor(VISIBLE / 2), height: ITEM }}
        />
        <div className="relative flex items-center">
          <WheelColumn label={`${label}: hora`} items={HOURS} index={hourIndex} onChange={(i) => emit(i, minuteIndex, periodIndex)} />
          <span className="text-xl font-semibold text-gray-400">:</span>
          <WheelColumn label={`${label}: minutos`} items={MINUTES} index={minuteIndex} onChange={(i) => emit(hourIndex, i, periodIndex)} />
          <WheelColumn label={`${label}: a. m. o p. m.`} items={PERIODS} index={periodIndex} onChange={(i) => emit(hourIndex, minuteIndex, i)} />
        </div>
      </div>
    </div>
  );
}
