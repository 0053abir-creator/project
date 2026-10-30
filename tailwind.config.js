/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Islamic University Bangladesh Official Green Theme
        iugreen: {
          50: "#edfcf4",
          100: "#d4f7e4",
          200: "#acf0cc",
          300: "#74e2ad",
          400: "#3bca88",
          500: "#16b06b",
          600: "#0b8d54",
          700: "#097044",
          800: "#006A4E", // Authentic IU Logo Green
          900: "#06482e",
          950: "#02281a",
        },
        primary: {
          50: "#edfcf4",
          100: "#d4f7e4",
          200: "#acf0cc",
          300: "#74e2ad",
          400: "#3bca88",
          500: "#16b06b",
          600: "#0b8d54",
          700: "#097044",
          800: "#006A4E",
          900: "#06482e",
          950: "#02281a",
        },
      },
    },
  },
  plugins: [],
};
