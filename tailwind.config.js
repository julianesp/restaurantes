/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[class~="dark-minimalist"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DE780D',
          50: '#FEF3E2',
          100: '#FDE0B5',
          200: '#FBCC85',
          300: '#F9B754',
          400: '#F7A32A',
          500: '#DE780D',
          600: '#B8620A',
          700: '#924D08',
          800: '#6C3806',
          900: '#462304',
        },
        secondary: {
          DEFAULT: '#B8620A',
          500: '#B8620A',
          600: '#924D08',
          700: '#6C3806',
        },
        accent: {
          DEFAULT: '#F7A32A',
          400: '#F9B754',
          500: '#F7A32A',
          600: '#DE780D',
        }
      }
    },
  },
  plugins: [],
};