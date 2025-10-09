"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import Image from "next/image";

const FloatingFooter = () => {
  const [menuOption, setMenuOptions] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const flechaRef = useRef<HTMLButtonElement>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const whatsappNumber = "3123946614";
  const facebookUrl = "https://www.facebook.com/saboreospizza";
  const instagramUrl = "https://www.instagram.com/saboreospizza/";

  const switchOptions = () => {
    setMenuOptions(!menuOption);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Control de pulsaciones
  useEffect(() => {
    if (!isClient) return;

    const startPulseAnimation = () => {
      setShowPulse(true);
      pulseTimeoutRef.current = setTimeout(() => {
        setShowPulse(false);
      }, 2000); // Mostrar pulsación por 2 segundos
    };

    // Iniciar inmediatamente y repetir cada 10 segundos
    startPulseAnimation(); // Primera pulsación inmediata
    const interval = setInterval(startPulseAnimation, 10000); // Repetir cada 10 segundos

    return () => {
      clearInterval(interval);
      const currentTimeout = pulseTimeoutRef.current;
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        flechaRef.current &&
        !flechaRef.current.contains(event.target as Node)
      ) {
        setMenuOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isClient]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      const currentTimeout = pulseTimeoutRef.current;
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, []);

  const createWhatsAppMessage = () => {
    const message = "¡Hola! Me gustaría hacer un pedido de pizza.";
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        ref={flechaRef}
        onClick={switchOptions}
        className="fixed bottom-4 left-4 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group cursor-pointer"
        aria-label="Abrir redes sociales"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className={`h-6 w-6 transition-transform duration-300 ${
            menuOption ? "rotate-45" : ""
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>

        {/* Pulse animation when closed */}
        {!menuOption && showPulse && (
          <div className="absolute inset-0 rounded-full bg-emerald-600 animate-ping opacity-30"></div>
        )}
      </button>

      {/* Social Media Menu */}
      {isClient && (
        <div
          ref={menuRef}
          className={`fixed bottom-20 left-4 z-40 transition-all duration-300 ${
            menuOption
              ? "opacity-100 transform translate-y-0 scale-100"
              : "opacity-0 transform translate-y-4 scale-95 pointer-events-none"
          }`}
        >
          <div className="flex flex-col gap-3">
            {/* WhatsApp */}
            <Link
              href={createWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12   transition-all duration-300 flex items-center justify-center group"
              title="WhatsApp"
            >
              {/* <MessageCircle className="h-6 w-6" /> */}
              <Image
                src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/redes/social%20%281%29.png"
                alt="Facebook"
                width={48}
                height={48}
              />
            </Link>

            {/* Facebook */}
            <Link
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12   transition-all duration-300 flex items-center justify-center group"
              title="Facebook"
            >
              {/* <Facebook className="h-6 w-6" /> */}
              <Image
                src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/redes/facebook.png"
                alt="Facebook"
                width={48}
                height={48}
              />
            </Link>

            {/* Instagram */}
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12   transition-all duration-300 flex items-center justify-center group"
              title="Instagram"
            >
              <Image
                src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/redes/instagram.png"
                alt="Facebook"
                width={48}
                height={48}
              />
            </Link>

            {/* Phone */}
            <Link
              href={`tel:+57${whatsappNumber}`}
              className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
              title="Llamar"
            >
              <Phone className="h-6 w-6" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingFooter;
