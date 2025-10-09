"use client";

import { Pizza, Sandwich, Cake, Coffee, IceCream, Wine } from "lucide-react";

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
    id: "lasagnas",
    name: "Lasagnas",
    icon: <Sandwich className="h-5 w-5" />,
  },
  {
    id: "papadays",
    name: "Papadays",
    icon: <IceCream className="h-5 w-5" />,
  },
  {
    id: "sandwich",
    name: "Sandwich Pizza",
    icon: <Sandwich className="h-5 w-5" />,
  },
  {
    id: "acompañamientos",
    name: "Acompañamientos",
    icon: <Coffee className="h-5 w-5" />,
  },
  {
    id: "postres",
    name: "Postres",
    icon: <Cake className="h-5 w-5" />,
  },
  {
    id: "extras",
    name: "Extras",
    icon: <Wine className="h-5 w-5" />,
  },
  {
    id: "bebidas",
    name: "Bebidas",
    icon: <Wine className="h-5 w-5" />,
  },
];

export default function MenuCategoriesBar() {
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

  return (
    <div className="w-full bg-white border-b shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide ">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 whitespace-nowrap border border-transparent hover:border-emerald-200 flex-shrink-0"
            >
              {category.icon}
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
