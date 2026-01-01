import React from "react";
import Link from "next/link";
import { createWhatsAppMessage } from "@/utils/whatsapp";
import { ChefHat, Soup, UtensilsCrossed } from "lucide-react";

const featuredDishes = [
  {
    id: 1,
    name: "Plato Especial",
    description:
      "Una exquisita combinación de sabores frescos y ingredientes de la más alta calidad",
    price: "$18.990",
    icon: ChefHat,
    color: "text-primary-500",
  },
  {
    id: 2,
    name: "Entrada Gourmet",
    description:
      "Deliciosa selección de entradas preparadas con ingredientes premium",
    price: "$21.990",
    icon: Soup,
    color: "text-accent-500",
  },
  {
    id: 3,
    name: "Especialidad de la Casa",
    description:
      "El favorito de nuestros clientes, preparado con receta tradicional",
    price: "$22.990",
    icon: UtensilsCrossed,
    color: "text-red-700",
  },
];

export default function PlatosDestacados() {
  return (
    <>
      {/* Platos Destacados */}
      <section
        id="destacadas"
        className="py-12 px-4 sm:px-6 lg:px-8 bg-yellow-50 dark:bg-gray-900"
      >
        <div className="max-w-6xl mx-auto reveal-on-scroll reveal-from-bottom">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Platos Destacados del Día
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Nuestras especialidades más populares, preparadas con ingredientes
              frescos y de la más alta calidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredDishes.map((dish) => {
              const IconComponent = dish.icon;
              return (
                <div
                  key={dish.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover-lift border-2 border-gray-100 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="w-48 h-48 mx-auto mb-6 relative rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center shadow-lg">
                      <IconComponent className={`w-24 h-24 ${dish.color}`} />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                      {dish.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                      {dish.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-2xl font-bold text-primary-500"
                        style={{
                          textShadow:
                            "0 0 2px #000, 0 1px 4px #000, 1px 0 2px #000",
                        }}
                      >
                        {dish.price}
                      </span>
                      <Link
                        href={createWhatsAppMessage(dish.name, dish.price)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm inline-block"
                      >
                        Pedir por WhatsApp
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
