/**
 * Logo de la plataforma ResFood.
 * - <ResFoodMark />: solo el ícono (campana de servicio sobre placa verde). Mismo dibujo que
 *   public/brand/resfood-mark.svg, en línea para poder heredar tamaño sin pedir otro archivo.
 * - <ResFoodLogo />: ícono + nombre, para cabeceras.
 * Los colores del ícono son fijos (identidad de la plataforma), no siguen el color de cada restaurante.
 */
export function ResFoodMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="ResFood"
      className={className}
    >
      <rect width="64" height="64" rx="15" fill="#1F8150" />
      <circle cx="32" cy="18.5" r="3.2" fill="#FAFAF9" />
      <path d="M13 41a19 19 0 0 1 38 0z" fill="#FAFAF9" />
      <path d="M20.5 36.5a12 12 0 0 1 6.5-9.6" fill="none" stroke="#1F8150" strokeWidth="3" strokeLinecap="round" />
      <rect x="9" y="44" width="46" height="4.5" rx="2.25" fill="#FAFAF9" />
    </svg>
  );
}

export default function ResFoodLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ResFoodMark size={size} />
      <span
        className="font-display font-bold tracking-[-0.03em] text-gray-900 dark:text-gray-50"
        style={{ fontSize: size * 0.68 }}
      >
        Res<span className="text-[#1F8150] dark:text-[#47A16C]">Food</span>
      </span>
    </span>
  );
}
