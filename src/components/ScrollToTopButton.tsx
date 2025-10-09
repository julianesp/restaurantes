"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar el botón cuando se haya desplazado más de 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-[#0c6b58] text-white p-4 rounded-full shadow-lg hover:bg-[#0a5647] transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0c6b58] focus:ring-offset-2"
          aria-label="Volver arriba"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
