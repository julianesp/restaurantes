/**
 * Logo de la plataforma Brasaya.
 * - <BrasayaMark />: solo el ícono (llama con núcleo dorado sobre un plato, en placa color llama). Mismo
 *   dibujo que public/brand/brasaya-mark.svg, en línea para poder heredar tamaño sin pedir otro archivo.
 * - <BrasayaLogo />: ícono + nombre, para cabeceras.
 * Los colores del ícono son fijos (identidad de la plataforma), no siguen el color de cada restaurante.
 */
export function BrasayaMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="Brasaya"
      className={className}
    >
      <rect width="64" height="64" rx="15" fill="#D0730E" />
      <path
        d="M32 8c4 8 14 13 14 25.5C46 42 39.7 48 32 48s-14-6-14-14.5c0-5.5 2.8-9.5 6-12.2.3 4.6 2.2 7.6 5.5 8.8C28.5 22.4 29.2 15 32 8z"
        fill="#FAFAF9"
      />
      <path
        d="M32.5 31c2 3.2 5.5 5 5.5 9 0 3.3-2.6 5.8-5.7 5.8-3 0-5.3-2.3-5.3-5.4 0-3.6 3.2-5.6 5.5-9.4z"
        fill="#FFD166"
      />
      <rect x="10" y="51" width="44" height="5" rx="2.5" fill="#FAFAF9" />
    </svg>
  );
}

export default function BrasayaLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrasayaMark size={size} />
      <span
        className="font-display font-bold tracking-[-0.03em] text-gray-900 dark:text-gray-50"
        style={{ fontSize: size * 0.68 }}
      >
        Brasa<span className="text-[#AD5C0B] dark:text-[#F6982C]">ya</span>
      </span>
    </span>
  );
}
