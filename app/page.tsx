"use client";

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
  Award,
  Heart,
  Leaf,
  DollarSign,
  CreditCard,
} from "lucide-react";

import FloatingFooter from "../components/FloatingFooter";
import Navbar from "../components/Navbar/page";
import Footer from "../containers/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import {
  createWhatsAppMessage,
  createFoodMenuMessage,
  createDeliveryMessage,
  createTableReservationMessage,
} from "../utils/whatsapp";
import Link from "next/link";
import styles from "../styles/Home.module.scss";
import { useRevealOnScroll } from "../utils/useRevealOnScroll";

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

const mostPopular = {
  name: "Plato Estrella",
  description:
    "El plato más solicitado por nuestros comensales. Sabor excepcional garantizado",
  price: "$25.000",
  icon: Star,
  color: "text-yellow-500",
};

const dishOfTheDay = {
  name: "Especial del Día",
  description:
    "Una deliciosa propuesta gastronómica seleccionada especialmente para hoy. Ingredientes frescos y sabores únicos que harán de tu experiencia algo inolvidable.",
  price: "$23.990",
  icon: Flame,
  color: "text-accent",
  special: "¡Solo por hoy!",
};

const specialOffer = {
  name: "Menú Familiar",
  description:
    "Perfecto para compartir en familia o con amigos. Ingredientes frescos y preparación artesanal que te encantará.",
  price: "$55.000",
  icon: Utensils,
  color: "text-primary-500",
  discount: "18% OFF",
};

const chefRecommendation = {
  name: "Selección del Chef",
  description:
    "Una exquisita combinación de ingredientes cuidadosamente seleccionados por nuestro chef. Preparado con técnicas tradicionales y productos frescos de temporada. Perfecta para quienes buscan sabor y calidad en cada bocado.",
  price: "$32.900",
  icon: ChefHat,
  color: "text-purple-600",
  badge: "",
};

// Menu categories with icons
const menuCategories = [
  { icon: Coffee, label: "Bebidas", color: "text-amber-600" },
  { icon: Wine, label: "Vinos", color: "text-primary-500" },
  { icon: Soup, label: "Sopas", color: "text-accent-500" },
  { icon: Salad, label: "Ensaladas", color: "text-green-600" },
  { icon: UtensilsCrossed, label: "Platos Fuertes", color: "text-red-700" },
];

