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
          dark: '#0d1117',
          green: '#1e3a1f',
          lighter: '#2a4d2e',
          accent: '#3d6f42',
          border: '#30363d',
          surface: '#161b22',
          text: '#c9d1d9',
          muted: '#8b949e',
        },
      },

      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },

      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },

  plugins: [],
};
