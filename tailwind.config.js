/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        accent: "#c5f82a",
        obsidian: {
          DEFAULT: "#070708",
          card: "#0e0e11",
          light: "#16161a",
          border: "#1a1a22",
        },
        toxic: "#c5f82a",
        cyber: "#ff5d00",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
