"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { generalWhatsAppMessage } from "../utils/whatsapp";
import Link from "next/link";
import styles from "../styles/NavBar.module.scss";

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
      className={`top-12 z-40 fixed w-full h-14 backdrop-blur-md bg-white/60 ${styles.navbar}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-10">
        <div className={`flex justify-items items-center h-16 max-[768px]:justify-center max-[768px]:relative ${styles.navContainer}`}>
          {/* Mobile Layout: Saboreos - Logo - Pizza */}
          <div className="hidden max-[768px]:grid max-[768px]:grid-cols-3 max-[768px]:w-full max-[768px]:items-center">
            <h1 className="text-xl font-bold text-gray-900 max-[768px]:text-center">
              Saboreos
            </h1>

            <div className="max-[768px]:flex max-[768px]:flex-col max-[768px]:items-center max-[768px]:relative mt-6">
              <Image
                src="https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/logo_saboreos.png"
                alt="logo"
                width={50}
                height={50}
                className="rounded-full bg-white transition-transform duration-700 ease-in-out hover:rotate-[360deg]"
              />

              {/* Flecha para desplegar el menú móvil */}
              <div className="max-[768px]:block hidden relative">
                {/* Semicircular background */}
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-white/100 backdrop-blur-sm rounded-b-full border-b border-l border-r border-gray-200 shadow-sm"></div>
                <button
                  onClick={toggleMobileMenu}
                  className="relative z-10 p-2 rounded-full hover:bg-gray-100/50 transition-all duration-200 hover:scale-110"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-700" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-700" />
                  )}
                </button>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 max-[768px]:text-center">
              Pizza
            </h1>
          </div>

          {/* Desktop Layout: Logo + Full Text a la izquierda */}
          <div className={`flex items-center space-x-2 max-[768px]:hidden min-[769px]:max-[1023px]:justify-center min-[769px]:max-[1023px]:w-full ${styles.logoSection}`}>
            <Image
              src="https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/logo_saboreos.png"
              alt="logo"
              width={60}
              height={60}
              className="rounded-full bg-white transition-transform duration-700 ease-in-out hover:rotate-[360deg]"
            />
            {/* gotas de queso */}
            <span
              className="
    absolute left-1/2 top-full h-3 w-2
    rounded-full bg-yellow-400 opacity-0
    group-hover:opacity-100 group-hover:animate-bounce
    -translate-x-1/2
  "
            />
            <span
              className="
    absolute left-1/3 top-full h-2 w-1.5
    rounded-full bg-yellow-300 opacity-0
    group-hover:opacity-100 group-hover:animate-bounce
    -translate-x-1/2 delay-150
  "
            />
            <h1 className="text-2xl font-bold text-gray-900">Saboreos Pizza</h1>
          </div>

          {/* Navigation Links a la derecha */}
          <div className={`hidden min-[769px]:flex items-center space-x-6 min-[769px]:max-[1023px]:hidden ${styles.navigationLinks}`}>
            <a
              href="#inicio"
              onClick={(e) => handleSmoothScroll(e, "inicio")}
              className="text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Inicio
            </a>
            <a
              href="#especialidades"
              onClick={(e) => handleSmoothScroll(e, "especialidades")}
              className="text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Especialidades
            </a>
            <a
              href="#contacto"
              onClick={(e) => handleSmoothScroll(e, "contacto")}
              className="text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Contacto
            </a>
            <a
              href={generalWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Pedir Ahora
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu - Absolute Overlay */}
      <div
        className={`max-[768px]:block hidden absolute top-full left-0 right-0 z-30 transition-all duration-300 ease-in-out mt-8 ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center bg-white/75 backdrop-opacity-0 shadow-xl border-b  ">
          <div className="py-6 px-6">
            {/* First Row - Navigation Links */}
            <div className="flex justify-center space-x-8 mb-4 ">
              <Link
                href="#inicio"
                onClick={(e) => {
                  handleSmoothScroll(e, "inicio");
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Inicio
              </Link>
              <Link
                href="#especialidades"
                onClick={(e) => {
                  handleSmoothScroll(e, "especialidades");
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Especialidades
              </Link>
              <Link
                href="#contacto"
                onClick={(e) => {
                  handleSmoothScroll(e, "contacto");
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Contacto
              </Link>
            </div>

            {/* Second Row - CTA Button */}
            <div className="flex justify-center">
              <Link
                href={generalWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg"
              >
                Pedir Ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
