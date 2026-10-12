"use client";

import Image from "next/image";
import { useBranding } from "@/context/TenantContext";

/** Logo del restaurante; si no tiene, muestra un círculo con su inicial. */
export default function BrandLogo({ size, className = "" }: { size: number; className?: string }) {
  const { logoUrl, name } = useBranding();

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
