"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChefHat } from "lucide-react";
import Link from "next/link";
import ReservationModal from "../ReservationModal";
import OrderModal from "../OrderModal";
import FloatingActionButtons from "../FloatingActionButtons";
import ThemeSwitcher from "../ThemeSwitcher";
import PulseAnimation from "../PulseAnimation";
import styles from "./NavBar.module.scss";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
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
      className={`${styles.bordes} z-40 fixed w-full bg-transparent transition-colors duration-300 ease-in-out top-0 left-0`}
    >
      <div className="w-full backdrop-blur-[3px]">
        <div className="flex justify-between items-center h-[65px] bg-gray-900/50 px-4 sm:px-6 lg:px-8">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg transition-transform duration-700 ease-in-out hover:rotate-[360deg]">
              <Link href="/" title="Ir a inicio">
                <ChefHat className="w-6 h-6 text-white" />
              </Link>
            </div>
            <h1 className="text-xl font-bold text-white">Tu Restaurante</h1>
          </div>

          {/* Theme Switcher y menú hamburguesa */}
          <div className="flex items-center space-x-3">
            <PulseAnimation interval={5000} duration={1200}>
              <ThemeSwitcher />
            </PulseAnimation>

            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-white transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="h-6 w-6 text-white transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable con animación mejorada */}
      <div
        className={`absolute top-full left-0 right-0 bg-gray-900/98 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-out overflow-hidden ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 max-h-screen"
            : "opacity-0 -translate-y-8 max-h-0 pointer-events-none"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Navigation Links */}
          <div
            className={`flex flex-col space-y-3 transition-all duration-700 ${
              isMobileMenuOpen
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0"
            }`}
          >
            <Link
              href="#inicio"
              onClick={(e) => {
                handleSmoothScroll(e, "inicio");
                setIsMobileMenuOpen(false);
              }}
              className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-lg py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm transform hover:translate-x-2"
            >
              Inicio
            </Link>
            <Link
              href="#especialidades"
              onClick={(e) => {
                handleSmoothScroll(e, "especialidades");
                setIsMobileMenuOpen(false);
              }}
              className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-lg py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm transform hover:translate-x-2"
            >
              Especialidades
            </Link>
            <Link
              href="#destacadas"
              onClick={(e) => {
                handleSmoothScroll(e, "destacadas");
                setIsMobileMenuOpen(false);
              }}
              className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-lg py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm transform hover:translate-x-2"
            >
              Destacados
            </Link>
            <Link
              href="#menu-comidas"
              onClick={(e) => {
                handleSmoothScroll(e, "menu-comidas");
                setIsMobileMenuOpen(false);
              }}
              className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-lg py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm transform hover:translate-x-2"
            >
              Menú
            </Link>
            <Link
              href="#delivery"
              onClick={(e) => {
                handleSmoothScroll(e, "delivery");
                setIsMobileMenuOpen(false);
              }}
              className="text-secondary-300 hover:text-primary-400 transition-all duration-300 font-semibold text-lg py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-secondary-300/30 backdrop-blur-sm transform hover:translate-x-2"
            >
              🏍️ Delivery
            </Link>
            <Link
              href="#contacto"
              onClick={(e) => {
                handleSmoothScroll(e, "contacto");
                setIsMobileMenuOpen(false);
              }}
              className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-lg py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm transform hover:translate-x-2"
            >
              Contacto
            </Link>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
      />
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      {/* Botones flotantes */}
      <FloatingActionButtons
        onReservaClick={() => setIsReservationModalOpen(true)}
        onPedirClick={() => setIsOrderModalOpen(true)}
      />
    </nav>
  );
};

export default Navbar;
