/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 한국식 색상 (상승: 빨강, 하락: 파랑)
        "up-kr": "#ef4444",
        "down-kr": "#3b82f6",
        // 미국식 색상 (상승: 초록, 하락: 빨강)
        "up-us": "#089981",
        "down-us": "#ef4444",
        // 브랜드 색상 (Sophisticated Monochrome)
        primary: {
          50: "var(--color-primary-50, #fafafa)",
          100: "var(--color-primary-100, #f4f4f5)",
          500: "var(--color-primary-500, #71717a)",
          600: "var(--color-primary-600, #52525b)",
          900: "var(--color-primary-900, #18181b)",
        },
      },
      backgroundImage: {},
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.25)",
        card: "0 4px 16px 0 rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "price-up": "priceUp 0.5s ease-in-out",
        "price-down": "priceDown 0.5s ease-in-out",
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        priceUp: {
          "0%": { backgroundColor: "rgba(8, 153, 129, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
        priceDown: {
          "0%": { backgroundColor: "rgba(239, 68, 68, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
