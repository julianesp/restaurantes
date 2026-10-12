"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./EmberEdge.module.scss";

/**
 * Borde de carbón encendido para el borde superior del footer: trozos de carbón, brasas que
 * titilan, humo que sube hacia la sección de arriba y alguna chispa suelta.
 *
 * - Solo CSS (transform / opacity), sin trabajo de JS por fotograma.
 * - Se pausa cuando no está en pantalla (IntersectionObserver).
 * - Con "reducir movimiento": brasas encendidas quietas, sin humo ni chispas.
 * - Posiciones pseudoaleatorias con semilla fija (enteros): servidor y navegador generan lo mismo.
 * - Interacción: al pasar el cursor (o tocar) los trozos cercanos se sacuden, las brasas se avivan y
 *   saltan chispitas (Web Animations API, sin re-render de React).
 */

// mulberry32: generador con aritmética entera, idéntico en cualquier motor de JS
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function build() {
  const rand = rng(1295);

  // Carbón de leña: trozos de tronco delgado quemado (alargados, puntas quebradas y grietas
  // transversales). Dos capas: atrás (más pequeños y altos) y delante; las brasas van en medio.
  const coalRow = (count: number, back: boolean) =>
    Array.from({ length: count }, (_, i) => {
      const w = back ? 22 + rand() * 26 : 34 + rand() * 42;
      const h = back ? 7 + rand() * 5 : 10 + rand() * 7;
      // Puntas quebradas: cada esquina entra un poco, distinto en cada trozo
      const j = () => Math.round(rand() * 9);
      const clip = `polygon(${j()}% 0%, ${100 - j()}% ${j()}%, 100% ${30 + j() * 3}%, ${100 - j()}% 100%, ${j()}% ${100 - j()}%, 0% ${40 + j() * 2}%)`;
      // Grietas transversales: líneas finas en posiciones propias (brillan en los trozos al rojo)
      const n = 2 + Math.floor(rand() * 3);
      const cracks = Array.from({ length: n }, (_, k) => Math.round(((k + 0.5 + (rand() - 0.5) * 0.6) / n) * 100));
      const gradient = cracks
        .map((x) => `linear-gradient(90deg, transparent ${x - 1.4}%, var(--crack) ${x}%, transparent ${x + 1.4}%)`)
        .join(", ");
      return {
        left: r2(((i + rand() * 0.8) / count) * 100),
        w: r2(w),
        h: r2(h),
        lift: r2(back ? h * (0.8 + rand() * 0.4) : h * (0.25 + rand() * 0.35)),
        tilt: r2((rand() - 0.5) * (back ? 14 : 10)),
        clip,
        cracks: gradient,
        hot: rand() < (back ? 0.22 : 0.34),
        dur: r2(1.8 + rand() * 2.2),
        delay: r2(-rand() * 4),
      };
    });
  const backCoals = coalRow(34, true);
  const coals = coalRow(40, false);

  const EMBERS = 40;
  const embers = Array.from({ length: EMBERS }, (_, i) => ({
    left: r2(((i + 0.2 + rand() * 0.6) / EMBERS) * 100),
    size: r2(9 + rand() * 14),
    dur: r2(1.4 + rand() * 1.8),
    delay: r2(-rand() * 3),
    lift: r2(rand() * 5),
  }));

  // Columnas de humo: cada una emite un chorro continuo de volutas estrechas que suben toda la
  // pantalla (hasta perderse detrás del navbar), ondulando y abriéndose poco a poco.
  const PLUMES = 8;
  const PUFFS = 16;
  const plumes = Array.from({ length: PLUMES }, (_, i) => {
    const dur = 10 + rand() * 6;
    const phase = rand();
    return {
      left: r2(((i + 0.2 + rand() * 0.6) / PLUMES) * 100),
      dur: r2(dur),
      sway: r2(18 + rand() * 26),
      swayDur: r2(3.5 + rand() * 3),
      swayDelay: r2(-rand() * 6),
      puffs: Array.from({ length: PUFFS }, (_, k) => ({
        w: r2(9 + rand() * 9),
        h: r2(120 + rand() * 70),
        // retrasos repartidos a lo largo del ciclo: el chorro se ve continuo desde el principio
        delay: r2(-((k / PUFFS + phase) % 1) * dur),
        dx: r2((rand() - 0.5) * 140),
        curl: r2((rand() < 0.5 ? -1 : 1) * (30 + rand() * 60)),
      })),
    };
  });

  const SPARKS = 7;
  const sparks = Array.from({ length: SPARKS }, () => ({
    left: r2(4 + rand() * 92),
    dur: r2(2.6 + rand() * 1.8),
    delay: r2(-rand() * 9), // ciclos largos: la chispa solo se ve en el primer tramo
    dx: r2((rand() - 0.5) * 40),
    rise: r2(40 + rand() * 50),
  }));

  return { backCoals, coals, embers, plumes, sparks };
}

