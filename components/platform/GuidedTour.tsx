"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart,
  BarController,
  LineController,
  DoughnutController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
  type ChartConfiguration,
  type ChartData,
} from "chart.js";
import { BookOpen, QrCode, ChefHat, BarChart3, Ticket, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// Solo lo que usa el recorrido (Chart.js permite registrar por partes y así pesa menos)
Chart.register(
  BarController, LineController, DoughnutController,
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale, Tooltip, Filler,
);

/** Colores tomados de las variables CSS del tema (siguen la marca y el modo claro/oscuro). */
function palette() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const rgb = (name: string, a = 1) => `rgb(${v(name)} / ${a})`;
  const dark = document.documentElement.classList.contains("dark");
  return {
    p300: rgb("--primary-300"),
    p400: rgb("--primary-400"),
    p500: rgb("--primary-500"),
    p600: rgb("--primary-600"),
    p700: rgb("--primary-700"),
    p800: rgb("--primary-800"),
    fill: rgb("--primary-500", dark ? 0.22 : 0.16),
    text: dark ? "rgb(214 211 209)" : "rgb(87 83 78)",
    grid: dark ? "rgb(255 255 255 / 0.07)" : "rgb(28 25 23 / 0.07)",
    surface: dark ? "rgb(28 25 23)" : "rgb(255 255 255)",
  };
}

type Pal = ReturnType<typeof palette>;

/** Configuración de cada paso: tipo, datos y opciones propias (se mezclan con las comunes). */
interface StepChart {
  type: "bar" | "line" | "doughnut";
  data: ChartData<"bar" | "line" | "doughnut">;
  options?: Record<string, unknown>;
}

interface Step {
  icon: typeof BookOpen;
  title: string;
  text: string;
  chartLabel: string;
  /** Resumen del gráfico para lectores de pantalla */
  summary: string;
  config: (c: Pal) => StepChart;
}

