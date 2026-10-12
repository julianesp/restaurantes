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
    </div>
  );
}

type CoalData = (typeof FIELD.coals)[number];

function Coal({ c, back = false }: { c: CoalData; back?: boolean }) {
  return (
    <span
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
