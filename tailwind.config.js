/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        military: {
          bg: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          hover: "#475569",

          accent: "#10b981",
          accentHover: "#059669",

          alert: "#f97316",
          danger: "#ef4444",
          success: "#22c55e",
          warning: "#f59e0b",
          info: "#3b82f6",

          text: "#f8fafc",
          textMuted: "#94a3b8",
        },
      },

      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },

      boxShadow: {
        glow: "0 0 25px rgba(16,185,129,0.25)",
        card: "0 8px 30px rgba(0,0,0,0.25)",
      },

      backdropBlur: {
        xs: "2px",
      },

      transitionDuration: {
        400: "400ms",
      },
    },
  },

  plugins: [],
};