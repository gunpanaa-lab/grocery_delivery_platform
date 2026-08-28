/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf5',
          100: '#dcfce8',
          500: '#22a35a',
          600: '#1e8e5a',
          700: '#166534',
        },
      },
    },
  },
  plugins: [],
};
