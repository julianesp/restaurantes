"use client";

import React from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, ChefHat } from "lucide-react";
import { generalWhatsAppMessage } from "../../utils/whatsapp";
import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer
      id="contacto"
      className={`${styles.footer} bg-primary-600/80 py-16 px-4 sm:px-6 lg:px-8 shadow-md `}
    >
      <div className="max-w-6xl mx-auto ">
        {/* Header Section */}
        <div className="mb-8 rounded-xl p-6 border border-white/90  shadow-[0_8px_16px_rgba(0,0,0,0.3),0_-2px_8px_rgba(255,255,255,0.1)_inset,0_2px_8px_rgba(0,0,0,0.2)_inset] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_-2px_8px_rgba(255,255,255,0.05)_inset,0_2px_8px_rgba(0,0,0,0.3)_inset] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,0,0,0.4),0_-4px_12px_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.3)_inset] animate-[bulge_0.6s_ease-in-out] hover:animate-none cursor-pointer">
          <div className="flex items-center space-x-2 mb-4">
            <ChefHat className="h-8 w-8" />
            <h3 className="text-2xl font-bold text-black">Tu Restaurante</h3>
          </div>
          <p className="text-black">
            Experiencia gastronómica única con ingredientes frescos y recetas
            tradicionales. Ofrecemos una gran variedad de platos preparados con
            dedicación y pasión por la buena cocina. Disfruta de nuestras
            especialidades, platos a la carta y opciones personalizadas. También
            atendemos eventos y pedidos especiales.
          </p>
        </div>

        {/* Info Sections - Responsive Grid */}
        <div className="grid grid-cols-1 gap-6 max-[425px]:grid-cols-2 max-[425px]:grid-rows-2 min-[426px]:grid-cols-2 lg:grid-cols-3">
          {/* Contacto - Mobile: Top Left, Desktop: Column 1 */}
          <div className="max-[425px]:col-start-1 max-[425px]:row-start-1 bg-white/10  backdrop-blur-sm rounded-xl p-6 border border-white/90  transition-all duration-500 hover:bg-white/15  shadow-[0_8px_16px_rgba(0,0,0,0.3),0_-2px_8px_rgba(255,255,255,0.1)_inset,0_2px_8px_rgba(0,0,0,0.2)_inset] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_-2px_8px_rgba(255,255,255,0.05)_inset,0_2px_8px_rgba(0,0,0,0.3)_inset] hover:shadow-[0_16px_32px_rgba(0,0,0,0.4),0_-4px_12px_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.3)_inset] hover:scale-[1.05] hover:-translate-y-1 cursor-pointer">
            <h4 className="text-lg font-bold mb-4 text-white">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-white/80 dark:text-primary-400" />
                <Link
                  href="tel:+573000000000"
                  className="text-white/90 dark:text-gray-200 hover:text-white dark:hover:text-primary-400 transition-colors font-medium"
                >
                  300 000 0000 0
                </Link>
              </div>

              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-white/80 dark:text-primary-400" />
                <span className="text-white/90 dark:text-gray-200">
                  Lunes-Domingo: 7:00 a.m - 6:00 p.m
                </span>
              </div>
            </div>
          </div>

          <div className="max-[425px]:col-start-2 max-[425px]:row-start-1 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/30 transition-all duration-500 hover:bg-white/15 dark:hover:bg-gray-800/30 shadow-[0_8px_16px_rgba(0,0,0,0.3),0_-2px_8px_rgba(255,255,255,0.1)_inset,0_2px_8px_rgba(0,0,0,0.2)_inset] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_-2px_8px_rgba(255,255,255,0.05)_inset,0_2px_8px_rgba(0,0,0,0.3)_inset] hover:shadow-[0_16px_32px_rgba(0,0,0,0.4),0_-4px_12px_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.3)_inset] hover:scale-[1.05] hover:-translate-y-1 cursor-pointer">
            <h4 className="text-lg font-bold mb-4 text-white">Síguenos</h4>
            <div className="space-y-2">
              <div className="block text-white/90 dark:text-gray-200 hover:text-white dark:hover:text-primary-400 transition-colors cursor-pointer">
                Facebook
              </div>

              <div className="block text-white/90 dark:text-gray-200 hover:text-white dark:hover:text-primary-400 transition-colors cursor-pointer">
                Instagram
              </div>

              <Link
                href={generalWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/90 dark:text-gray-200 hover:text-white dark:hover:text-primary-400 transition-colors cursor-pointer"
              >
                WhatsApp
              </Link>
            </div>
          </div>

          {/* Visítanos - Mobile: Bottom (spans both columns), Desktop: Column 3 */}
          <div className="max-[425px]:col-span-2 max-[425px]:row-start-2 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/30 transition-all duration-500 hover:bg-white/15 dark:hover:bg-gray-800/30 shadow-[0_8px_16px_rgba(0,0,0,0.3),0_-2px_8px_rgba(255,255,255,0.1)_inset,0_2px_8px_rgba(0,0,0,0.2)_inset] dark:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_-2px_8px_rgba(255,255,255,0.05)_inset,0_2px_8px_rgba(0,0,0,0.3)_inset] hover:shadow-[0_16px_32px_rgba(0,0,0,0.4),0_-4px_12px_rgba(255,255,255,0.2)_inset,0_4px_12px_rgba(0,0,0,0.3)_inset] hover:scale-[1.05] hover:-translate-y-1 cursor-pointer">
            <h4 className="text-lg font-bold mb-4 text-white">Visítanos</h4>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-white/80 dark:text-primary-400" />
                  <span className="text-white dark:text-gray-100">
                    Ubicación Principal
                  </span>
                </div>
                <span className="text-white/80 dark:text-gray-300 ml-7">
                  Tu dirección aquí
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-white/80 dark:text-primary-400" />
                  <span className="text-white dark:text-gray-100">
                    Sucursal
                  </span>
                </div>
                <span className="text-white/80 dark:text-gray-300 ml-7">
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
