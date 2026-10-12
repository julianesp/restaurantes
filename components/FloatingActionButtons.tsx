"use client";

import { useEffect, useRef } from "react";
import PulseAnimation from "./PulseAnimation";
import styles from "./FloatingActionButtons.module.scss";

interface FloatingActionButtonsProps {
  onReservaClick: () => void;
  onPedirClick: () => void;
}

/**
 * Botón flotante "Pedir Ahora". Va fijo abajo en el centro y no pasa por encima del footer: se
 * detiene en su borde (las brasas), rebota, se quema hasta desaparecer y vuelve a aparecer cuando
 * el usuario sube. Todo con transform / clip-path y data-state, sin re-render de React.
 */
export default function FloatingActionButtons({ onPedirClick }: FloatingActionButtonsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    const btn = btnRef.current;
    if (!el || !btn) return;
    // En algunas páginas el footer se monta después que el navbar: se espera a que aparezca
    let cleanup: (() => void) | undefined;
    const attach = (footer: HTMLElement) => {
      cleanup = follow(el, btn, footer);
    };
    const found = document.querySelector("footer");
    if (found) {
      attach(found);
      return () => cleanup?.();
    }
    const mo = new MutationObserver(() => {
      const footer = document.querySelector("footer");
      if (footer) {
        mo.disconnect();
        attach(footer);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed bottom-6 left-1/2 z-30 flex items-center justify-center gap-3"
      style={{ transform: "translate3d(-50%, 0, 0)" }}
    >
      <PulseAnimation interval={5000} duration={1200}>
        <div className={styles.btnWrap}>
          <button
            ref={btnRef}
            onClick={onPedirClick}
            className={`${styles.btn} w-max rounded-full bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-900/25 hover:bg-primary-700`}
          >
            Pedir Ahora
          </button>
          <span aria-hidden className={styles.front} />
          <span aria-hidden className={styles.puff} />
        </div>
      </PulseAnimation>
    </div>
  );
}

type BurnState = "idle" | "burn" | "burned" | "back";

/**
 * Sube el botón lo que el footer ocupa en pantalla y maneja el ciclo de quemado:
 * idle -> (toca el footer) burn -> burned -> (el usuario sube) back -> idle.
 * Devuelve la limpieza.
 */
function follow(el: HTMLElement, btn: HTMLElement, footer: HTMLElement) {
  const GAP = 6; // el botón se apoya casi encima de las brasas
  const BOTTOM = 24; // bottom-6: distancia normal al borde inferior de la pantalla
  const RESET = 80; // cuánto hay que subir (px) para que vuelva a aparecer
  let state: BurnState = "idle";
  let frame = 0;

  const setState = (next: BurnState) => {
    state = next;
    if (next === "idle") delete el.dataset.state;
    else el.dataset.state = next;
  };

  const onAnimationEnd = (event: AnimationEvent) => {
    const name = event.animationName;
    if (state === "burn" && (name.includes("bf-consume") || name.includes("bf-fade"))) setState("burned");
    if (state === "back" && name.includes("bf-appear")) setState("idle");
  };
  btn.addEventListener("animationend", onAnimationEnd);

  const update = () => {
    frame = 0;
    // Cuánto del footer se ve en pantalla; el botón sube lo justo para quedar sobre su borde
    const overlap = window.innerHeight - footer.getBoundingClientRect().top;
    const lift = Math.max(0, overlap - BOTTOM + GAP);
    el.style.transform = `translate3d(-50%, ${-lift}px, 0)`;

    if (lift > 0 && (state === "idle" || state === "back")) {
      el.style.setProperty("--btn-h", `${btn.offsetHeight}px`);
      setState("burn");
    } else if (overlap - BOTTOM + GAP < -RESET && (state === "burn" || state === "burned")) {
      setState("back");
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  // Solo se escucha el scroll mientras el footer está cerca de la pantalla
  let listening = false;
  const start = () => {
    if (listening) return;
    listening = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
  };
  const stop = () => {
    if (!listening) return;
    listening = false;
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    el.style.transform = "translate3d(-50%, 0, 0)";
    if (state === "burn" || state === "burned") setState("back");
  };
  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
    rootMargin: `0px 0px ${RESET + 120}px 0px`,
  });
  io.observe(footer);

  return () => {
    io.disconnect();
    stop();
    btn.removeEventListener("animationend", onAnimationEnd);
    if (frame) cancelAnimationFrame(frame);
  };
}
