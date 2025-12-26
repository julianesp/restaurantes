"use client";

import { Pizza, Sandwich, Cake, Coffee, IceCream, Wine, ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  {
    id: "pizzas",
    name: "Pizzas",
    icon: <Pizza className="h-5 w-5" />,
  },
  {
    id: "pollo-champi",
    name: "Pollo con Champiñones",
    icon: <Sandwich className="h-5 w-5" />,
  },
  {
    id: "pollo-jamon",
    name: "Pollo con Jamón",
    icon: <IceCream className="h-5 w-5" />,
  },
  {
    id: "sandwich",
    name: "Sandwich",
    icon: <Sandwich className="h-5 w-5" />,
  },
  {
    id: "carnes",
    name: "Carnes",
    icon: <Coffee className="h-5 w-5" />,
  },
  {
    id: "mazorcada",
    name: "Mazorcada",
    icon: <Cake className="h-5 w-5" />,
  },
  {
    id: "salchipapa",
    name: "Salchipapa",
    icon: <Wine className="h-5 w-5" />,
  },
  {
    id: "hamburguesas",
    name: "Hamburguesas",
    icon: <Wine className="h-5 w-5" />,
  },
  {
    id: "lazaña",
    name: "Lazaña",
    icon: <Wine className="h-5 w-5" />,
  },
  {
    id: "gaseosa",
    name: "Gaseosa",
    icon: <Wine className="h-5 w-5" />,
  },
];

export default function MenuCategoriesBar() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    // Scroll suave a la sección correspondiente
    const element = document.getElementById(categoryId);
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 120; // Ajuste para navbar + barra de categorías

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm z-40 relative">
      <div className="max-w-7xl mx-auto px-4 py-3 relative">
        {/* Botón izquierdo */}
        {showLeftButton && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 dark:bg-gray-800/95 hover:bg-[#0c6b58] hover:text-white text-gray-700 dark:text-gray-300 p-2 rounded-full shadow-lg transition-all duration-200"
            aria-label="Desplazar a la izquierda"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Contenedor de categorías */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c6b58] dark:bg-primary-600 text-white hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 whitespace-nowrap border border-transparent hover:border-emerald-200 dark:hover:border-gray-600 flex-shrink-0"
            >
              {category.icon}
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Botón derecho */}
        {showRightButton && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 dark:bg-gray-800/95 hover:bg-[#0c6b58] hover:text-white text-gray-700 dark:text-gray-300 p-2 rounded-full shadow-lg transition-all duration-200"
            aria-label="Desplazar a la derecha"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
