/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'selector', // Activa el modo oscuro cuando la clase 'dark' está presente
  theme: {
    extend: {
      colors: {
        neutral: {
          150: '#f9f9f9',
          750: '#303030',
          850: '#212121'
        },
      },
      screens: {
        'xs': '460px',
      },
    },
  },
  plugins: [],
}
