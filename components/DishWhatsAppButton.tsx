"use client";

import { MessageCircle } from "lucide-react";
import { useBranding } from "@/context/TenantContext";
import { createDishOrderMessage } from "@/utils/whatsapp";

/**
 * "Pedir por WhatsApp" de un plato concreto: abre el chat del restaurante con el plato, su precio y
 * el enlace de la carta ya escritos, para que el mesero o el dueño sepa qué mandar a preparar.
 * El enlace se arma al pulsar (con el dominio real de la página), así no cambia entre servidor y navegador.
 * Si el restaurante no tiene WhatsApp configurado, no se muestra.
 */
export default function DishWhatsAppButton({
  name, price, className = "", label = "WhatsApp",
}: { name: string; price?: string | null; className?: string; label?: string }) {
  const branding = useBranding();
  if (!branding.whatsapp) return null;

  const open = () => {
    const url = createDishOrderMessage(branding.whatsapp, {
      name,
      price,
      restaurant: branding.name,
      url: `${window.location.origin}/menu`,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Pedir ${name} por WhatsApp`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5b] ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </button>
  );
}
