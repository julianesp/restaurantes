"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SuggestionBox from "../../components/SuggestionBox";
import styles from "../../styles/Footer.module.scss";

const PhoneIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/blog", label: "Blog" },
  { href: "/galeria", label: "Galería" },
];

const Footer = () => {
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  return (
    <footer id="contacto" className={styles.footer}>
      {/* Franja decorativa superior */}
      <div
        className="w-full h-1"
        style={{
          background:
            "linear-gradient(90deg, #DE780D 50%, #F7A32A 10%, #DE780D 100%)",
        }}
      />

      <div
        className="w-full px-4 sm:px-6 lg:px-8 py-16"
        style={{ backgroundColor: "#1a0a00" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Grid principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Columna 1 — Marca */}
            <div className="lg:col-span-1 flex flex-col gap-5 items-center text-center">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#DE780D" }}
                >
                  <Image
                    src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/logo_temporal.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-bold text-xl tracking-wide text-center">
                  Restaurante
                </span>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed p-4 text-center">
                Gastronomía tradicional del Valle de Sibundoy, Putumayo.
                Ingredientes frescos, recetas auténticas y el sabor de nuestra
                tierra en cada plato.
              </p>

              {/* Redes sociales */}
              <div className="flex gap-3 mt-1 justify-center">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125"
                  style={{
                    backgroundColor: "#2a1200",
                    color: "#DE780D",
                    border: "1px solid #DE780D33",
                  }}
                >
                  <FacebookIcon />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125"
                  style={{
                    backgroundColor: "#2a1200",
                    color: "#DE780D",
                    border: "1px solid #DE780D33",
                  }}
                  
                >
                  <InstagramIcon />
                </a>
                <a
                  href="#"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125"
                  style={{
                    backgroundColor: "#2a1200",
                    color: "#DE780D",
                    border: "1px solid #DE780D33",
                  }}
                  
                >
                  <WhatsAppIcon />
                </a>
              </div>
            </div>

            {/* Columna 2 — Navegación */}
            <div className="flex flex-col items-center text-center">
              <h4
                className="font-semibold text-base mb-5 uppercase tracking-widest"
                style={{ color: "#DE780D" }}
              >
                Explorar
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 group"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 group-hover:scale-150"
                        style={{ backgroundColor: "#DE780D" }}
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3 — Contacto */}
            <div className="flex flex-col items-center text-center">
              <h4
                className="font-semibold text-base mb-5 uppercase tracking-widest"
                style={{ color: "#DE780D" }}
              >
                Contacto
              </h4>
              <ul className="space-y-4 w-full">
                <li className="flex flex-col items-center gap-1">
                  <span style={{ color: "#DE780D" }}>
                    <PhoneIcon />
                  </span>
                  <p className="text-white text-sm font-medium">Teléfono</p>
                  <a
                    href="tel:+573000000000"
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    +57 300 000 0000
                  </a>
                </li>
                <li className="flex flex-col items-center gap-1">
                  <span style={{ color: "#DE780D" }}>
                    <MapPinIcon />
                  </span>
                  <p className="text-white text-sm font-medium">Dirección</p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Valle+de+Sibundoy+Putumayo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    Valle de Sibundoy, Putumayo
                  </a>
                </li>
                <li className="flex flex-col items-center gap-1">
                  <span style={{ color: "#DE780D" }}>
                    <ClockIcon />
                  </span>
                  <p className="text-white text-sm font-medium">Horario</p>
                  <p className="text-gray-400 text-sm">
                    Lun–Dom: 11:00 am – 6:00 pm
                  </p>
                </li>
              </ul>
            </div>

            {/* Columna 4 — Buzón y pedido */}
            <div className="mb-12 flex flex-col items-center text-center">
              <h4
                className="font-semibold text-base mb-5 uppercase tracking-widest"
                style={{ color: "#DE780D" }}
              >
                Participa
              </h4>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed pt-4 pb-4">
                ¿Tienes una sugerencia o comentario? Nos encanta saber tu
                opinión para mejorar tu experiencia.
              </p>
              <button
                onClick={() => setIsSuggestionOpen(true)}
                className="w-full py-3 px-5 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#DE780D" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                Buzón de Sugerencias
              </button>

              <Link
                href="/menu"
                className="mt-3 w-full py-3 px-5 rounded-lg text-sm font-semibold transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "#2a1200",
                  color: "#DE780D",
                  border: "1px solid #DE780D55",
                }}
              >
                Ver Menú Completo
              </Link>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-white/10 pt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-xs text-center md:text-left">
                © {new Date().getFullYear()} Restaurante — Valle de Sibundoy,
                Putumayo. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SuggestionBox
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
      />
    </footer>
  );
};

export default Footer;
