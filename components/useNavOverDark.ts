"use client";

import { useEffect, useState } from "react";

/**
 * ¿Hay una zona oscura (foto, footer, cabecera de color) detrás del navbar transparente?
 * Las zonas se marcan con el atributo `data-nav-dark`. Solo se vigila la franja superior de la
 * pantalla (la altura del navbar), con IntersectionObserver: nada se calcula en cada scroll.
 */
export function useNavOverDark(bandPx = 76) {
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const visible = new Set<Element>();

    const build = () => {
      io?.disconnect();
      visible.clear();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.add(e.target);
            else visible.delete(e.target);
          }
          setOverDark(visible.size > 0);
        },
        // Recorta el área observada a la franja que queda detrás del navbar
        { rootMargin: `0px 0px -${Math.max(0, window.innerHeight - bandPx)}px 0px` },
      );
      document.querySelectorAll("[data-nav-dark]").forEach((el) => io!.observe(el));
    };

    build();
    // Algunas zonas se montan después (contenido cargado en el cliente) o cambia el tamaño
    let pending = 0;
    const rebuild = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(build);
    };
    const mo = new MutationObserver((records) => {
      if (records.some((r) => Array.from(r.addedNodes).some((n) => n instanceof Element && (n.matches("[data-nav-dark]") || n.querySelector("[data-nav-dark]"))))) {
        rebuild();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", rebuild);

    return () => {
      io?.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", rebuild);
      cancelAnimationFrame(pending);
    };
  }, [bandPx]);

  return overDark;
}
