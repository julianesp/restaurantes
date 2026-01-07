"use client";

import React from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, ChefHat } from "lucide-react";
import { generalWhatsAppMessage } from "../../utils/whatsapp";
// href=""
import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer
      id="contacto"
      className={`${styles.footer} py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 shadow-2xl`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div
          className={`${styles.logoDescription} mb-8 rounded-xl p-6 bg-white/20 dark:bg-black/30 backdrop-blur-md shadow-[0_8px_16px_rgba(0,0,0,0.3),0_-2px_8px_rgba(255,255,255,0.1)_inset,0_2px_8px_rgba(0,0,0,0.2)_inset] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_-2px_8px_rgba(255,255,255,0.05)_inset,0_2px_8px_rgba(0,0,0,0.3)_inset] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.4),0_-4px_12px_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.3)_inset] animate-[bulge_0.6s_ease-in-out] hover:animate-none`}
        >
          {/* Logo y título - aparece primero */}
          <div
            className="flex items-center space-x-2 mb-4"
            data-aos="fade-right"
          >
            <ChefHat className={`h-8 w-8 text-white ${styles.slideInLogo}`} />
            <h3
              className={`text-2xl font-bold text-white ${styles.slideInLogo}`}
            >
              Tu Restaurante
            </h3>
          </div>

          {/* Texto descriptivo - aparece después de 0.5s */}
          <div data-aos="fade-left">
            <p
              className={`${styles.fadeInText} text-white dark:text-gray-100 leading-relaxed`}
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
        <div className="grid grid-cols-1 gap-6 max-[425px]:grid-cols-2 max-[425px]:grid-rows-2 min-[426px]:grid-cols-2 lg:grid-cols-3">
          <div className="max-[425px]:col-start-1 max-[425px]:row-start-1 bg-white/15 dark:bg-black/25 backdrop-blur-md rounded-xl p-6 transition-all duration-500 hover:bg-white/20 dark:hover:bg-black/35 shadow-[0_8px_16px_rgba(0,0,0,0.3),0_-2px_8px_rgba(255,255,255,0.1)_inset,0_2px_8px_rgba(0,0,0,0.2)_inset] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_-2px_8px_rgba(255,255,255,0.05)_inset,0_2px_8px_rgba(0,0,0,0.3)_inset] hover:shadow-[0_16px_32px_rgba(0,0,0,0.4),0_-4px_12px_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.3)_inset] hover:scale-[1.05] hover:-translate-y-1 hover:border hover:border-white">
            <h4 className="text-lg font-bold mb-4 text-white">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-white" />
                {/* <Link
                  href="tel:+573000000000"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  300 000 0000
                </Link> */}

                <div className="block text-white/90 hover:text-white transition-colors cursor-pointer">
                  300 000 0000
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-white" />
                <span className="text-white/90">
                  Lunes-Domingo: 11:00 a.m - 6:00 p.m
                </span>
              </div>
            </div>
          </div>

          <div className="max-[425px]:col-start-2 max-[425px]:row-start-1 bg-white/15 dark:bg-black/25 backdrop-blur-md rounded-xl p-6 transition-all duration-500 hover:bg-white/20 dark:hover:bg-black/35 shadow-[0_8px_16px_rgba(0,0,0,0.3),0_-2px_8px_rgba(255,255,255,0.1)_inset,0_2px_8px_rgba(0,0,0,0.2)_inset] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_-2px_8px_rgba(255,255,255,0.05)_inset,0_2px_8px_rgba(0,0,0,0.3)_inset] hover:shadow-[0_16px_32px_rgba(0,0,0,0.4),0_-4px_12px_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.3)_inset] hover:scale-[1.05] hover:-translate-y-1">
            <h4 className="text-lg font-bold mb-4 text-white">Síguenos</h4>
            <div className="space-y-2">
              <div className="block text-white/90 hover:text-white transition-colors cursor-pointer">
                Facebook
              </div>

              <div className="block text-white/90 hover:text-white transition-colors cursor-pointer">
                Instagram
              </div>

              <div className="block text-white/90 hover:text-white transition-colors cursor-pointer">
                WhatsApp
              </div>

              {/* <Link
                href={generalWhatsAppMessage()}
                // href=""
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                WhatsApp
              </Link> */}
            </div>
          </div>

          <div className="max-[425px]:col-span-2 max-[425px]:row-start-2 bg-white/15 dark:bg-black/25 backdrop-blur-md rounded-xl p-6 transition-all duration-500 hover:bg-white/20 dark:hover:bg-black/35 shadow-[0_8px_16px_rgba(0,0,0,0.3),0_-2px_8px_rgba(255,255,255,0.1)_inset,0_2px_8px_rgba(0,0,0,0.2)_inset] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_-2px_8px_rgba(255,255,255,0.05)_inset,0_2px_8px_rgba(0,0,0,0.3)_inset] hover:shadow-[0_16px_32px_rgba(0,0,0,0.4),0_-4px_12px_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.3)_inset] hover:scale-[1.05] hover:-translate-y-1">
            <h4 className="text-lg font-bold mb-4 text-white">Visítanos</h4>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    Ubicación Principal
                  </span>
                </div>
                <span className="text-white/80 ml-7">Tu dirección aquí</span>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Sucursal</span>
                </div>
                <span className="text-white/80 ml-7">
                  Dirección de sucursal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
