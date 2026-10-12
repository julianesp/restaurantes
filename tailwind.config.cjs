/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

// secondary/accent apuntan a la misma escala que primary: un solo color de marca en todo el sitio
// (y así también siguen el color propio de cada restaurante).
const scale = (shift = 0) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((k, i, all) => {
      const target = all[Math.min(all.length - 1, i + shift)];
      return [k, `rgb(var(--primary-${target}) / <alpha-value>)`];
    })
  );

module.exports = {
  // `.dark` lo pone next-themes en <html>; se conserva el selector antiguo `dark-minimalist`.
  // Con solo el selector antiguo, las clases dark: nunca se activaban al cambiar de tema.
  darkMode: ['variant', ['&:is(.dark *)', '&:is([class~="dark-minimalist"] *)']],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-geist-sans)', 'ui-sans-serif', 'sans-serif'],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      colors: {
        // Variables CSS: cada restaurante puede redefinir su color (ver lib/branding.ts → themeCss)
        primary: {
          DEFAULT: 'rgb(var(--primary-500) / <alpha-value>)',
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          200: 'rgb(var(--primary-200) / <alpha-value>)',
          300: 'rgb(var(--primary-300) / <alpha-value>)',
          400: 'rgb(var(--primary-400) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
          700: 'rgb(var(--primary-700) / <alpha-value>)',
          800: 'rgb(var(--primary-800) / <alpha-value>)',
          900: 'rgb(var(--primary-900) / <alpha-value>)',
          950: 'rgb(var(--primary-900) / <alpha-value>)',
        },
        secondary: { DEFAULT: 'rgb(var(--primary-700) / <alpha-value>)', ...scale(2) },
        accent: { DEFAULT: 'rgb(var(--primary-400) / <alpha-value>)', ...scale(0) },
        // Neutros cálidos (piedra) en lugar del gris azulado por defecto
        gray: colors.stone,
        slate: colors.stone,
        // El naranja/ámbar heredado pasa a la escala de marca
        orange: scale(0),
        amber: scale(0),
      }
    },
  },
  plugins: [],
};