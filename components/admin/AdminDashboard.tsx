"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  LayoutDashboard,
  Utensils,
  Newspaper,
  Image,
  Settings,
  Home,
  ChefHat,
  FileText,
  Users,
} from "lucide-react";

const menuItems = [
  {
    id: "overview",
    name: "Vista General",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "daily-specials",
    name: "Platos del Día",
    icon: ChefHat,
    href: "/admin/daily-specials",
  },
  {
    id: "blog",
    name: "Blog & Noticias",
    icon: Newspaper,
    href: "/admin/blog",
  },
  {
    id: "menu",
    name: "Gestión de Menú",
    icon: Utensils,
    href: "/admin/menu",
  },
  {
    id: "gallery",
    name: "Galería de Fotos",
    icon: Image,
    href: "/admin/gallery",
  },
  {
    id: "testimonials",
    name: "Testimonios",
    icon: Users,
    href: "/admin/testimonials",
  },
  {
    id: "settings",
    name: "Configuración",
    icon: Settings,
    href: "/admin/settings",
  },
];

export default function AdminDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const { user } = useUser();

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`
    : user?.emailAddresses[0]?.emailAddress || "Administrador";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Restaurante Munay
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Ver Sitio</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            ¡Bienvenido, {userName}! 👋
          </h2>
          <p className="text-primary-100">
            Gestiona el contenido del sitio web de Restaurante Munay desde este
            panel
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.id === "overview" &&
                        "Resumen de estadísticas y actividad"}
                      {item.id === "daily-specials" &&
                        "Agregar y gestionar platos especiales del día"}
                      {item.id === "blog" &&
                        "Crear y publicar noticias, recetas y eventos"}
                      {item.id === "menu" &&
                        "Actualizar el menú y precios"}
                      {item.id === "gallery" &&
                        "Subir y organizar fotos de comidas"}
                      {item.id === "testimonials" &&
                        "Gestionar reseñas de clientes"}
                      {item.id === "settings" &&
                        "Configurar información del restaurante"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Platos del Día
              </h4>
              <ChefHat className="w-5 h-5 text-primary-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              4
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Activos actualmente
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Publicaciones
              </h4>
              <FileText className="w-5 h-5 text-accent-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              6
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              En el blog
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Fotos
              </h4>
              <Image className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              17
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              En la galería
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Testimonios
              </h4>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              6
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Reseñas publicadas
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">i</span>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                Instrucciones de Uso
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>
                  • <strong>Platos del Día:</strong> Agrega los especiales
                  diarios que aparecerán destacados en la página principal
                </li>
                <li>
                  • <strong>Blog & Noticias:</strong> Publica noticias,
                  recetas, eventos y novedades del restaurante
                </li>
                <li>
                  • <strong>Galería:</strong> Sube fotos profesionales de tus
                  platillos
                </li>
                <li>
                  • <strong>Menú:</strong> Actualiza precios y descripciones de
                  los platos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
