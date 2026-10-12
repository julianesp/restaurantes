"use client";

import { useEffect, useState } from "react";

import {
  Star,
  Utensils,
  Clock,
  ChefHat,
  Flame,
  UtensilsCrossed,
  Coffee,
  Wine,
  Soup,
  Salad,
  Bike,
  MapPin,
  Phone,
  HandHeart,
  Leaf,
  CookingPot,
  ArrowRight,
  Info,
} from "lucide-react";

import FloatingFooter from "@/components/FloatingFooter";
import Navbar from "@/components/Navbar/page";
import Footer from "@/containers/Footer/page";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import FoodSlider from "@/components/FoodSlider";
import LocationMap from "@/components/LocationMap";
import OrderCTAModal from "@/components/OrderCTAModal";
import TestimonialsSection from "@/components/TestimonialsSection";
import DishDetailModal from "@/components/DishDetailModal";
import PlatoDeLaSemana from "@/components/PlatoDeLaSemana";
import Link from "next/link";
import { useBranding } from "@/context/TenantContext";

const mostPopular = {
  id: 9000,
  name: "Plato Estrella",
  description:
    "El que más nos piden. Sabor de casa, porción generosa y hecho con ingredientes frescos del día.",
  price: "$25.000",
  icon: Star,
  color: "text-yellow-500",
  category: "Platos Destacados",
  image: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/1.jpg",
  ingredients: ["Carne de res premium", "Vegetales frescos", "Especias secretas", "Arroz premium", "Ensalada fresca"],
  nutritionalInfo: {
    calories: "650 kcal",
    protein: "45g",
    carbs: "60g",
    fat: "22g",
  },
};

const dishOfTheDay = {
  id: 9003,
  name: "Especial del Día",
  description:
    "Lo que salió hoy de la cocina: proteína, principio y ensalada, como un buen corrientazo bien servido.",
  price: "$23.990",
  icon: Flame,
  color: "text-accent",
  special: "¡Solo por hoy!",
  category: "Platos Destacados",
  image: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/2.jpg",
  ingredients: ["Proteína del día", "Vegetales de temporada", "Guarnición especial", "Salsa casera"],
  nutritionalInfo: {
    calories: "580 kcal",
    protein: "38g",
    carbs: "52g",
    fat: "18g",
  },
};

const specialOffer = {
  id: 9001,
  name: "Menú Familiar",
  description:
    "Para compartir el domingo: platos fuertes, acompañamientos y bebidas para 4 o 5 personas.",
  price: "$55.000",
  icon: Utensils,
  color: "text-primary-500",
  discount: "-18%",
  category: "Menús Especiales",
  image: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/3.jpg",
  ingredients: ["Variedad de proteínas", "Acompañamientos múltiples", "Ensaladas frescas", "Bebidas incluidas", "Postre sorpresa"],
  nutritionalInfo: {
    calories: "2400 kcal",
    protein: "180g",
    carbs: "240g",
    fat: "85g",
  },
};

const chefRecommendation = {
  id: 9002,
  name: "Selección del Chef",
  description:
    "El plato que el chef pediría para él: receta tradicional con producto de temporada.",
  price: "$32.900",
  icon: ChefHat,
  color: "text-primary-600",
  badge: "La del chef",
  category: "Especialidades del Chef",
  image: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/4.jpg",
  ingredients: ["Proteína selecta", "Vegetales gourmet", "Reducción especial", "Guarnición premium", "Hierbas frescas"],
  nutritionalInfo: {
    calories: "720 kcal",
    protein: "52g",
    carbs: "55g",
    fat: "28g",
  },
};

// Menu categories with icons
const menuCategories = [
  { icon: Soup, label: "Sopas" },
  { icon: UtensilsCrossed, label: "Platos fuertes" },
  { icon: Salad, label: "Ensaladas" },
  { icon: Coffee, label: "Bebidas" },
  { icon: Wine, label: "Vinos" },
];

// Comidas especiales para el slider - SE CARGAN DESDE LA BASE DE DATOS
// (Los datos hardcodeados se mantienen como fallback si falla la carga)
const fallbackFoods = [
  {
    id: 1,
    name: "Buñuelos Artesanales",
    description:
      "Deliciosos buñuelos recién hechos con receta tradicional. Crujientes por fuera, suaves por dentro. Preparados con queso fresco y papa selecta. Un clásico que no puede faltar en tu mesa.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/1.jpg",
    price: "$8.000",
  },
  {
    id: 2,
    name: "Empanadas Caseras",
    description:
      "Empanadas rellenas con los ingredientes más frescos. Disponibles en carne molida jugosa, pollo desmenuzado, queso derretido y vegetales selectos. Un sabor auténtico que te transportará a casa.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/2.jpg",
    price: "$3.500",
  },
  {
    id: 3,
    name: "Papas Rellenas",
    description:
      "Papas criollas doradas y crujientes rellenas de carne molida sazonada con especias tradicionales y cebolla caramelizada. Una explosión de sabor y textura en cada bocado.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/3.jpg",
    price: "$5.500",
  },
  {
    id: 4,
    name: "Arepas de Maíz",
    description:
      "Arepas dulces de maíz tierno hechas al estilo tradicional con queso fresco derretido. Perfectas para el desayuno, almuerzo o merienda. Suaves, esponjosas y llenas de sabor.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/4.jpg",
    price: "$4.000",
  },
  {
    id: 5,
    name: "Tamales Caseros",
    description:
      "Tamales envueltos en hoja de plátano con el auténtico sabor de la cocina tradicional. Rellenos generosos de carne de cerdo, pollo y verduras. Masa suave y aromática, elaborados con ingredientes seleccionados.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/restaurants/5.jpg",
    price: "$12.000",
  },
];

