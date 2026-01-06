"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react"; // Íconos bonitos
import { Button } from "./ui/button"; // Botón estilizado de shadcn
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Forzar tema claro al montar si no hay tema guardado
    const storedTheme = localStorage.getItem('restaurant-theme');
    if (!storedTheme) {
      setTheme('light');
    }
  }, [setTheme]);

  if (!mounted) return null; // O un loader, o solo el botón sin icono

  const currentTheme = theme || resolvedTheme;

  return (
    <Button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      variant="outline"
      className="w-10 h-10 p-0 rounded-full border-2 shadow-lg hover:scale-110 transition-all duration-200
        bg-yellow-400 text-gray-900 border-yellow-500
        dark:bg-gray-800 dark:text-yellow-400 dark:border-gray-700"
      aria-label={
        currentTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
      title={currentTheme === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {currentTheme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}
