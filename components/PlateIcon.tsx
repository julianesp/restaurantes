import styles from "./PlateIcon.module.scss";

interface PlateIconProps {
  /** Cantidad de platos en el pedido: el plato de sopa se va llenando (lleno a partir de 5) */
  count: number;
  className?: string;
}

const MAX_LEVEL = 5;

const grow = (on: boolean): React.CSSProperties => ({
  opacity: on ? 1 : 0,
  transform: on ? "scale(1)" : "scale(0.4)",
  transformBox: "fill-box",
  transformOrigin: "50% 80%",
  transition: "opacity 0.35s ease-out, transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)",
});

/**
 * Plato hondo de sopa visto en perspectiva: borde elíptico arriba, pared interior sombreada (da la
 * profundidad), cuerpo que baja hasta la base y el caldo, que sube con la cantidad de platos.
 * Encima del caldo se van sirviendo los alimentos. El vapor solo se activa cuando el botón toca los
 * carbones (data-heat en el botón).
 */
export default function PlateIcon({ count, className }: PlateIconProps) {
  const on = (min: number) => count >= min;
  const level = Math.min(Math.max(count, 0), MAX_LEVEL) / MAX_LEVEL;
  // Nivel del caldo: bajo cuando hay poco (se ve la pared), casi al borde cuando está lleno
  const dy = (1 - level) * 3.2;
  const surface = `translateY(${dy}px) scale(${0.8 + 0.2 * level})`;
  const rise: React.CSSProperties = {
    transform: `translateY(${dy}px)`,
    transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
  };

  return (
    <svg
      viewBox="0 2 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`${styles.svg} ${className ?? ""}`}
    >
      {/* Cuerpo del plato: baja curvo desde el borde hasta la base */}
      <path d="M2 13c0 9 6 15 14 15s14-6 14-15z" fill="currentColor" fillOpacity="0.16" />
      <path d="M10.5 29.5h11" />

      {/* Borde y pared interior sombreada: da la sensación de hondo */}
      <ellipse cx="16" cy="13" rx="14" ry="5" fill="currentColor" fillOpacity="0.1" />
      <ellipse cx="16" cy="13.6" rx="11.8" ry="4" stroke="none" fill="currentColor" fillOpacity="0.32" />
      {/* Fondo del plato, visible solo cuando está vacío */}
      <ellipse cx="16" cy="17.2" rx="7" ry="1.9" stroke="none" fill="currentColor" fillOpacity="0.28" />

      {/* Caldo: la superficie sube y se ensancha a medida que se llena */}
      <ellipse
        cx="16"
        cy="14.6"
        rx="11"
        ry="3.6"
        stroke="none"
        style={{
          fill: "#f59e0b",
          opacity: on(1) ? 1 : 0,
          transform: surface,
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
          transition: "opacity 0.35s ease-out, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />

      {/* Alimentos sobre el caldo (siguen su nivel) */}
      <g stroke="none" style={rise}>
        <ellipse cx="12.4" cy="14.2" rx="3.4" ry="1.9" style={{ ...grow(on(2)), fill: "#92400e" }} />
        <circle cx="19.6" cy="14.6" r="2.1" style={{ ...grow(on(3)), fill: "#86efac" }} />
        <ellipse cx="16" cy="12.9" rx="2.5" ry="1.4" style={{ ...grow(on(4)), fill: "#fcd34d" }} />
        <circle cx="16.4" cy="15.6" r="1" style={{ ...grow(on(5)), fill: "#ef4444" }} />
      </g>

      {/* Vapor: solo hierve cerca de los carbones (lo activa data-heat del botón) */}
      <g strokeWidth="1.5">
        <path className={`${styles.steam} ${styles.s1}`} d="M11 8c-1.6-1.4 1.6-2.6 0-4" />
        <path className={`${styles.steam} ${styles.s2}`} d="M16 7c-1.6-1.4 1.6-2.6 0-4" />
        <path className={`${styles.steam} ${styles.s3}`} d="M21 8c-1.6-1.4 1.6-2.6 0-4" />
      </g>
    </svg>
  );
}
