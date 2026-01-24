"use client";

import { useRevealOnScroll } from "../../utils/useRevealOnScroll";
import Navbar from "../../components/Navbar/page";
import Footer from "../../containers/Footer/page";
import FloatingFooter from "../../components/FloatingFooter";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import {
  Heart,
  Users,
  Award,
  Clock,
  ChefHat,
  Leaf,
  Star,
  Target,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const heroReveal = useRevealOnScroll<HTMLDivElement>();
  const storyReveal = useRevealOnScroll<HTMLDivElement>();
  const philosophyReveal = useRevealOnScroll<HTMLDivElement>();
  const valuesReveal = useRevealOnScroll<HTMLDivElement>();
  const teamReveal = useRevealOnScroll<HTMLDivElement>();
  const whyUsReveal = useRevealOnScroll<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <div
          ref={heroReveal.ref}
          className={`max-w-7xl mx-auto text-center reveal-on-scroll reveal-scale-up ${
            heroReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-2xl animate-float">
              <ChefHat className="w-12 h-12 text-primary-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Conoce la historia, filosofía y valores que hacen de Restaurante
            Munay un lugar especial en el Valle de Sibundoy
          </p>
        </div>
      </section>

      {/* Historia del Restaurante */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div
          ref={storyReveal.ref}
          className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-left ${
            storyReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-10 h-10 text-primary-500" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Nuestra Historia
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-lg leading-relaxed">
                  Restaurante Munay nació del sueño de llevar los sabores
                  auténticos y tradicionales del Valle de Sibundoy a cada mesa.
                  Fundado con la pasión por la gastronomía local y el compromiso
                  con la calidad, nos hemos convertido en un referente en la
                  región.
                </p>
                <p className="text-lg leading-relaxed">
                  Nuestro nombre "Munay" refleja el amor y dedicación que
                  ponemos en cada plato que servimos. Desde nuestros inicios,
                  hemos trabajado con ingredientes frescos y locales,
                  manteniendo vivas las recetas tradicionales mientras
                  innovamos constantemente.
                </p>
                <p className="text-lg leading-relaxed">
                  Hoy nos enorgullece ser el primer restaurante del Alto
                  Putumayo con presencia digital completa, facilitando a
                  nuestros clientes el acceso a nuestros servicios de reservas y
                  pedidos en línea.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center shadow-2xl">
                <Award className="w-48 h-48 text-primary-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filosofía de Cocina */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-50 to-yellow-50 dark:from-accent-900/20 dark:to-yellow-900/20">
        <div
          ref={philosophyReveal.ref}
          className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-right ${
            philosophyReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <ChefHat className="w-16 h-16 text-accent-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nuestra Filosofía
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              En Restaurante Munay creemos que la mejor comida nace de la
              combinación perfecta entre tradición e innovación
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Ingredientes Frescos
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Seleccionamos cuidadosamente cada ingrediente, trabajando con
                productores locales para garantizar frescura y calidad en cada
                plato.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Recetas Tradicionales
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Mantenemos vivas las recetas ancestrales de nuestra región,
                preparadas con técnicas tradicionales que han pasado de
                generación en generación.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Innovación Constante
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Experimentamos con nuevas combinaciones de sabores y
                presentaciones, siempre respetando la esencia de nuestra cocina
                tradicional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores del Restaurante */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div
          ref={valuesReveal.ref}
          className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-bottom ${
            valuesReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="text-center mb-12">
            <Target className="w-16 h-16 text-primary-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nuestros Valores
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Los principios que guían nuestro trabajo cada día
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Calidad Sin Compromiso
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Nunca comprometemos la calidad de nuestros platos. Cada
                  ingrediente es seleccionado con rigurosidad y cada
                  preparación sigue los más altos estándares.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Atención Excepcional
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Cada cliente es especial para nosotros. Brindamos un servicio
                  cálido, personalizado y profesional que hace que cada visita
                  sea memorable.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Compromiso Local
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Apoyamos a productores y proveedores locales, contribuyendo al
                  desarrollo económico de nuestra comunidad y generando empleo
                  en la región.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Honestidad y Transparencia
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Somos transparentes con nuestros clientes sobre la procedencia
                  de nuestros ingredientes y nuestros procesos de preparación.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Pasión por la Gastronomía
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Cada plato que servimos lleva el amor y la dedicación de
                  nuestro equipo. La cocina es nuestro arte y cada día buscamos
                  perfeccionarlo.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Innovación Digital
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Somos pioneros en el Alto Putumayo, ofreciendo servicios
                  digitales modernos que facilitan la experiencia de nuestros
                  clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo (Placeholder para fotos futuras) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div
          ref={teamReveal.ref}
          className={`max-w-6xl mx-auto reveal-on-scroll reveal-scale-up ${
            teamReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="text-center mb-12">
            <Users className="w-16 h-16 text-primary-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Conoce a las personas que hacen posible cada experiencia
              gastronómica
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center">
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Nuestro equipo está conformado por chefs apasionados,
                meseros atentos y personal comprometido con ofrecer la mejor
                experiencia. Cada miembro de nuestro equipo aporta su talento y
                dedicación para hacer de tu visita algo especial.
              </p>
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 border-l-4 border-primary-500">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "Estamos trabajando en presentar a nuestro increíble equipo.
                  Próximamente podrás conocer a nuestros chefs, directivos y
                  todo el personal que hace posible la magia de Restaurante
                  Munay."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué Elegirnos */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-950 text-white">
        <div
          ref={whyUsReveal.ref}
          className={`max-w-6xl mx-auto reveal-on-scroll reveal-from-bottom ${
            whyUsReveal.isVisible ? "visible" : ""
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por Qué Elegir Restaurante Munay?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Somos más que un restaurante, somos una experiencia gastronómica
              única en el Valle de Sibundoy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-primary-500 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Primer Restaurante Digital
              </h3>
              <p className="text-gray-300">
                Somos el único restaurante en el Alto Putumayo con presencia
                digital completa, reservas y pedidos en línea.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Productos Locales</h3>
              <p className="text-gray-300">
                Trabajamos con productores locales, garantizando frescura y
                apoyando la economía de nuestra comunidad.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Atención Personalizada</h3>
              <p className="text-gray-300">
                Cada cliente recibe un trato especial y personalizado que hace
                la diferencia en su experiencia.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-accent-500 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chef Experimentado</h3>
              <p className="text-gray-300">
                Nuestro chef combina técnicas tradicionales con innovación para
                crear platos únicos.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-primary-500 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Calidad Garantizada</h3>
              <p className="text-gray-300">
                Cada plato pasa por rigurosos controles de calidad para
                garantizar tu satisfacción.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Servicio Rápido</h3>
              <p className="text-gray-300">
                Respetamos tu tiempo sin comprometer la calidad. Servicio
                eficiente y delivery disponible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent-100 to-primary-100 dark:from-accent-900/30 dark:to-primary-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            ¿Listo para Vivir la Experiencia Munay?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Ven y descubre por qué somos el restaurante favorito del Valle de
            Sibundoy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver Menú Completo
            </Link>
            <Link
              href="/#delivery"
              className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500 dark:text-primary-400 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg border-2 border-primary-500"
            >
              Hacer un Pedido
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingFooter />
      <ScrollToTopButton />
    </div>
  );
}
