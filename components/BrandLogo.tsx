"use client";

import Image from "next/image";
import { useBranding } from "@/context/TenantContext";
import { BrasayaMark } from "@/components/BrasayaLogo";

/** Logo del restaurante; si no tiene, muestra un círculo con su inicial. */
export default function BrandLogo({ size, className = "" }: { size: number; className?: string }) {
  const { logoUrl, name } = useBranding();

  // Logo de Brasaya: en línea (no <img>) para que la llama pueda animarse al pasar el mouse
  if (logoUrl === "/brand/brasaya-mark.svg") {
    return <BrasayaMark size={size} className={className} />;
  }

  // Otros SVG: <img> directo, el optimizador de imágenes no procesa SVG
  if (logoUrl && /\.svg($|\?)/i.test(logoUrl)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={`Logo ${name}`} width={size} height={size} className={className} />
    );
  }

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`Logo ${name}`}
        title={`Logo ${name}`}
        width={size}
        height={size}
        className={className}
        priority
      />
    );
  }

  return (
    <span
      aria-label={`Logo ${name}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      className="inline-flex items-center justify-center rounded-full bg-primary-500 text-white font-bold select-none"
    >
      {name.trim().charAt(0).toUpperCase() || "R"}
    </span>
  );
}
