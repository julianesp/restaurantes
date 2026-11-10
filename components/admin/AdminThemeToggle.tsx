"use client";

import { Moon, Sun } from "lucide-react";
import ThemeModeMenu from "@/components/ThemeModeMenu";

/** Botón de tema del admin: menú con automático / claro / oscuro (comparte la preferencia con el sitio). */
export default function AdminThemeToggle({ className = "" }: { className?: string }) {
  return (
    <ThemeModeMenu
      className={`relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
    >
      {/* Antes de montar se muestra la luna (tema por defecto: claro) para no desajustar la hidratación */}
      {(isDark) => (isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
    </ThemeModeMenu>
  );
}
