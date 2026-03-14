"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { generalWhatsAppMessage } from "../../utils/whatsapp";
import SuggestionBox from "../../components/SuggestionBox";
// href=""
import styles from "./Footer.module.scss";

// Iconos SVG personalizados para evitar problemas de HMR
const PhoneIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
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

const MapPinIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
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

const ClockIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
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

const Footer = () => {
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  return (
    <footer
      id="contacto"
      className={`${styles.footer} py-16 px-4 sm:px-6 lg:px-8 shadow-2xl`}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div
          className={`${styles.logoDescription} mb-12 rounded-2xl p-8 bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 hover:bg-white/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]`}
        >
          {/* Logo y título - aparece primero */}
          <div
            className="flex items-center space-x-4 mb-6 justify-center"
            data-aos="fade-right"
          >
            <div className="p-3 rounded-full backdrop-blur-md border w-3/4 flex justify-center hover:scale-125 transition-transform duration-500 cursor-pointer hover:border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:rotate-180">
              <Image
                src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/logo_temporal.png"
                alt="Logo Restaurante"
                width={70}
                height={100}
                className={`object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] ${styles.slideInLogo}`}
              />
            </div>
          </div>

          {/* Texto descriptivo - aparece después de 0.5s */}
          <div data-aos="fade-left">
            <p
              className={`${styles.fadeInText} text-white leading-relaxed text-lg`}
            >
              Experiencia gastronómica única con ingredientes frescos y recetas
              tradicionales. Ofrecemos una gran variedad de platos preparados
              con dedicación y pasión por la buena cocina. Disfruta de nuestras
              especialidades, platos a la carta y opciones personalizadas.
              También atendemos eventos y pedidos especiales.
            </p>
          </div>
        </div>

        {/* Info Sections - Responsive Grid */}
        <div className="grid grid-cols-1 gap-8 max-[425px]:grid-cols-2 max-[425px]:grid-rows-2 min-[426px]:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="max-[425px]:col-start-1 max-[425px]:row-start-1 bg-white/10 backdrop-blur-lg rounded-2xl p-8 transition-all duration-500 hover:bg-white/15 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:scale-[1.03] hover:-translate-y-2 hover:border-white/40">
            <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <PhoneIcon className="h-6 w-6" />
              Contacto
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <PhoneIcon className="h-5 w-5 text-white" />
                </div>
                <div className="block text-white/90 hover:text-white transition-colors cursor-pointer font-medium">
                  300 000 0000
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium">Horario</span>
                  <span className="text-white/80 text-sm">Lunes-Domingo</span>
                  <span className="text-white/80 text-sm">
                    11:00 a.m - 6:00 p.m
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-[425px]:col-start-2 max-[425px]:row-start-1 bg-white/10 backdrop-blur-lg rounded-2xl p-8 transition-all duration-500 hover:bg-white/15 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:scale-[1.03] hover:-translate-y-2 hover:border-white/40">
            <h4 className="text-xl font-bold mb-6 text-white">Síguenos</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-pointer group">
                <Image
                  src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/redes/facebook.png"
                  alt="Facebook"
                  width={20}
                  height={20}
                />
                <span className="text-white/90 group-hover:text-white transition-colors font-medium">
                  Facebook
                </span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-pointer group">
                <Image
                  src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/redes/instagram.png"
                  alt="Instagram"
                  width={20}
                  height={20}
                />
                <span className="text-white/90 group-hover:text-white transition-colors font-medium">
                  Instagram
                </span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-pointer group">
                <Image
                  src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/redes/social%20%281%29.png"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                />
                <span className="text-white/90 group-hover:text-white transition-colors font-medium">
                  WhatsApp
                </span>
              </div>
            </div>
          </div>

          <div className="max-[425px]:col-span-2 max-[425px]:row-start-2 bg-white/10 backdrop-blur-lg rounded-2xl p-8 transition-all duration-500 hover:bg-white/15 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:scale-[1.03] hover:-translate-y-2 hover:border-white/40">
            <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <MapPinIcon className="h-6 w-6" />
              Visítanos
            </h4>
            <div className="space-y-5">
              <div className="flex flex-col space-y-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <MapPinIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">
                    Ubicación Principal
                  </span>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Tu+dirección+aquí"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 ml-14 hover:underline"
                >
                  Tu dirección aquí
                </a>
              </div>

              <button
                onClick={() => setIsSuggestionOpen(true)}
                className="w-full flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white/90 hover:text-white font-medium mt-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Buzón de Sugerencias
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="text-center">
            <p className="text-white/80 text-sm">
              © {new Date().getFullYear()} Restaurante. Todos los derechos
              reservados.
            </p>
            <p className="text-white/60 text-xs mt-2">
              Hecho con ❤️ para los amantes de la buena comida
            </p>
          </div>
        </div>
      </div>

      <SuggestionBox isOpen={isSuggestionOpen} onClose={() => setIsSuggestionOpen(false)} />
    </footer>
  );
};

export default Footer;