export default function Home() {
  // Hooks de animación para diferentes secciones
  const heroReveal = useRevealOnScroll<HTMLDivElement>();
  const specialtiesReveal = useRevealOnScroll<HTMLDivElement>();
  const popularDishReveal = useRevealOnScroll<HTMLDivElement>();
  const dishOfDayReveal = useRevealOnScroll<HTMLDivElement>();
  const specialOfferReveal = useRevealOnScroll<HTMLDivElement>();
  const chefReveal = useRevealOnScroll<HTMLDivElement>();
  const featuredReveal = useRevealOnScroll<HTMLDivElement>();
  const menuReveal = useRevealOnScroll<HTMLDivElement>();
  const deliveryReveal = useRevealOnScroll<HTMLDivElement>();
  const infoReveal = useRevealOnScroll<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* <AnnouncementBanner /> */}
      <Navbar />

      {/* <div className="pt-28">
        <MenuCategoriesBar />
      </div> */}

      <section id="inicio" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        {/* Hero Section with Icon */}
        <div
          ref={heroReveal.ref}
          className={`max-w-6xl mx-auto text-center mb-12 reveal-on-scroll reveal-scale-up ${
            heroReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="flex justify-center mb-8 mt-16">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-2xl animate-float">
                <ChefHat className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                <Star className="w-6 h-6 text-gray-900" />
              </div>
            </div>
          </div>

          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Bienvenido a{" "}
            <span className="text-primary-500">Tu Restaurante</span>
          </h2>
          <p className="text-xl text-black mb-8 max-w-3xl mx-auto">
            Donde cada plato es una obra maestra. Ingredientes frescos, recetas
            tradicionales y la pasión por la auténtica cocina se encuentran en
            cada bocado.
          </p>
        </div>

        {/* Menu Categories */}
        <div
          ref={specialtiesReveal.ref}
          id="especialidades"
          className={`max-w-6xl mx-auto py-6 reveal-on-scroll reveal-from-bottom ${
            specialtiesReveal.isVisible ? "visible" : ""
          }`}
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Nuestras Especialidades
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {menuCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift cursor-pointer"
              >
                <div
                  className={`flex flex-col items-center space-y-3 ${category.color}`}
                >
                  <category.icon className="w-12 h-12" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                    {category.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`severalFoods ${styles.severalFoods} max-w-6xl mx-auto`}
      >
        {/* Plato Más Popular */}
        <section
          className={`py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 parallax-container`}
        >
          <div
            ref={popularDishReveal.ref}
            className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-bottom ${
              popularDishReveal.isVisible ? "visible" : ""
            }`}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                🏆 El Más Pedido
              </h3>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-accent-100 dark:from-yellow-900/30 dark:to-accent-900/30 rounded-2xl p-8 max-w-4xl mx-auto hover-lift">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-6 relative rounded-full bg-gradient-to-br from-yellow-400 to-accent-500 flex items-center justify-center shadow-lg">
                  <mostPopular.icon
                    className={`w-24 h-24 ${mostPopular.color}`}
                  />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {mostPopular.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
                  {mostPopular.description}
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <span
                    className="text-4xl font-bold text-primary-500"
                    style={{
                      textShadow:
                        "0 0 2px #000, 0 1px 4px #000, 1px 0 2px #000",
                    }}
                  >
                    {mostPopular.price}
                  </span>
                  <Link
                    href={createWhatsAppMessage(
                      mostPopular.name,
                      mostPopular.price
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-primary-700 transition-colors inline-block shadow-lg"
                  >
                    Pedir por WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plato del Día */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-50 to-yellow-50 dark:from-accent-900/20 dark:to-yellow-900/20 parallax-container">
          <div
            ref={dishOfDayReveal.ref}
            className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-left ${
              dishOfDayReveal.isVisible ? "visible" : ""
            }`}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                🌅 Especial del Día
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {dishOfTheDay.special}
              </p>
            </div>

            <div className="bg-gradient-to-r from-accent-100 to-primary-100 dark:from-accent-900/30 dark:to-primary-900/30 rounded-2xl p-8 max-w-4xl mx-auto hover-lift">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-6 relative rounded-full bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center shadow-lg">
                  <dishOfTheDay.icon
                    className={`w-24 h-24 ${dishOfTheDay.color}`}
                  />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {dishOfTheDay.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
                  {dishOfTheDay.description}
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <span
                    className="text-4xl font-bold text-primary-500"
                    style={{
                      textShadow:
                        "0 0 2px #000, 0 1px 4px #000, 1px 0 2px #000",
                    }}
                  >
                    {dishOfTheDay.price}
                  </span>
                  <Link
                    href={createWhatsAppMessage(
                      dishOfTheDay.name,
                      dishOfTheDay.price
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-primary-700 transition-colors inline-block shadow-lg"
                  >
                    Pedir por WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Oferta Especial */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 parallax-container">
          <div
            ref={specialOfferReveal.ref}
            className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-right ${
              specialOfferReveal.isVisible ? "visible" : ""
            }`}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                🔥 Oferta Especial
              </h3>
              <p className="text-primary-500 dark:text-primary-400 font-semibold text-lg">
                {specialOffer.discount}
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary-100 to-pink-100 dark:from-primary-900/30 dark:to-pink-900/30 rounded-2xl p-8 max-w-4xl mx-auto relative hover-lift">
              {/* Badge de descuento */}
              <div className="absolute -top-4 -right-4 bg-primary-500 text-white px-4 py-2 rounded-full font-bold text-sm transform rotate-12 shadow-lg">
                {specialOffer.discount}
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-6 relative rounded-full bg-gradient-to-br from-primary-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <specialOffer.icon
                    className={`w-24 h-24 ${specialOffer.color}`}
                  />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {specialOffer.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
                  {specialOffer.description}
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center space-x-4">
                    <span
                      className="text-4xl font-bold text-primary-500"
                      style={{
                        textShadow:
                          "0 0 2px #000, 0 1px 4px #000, 1px 0 2px #000",
                      }}
                    >
                      {specialOffer.price}
                    </span>
                  </div>
                  <Link
                    href={createWhatsAppMessage(
                      specialOffer.name,
                      specialOffer.price
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-primary-700 transition-colors inline-block shadow-lg"
                  >
                    Aprovechar Oferta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recomendación del Chef */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 parallax-container">
          <div
            ref={chefReveal.ref}
            className={`max-w-6xl mx-auto reveal-on-scroll reveal-scale-up ${
              chefReveal.isVisible ? "visible" : ""
            }`}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                👨‍🍳 Recomendación del Chef
              </h3>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">
                {chefRecommendation.badge}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-8 max-w-4xl mx-auto relative hover-lift">
              {/* Badge de chef */}
              <div className="absolute -top-4 -left-4 bg-primary-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                Chef Choice
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-6 relative rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <chefRecommendation.icon
                    className={`w-24 h-24 ${chefRecommendation.color}`}
                  />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {chefRecommendation.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
                  {chefRecommendation.description}
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <span
                    className="text-4xl font-bold text-primary-500"
                    style={{
                      textShadow:
                        "0 0 2px #000, 0 1px 4px #000, 1px 0 2px #000",
                    }}
                  >
                    {chefRecommendation.price}
                  </span>
                  <Link
                    href={createWhatsAppMessage(
                      chefRecommendation.name,
                      chefRecommendation.price
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-primary-700 transition-colors inline-block shadow-lg"
                  >
                    Pedir por WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Platos Destacados */}
      <section
        id="destacadas"
        className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
      >
        <div
          ref={featuredReveal.ref}
          className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-bottom ${
            featuredReveal.isVisible ? "visible" : ""
          }`}
        >
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

      {/* Nuestro Menú */}
      <section
        id="menu-comidas"
        className={`relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950`}
      >
        <div
          ref={menuReveal.ref}
          className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-bottom ${
            menuReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🍽️ Nuestro Menú
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubre nuestra variedad de platos tradicionales y
              especialidades. ¡Contacta para conocer precios y disponibilidad!
            </p>
          </div>

          <div className="relative">
            {/* Menu Grid with Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover-lift">
                <Coffee className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-center dark:text-white">
                  Bebidas
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover-lift">
                <Wine className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-center dark:text-white">
                  Vinos
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover-lift">
                <Soup className="w-16 h-16 text-accent-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-center dark:text-white">
                  Sopas
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover-lift">
                <Salad className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-center dark:text-white">
                  Ensaladas
                </h4>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-8">
              <Link
                href={createFoodMenuMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-primary-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Utensils className="h-6 w-6 mr-2" />
                Ver Menú Completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Envíos a Domicilio */}
      <section
        id="delivery"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-50 to-yellow-50 dark:from-accent-900/20 dark:to-yellow-900/20"
      >
        <div
          ref={deliveryReveal.ref}
          className={`max-w-6xl mx-auto reveal-on-scroll reveal-scale-up ${
            deliveryReveal.isVisible ? "visible" : ""
          }`}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center shadow-2xl animate-float">
                  <Bike className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🏍️ Envíos a Domicilio
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Disfruta de nuestros deliciosos platos en la comodidad de tu
              hogar. Servicio rápido y confiable con mototaxistas locales.
            </p>
          </div>

          {/* Cards de beneficios */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Entrega Rápida
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tiempo estimado de entrega: 30-45 minutos dependiendo de tu
                ubicación
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Amplia Cobertura
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Realizamos envíos en toda la ciudad. Contáctanos para confirmar
                tu zona
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bike className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Apoyo Local
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Trabajamos con mototaxistas locales, generando empleo en nuestra
                comunidad
              </p>
            </div>
          </div>

          {/* Información de Costos */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border-2 border-primary-200 dark:border-primary-800 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Costo de Envío
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    Consultar
                  </p>
                </div>
              </div>

              <div className="hidden md:block w-px h-16 bg-gray-300 dark:bg-gray-600"></div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Forma de Pago
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Previo al Envío
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Importante:</strong> El costo de envío se debe
                    cancelar antes de que el repartidor salga con tu pedido. Te
                    confirmaremos el monto según tu ubicación.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-accent-100 to-primary-100 dark:from-accent-900/30 dark:to-primary-900/30 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Listo para pedir?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Haz tu pedido por WhatsApp y disfruta de comida deliciosa en tu
              casa. ¡Te llevamos el sabor hasta tu puerta!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={createDeliveryMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-accent-600 to-primary-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-500 btn-animated inline-flex items-center space-x-2"
              >
                <Bike className="w-5 h-5" />
                <span>Solicitar Delivery</span>
              </Link>
              <Link
                href={createTableReservationMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-900 dark:border-gray-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-900 dark:hover:bg-gray-600 hover:text-white transition-all duration-500 inline-flex items-center space-x-2"
              >
                <Utensils className="w-5 h-5" />
                <span>Reservar Mesa</span>
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-6">
              💡 También puedes llamarnos al <strong>321-555-7890</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Información Adicional */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-950 text-white">
        <div
          ref={infoReveal.ref}
          className={`max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center reveal-on-scroll reveal-from-bottom ${
            infoReveal.isVisible ? "visible" : ""
          }`}
        >
          <div>
            <Leaf className="h-12 w-12 text-green-400 dark:text-green-500 mx-auto mb-4 transition-all duration-500 delay-100 hover:scale-110 hover:text-green-300" />
            <h4 className="text-xl font-bold mb-2 underline underline-offset-4 text-white">
              Ingredientes Naturales
            </h4>
            <p className="text-gray-100 dark:text-gray-300">
              Productos frescos y de primera calidad, seleccionados
              cuidadosamente para garantizar el mejor sabor en cada plato
            </p>
          </div>
          <div>
            <Heart className="h-12 w-12 text-red-400 dark:text-red-500 mx-auto mb-4 transition-all duration-500 delay-100 hover:scale-125 hover:text-red-300 animate-pulse-slow" />
            <h4 className="text-xl font-bold mb-2 underline underline-offset-4 text-white">
              Hecho con Pasión
            </h4>
            <p className="text-gray-100 dark:text-gray-300">
              Cada receta es preparada con dedicación y amor por nuestros chefs,
              siguiendo tradiciones culinarias auténticas
            </p>
          </div>
          <div>
            <Award className="h-12 w-12 text-yellow-400 dark:text-yellow-500 mx-auto mb-4 transition-all duration-500 delay-100 hover:rotate-12 hover:scale-110 hover:text-yellow-300" />
            <h4 className="text-xl font-bold mb-2 underline underline-offset-4 text-white">
              Experiencia Premium
            </h4>
            <p className="text-gray-100 dark:text-gray-300">
              Más de 10 años deleitando paladares exigentes con sabores únicos y
              un servicio de excelencia incomparable
            </p>
          </div>
        </div>
      </section>

      <Footer />

      <FloatingFooter />

      <ScrollToTopButton />
    </div>
  );
}
