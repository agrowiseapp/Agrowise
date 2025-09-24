/** @type {import('tailwindcss').Config} */
const colors = require("./assets/Theme/colors");
module.exports = {
  content: [
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: { colors },
  },
  plugins: [],
};
