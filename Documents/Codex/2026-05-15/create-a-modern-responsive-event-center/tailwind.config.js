/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}", "./server/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0b0f14",
        champagne: "#f4d7a1",
        bronze: "#b8823d",
        pearl: "#f8f5ef",
        sage: "#7c927d",
        wine: "#6e243c"
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 90px rgba(184, 130, 61, 0.22)",
        soft: "0 18px 60px rgba(11, 15, 20, 0.12)"
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        reveal: "reveal 700ms ease both",
        shimmer: "shimmer 2.5s linear infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      }
    }
  },
  plugins: []
};
