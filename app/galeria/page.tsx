"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar/page";
import Footer from "../../containers/Footer/page";
import FloatingFooter from "../../components/FloatingFooter";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import {
  Coffee,
  UtensilsCrossed,
  Cake,
  IceCream,
  Pizza,
  Soup,
  X,
} from "lucide-react";
import { useRevealOnScroll } from "../../utils/useRevealOnScroll";
import Link from "next/link";
import { createWhatsAppMessage } from "../../utils/whatsapp";

interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: "desayunos" | "almuerzos" | "cenas" | "postres" | "bebidas" | "helados";
  image?: string;
}

// Datos de ejemplo - En producción las fotos serán proporcionadas por el cliente
const foodGallery: FoodItem[] = [
  // Desayunos
  {
    id: 1,
    name: "Desayuno Tradicional",
    description: "Huevos, arepa, queso, chocolate y pan recién horneado",
    price: "$12.000",
    category: "desayunos",
  },
  {
    id: 2,
    name: "Calentado Campesino",
    description: "Arroz, frijoles, carne desmechada, huevo y arepa",
    price: "$15.000",
    category: "desayunos",
  },
  {
    id: 3,
    name: "Tamal con Chocolate",
    description: "Tamal tradicional con chocolate caliente casero",
    price: "$14.000",
    category: "desayunos",
  },
  // Almuerzos
  {
    id: 4,
    name: "Bandeja Paisa",
    description: "El plato típico colombiano con todos sus ingredientes",
    price: "$28.000",
    category: "almuerzos",
  },
  {
    id: 5,
    name: "Sancocho Campesino",
    description: "Sopa tradicional con carne, plátano y yuca",
    price: "$15.000",
    category: "almuerzos",
  },
  {
    id: 6,
    name: "Cazuela de Mariscos",
    description: "Mariscos frescos del Pacífico en salsa criolla",
    price: "$35.000",
    category: "almuerzos",
  },
  {
    id: 7,
    name: "Pechuga a la Plancha",
    description: "Pechuga jugosa con arroz y ensalada fresca",
    price: "$22.000",
    category: "almuerzos",
  },
  {
    id: 8,
    name: "Lomo de Cerdo",
    description: "Lomo en salsa BBQ con papas criollas",
    price: "$26.000",
    category: "almuerzos",
  },
  // Cenas
  {
    id: 9,
    name: "Hamburguesa Especial",
    description: "Carne, queso, tocineta y vegetales frescos",
    price: "$18.000",
    category: "cenas",
  },
  {
    id: 10,
    name: "Pizza Familiar",
    description: "Pizza artesanal con ingredientes premium",
    price: "$30.000",
    category: "cenas",
  },
  // Postres
  {
    id: 11,
    name: "Tres Leches",
    description: "Pastel tradicional empapado en tres tipos de leche",
    price: "$7.500",
    category: "postres",
  },
  {
    id: 12,
    name: "Tiramisú",
    description: "Postre italiano con café y mascarpone",
    price: "$8.000",
    category: "postres",
  },
  {
    id: 13,
    name: "Brownie con Helado",
    description: "Brownie de chocolate caliente con helado",
    price: "$10.000",
    category: "postres",
  },
  // Bebidas
  {
    id: 14,
    name: "Limonada de Coco",
    description: "Refrescante limonada con toque de coco",
    price: "$6.000",
    category: "bebidas",
  },
  {
    id: 15,
    name: "Jugo Natural",
    description: "Jugos de frutas frescas de temporada",
    price: "$5.000",
    category: "bebidas",
  },
  // Helados
  {
    id: 16,
    name: "Copa de Helado",
    description: "Tres bolas de helado con salsa a elección",
    price: "$8.000",
    category: "helados",
  },
  {
    id: 17,
    name: "Milkshake",
    description: "Batido cremoso en varios sabores",
    price: "$10.000",
    category: "helados",
  },
];

const categories = [
  { id: "todos", name: "Todos", icon: UtensilsCrossed, color: "text-primary-500" },
  { id: "desayunos", name: "Desayunos", icon: Coffee, color: "text-yellow-600" },
  { id: "almuerzos", name: "Almuerzos", icon: Soup, color: "text-accent-600" },
  { id: "cenas", name: "Cenas", icon: Pizza, color: "text-indigo-600" },
  { id: "postres", name: "Postres", icon: Cake, color: "text-pink-600" },
  { id: "bebidas", name: "Bebidas", icon: Coffee, color: "text-amber-600" },
  { id: "helados", name: "Helados", icon: IceCream, color: "text-cyan-600" },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const heroReveal = useRevealOnScroll<HTMLDivElement>();
  const galleryReveal = useRevealOnScroll<HTMLDivElement>();

  const filteredItems =
    selectedCategory === "todos"
      ? foodGallery
      : foodGallery.filter((item) => item.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.icon : UtensilsCrossed;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.color : "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-gray-800 dark:to-gray-900">
        <div
          ref={heroReveal.ref}
          className={`max-w-7xl mx-auto text-center reveal-on-scroll reveal-scale-up ${
            heroReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-2xl animate-float">
              <UtensilsCrossed className="w-12 h-12 text-primary-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Galería de Comidas
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Descubre visualmente cada uno de nuestros deliciosos platos. Una
            foto vale más que mil palabras.
          </p>
          <div className="mt-6 bg-yellow-500/20 border-2 border-yellow-400 rounded-xl p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <p className="text-white font-medium">
              📸 Las fotos profesionales de los platos serán actualizadas con las
              imágenes proporcionadas por el restaurante
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="sticky top-16 z-30 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-primary-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div
          ref={galleryReveal.ref}
          className={`max-w-7xl mx-auto reveal-on-scroll reveal-from-bottom ${
            galleryReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover-lift cursor-pointer border border-gray-200 dark:border-gray-700 group"
                >
                  {/* Image Placeholder con gradiente de la categoría */}
                  <div className="relative h-56 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center overflow-hidden">
                    <Icon
                      className={`w-20 h-20 ${getCategoryColor(
                        item.category
                      )} transition-transform duration-300 group-hover:scale-110`}
                    />
                    {/* Overlay con efecto hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Ver Detalles
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary-500">
                        {item.price}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            createWhatsAppMessage(item.name, item.price),
                            "_blank"
                          );
                        }}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      >
                        Pedir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <UtensilsCrossed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No hay platos en esta categoría
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pronto agregaremos más opciones deliciosas
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalles */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-10"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Image */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
              {(() => {
                const Icon = getCategoryIcon(selectedItem.category);
                return (
                  <Icon
                    className={`w-32 h-32 ${getCategoryColor(
                      selectedItem.category
                    )}`}
                  />
                );
              })()}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {selectedItem.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                {selectedItem.description}
              </p>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Precio
                  </p>
                  <p className="text-3xl font-bold text-primary-500">
                    {selectedItem.price}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={createWhatsAppMessage(
                    selectedItem.name,
                    selectedItem.price
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold text-center transition-all"
                >
                  Pedir por WhatsApp
                </Link>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <FloatingFooter />
      <ScrollToTopButton />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
