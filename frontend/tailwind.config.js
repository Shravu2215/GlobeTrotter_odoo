/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B0E14",
        surface: "#131722",
        surfaceAlt: "#1A2030",
        border: "#242B3D",
        accent: "#5B8CFF",
        accentAlt: "#7DE0C6",
        muted: "#8B93A7",
        roamora: {
          bg: "#FAF9F6",
          green: "#1A3A32",
          greenHover: "#2C4F46",
          gold: "#C69C6D",
          text: "#1E1E1E",
          card: "#FFFFFF",
          border: "#EAEAEA"
        }
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
      },
    },
  },
  plugins: [],
};
