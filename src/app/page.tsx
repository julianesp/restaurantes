"use client";

import { Star, Utensils, ChevronLeft, ChevronRight } from "lucide-react";

import { useState } from "react";
import Image from "next/image";
import ImageSlider from "../components/ImageSlider";
import FloatingFooter from "../components/FloatingFooter";
import Navbar from "../components/Navbar";
import Footer from "../containers/Footer";
import MenuCategoriesBar from "../components/MenuCategoriesBar";
import AnnouncementBanner from "../components/AnnouncementBanner";
import {
  createWhatsAppMessage,
  createFoodMenuMessage,
} from "../utils/whatsapp";
import Link from "next/link";
import { Clock } from "lucide-react";
import styles from "../styles/Home.module.scss";

const featuredPizzas = [
  {
    id: 1,
    name: "Margarita Suprema",
    description:
      "Salsa de tomate artesanal, mozzarella fresca, albahaca y aceite de oliva extra virgen",
    price: "$18.990",
    image:
      "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/pizzas/margarita.jpg",
  },
  {
    id: 2,
    name: "Pepperoni Clásica",
    description:
      "Generosas rodajas de pepperoni, mozzarella derretida y orégano fresco",
    price: "$21.990",
    image:
      "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/pizzas/pepperoni.jpg",
  },
  {
    id: 3,
    name: "Hawaiana Gourmet",
    description:
      "Jamón premium, piña tropical, mozzarella y un toque de cilantro",
    price: "$22.990",
    image:
      "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/pizzas/hawaiana-gourmet.jpg",
  },
];

const mostPopular = {
  name: "Hawaiana",
  description: "Jamón premium, piña tropical, mozzarella",
  price: "$25.000",
  image:
    "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/pizzas/hawaiana.jpg",
};

const pizzaOfTheDay = {
  name: "Pizza tropical",
  description:
    "Una deliciosa combinación de sabores dulces y salados: jugosa piña, jamón ahumado y queso fundido sobre una base crujiente. ¡Un clásico que te transporta directo al paraíso en cada bocado! 🌴✨",
  price: "$23.990",
  image:
    "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/pizzas/carnes%20y%20tropical.jpg",
  special: "¡Solo por hoy!",
};

const specialOffer = {
  name: "Pizza Familiar",
  description:
    "Perfecta para compartir en familia o con amigos. Ingredientes frescos y una masa artesanal que te encantará.",
  price: "$55.000",
  // originalPrice: "$34.990",
  image:
    "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/pizzas/pizza_mega.jpg",
  discount: "18% OFF",
};

const chefRecommendation = {
  name: "Trufa y Prosciutto",
  description:
    "Salsa de trufa negra, prosciutto di Parma, rúcula fresca, parmesano y aceite de trufa",
  price: "$32.990",
  image:
    "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/pizzas/trufa-prosciutto.jpg",
  badge: "",
};

// Image data for sliders
const imageCategories = {
  pizza: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  comidas: ["1", "2", "3", "4"],
  preparacion: ["1", "2", "3", "4", "5"],
};

// Food menu images data
const foodMenuImages = [
  {
    id: 1,
    url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/listado%20food/1.jpg",
    alt: "Menú de comidas 1",
  },
  {
    id: 2,
    url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/listado%20food/2.jpg",
    alt: "Menú de comidas 2",
  },
  {
    id: 3,
    url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/listado%20food/3.jpg",
    alt: "Menú de comidas 3",
  },
  {
    id: 4,
    url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/listado%20food/4.jpg",
    alt: "Menú de comidas 4",
  },
  {
    id: 5,
    url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/listado%20food/5.jpg",
    alt: "Menú de comidas 5",
  },
  {
    id: 6,
    url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/listado%20food/6.jpg",
    alt: "Menú de comidas 6",
  },
  {
    id: 7,
    url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/listado%20food/7.jpg",
    alt: "Menú de comidas 7",
  },
  {
    id: 8,
    url: "https://ipbxcphqipulqm7d.public.blob.vercel-storage.com/images/listado%20food/8.jpg",
    alt: "Menú de comidas 8",
  },
];