// Datos de ejemplo de un restaurante típico (no son métricas reales de clientes)
const STEPS: Step[] = [
  {
    icon: BookOpen,
    title: "Publica tu carta",
    text: "Sube tus platos con foto y precio desde el celular. Los cambios se ven al instante en tu sitio.",
    chartLabel: "Platos por categoría",
    summary: "Carta de ejemplo con 9 platos fuertes, 6 sopas, 8 bebidas, 4 entradas y 5 postres.",
    config: (c) => ({
      type: "doughnut",
      data: {
        labels: ["Platos fuertes", "Sopas", "Bebidas", "Entradas", "Postres"],
        datasets: [{
          data: [9, 6, 8, 4, 5],
          backgroundColor: [c.p600, c.p500, c.p400, c.p300, c.p800],
          borderColor: c.surface,
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: { cutout: "62%" },
    }),
  },
  {
    icon: QrCode,
    title: "Tus clientes piden desde la mesa",
    text: "Cada mesa tiene su código QR: escanean, eligen y el pedido sale sin esperar al mesero.",
    chartLabel: "Pedidos por hora en un día",
    summary: "Los pedidos suben desde las 11 a. m., llegan al pico de 34 a la 1 p. m. y bajan en la tarde.",
    config: (c) => ({
      type: "line",
      data: {
        labels: ["11", "12", "1", "2", "3", "4", "5", "6"],
        datasets: [{
          data: [8, 26, 34, 22, 9, 6, 11, 15],
          borderColor: c.p500,
          backgroundColor: c.fill,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: c.p600,
        }],
      },
    }),
  },
  {
    icon: ChefHat,
    title: "La cocina recibe al instante",
    text: "Los pedidos llegan al panel de cocina y a los meseros por Telegram. Menos papelitos, menos errores.",
    chartLabel: "Minutos promedio hasta servir",
    summary: "El tiempo hasta servir baja de 24 minutos en la primera semana a 13 en la cuarta.",
    config: (c) => ({
      type: "bar",
      data: {
        labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
        datasets: [{
          data: [24, 19, 15, 13],
          backgroundColor: [c.p300, c.p400, c.p500, c.p600],
          borderRadius: 10,
          maxBarThickness: 56,
        }],
      },
    }),
  },
  {
    icon: BarChart3,
    title: "Sabes qué se vende",
    text: "Estadísticas por día, semana y mes: tus platos estrella y los que conviene ajustar.",
    chartLabel: "Platos más vendidos del mes",
    summary: "Los más vendidos: bandeja paisa 142, ajiaco 118, sancocho 97, arepa rellena 85 y jugo natural 74.",
    config: (c) => ({
      type: "bar",
      data: {
        labels: ["Bandeja paisa", "Ajiaco", "Sancocho", "Arepa rellena", "Jugo natural"],
        datasets: [{
          data: [142, 118, 97, 85, 74],
          backgroundColor: c.p500,
          hoverBackgroundColor: c.p600,
          borderRadius: 8,
          maxBarThickness: 28,
        }],
      },
      options: { indexAxis: "y" },
    }),
  },
  {
    icon: Ticket,
    title: "Fidelizas con tiqueteras",
    text: "Vende paquetes de almuerzos y lleva el saldo de cada cliente. Ellos vuelven, tú vendes por adelantado.",
    chartLabel: "Clientes que vuelven cada semana",
    summary: "Los clientes recurrentes pasan de 18 a 41 en ocho semanas.",
    config: (c) => ({
      type: "line",
      data: {
        labels: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"],
        datasets: [{
          data: [18, 21, 24, 27, 31, 34, 38, 41],
          borderColor: c.p600,
          backgroundColor: c.fill,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: c.p500,
        }],
      },
    }),
  },
];

const AUTOPLAY_MS = 6000;

export default function GuidedTour() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [themeTick, setThemeTick] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Avanza solo mientras se ve en pantalla y no está en pausa
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [step, playing, visible]);

  // Re-pintar al cambiar de modo claro/oscuro
  useEffect(() => {
    const mo = new MutationObserver(() => setThemeTick((n) => n + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // Gráfico: se crea de nuevo en cada paso (cambia de tipo) con una entrada corta
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = palette();
    const base = STEPS[step].config(c);
    const isDoughnut = base.type === "doughnut";

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvas, {
      ...base,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reduce ? false : { duration: 700, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.surface,
            titleColor: c.text,
            bodyColor: c.text,
            borderColor: c.grid,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 10,
            displayColors: isDoughnut,
          },
        },
        scales: isDoughnut
          ? undefined
          : {
              x: { grid: { display: false }, border: { display: false }, ticks: { color: c.text, font: { family: "inherit" } } },
              y: { grid: { color: c.grid }, border: { display: false }, ticks: { color: c.text, font: { family: "inherit" } }, beginAtZero: true },
            },
        ...(base.options ?? {}),
      } as ChartConfiguration["options"],
    } as ChartConfiguration);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [step, themeTick]);

  const go = (i: number) => {
    setStep((i + STEPS.length) % STEPS.length);
  };
  const current = STEPS[step];

  return (
    <section
      ref={sectionRef}
      id="recorrido"
      aria-roledescription="recorrido guiado"
      className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <h2 className="mb-3 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">
            Así funciona Brasaya en tu restaurante
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Un recorrido de cinco pasos, de la carta al cliente que vuelve.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Pasos */}
          <ol className="flex flex-col gap-2" aria-label="Pasos del recorrido">
            {STEPS.map((s, i) => {
              const active = i === step;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => {
                      go(i);
                      setPlaying(false);
                    }}
                    aria-current={active ? "step" : undefined}
                    className={`relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-colors duration-200 ${
                      active
                        ? "border-primary-300 bg-white shadow-sm dark:border-primary-700 dark:bg-gray-900"
                        : "border-transparent hover:bg-white/70 dark:hover:bg-gray-900/60"
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                          active
                            ? "bg-primary-600 text-white"
                            : "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                        }`}
                      >
                        <s.icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold text-gray-950 dark:text-white">{s.title}</span>
                        <span
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                            active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <span className="overflow-hidden text-sm text-gray-600 dark:text-gray-300">
                            <span className="block pt-1">{s.text}</span>
                          </span>
                        </span>
                      </span>
                    </span>
                    {/* Progreso del avance automático (solo transform) */}
                    {active && playing && visible && (
                      <span
                        key={step}
                        aria-hidden
                        className="tour-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary-500"
                        style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Gráfico */}
          <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-7">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paso {step + 1} de {STEPS.length}
                </p>
                <h3 className="text-xl font-semibold text-gray-950 dark:text-white" aria-live="polite">
                  {current.chartLabel}
                </h3>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pausar recorrido" : "Reproducir recorrido"}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    go(step - 1);
                    setPlaying(false);
                  }}
                  aria-label="Paso anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    go(step + 1);
                    setPlaying(false);
                  }}
                  aria-label="Paso siguiente"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="relative h-72 sm:h-80">
              <canvas ref={canvasRef} role="img" aria-label={`${current.chartLabel}. ${current.summary}`} />
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Datos de ejemplo de un restaurante típico.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
