"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReservationModal from "../ReservationModal";
import OrderModal from "../OrderModal";
import FloatingActionButtons from "../FloatingActionButtons";
import ThemeSwitcher from "../ThemeSwitcher";
import PulseAnimation from "../PulseAnimation";
import { UserButton, useUser } from "@clerk/nextjs";
import styles from "./NavBar.module.scss";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showNavLinks, setShowNavLinks] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        handleClickOutside as EventListener,
      );
      document.addEventListener(
        "touchstart",
        handleClickOutside as EventListener,
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener,
      );
      document.removeEventListener(
        "touchstart",
        handleClickOutside as EventListener,
      );
    };
  }, [isMobileMenuOpen]);

  // Animación de entrada de los enlaces después de 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavLinks(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Funciones para manejar el hover con delay
  const handleMouseEnter = (dropdown: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    // Delay de 300ms antes de cerrar
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 300);
  };

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
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
        {/* Navbar para pantallas grandes (lg+) */}
        <div className="hidden lg:flex items-center justify-center h-[80px] bg-gray-900/50 px-8 relative">
          {/* Enlaces izquierda - cerca del logo */}
          <div className="flex items-center gap-4 absolute left-1/2 -translate-x-[280px]">
            {/* Menú Inicio con submenú */}
            <div
              className={`relative group transition-all duration-500 ${
                showNavLinks
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-20'
              }`}
              style={{ transitionDelay: '0ms' }}
              onMouseEnter={() => handleMouseEnter('inicio')}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="#inicio"
                onClick={(e) => handleSmoothScroll(e, "inicio")}
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-sm flex items-center gap-1"
              >
                Inicio
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {/* Submenú */}
              <div
                className={`absolute top-full left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden transition-all duration-300 origin-top ${
                  openDropdown === 'inicio'
                    ? 'opacity-100 scale-y-100 translate-y-0'
                    : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'
                }`}
                onMouseEnter={() => handleMouseEnter('inicio')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="#especialidades"
                  onClick={(e) => {
                    handleSmoothScroll(e, "especialidades");
                    setOpenDropdown(null);
                  }}
                  className="block px-4 py-3 text-white hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-200 text-sm"
                >
                  Especialidades
                </Link>
                <Link
                  href="#destacadas"
                  onClick={(e) => {
                    handleSmoothScroll(e, "destacadas");
                    setOpenDropdown(null);
                  }}
                  className="block px-4 py-3 text-white hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-200 text-sm border-t border-white/10"
                >
                  Destacados
                </Link>
              </div>
            </div>

            {/* Menú Sobre Nosotros con submenú */}
            <div
              className={`relative group transition-all duration-500 ${
                showNavLinks
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-20'
              }`}
              style={{ transitionDelay: '100ms' }}
              onMouseEnter={() => handleMouseEnter('nosotros')}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/nosotros"
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-sm flex items-center gap-1"
              >
                Sobre Nosotros
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {/* Submenú */}
              <div
                className={`absolute top-full left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden transition-all duration-300 origin-top ${
                  openDropdown === 'nosotros'
                    ? 'opacity-100 scale-y-100 translate-y-0'
                    : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'
                }`}
                onMouseEnter={() => handleMouseEnter('nosotros')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/galeria"
                  onClick={() => setOpenDropdown(null)}
                  className="block px-4 py-3 text-white hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-200 text-sm"
                >
                  📸 Galería
                </Link>
                <Link
                  href="#contacto"
                  onClick={(e) => {
                    handleSmoothScroll(e, "contacto");
                    setOpenDropdown(null);
                  }}
                  className="block px-4 py-3 text-white hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-200 text-sm border-t border-white/10"
                >
                  Contacto
                </Link>
              </div>
            </div>
          </div>

          {/* Logo centrado */}
          <Link
            href="/"
            title="Ir a inicio"
            className="transition-transform duration-700 ease-in-out hover:scale-110 p-2 rounded-full bg-white/10 backdrop-blur-sm shadow-lg hover:bg-white/20 z-10"
          >
            <Image
              src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/munay/images/logo%20en%20blanco%20png.png"
              alt="Logo Restaurante Munay"
              title="Logo Restaurante Munay"
              width={70}
              height={70}
              className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              priority
            />
          </Link>

          {/* Enlaces derecha - cerca del logo */}
          <div className="flex items-center gap-4 absolute left-1/2 translate-x-[110px]">
            <Link
              href="#menu-comidas"
              onClick={(e) => handleSmoothScroll(e, "menu-comidas")}
              className={`text-white hover:text-primary-400 transition-all duration-500 font-medium text-sm ${
                showNavLinks
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-20'
              }`}
              style={{ transitionDelay: '0ms' }}
            >
              Menú
            </Link>

            <Link
              href="/blog"
              className={`text-white hover:text-primary-400 transition-all duration-500 font-medium text-sm ${
                showNavLinks
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-20'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              Blog
            </Link>

            <Link
              href="#delivery"
              onClick={(e) => handleSmoothScroll(e, "delivery")}
              className={`text-secondary-300 hover:text-primary-400 transition-all duration-500 font-semibold text-sm ${
                showNavLinks
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-20'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              🏍️ Delivery
            </Link>

            <div
              className={`transition-all duration-500 ${
                showNavLinks
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-20'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <PulseAnimation interval={5000} duration={1200}>
                <ThemeSwitcher />
              </PulseAnimation>
            </div>

            {isSignedIn && (
              <div
                className={`flex items-center transition-all duration-500 ${
                  showNavLinks
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-20'
                }`}
                style={{ transitionDelay: '400ms' }}
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-white/20 hover:ring-white/40 transition-all"
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navbar para móviles y tablets (< lg) */}
        <div className="flex lg:hidden justify-between items-center h-[65px] bg-gray-900/50 px-4 sm:px-6">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              title="Ir a inicio"
              className="transition-transform duration-700 ease-in-out hover:scale-110 p-2 rounded-full bg-white/10 backdrop-blur-sm shadow-lg hover:bg-white/20"
            >
              <Image
                src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/munay/images/logo%20en%20blanco%20png.png"
                alt="Logo Restaurante Munay"
                title="Logo Restaurante Munay"
                width={70}
                height={70}
                className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                priority
              />
            </Link>
          </div>

          {/* Theme Switcher, User Button y menú hamburguesa */}
          <div className="flex items-center space-x-3">
            <PulseAnimation interval={5000} duration={1200}>
              <ThemeSwitcher />
            </PulseAnimation>

            {isSignedIn && (
              <div className="flex items-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-white/20 hover:ring-white/40 transition-all"
                    }
                  }}
                />
              </div>
            )}

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

      {/* Menú desplegable con animación mejorada - Solo visible en móviles */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-500 ease-out overflow-hidden ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 max-h-screen"
            : "opacity-0 -translate-y-8 max-h-0 pointer-events-none"
        }`}
      >
        <div className="w-full flex justify-center">
          <div
            className={`max-w-md w-full mx-auto px-6 py-8 bg-gray-900/98 backdrop-blur-xl shadow-2xl ${styles.menuMobile}`}
          >
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
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                Inicio
              </Link>
              <Link
                href="#especialidades"
                onClick={(e) => {
                  handleSmoothScroll(e, "especialidades");
                  setIsMobileMenuOpen(false);
                }}
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                Especialidades
              </Link>
              <Link
                href="#destacadas"
                onClick={(e) => {
                  handleSmoothScroll(e, "destacadas");
                  setIsMobileMenuOpen(false);
                }}
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                Destacados
              </Link>
              <Link
                href="/galeria"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                📸 Galería
              </Link>
              <Link
                href="#menu-comidas"
                onClick={(e) => {
                  handleSmoothScroll(e, "menu-comidas");
                  setIsMobileMenuOpen(false);
                }}
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                Menú
              </Link>
              <Link
                href="/nosotros"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                Blog & Noticias
              </Link>
              <Link
                href="#delivery"
                onClick={(e) => {
                  handleSmoothScroll(e, "delivery");
                  setIsMobileMenuOpen(false);
                }}
                className="text-secondary-300 hover:text-primary-400 transition-all duration-300 font-semibold text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-secondary-300/30 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                🏍️ Delivery
              </Link>
              <Link
                href="#contacto"
                onClick={(e) => {
                  handleSmoothScroll(e, "contacto");
                  setIsMobileMenuOpen(false);
                }}
                className="text-white hover:text-primary-400 transition-all duration-300 font-medium text-xl py-4 px-6 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 backdrop-blur-sm text-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  textShadow:
                    "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                Contacto
              </Link>
            </div>
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
