import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#07090e",
        surface: {
          DEFAULT: "#0e1320",
          card: "#0e1422",
          elevated: "#121828",
          highlight: "#182136",
          dark: "#0a0e17",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
          cyan: "rgba(6, 182, 212, 0.3)",
        },
        brand: {
          cyan: "#06B6D4",
          neon: "#22D3EE",
          blue: "#2563EB",
          deepBlue: "#1D4ED8",
          glow: "rgba(6, 182, 212, 0.35)",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
