/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/screens/**/*.{js,jsx,ts,tsx}",
    "./app/tabs/**/*.{js,jsx,ts,tsx}",

    // Tambahkan path lain jika perlu
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
