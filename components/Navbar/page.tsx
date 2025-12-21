"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChefHat } from "lucide-react";
import { generalWhatsAppMessage } from "../../utils/whatsapp";
import styles from "./NavBar.module.scss";
import Link from "next/link";
import ThemeSwitcher from "../ThemeSwitcher";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Cerrar menú al hacer clic fuera
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent | ToggleEvent) => {
  //     if (navRef.current && !navRef.current.contains(event.target as Node)) {
  //       setIsMobileMenuOpen(false);
  //     }
  //   };

  //   if (isMobileMenuOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //     document.addEventListener("touchstart", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //     document.removeEventListener("touchstart", handleClickOutside);
  //   };
  // }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
      document.addEventListener(
        "touchstart",
        handleClickOutside as EventListener
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
      document.removeEventListener(
        "touchstart",
        handleClickOutside as EventListener
      );
    };
  }, [isMobileMenuOpen]);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 80; // Ajuste para el navbar fijo

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Agregar impulso de velocidad
      const startTime = performance.now();
      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      const duration = Math.min(800, Math.abs(distance) * 0.8); // Duración más rápida

      function easeInOutQuart(t: number): number {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
      }

      function animateScroll(currentTime: number) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easeInOutQuart(progress);

        window.scrollTo(0, startPosition + distance * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      }

      requestAnimationFrame(animateScroll);
    }
  };
  return (
    <nav
      ref={navRef}
      className={`z-40 fixed w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md ${styles.navbar}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg transition-transform duration-700 ease-in-out hover:rotate-[360deg]">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tu Restaurante</h1>
          </div>

          {/* Botones principales y menú hamburguesa - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Botón Reserva destacado */}
            <Link
              href={generalWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-500 overflow-hidden btn-animated"
            >
              <span className="relative z-10">Reserva</span>
            </Link>

            <Link
              href={generalWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-500 hover:shadow-lg"
            >
              Pedir Ahora
            </Link>

            {/* Botón menú hamburguesa */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Menú hamburguesa - Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Theme Switcher Mobile */}
            <ThemeSwitcher />

            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable */}
      <div
        className={`absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Navigation Links */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6 md:justify-center mb-6">
            <Link
              href="#inicio"
              onClick={(e) => {
                handleSmoothScroll(e, "inicio");
                setIsMobileMenuOpen(false);
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium text-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              Inicio
            </Link>
            <Link
              href="#especialidades"
              onClick={(e) => {
                handleSmoothScroll(e, "especialidades");
                setIsMobileMenuOpen(false);
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium text-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              Especialidades
            </Link>
            <Link
              href="#destacadas"
              onClick={(e) => {
                handleSmoothScroll(e, "destacadas");
                setIsMobileMenuOpen(false);
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium text-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              Destacados
            </Link>
            <Link
              href="#menu-comidas"
              onClick={(e) => {
                handleSmoothScroll(e, "menu-comidas");
                setIsMobileMenuOpen(false);
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium text-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              Menú
            </Link>
            <Link
              href="#delivery"
              onClick={(e) => {
                handleSmoothScroll(e, "delivery");
                setIsMobileMenuOpen(false);
              }}
              className="text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-semibold text-center py-2 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg"
            >
              🏍️ Delivery
            </Link>
            <Link
              href="#contacto"
              onClick={(e) => {
                handleSmoothScroll(e, "contacto");
                setIsMobileMenuOpen(false);
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium text-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              Contacto
            </Link>
          </div>

          {/* Botones CTA en mobile */}
          <div className="flex md:hidden flex-col space-y-3">
            <Link
              href={generalWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-full hover:shadow-xl transition-all duration-500 font-semibold shadow-lg btn-animated text-center"
            >
              Reserva
            </Link>
            <Link
              href={generalWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-500 font-medium shadow-lg text-center"
            >
              Pedir Ahora
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
