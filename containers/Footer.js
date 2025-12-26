"use client";

import React from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, ChefHat } from "lucide-react";
import { generalWhatsAppMessage } from "../utils/whatsapp";

const Footer = () => {
  return (
    <footer
      id="contacto"
      className="bg-[#0077f7] dark:bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-md"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <ChefHat className="h-8 w-8 text-primary-400 dark:text-primary-500" />
            <h3 className="text-2xl font-bold text-white">Tu Restaurante</h3>
          </div>
          <p className="text-white dark:text-gray-300 mb-4">
            Experiencia gastronómica única con ingredientes frescos y recetas
            tradicionales. Ofrecemos una gran variedad de platos preparados con
            dedicación y pasión por la buena cocina. Disfruta de nuestras
            especialidades, platos a la carta y opciones personalizadas. También
            atendemos eventos y pedidos especiales.
          </p>
        </div>

        {/* Info Sections - Responsive Grid */}
        <div className="grid grid-cols-1 gap-8 max-[425px]:grid-cols-2 max-[425px]:grid-rows-2 min-[426px]:grid-cols-2 lg:grid-cols-3">
          {/* Contacto - Mobile: Top Left, Desktop: Column 1 */}
          <div className="max-[425px]:col-start-1 max-[425px]:row-start-1">
            <h4 className="text-lg font-bold mb-4 text-white">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary-400 dark:text-primary-500" />
                <Link
                  href="tel:+573000000000"
                  className="text-white dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-500 transition-colors font-medium px-3 py-1 rounded bg-primary-700/20 dark:bg-primary-800/30"
                >
                  300 000 0000 0
                </Link>
              </div>

              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-primary-400 dark:text-primary-500" />
                <span className="text-white dark:text-gray-300">
                  Lunes-Domingo: 7:00 a.m - 6:00 p.m
                </span>
              </div>
            </div>
          </div>

          <div className="max-[425px]:col-start-2 max-[425px]:row-start-1">
            <h4 className="text-lg font-bold mb-4 text-white">Síguenos</h4>
            <div className="space-y-2">
              <div className="block text-white dark:text-gray-300">Facebook</div>

              <div className="block text-white dark:text-gray-300">Instagram</div>

              <Link
                href={generalWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white dark:text-gray-300 transition-colors cursor-pointer"
              >
                WhatsApp
              </Link>
            </div>
          </div>

          {/* Visítanos - Mobile: Bottom (spans both columns), Desktop: Column 3 */}
          <div className="max-[425px]:col-span-2 max-[425px]:row-start-2">
            <h4 className="text-lg font-bold mb-4 text-white">Visítanos</h4>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary-400 dark:text-primary-500" />
                  <span className="text-white dark:text-gray-200">Ubicación Principal</span>
                </div>
                <span className="text-gray-300 dark:text-gray-400 ml-7">Tu dirección aquí</span>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary-400 dark:text-primary-500" />
                  <span className="text-white dark:text-gray-200">Sucursal</span>
                </div>
                <span className="text-gray-300 dark:text-gray-400 ml-7">
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
