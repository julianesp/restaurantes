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
  const { isSignedIn, user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showNavLinks, setShowNavLinks] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoRotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Verificar si el usuario es administrador
  const isAdmin = user?.emailAddresses?.some(
    (email) => process.env.NEXT_PUBLIC_ADMIN_EMAILS?.includes(email.emailAddress)
  );

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
    // Delay de 500ms antes de cerrar
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 500);
  };

  return (
    <nav
      ref={navRef}
      className={`${styles.bordes} z-40 fixed w-full  bg-transparent transition-colors duration-300 ease-in-out top-0 left-0`}
    >
      <div className="w-full ">
        {/* Navbar para pantallas grandes (lg+) */}
        <div className="hidden lg:flex items-center justify-between h-[60px] px-8 border-b backdrop-blur-md rounded-s-3xl rounded-e-3xl max-w-[1400px] mx-auto relative">
          {/* Enlaces izquierda */}
          <div className="flex items-center gap-6 flex-1">
            {/* Menú Inicio con submenú */}
            <div
              className={`relative group transition-all duration-200 ${
                showNavLinks
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
              style={{ transitionDelay: "0ms" }}
              onMouseEnter={() => handleMouseEnter("inicio")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/#inicio"
                className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-lg font-bold transition-all duration-200 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-125 flex items-center gap-1"
              >
                Inicio
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>

              {/* Submenú */}
              <div
                className={`absolute top-full left-0 mt-2 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden transition-all duration-300 origin-top border border-gray-200 dark:border-gray-700 ${
                  openDropdown === "inicio"
                    ? "opacity-100 scale-y-100 translate-y-0"
                    : "opacity-0 scale-y-0 -translate-y-4 pointer-events-none"
                }`}
                onMouseEnter={() => handleMouseEnter("inicio")}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/#especialidades"
                  onClick={() => setOpenDropdown(null)}
                  className="block px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:text-primary-400 transition-all duration-200 text-lg"
                >
                  Especialidades
                </Link>
                <Link
                  href="/#destacadas"
                  onClick={() => setOpenDropdown(null)}
                  className="block px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:text-primary-400 transition-all duration-200 text-lg border-t border-gray-200 dark:border-white/10"
                >
                  Destacados
                </Link>
              </div>
            </div>

            {/* Menú Sobre Nosotros con submenú */}
            <div
              className={`relative group transition-all duration-500 ${
                showNavLinks
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
              style={{ transitionDelay: "100ms" }}
              onMouseEnter={() => handleMouseEnter("nosotros")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/nosotros"
                className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-lg font-bold transition-all duration-200 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 flex items-center gap-1"
              >
                Sobre Nosotros
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
              {/* Submenú */}
              <div
                className={`absolute top-full left-0 mt-2 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden transition-all duration-300 origin-top border border-gray-200 dark:border-gray-700 ${
                  openDropdown === "nosotros"
                    ? "opacity-100 scale-y-100 translate-y-0"
                    : "opacity-0 scale-y-0 -translate-y-4 pointer-events-none"
                }`}
                onMouseEnter={() => handleMouseEnter("nosotros")}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/galeria"
                  onClick={() => setOpenDropdown(null)}
                  className="block px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:text-primary-400 transition-all duration-200 text-lg"
                >
                  📸 Galería
                </Link>
                <Link
                  href="/#contacto"
                  onClick={() => setOpenDropdown(null)}
                  className="block px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:text-primary-400 transition-all duration-200 text-lg border-t border-gray-200 dark:border-white/10"
                >
                  Contacto
                </Link>
              </div>
            </div>
          </div>

          {/* Logo centrado - Posición absoluta */}
          <Link
            href="/"
            title="Ir a inicio"
            style={
              logoHovered
                ? {
                    animation: "spin-180 0.6s ease-in-out 0.05s forwards",
                    transform: "scale(1.1)",
                  }
                : undefined
            }
            className="absolute left-1/2 -translate-x-1/2 transition-transform duration-500 ease-in-out hover:scale-110 p-2 rounded-full bg-gray-100/80 backdrop-blur-sm shadow-lg z-10"
            onMouseEnter={() => {
              setLogoHovered(true);
              if (logoRotateTimeoutRef.current) {
                clearTimeout(logoRotateTimeoutRef.current);
              }
            }}
            onMouseLeave={() => {
              setLogoHovered(false);
              if (logoRotateTimeoutRef.current) {
                clearTimeout(logoRotateTimeoutRef.current);
              }
            }}
          >
            <Image
              src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/logo_temporal.png"
              alt="Logo Restaurante"
              title="Logo Restaurante"
              width={70}
              height={70}
              className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              priority
            />
          </Link>

          {/* Enlaces derecha */}
          <div className="flex items-center gap-6 flex-1 justify-end">
            <Link
              href="/#menu-comidas"
              className={`text-white hover:text-yellow-400 px-3 py-2 rounded-md text-lg font-bold transition-all duration-200 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                showNavLinks
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              Menú
            </Link>

            <Link
              href="/blog"
              className={`text-white hover:text-yellow-400 px-3 py-2 rounded-md text-lg font-bold transition-all duration-200 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                showNavLinks
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              Blog
            </Link>

            <Link
              href="/#delivery"
              className={`text-white hover:text-yellow-400 px-3 py-2 rounded-md text-lg font-bold transition-all duration-200 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                showNavLinks
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              🏍️ Entrega
            </Link>

            <div
              className={`transition-all duration-500 ${
                showNavLinks
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              {/* <PulseAnimation interval={5000} duration={1200}>
                <ThemeSwitcher />
              </PulseAnimation> */}
            </div>

            {isSignedIn ? (
              <div
                className={`flex items-center gap-3 transition-all duration-500 ${
                  showNavLinks
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-20"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-white hover:text-yellow-400 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 backdrop-blur-sm transition-all duration-200 font-bold text-sm border border-primary-400/50 hover:border-primary-300 hover:scale-105 shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Admin
                  </Link>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 ring-2 ring-white/20 hover:ring-white/40 transition-all",
                    },
                  }}
                />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className={`flex items-center gap-2 text-white hover:text-yellow-400 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 font-bold text-lg border border-white/20 hover:border-white/40 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  showNavLinks
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-20"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>

        {/* Navbar para móviles y tablets (< lg) */}
        <div className="flex lg:hidden justify-between items-center h-[55px] backdrop-blur-md px-3 sm:px-4 border-b ">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              title="Ir a inicio"
              className="transition-transform duration-700 ease-in-out hover:scale-110 p-1.5 rounded-full bg-gray-100/80 backdrop-blur-sm shadow-lg"
            >
              <Image
                src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/logo_temporal.png"
                alt="Logo Restaurante"
                title="Logo Restaurante"
                width={50}
                height={50}
                className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                priority
              />
            </Link>
          </div>

          {/* Theme Switcher, User Button y menú hamburguesa */}
          <div className="flex items-center space-x-3">
            {/* <PulseAnimation interval={5000} duration={1200}>
              <ThemeSwitcher />
            </PulseAnimation> */}

            {isSignedIn ? (
              <div className="flex items-center">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 ring-2 ring-white/20 hover:ring-white/40 transition-all",
                    },
                  }}
                />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-1.5 text-white hover:text-yellow-400 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 font-bold text-xs border border-white/20 hover:border-white/40 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Iniciar
              </Link>
            )}

            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full bg-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 shadow-lg"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-900 dark:text-white transition-transform duration-300 rotate-90 " />
              ) : (
                <Menu className="h-6 w-6 text-gray-900 dark:text-white transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable con animación mejorada - Solo visible en móviles */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 max-h-screen"
            : "opacity-0 -translate-y-8 max-h-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div className="w-full flex justify-center py-2">
          <div
            className={`max-w-sm w-[70%] mx-auto px-3 sm:px-4 py-4 sm:py-6 backdrop-blur-md bg-black/40 shadow-2xl border border-white/20 rounded-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Links */}
            <div className="flex flex-col space-y-0 overflow-hidden ">
              <Link
                href="/#inicio"
                onClick={() => setIsMobileMenuOpen(false)}
                className={` text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center border-b border-white/30 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "50ms" : "0ms" }}
              >
                Inicio
              </Link>
              <Link
                href="/#especialidades"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center border-b border-white/30 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "100ms" : "0ms" }}
              >
                Especialidades
              </Link>
              <Link
                href="/#destacadas"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center border-b border-white/30 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "150ms" : "0ms" }}
              >
                Destacados
              </Link>
              <Link
                href="/galeria"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center border-b border-white/30 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "200ms" : "0ms" }}
              >
                📸 Galería
              </Link>
              <Link
                href="/#menu-comidas"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center border-b border-white/30 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "250ms" : "0ms" }}
              >
                Menú
              </Link>
              <Link
                href="/nosotros"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center border-b border-white/30 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center border-b border-white/30 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "350ms" : "0ms" }}
              >
                Blog & Noticias
              </Link>
              <Link
                href="/#delivery"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center border-b border-white/30 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "400ms" : "0ms" }}
              >
                🏍️ Delivery
              </Link>
              <Link
                href="/#contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white hover:text-yellow-400 transition-all duration-300 font-bold text-lg sm:text-xl py-3 px-4 text-center [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%),_-1px_-1px_2px_rgb(0_0_0_/_80%),_1px_-1px_2px_rgb(0_0_0_/_80%),_-1px_1px_2px_rgb(0_0_0_/_80%)] hover:scale-105 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-full"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? "450ms" : "0ms" }}
              >
                Contacto
              </Link>

              {/* Botón Admin - Solo visible para administradores */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-bold text-lg sm:text-xl py-4 px-4 text-center rounded-lg border-2 border-primary-400/50 shadow-lg hover:scale-105 mx-4 mt-4 ${
                    isMobileMenuOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-full"
                  }`}
                  style={{ transitionDelay: isMobileMenuOpen ? "500ms" : "0ms" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Panel de Administración
                </Link>
              )}
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
