/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal de 3 azules
        primary: {
          DEFAULT: '#00A2F7',  // Azul principal brillante
          50: '#E6F7FF',
          100: '#BAE7FF',
          200: '#91D5FF',
          300: '#69C0FF',
          400: '#4DC4FF',
          500: '#00A2F7',      // Color base
          600: '#0077CC',      // Azul intermedio
          700: '#0066AA',
          800: '#005599',
          900: '#003D77',
        },
        secondary: {
          DEFAULT: '#0077CC',  // Azul intermedio
          500: '#0077CC',
          600: '#005599',
          700: '#004477',
        },
        accent: {
          DEFAULT: '#33B5FF',  // Azul claro/acento
          400: '#4DC4FF',
          500: '#33B5FF',
          600: '#1AA3F0',
        }
      }
    },
  },
  plugins: [],
};