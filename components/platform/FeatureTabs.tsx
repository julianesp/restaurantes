"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Trophy,
  FileText,
  Palette,
  Sparkles,
  BellRing,
  MessagesSquare,
  KeyRound,
  Printer,
  FileDown,
  Star,
  SunMoon,
  Smartphone,
} from "lucide-react";

// Una selección de características por rol (no todas): lo que más valora cada quien
const TABS = [
  {
    id: "dueno",
    label: "Para ti",
    features: [
      { icon: Trophy, title: "Plato de la semana automático", text: "Cada lunes Brasaya elige tu plato más vendido y lo destaca en tu sitio." },
      { icon: Sparkles, title: "Especiales del día", text: "Publica el corrientazo o la oferta de hoy y aparece de primero en tu carta." },
      { icon: FileText, title: "Facturas en PDF", text: "Cada pedido pagado genera su factura lista para descargar o enviar." },
      { icon: Palette, title: "Tu marca, tu estilo", text: "Logo, color, horario, redes y WhatsApp: tu sitio se ve como tu restaurante." },
    ],
  },
  {
    id: "equipo",
    label: "Para tu equipo",
    features: [
      { icon: BellRing, title: "Avisos en Telegram", text: "Cada pedido nuevo llega al instante al celular de la cocina y los meseros." },
      { icon: MessagesSquare, title: "Chat de cocina", text: "Meseros y cocina se escriben dentro de Brasaya, sin grupos de WhatsApp." },
      { icon: KeyRound, title: "Panel de meseros con PIN", text: "Cada mesero entra con su PIN y toma pedidos por mesa desde su celular." },
      { icon: Printer, title: "QR listos para imprimir", text: "Crea los códigos de tus mesas y descárgalos para ponerlos en cada una." },
    ],
  },
  {
    id: "clientes",
    label: "Para tus clientes",
    features: [
      { icon: Smartphone, title: "Sin descargar nada", text: "Abren tu carta desde el navegador del celular y piden en segundos." },
      { icon: FileDown, title: "Carta en PDF", text: "Pueden descargar tu menú completo para compartirlo o verlo después." },
      { icon: Star, title: "Reseñas y sugerencias", text: "Tus clientes califican su visita y te dejan ideas en el buzón." },
      { icon: SunMoon, title: "Claro de día, oscuro de noche", text: "Tu sitio cambia de modo según la hora de Colombia para leerse cómodo." },
    ],
  },
] as const;

export default function FeatureTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });

  // Píldora que se desliza bajo la pestaña activa (solo transform y ancho medido)
  const measure = () => {
    const tab = tabRefs.current[active];
    const list = listRef.current;
    if (!tab || !list) return;
    setPill({ x: tab.offsetLeft, w: tab.offsetWidth, ready: true });
  };
  useLayoutEffect(measure, [active]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  });

  // Teclado: flechas, Inicio y Fin (patrón ARIA de pestañas)
  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = TABS.length - 1;
    let next = active;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const tab = TABS[active];

  return (
    <section id="caracteristicas" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-3 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">Y hay más</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Algunas de las funciones que tu restaurante tiene desde el primer día.
            </p>
          </div>

          <div
            ref={listRef}
            role="tablist"
            aria-label="Características por tipo de usuario"
            onKeyDown={onKeyDown}
            className="relative inline-flex rounded-full border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900"
          >
            <span
              aria-hidden
              className={`absolute bottom-1 left-0 top-1 rounded-full bg-primary-600 transition-[transform,width] duration-300 ease-out ${
                pill.ready ? "opacity-100" : "opacity-0"
              }`}
              style={{ width: pill.w, transform: `translateX(${pill.x}px)` }}
            />
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={i === active}
                aria-controls={`panel-${t.id}`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 sm:px-5 ${
                  i === active ? "text-white" : "text-gray-700 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          className="feature-panel grid gap-4 sm:grid-cols-2"
        >
          {tab.features.map((f) => (
            <article
              key={f.title}
              className="flex gap-4 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="mb-1 font-semibold text-gray-950 dark:text-white">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{f.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
