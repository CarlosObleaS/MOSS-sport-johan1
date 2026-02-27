/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deporte-blue': '#001f3f', // Azul oscuro de tus imágenes
        'deporte-gold': '#FFD700', // Dorado de tus imágenes
        'deporte-card': '#1e293b', // Gris oscuro para tarjetas
      }
    },
  },
  plugins: [],
}   