export default function LegacyHome() {
  const branding = useBranding();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<typeof mostPopular | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [specialFoods, setSpecialFoods] = useState<any[]>(fallbackFoods);

  const handleDishClick = (dish: typeof mostPopular) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  // Cargar platos destacados desde la base de datos
  useEffect(() => {
    const loadFeaturedDishes = async () => {
      try {
        const response = await fetch('/api/featured-dishes');
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            // Convertir formato de DB al formato esperado por el componente
            const formattedDishes = data.data.map((dish: any) => ({
              id: dish.id,
              name: dish.name,
              description: dish.description,
              price: dish.price,
              image: dish.image_url || fallbackFoods[0].image,
            }));
            setSpecialFoods(formattedDishes);
          }
        }
      } catch (error) {
        console.error('Error loading featured dishes:', error);
        // Mantener fallbackFoods si hay error
      }
    };

    loadFeaturedDishes();
  }, []);

  // Mosaico "Para hoy": el primero ocupa la celda grande
  const todayPicks = [
    { dish: mostPopular, label: "El más pedido", tag: null as string | null },
    { dish: dishOfTheDay, label: "Especial del día", tag: dishOfTheDay.special },
    { dish: specialOffer, label: "Menú familiar", tag: specialOffer.discount },
    { dish: chefRecommendation, label: "Recomendación del chef", tag: chefRecommendation.badge },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />

      {/* Slider de especialidades */}
      <div id="especialidades" className="relative h-[100dvh] w-full">
        <FoodSlider foods={specialFoods} autoplayInterval={5000} />
      </div>

      <div className="relative z-10 bg-[rgb(var(--background))]">
        {/* Bienvenida */}
        <section id="inicio" className="px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
            <div data-aos="fade-up">
              <h2 className="mb-5 text-4xl font-bold leading-[1.05] text-gray-950 dark:text-white md:text-5xl lg:text-6xl">
                Bienvenidos a <span className="text-primary-600 dark:text-primary-400">{branding.name}</span>
              </h2>
              <p className="mb-8 max-w-[52ch] text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                {branding.tagline ||
                  "Sazón de casa, porciones generosas y el sabor de siempre. Aquí se come como en familia."}
              </p>
              <div className="mb-9 flex flex-wrap gap-2.5 text-sm">
                {branding.hours && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" /> {branding.hours}
                  </span>
                )}
                {branding.address && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" /> {branding.address}
                  </span>
                )}
              </div>
              <Link
                href="/menu"
                className="btn-press group inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-900/15 hover:bg-primary-700"
              >
                Ver la carta
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Categorías de la carta */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-aos="fade-up" data-aos-delay="80">
              {menuCategories.map((category, index) => (
                <Link
                  key={category.label}
                  href="/menu"
                  className={`btn-press group flex flex-col justify-between gap-6 rounded-3xl border border-gray-200 bg-white p-5 hover:border-primary-300 hover:bg-primary-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-700 dark:hover:bg-primary-900/30 ${
                    index === 0 ? "col-span-2 sm:col-span-1 sm:row-span-2" : ""
                  }`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                    <category.icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{category.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Para hoy: mosaico con los destacados */}
        <section id="destacadas" className="px-4 pb-20 sm:px-6 md:pb-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl" data-aos="fade-up">
              Para hoy
            </h2>
            <div className="grid auto-rows-[260px] gap-4 md:grid-cols-4 md:auto-rows-[240px]">
              {todayPicks.map(({ dish, label, tag }, index) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => handleDishClick(dish)}
                  data-aos="fade-up"
                  data-aos-delay={index * 60}
                  className={`group relative overflow-hidden rounded-3xl bg-gray-200 text-left dark:bg-gray-800 ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : index === 1 ? "md:col-span-2" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dish.image}
                    alt={dish.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {tag && (
                    <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-950">
                      {tag}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
                    <p className="mb-1 text-sm font-medium text-white/75">{label}</p>
                    <h3 className={`font-bold leading-tight ${index === 0 ? "text-3xl md:text-4xl" : "text-xl"}`}>
                      {dish.name}
                    </h3>
                    {index === 0 && (
                      <p className="mt-2 max-w-md text-white/80 line-clamp-2">{dish.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-lg font-bold tabular-nums">{dish.price}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-white/90">
                        Ver detalles
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Plato de la semana */}
        <PlatoDeLaSemana />

        {/* Nuestro menú: franja de llamada a la acción */}
        <section id="menu-comidas" className="px-4 py-20 sm:px-6 md:py-24 lg:px-8">
          <div
            className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-primary-700 px-6 py-14 text-white sm:px-12 md:py-16 dark:bg-primary-900"
            data-aos="fade-up"
          >
            <CookingPot
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-6 h-56 w-56 text-white/[0.07] md:h-72 md:w-72"
              strokeWidth={1.25}
            />
            <div className="relative max-w-xl">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">¿Con hambre? Mire la carta completa</h2>
              <p className="mb-8 text-lg text-white/80">
                Sopas, platos fuertes, ensaladas y bebidas. Pida en línea y lo tenemos listo cuando llegue.
              </p>
              <Link
                href="/menu"
                className="btn-press inline-flex items-center gap-2 rounded-full bg-[#fafaf9] px-7 py-3.5 font-semibold text-[rgb(var(--primary-800))] hover:bg-primary-50 dark:hover:bg-[#fafaf9]/90"
              >
                <Utensils className="h-5 w-5" />
                Ver menú completo
              </Link>
            </div>
          </div>
        </section>

        {/* Domicilios */}
        <section id="delivery" className="px-4 pb-20 sm:px-6 md:pb-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl" data-aos="fade-up">
              <h2 className="mb-4 text-3xl font-bold text-gray-950 dark:text-white md:text-4xl">
                Domicilios a su casa
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Pídalo por WhatsApp y se lo llevamos calientico. Trabajamos con mototaxistas del barrio.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
              <ul className="divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white px-6 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
                {[
                  { icon: Clock, title: "Llega en 30 a 45 minutos", text: "Según qué tan lejos esté de nosotros." },
                  { icon: MapPin, title: "Cubrimos toda la ciudad", text: "Escríbanos para confirmar su zona." },
                  { icon: Bike, title: "Repartidores locales", text: "Cada domicilio es trabajo para la gente del barrio." },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-4 py-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-950 dark:text-white">{item.title}</p>
                      <p className="text-gray-600 dark:text-gray-400">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col justify-between gap-6 rounded-3xl bg-gray-100 p-6 dark:bg-gray-900 md:p-8">
                <div className="space-y-3">
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400">Costo del domicilio</span>
                    <span className="font-semibold text-gray-950 dark:text-white">Según la zona</span>
                  </p>
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400">Pago</span>
                    <span className="font-semibold text-gray-950 dark:text-white">Antes del envío</span>
                  </p>
                  <p className="flex gap-2 rounded-2xl bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    El domicilio se paga antes de que el repartidor salga. Le confirmamos el valor según su dirección.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 font-semibold text-white hover:bg-primary-700"
                  >
                    <Bike className="h-5 w-5" />
                    Pedir a domicilio
                  </button>
                  {branding.phone && (
                    <a
                      href={`tel:${branding.phone.replace(/[^\d+]/g, "")}`}
                      className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
                    >
                      <Phone className="h-4 w-4" /> O llámenos al {branding.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lo que nos distingue */}
        <section className="border-y border-gray-200 bg-white px-4 py-16 dark:border-gray-800 dark:bg-gray-900 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
            {[
              { icon: Leaf, title: "Del mercado a la olla", text: "Compramos fresco cada mañana: verduras, carnes y frutas de temporada." },
              { icon: ChefHat, title: "Sazón de casa", text: "Recetas de toda la vida, preparadas sin afán y con buen sabor." },
              { icon: HandHeart, title: "Atención con cariño", text: "Lo atendemos como en familia, en el local o a domicilio." },
            ].map((item, index) => (
              <div key={item.title} className="flex gap-4" data-aos="fade-up" data-aos-delay={index * 60}>
                <item.icon className="h-7 w-7 shrink-0 text-primary-600 dark:text-primary-400" strokeWidth={1.75} />
                <div>
                  <h3 className="mb-1.5 text-lg font-semibold text-gray-950 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonios */}
        <TestimonialsSection />

        {/* Ubicación */}
        <LocationMap
          businessName={branding.name}
          address={[branding.address, branding.city].filter(Boolean).join(", ")}
          phone={branding.phone}
          hours={branding.hours}
        />

        <Footer />

        <FloatingFooter />

        <ScrollToTopButton />

        {/* Modal de opciones de pedido */}
        <OrderCTAModal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} />

        {/* Modal de detalles del plato */}
        <DishDetailModal isOpen={isDishModalOpen} onClose={() => setIsDishModalOpen(false)} dish={selectedDish} />
      </div>
    </div>
  );
}