export default function Home() {
  const [currentFoodIndex, setCurrentFoodIndex] = useState(0);

  const nextFoodSlide = () => {
    setCurrentFoodIndex((prevIndex) =>
      prevIndex === foodMenuImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevFoodSlide = () => {
    setCurrentFoodIndex((prevIndex) =>
      prevIndex === 0 ? foodMenuImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <AnnouncementBanner />
      <Navbar />
      <MenuCategoriesBar />

      <section id="inicio" className="py-6 px-4 sm:px-6 lg:px-8">
        <ImageSlider
          images={imageCategories.pizza}
          category="pizza"
          title=""
          autoplayInterval={4000}
        />

        <div className="max-w-6xl mx-auto text-center ">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Bienvenido a{" "}
            <span className="text-emerald-600">Saboreos Pizza</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Donde cada pizza es una obra maestra. Ingredientes frescos, recetas
            tradicionales y el amor por la auténtica cocina italiana se
            encuentran en cada bocado.
          </p>

          {/* <a 
            href="#destacadas"
            className="bg-emerald-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-emerald-700 transition-colors shadow-lg inline-block"
          >
            Ver Nuestras Pizzas
          </a> */}
        </div>

        <div id="especialidades" className="flex items-center space-x-2 py-6">
          <ImageSlider
            images={imageCategories.comidas}
            category="comidas"
            title="Otras Especialidades"
            autoplayInterval={2500}
          />
        </div>
      </section>

      <section
        className={`severalFoods ${styles.severalFoods} max-w-6xl mx-auto`}
      >
        {/* Pizza Más Popular */}
        <section className={`py-16 px-4 sm:px-6 lg:px-8 bg-white `}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                🏆 La Más Pedida
              </h3>

              {/* <p className="text-gray-600">{mostPopular.orders ?? ""}</p> */}
            </div>

            <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-6 relative rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={mostPopular.image}
                    alt={mostPopular.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-4">
                  {mostPopular.name}
                </h4>
                <p className="text-gray-600 mb-6 max-w-2xl">
                  {mostPopular.description}
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <span
                    className="text-4xl font-bold text-yellow-400"
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
                    className="bg-emerald-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-emerald-700 transition-colors inline-block shadow-lg"
                  >
                    Pedir por WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pizza del Día */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                🌅 Pizza del Día
              </h3>
              <p className="text-gray-600">{pizzaOfTheDay.special}</p>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-6 relative rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={pizzaOfTheDay.image}
                    alt={pizzaOfTheDay.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-4">
                  {pizzaOfTheDay.name}
                </h4>
                <p className="text-gray-600 mb-6 max-w-2xl">
                  {pizzaOfTheDay.description}
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <span
                    className="text-4xl font-bold text-yellow-400"
                    style={{
                      textShadow:
                        "0 0 2px #000, 0 1px 4px #000, 1px 0 2px #000",
                    }}
                  >
                    {pizzaOfTheDay.price}
                  </span>
                  <Link
                    href={createWhatsAppMessage(
                      pizzaOfTheDay.name,
                      pizzaOfTheDay.price
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-orange-700 transition-colors inline-block shadow-lg"
                  >
                    Pedir por WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Oferta Especial */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                🔥 Oferta Especial
              </h3>
              <p className="text-red-600 font-semibold text-lg">
                {specialOffer.discount}
              </p>
            </div>

            <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-8 max-w-4xl mx-auto relative">
              {/* Badge de descuento */}
              <div className="absolute -top-4 -right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm transform rotate-12 shadow-lg">
                {specialOffer.discount}
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-6 relative rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={specialOffer.image}
                    alt={specialOffer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-4">
                  {specialOffer.name}
                </h4>
                <p className="text-gray-600 mb-6 max-w-2xl">
                  {specialOffer.description}
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center space-x-4">
                    {/* <span className="text-2xl text-gray-400 line-through">
                      {specialOffer.originalPrice}
                    </span> */}
                    <span
                      className="text-4xl font-bold text-yellow-400"
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
                    className="bg-red-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-red-700 transition-colors inline-block shadow-lg"
                  >
                    Aprovechar Oferta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recomendación del Chef */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                👨‍🍳 Recomendación del Chef
              </h3>
              <p className="text-purple-600 font-semibold">
                {chefRecommendation.badge}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-8 max-w-4xl mx-auto relative">
              {/* Badge de chef */}
              <div className="absolute -top-4 -left-4 bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                Chef Choice
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 mb-6 relative rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={chefRecommendation.image}
                    alt={chefRecommendation.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-4">
                  {chefRecommendation.name}
                </h4>
                <p className="text-gray-600 mb-6 max-w-2xl">
                  {chefRecommendation.description}
                </p>
                <div className="flex flex-col items-center space-y-4">
                  <span
                    className="text-4xl font-bold text-yellow-400"
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
                    className="bg-purple-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-purple-700 transition-colors inline-block shadow-lg"
                  >
                    Pedir por WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Pizzas Destacadas */}
      <section id="destacadas" className="py-6 px-4 sm:px-6 lg:px-8">
        <div>
          <ImageSlider
            images={imageCategories.preparacion}
            category="preparacion"
            title="Mi formación"
            autoplayInterval={3500}
          />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Pizzas Destacadas del Día
            </h3>
            <p className="text-gray-600">
              Nuestras especialidades más populares, preparadas con ingredientes
              frescos y de la más alta calidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 ">
            {featuredPizzas.map((pizza) => (
              <div
                key={pizza.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 duration-200 ease-in-out"
              >
                <div className="p-6">
                  <div className="w-24 h-24 mx-auto mb-4 relative rounded-full overflow-hidden shadow-md">
                    <Image
                      src={pizza.image}
                      alt={pizza.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {pizza.name}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    {pizza.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-2xl font-bold text-yellow-400"
                      style={{
                        textShadow:
                          "0 0 2px #000, 0 1px 4px #000, 1px 0 2px #000",
                      }}
                    >
                      {pizza.price}
                    </span>
                    <Link
                      href={createWhatsAppMessage(pizza.name, pizza.price)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm inline-block"
                    >
                      Pedir por WhatsApp
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menú de Comidas Carousel */}
      <section
        id="menu-comidas"
        className={`relative py-16 px-4 sm:px-6 lg:px-8 bg-white  `}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              🍽️ Nuestro Menú de Comidas
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra variedad de platos tradicionales y
              especialidades. ¡Contacta al chef para conocer precios y
              disponibilidad!
            </p>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-xl shadow-lg bg-gray-50">
              <div className="relative h-96 md:h-[500px]">
                <Image
                  src={foodMenuImages[currentFoodIndex].url}
                  alt={foodMenuImages[currentFoodIndex].alt}
                  fill
                  className="object-cover transition-all duration-500 ease-in-out"
                  priority
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevFoodSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextFoodSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {foodMenuImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFoodIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentFoodIndex
                          ? "bg-white scale-110"
                          : "bg-white/60 hover:bg-white/80"
                      }`}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-8">
              <Link
                href={createFoodMenuMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-emerald-600 text-white px-8 py-4 text-lg rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Utensils className="h-6 w-6 mr-2" />
                Ver Menú Completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Información Adicional */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Utensils className="h-12 w-12 text-emerald-400 mx-auto mb-4 hover:-scale-x-100 transition-normal duration-500 delay-100 hover:rotate-45" />
            <h4 className="text-xl font-bold mb-2 underline underline-offset-4">
              Ingredientes Frescos
            </h4>
            <p className="text-gray-100">
              Seleccionamos solo los mejores ingredientes de la región para
              nuestras pizzas
            </p>
          </div>
          <div>
            <Clock className="h-12 w-12 text-emerald-400 mx-auto mb-4 transition-normal duration-500 delay-100 hover:rotate-180" />
            <h4 className="text-xl font-bold mb-2 underline underline-offset-4">
              Entrega Rápida
            </h4>
            <p className="text-gray-100">
              Entrega a domicilio para Santiago, Colón, San Pedro, Sibundoy y
              San Francisco
            </p>
          </div>
          <div>
            <Star className="h-12 w-12 text-emerald-400 mx-auto mb-4  transition-normal duration-500 delay-100 hover:rotate-180" />
            <h4 className="text-xl font-bold mb-2 underline underline-offset-4">
              Calidad Garantizada
            </h4>
            <p className="text-gray-100">
              Más de 10 años perfeccionando nuestras recetas tradicionales
            </p>
          </div>
        </div>
      </section>

      <Footer />

      <FloatingFooter />
    </div>
  );
}
