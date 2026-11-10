/**
 * Animación "volar al carrito": una miniatura del plato sale desde el botón pulsado, describe un
 * arco hasta el botón flotante del carrito ([data-cart-target]) y este da un pequeño salto al recibirla.
 *
 * - Solo transform y opacity (Web Animations API), sin re-render de React.
 * - Con "reducir movimiento" no hay vuelo: el carrito solo da el salto.
 * - Si no hay carrito en pantalla, no hace nada.
 * - Cada pantalla indica su carrito con `target` (selector CSS). La posición del botón se toma al
 *   instante y el destino se busca dos fotogramas después: así funciona aunque el botón desaparezca
 *   al agregar (pasa a controles de cantidad) o el resumen del pedido aparezca con el primer plato.
 */

const SIZE = 56;
const DURATION = 750;
const STEPS = 24;

/** Curva de aceleración: arranca suave y llega rápido, como algo que cae dentro del carrito. */
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function bump(target: Element) {
  target.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.22)" },
      { transform: "scale(0.94)" },
      { transform: "scale(1)" },
    ],
    { duration: 420, easing: "ease-out" }
  );
}

export function flyToCart(from: Element, image?: string | null, target = "[data-cart-target]") {
  if (typeof window === "undefined") return;
  const a = from.getBoundingClientRect();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = document.querySelector(target);
      if (el) fly(a, el, image);
    })
  );
}

function fly(a: DOMRect, target: Element, image?: string | null) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bump(target);
    return;
  }

  const b = target.getBoundingClientRect();
  const x0 = a.left + a.width / 2 - SIZE / 2;
  const y0 = a.top + a.height / 2 - SIZE / 2;
  const x1 = b.left + b.width / 2 - SIZE / 2;
  const y1 = b.top + b.height / 2 - SIZE / 2;

  // Punto de control de la curva: a mitad de camino y bien por encima de ambos extremos (el arco)
  const cx = (x0 + x1) / 2;
  const cy = Math.min(y0, y1) - Math.max(120, Math.abs(x1 - x0) * 0.25);

  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    borderRadius: "9999px",
    zIndex: "60",
    pointerEvents: "none",
    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.35)",
    border: "3px solid white",
    background: image ? `center / cover no-repeat url("${image.replace(/"/g, '\\"')}")` : "rgb(var(--primary-600))",
    willChange: "transform, opacity",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);

  // Curva de Bézier cuadrática muestreada: cada fotograma clave es un punto del arco
  const frames: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = easeInOut(i / STEPS);
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const scale = 1 - 0.65 * t;
    frames.push({
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
      opacity: i === STEPS ? 0.6 : 1,
    });
  }

  const flight = el.animate(frames, { duration: DURATION, easing: "linear", fill: "forwards" });
  const done = () => {
    el.remove();
    bump(target);
  };
  flight.onfinish = done;
  flight.oncancel = () => el.remove();
}
