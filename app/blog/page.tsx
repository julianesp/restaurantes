"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar/page";
import Footer from "../../containers/Footer/page";
import FloatingFooter from "../../components/FloatingFooter";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import {
  Calendar,
  Clock,
  ChefHat,
  Utensils,
  Newspaper,
  Tag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRevealOnScroll } from "../../utils/useRevealOnScroll";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: "platos-especiales" | "noticias" | "recetas" | "eventos";
  date: string;
  readTime: number;
  image?: string;
  tags: string[];
}

// Datos de ejemplo - En producción vendrían de una base de datos o CMS
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Plato Especial de Enero: Cazuela de Mariscos del Pacífico",
    excerpt:
      "Este mes presentamos nuestra exquisita cazuela de mariscos frescos del Pacífico colombiano, preparada con una receta tradicional única.",
    content: "",
    category: "platos-especiales",
    date: "2026-01-15",
    readTime: 3,
    tags: ["Plato del Mes", "Mariscos", "Especial"],
  },
  {
    id: 2,
    title: "¡Renovamos Nuestra Cocina con Equipos de Última Generación!",
    excerpt:
      "Estamos emocionados de anunciar la modernización de nuestra cocina con equipos de última tecnología para servirte mejor.",
    content: "",
    category: "noticias",
    date: "2026-01-12",
    readTime: 4,
    tags: ["Renovación", "Noticias", "Mejoras"],
  },
  {
    id: 3,
    title: "Receta Casera: Cómo Hacer Arepas Perfectas",
    excerpt:
      "Descubre los secretos de nuestro chef para preparar las arepas más deliciosas y esponjosas en casa.",
    content: "",
    category: "recetas",
    date: "2026-01-08",
    readTime: 5,
    tags: ["Recetas", "Tips de Cocina", "Arepas"],
  },
  {
    id: 4,
    title: "Evento Especial: Noche de Parrilla - Febrero 14",
    excerpt:
      "Únete a nosotros el 14 de febrero para una noche especial con lo mejor de nuestra parrilla y música en vivo.",
    content: "",
    category: "eventos",
    date: "2026-01-05",
    readTime: 2,
    tags: ["Eventos", "Parrilla", "San Valentín"],
  },
  {
    id: 5,
    title: "El Arte del Sancocho: Historia de un Plato Tradicional",
    excerpt:
      "Exploramos la rica historia detrás del sancocho, uno de los platos más emblemáticos de nuestra gastronomía.",
    content: "",
    category: "recetas",
    date: "2026-01-01",
    readTime: 6,
    tags: ["Historia", "Sancocho", "Tradición"],
  },
  {
    id: 6,
    title: "Nuevo Chef se Une al Equipo de Munay",
    excerpt:
      "Damos la bienvenida al Chef Miguel Ángel Torres, quien trae consigo 15 años de experiencia en cocina tradicional colombiana.",
    content: "",
    category: "noticias",
    date: "2025-12-28",
    readTime: 3,
    tags: ["Equipo", "Nuevo Chef", "Noticias"],
  },
];

const categories = [
  { id: "todos", name: "Todos", icon: Newspaper },
  { id: "platos-especiales", name: "Platos Especiales", icon: Utensils },
  { id: "noticias", name: "Noticias", icon: Newspaper },
  { id: "recetas", name: "Recetas & Tips", icon: ChefHat },
  { id: "eventos", name: "Eventos", icon: Calendar },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const heroReveal = useRevealOnScroll<HTMLDivElement>();
  const postsReveal = useRevealOnScroll<HTMLDivElement>();

  const filteredPosts =
    selectedCategory === "todos"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "platos-especiales": "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
      noticias: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
      recetas: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      eventos: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      "platos-especiales": "Plato Especial",
      noticias: "Noticia",
      recetas: "Receta",
      eventos: "Evento",
    };
    return labels[category as keyof typeof labels] || category;
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
              <Newspaper className="w-12 h-12 text-primary-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Blog & Noticias
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Descubre nuestros platos especiales, noticias, recetas y eventos
            exclusivos del Restaurante Munay
          </p>
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

      {/* Blog Posts Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div
          ref={postsReveal.ref}
          className={`max-w-7xl mx-auto reveal-on-scroll reveal-from-bottom ${
            postsReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover-lift border border-gray-200 dark:border-gray-700"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
                  {post.category === "platos-especiales" && (
                    <Utensils className="w-16 h-16 text-primary-400" />
                  )}
                  {post.category === "noticias" && (
                    <Newspaper className="w-16 h-16 text-primary-400" />
                  )}
                  {post.category === "recetas" && (
                    <ChefHat className="w-16 h-16 text-primary-400" />
                  )}
                  {post.category === "eventos" && (
                    <Calendar className="w-16 h-16 text-primary-400" />
                  )}
                </div>

                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {getCategoryLabel(post.category)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime} min</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Read More Button */}
                  <button className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
                    Leer Más
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No hay publicaciones en esta categoría
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pronto agregaremos más contenido. ¡Vuelve pronto!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent-100 to-primary-100 dark:from-accent-900/30 dark:to-primary-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            ¿Quieres Estar al Día?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            No te pierdas nuestros platos especiales, eventos y novedades
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver Menú
            </Link>
            <Link
              href="/#delivery"
              className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500 dark:text-primary-400 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg border-2 border-primary-500"
            >
              Hacer Pedido
            </Link>
          </div>
        </div>
      </section>

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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
