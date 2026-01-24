"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageSquare, User } from "lucide-react";
import { useRevealOnScroll } from "../utils/useRevealOnScroll";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  avatar?: string;
  verified?: boolean;
}

// Reseñas dinámicas - En producción vendrían de una base de datos conectada a Facebook
// Array vacío hasta que se integre la autenticación con Facebook
const testimonials: Testimonial[] = [];

export default function TestimonialsSection() {
  const { isSignedIn, user } = useUser();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");

  const testimonialsReveal = useRevealOnScroll<HTMLDivElement>();

  // Auto-llenar el nombre si el usuario está autenticado
  useEffect(() => {
    if (isSignedIn && user) {
      const userName = user.firstName
        ? `${user.firstName} ${user.lastName || ""}`
        : user.emailAddresses[0]?.emailAddress || "";
      setNewReview((prev) => ({ ...prev, name: userName }));
    }
  }, [isSignedIn, user]);

  // Calcular estadísticas
  const totalReviews = testimonials.length;
  const averageRating = totalReviews > 0
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / totalReviews
    : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (rating) =>
      totalReviews > 0
        ? testimonials.filter((t) => t.rating === rating).length / totalReviews
        : 0
  );

  // Ordenar testimonios
  const sortedTestimonials = [...testimonials].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return b.helpful - a.helpful;
    }
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // En producción, aquí se enviaría a una API
    console.log("Nueva reseña:", newReview);
    alert(
      "¡Gracias por tu reseña! Será publicada después de ser revisada por nuestro equipo."
    );
    setNewReview({ name: "", rating: 5, comment: "" });
    setShowReviewForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div
        ref={testimonialsReveal.ref}
        className={`max-w-7xl mx-auto reveal-on-scroll reveal-from-bottom ${
          testimonialsReveal.isVisible ? "visible" : ""
        }`}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <MessageSquare className="w-16 h-16 text-primary-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            La opinión de nuestros comensales es muy importante para nosotros
          </p>
        </div>

        {/* Estadísticas de Reseñas */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Resumen de calificación */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Basado en {totalReviews} reseñas
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-500 mb-1">
                  {totalReviews > 0
                    ? Math.round((testimonials.filter((t) => t.rating === 5).length / totalReviews) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Recomendado
                </p>
              </div>
            </div>

            {/* Distribución de calificaciones */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                    {rating} ⭐
                  </span>
                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-accent-500 transition-all duration-500"
                      style={{ width: `${ratingDistribution[index] * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {Math.round(ratingDistribution[index] * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario para dejar reseña */}
          <div className="bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-2xl p-8 shadow-lg">
            {!showReviewForm ? (
              <div className="h-full flex flex-col justify-center items-center text-center">
                <User className="w-16 h-16 text-primary-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  ¿Has Visitado Munay?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Comparte tu experiencia con otros comensales y ayúdanos a
                  mejorar
                </p>
                {isSignedIn ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Dejar una Reseña
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Inicia sesión con tu cuenta de Facebook para dejar una
                      reseña verificada
                    </p>
                    <Link
                      href="/sign-in"
                      className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Cuéntanos tu Experiencia
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tu Nombre
                    {isSignedIn && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        ✓ Verificado con Facebook
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.name}
                    onChange={(e) =>
                      setNewReview({ ...newReview, name: e.target.value })
                    }
                    disabled={isSignedIn}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Ingresa tu nombre"
                  />
                  {isSignedIn && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nombre obtenido de tu perfil de Facebook
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calificación
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= newReview.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tu Comentario
                  </label>
                  <textarea
                    required
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Comparte tu experiencia..."
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Publicar Reseña
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Todas las Reseñas
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("recent")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === "recent"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Más Recientes
            </button>
            <button
              onClick={() => setSortBy("helpful")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === "helpful"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Más Útiles
            </button>
          </div>
        </div>

        {/* Lista de Testimonios */}
        {totalReviews === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 text-center">
            <MessageSquare className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Aún no hay reseñas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Sé el primero en compartir tu experiencia en Restaurante Munay. Tus comentarios ayudan a otros comensales y nos permiten mejorar nuestro servicio.
            </p>
            {isSignedIn ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
              >
                Dejar la Primera Reseña
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Iniciar Sesión para Dejar Reseña
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {sortedTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </h4>
                        {testimonial.verified && (
                          <span
                            className="text-blue-500 text-xs"
                            title="Usuario verificado con Facebook"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(testimonial.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {testimonial.comment}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{testimonial.helpful} personas encontraron esto útil</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