const FIELD = build();

type Vars = CSSProperties & Record<`--${string}`, string>;

export default function EmberEdge() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // --- Interacción: remover las brasas con el cursor -------------------------------------------
  const flareRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const lastX = useRef(0);
  const lastPoke = useRef(new WeakMap<Element, number>());

  // Al moverse un trozo: un fogonazo breve en el punto y unas chispitas que saltan y se apagan
  const flare = (leftPct: number, big = false) => {
    const layer = flareRef.current;
    if (!layer || layer.childElementCount > 48) return; // tope de destellos simultáneos

    const flash = document.createElement("span");
    flash.className = styles.flash;
    flash.style.left = `${leftPct}%`;
    layer.appendChild(flash);
    flash
      .animate(
        [
          { transform: "translate3d(-50%, 50%, 0) scale(0.4)", opacity: 0 },
          { transform: "translate3d(-50%, 50%, 0) scale(1.15)", opacity: 1, offset: 0.25 },
          { transform: "translate3d(-50%, 50%, 0) scale(1.4)", opacity: 0 },
        ],
        { duration: 260, easing: "ease-out" },
      )
      .finished.then(() => flash.remove(), () => flash.remove());

    const count = (big ? 5 : 3) + Math.floor(Math.random() * 3);
    for (let n = 0; n < count; n++) {
      const spark = document.createElement("span");
      spark.className = styles.flareSpark;
      const size = 2 + Math.random() * 2;
      spark.style.left = `${leftPct + (Math.random() - 0.5) * 0.8}%`;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      layer.appendChild(spark);
      // Pequeño salto en arco: sube, se abre hacia un lado y cae un poco al apagarse
      const dx = (Math.random() - 0.5) * (big ? 46 : 30);
      const up = (big ? 18 : 10) + Math.random() * (big ? 22 : 16);
      spark
        .animate(
          [
            { transform: "translate3d(-50%, 0, 0) scale(1)", opacity: 1 },
            { transform: `translate3d(calc(-50% + ${dx * 0.6}px), ${-up}px, 0) scale(1)`, opacity: 1, offset: 0.45 },
            { transform: `translate3d(calc(-50% + ${dx}px), ${-up * 0.7}px, 0) scale(0.4)`, opacity: 0 },
          ],
          { duration: 380 + Math.random() * 380, delay: Math.random() * 60, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)", fill: "backwards" },
        )
        .finished.then(() => spark.remove(), () => spark.remove());
    }
  };

  const stir = (clientX: number, burst = false) => {
    const root = ref.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const x = clientX - rect.left;
    const RADIUS = burst ? 90 : 64;
    const now = performance.now();

    root.querySelectorAll<HTMLElement>("[data-coal]").forEach((el) => {
      const cx = (Number(el.dataset.left) / 100) * rect.width;
      const d = Math.abs(cx - x);
      if (d > RADIUS) return;
      const last = lastPoke.current.get(el) ?? 0;
      if (now - last < 380) return; // cada trozo descansa un momento entre sacudidas
      lastPoke.current.set(el, now);
      const k = 1 - d / RADIUS; // más cerca, más fuerte
      const tilt = Number(el.dataset.tilt);
      const base = `translateX(-50%) rotate(${tilt}deg)`;
      // Salto: sube con un giro, cae, rebota un poco y se asienta (más alto cuanto más cerca)
      const lift = (burst ? 20 : 14) * k + 4;
      const side = Math.random() < 0.5 ? -1 : 1;
      el.animate(
        [
          { transform: base, offset: 0 },
          { transform: `translateX(-50%) translate(${side * 2.5 * k}px, ${-lift}px) rotate(${tilt + side * 9 * k}deg)`, offset: 0.32 },
          { transform: `translateX(-50%) translate(${side * 1.5 * k}px, 0px) rotate(${tilt - side * 3 * k}deg)`, offset: 0.62 },
          { transform: `translateX(-50%) translate(${side * 0.6 * k}px, ${-lift * 0.25}px) rotate(${tilt + side * 1.5 * k}deg)`, offset: 0.8 },
          { transform: base, offset: 1 },
        ],
        { duration: 560, easing: "cubic-bezier(0.33, 0.9, 0.4, 1)" },
      );
      if (Math.random() < (burst ? 1 : 0.7) * k + 0.1) flare(Number(el.dataset.left), burst);
    });

    // Las brasas cercanas se avivan
    root.querySelectorAll<HTMLElement>("[data-ember]").forEach((el) => {
      const cx = (Number(el.dataset.left) / 100) * rect.width;
      const d = Math.abs(cx - x);
      if (d > RADIUS * 1.2) return;
      const k = 1 - d / (RADIUS * 1.2);
      el.animate(
        [
          { transform: "translateX(-50%) scale(1)", opacity: 0.8 },
          { transform: `translateX(-50%) scale(${1 + 0.7 * k})`, opacity: 1, offset: 0.3 },
          { transform: "translateX(-50%) scale(1)", opacity: 0.8 },
        ],
        { duration: 700, easing: "ease-out" },
      );
    });
  };

  const reduceMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reduceMotion()) return;
    lastX.current = e.clientX;
    if (!frame.current) {
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        stir(lastX.current);
      });
    }
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (reduceMotion()) return;
    stir(e.clientX, true); // toque o clic: ráfaga más fuerte
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div ref={ref} className={styles.edge} data-active={active || undefined} aria-hidden>
      {/* Humo: sube toda la pantalla y se pierde detrás del navbar */}
      <div className={styles.smokeLayer}>
        {FIELD.plumes.map((p, i) => (
          <div
            key={i}
            className={styles.plume}
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.swayDur}s`,
              animationDelay: `${p.swayDelay}s`,
              "--sway": `${p.sway}px`,
            } as Vars}
          >
            {p.puffs.map((f, k) => (
              <span
                key={k}
                className={styles.puff}
                style={{
                  width: f.w,
                  height: f.h,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${f.delay}s`,
                  "--dx": `${f.dx}px`,
                  "--curl": `${f.curl}px`,
                } as Vars}
              />
            ))}
          </div>
        ))}
        {FIELD.sparks.map((s, i) => (
          <span
            key={i}
            className={styles.spark}
            style={{
              left: `${s.left}%`,
              animationDuration: `${s.dur * 3}s`,
              animationDelay: `${s.delay}s`,
              "--dx": `${s.dx}px`,
              "--rise": `-${s.rise}px`,
            } as Vars}
          />
        ))}
      </div>

      {/* Resplandor bajo las brasas */}
      <div className={styles.glow} />

      {/* Carbón de atrás, brasas en medio y carbón de delante: el fuego asoma entre los trozos */}
      {FIELD.backCoals.map((c, i) => (
        <Coal key={i} c={c} back />
      ))}
      {FIELD.embers.map((e, i) => (
        <span
          key={i}
          data-ember
          data-left={e.left}
          className={styles.ember}
          style={{
            left: `${e.left}%`,
            width: e.size * 1.6,
            height: e.size,
            marginTop: -e.size / 2 - e.lift,
            animationDuration: `${e.dur}s`,
            animationDelay: `${e.delay}s`,
          }}
        />
      ))}
      {FIELD.coals.map((c, i) => (
        <Coal key={i} c={c} />
      ))}

      {/* Fogonazos y chispitas al remover las brasas */}
      <div ref={flareRef} className={styles.flareLayer} />
      {/* Franja sensible al cursor sobre la cama de brasas */}
      <div className={styles.stirZone} onPointerMove={onPointerMove} onPointerDown={onPointerDown} />
    </div>
  );
}

type CoalData = (typeof FIELD.coals)[number];

function Coal({ c, back = false }: { c: CoalData; back?: boolean }) {
  return (
    <span
      data-coal
      data-left={c.left}
      data-tilt={c.tilt}
      className={`${styles.coal} ${back ? styles.back : ""} ${c.hot ? styles.hot : ""}`}
      style={{
        left: `${c.left}%`,
        width: c.w,
        height: c.h,
        marginTop: -c.lift,
        clipPath: c.clip,
        transform: `translateX(-50%) rotate(${c.tilt}deg)`,
        "--cracks": c.cracks,
        "--dur": `${c.dur}s`,
        "--delay": `${c.delay}s`,
      } as Vars}
    />
  );
}
