import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.25rem", lg: "1.5rem" },
      screens: { "2xl": "1160px" }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#D4AF37",
          foreground: "#090806"
        },
        accent: {
          DEFAULT: "#7B61FF",
          foreground: "#F8F7FF"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        display: ["Inter", "SF Pro Display", "PingFang SC", "Microsoft YaHei", "sans-serif"]
      },
      boxShadow: {
        gold: "0 0 42px rgba(212, 175, 55, 0.18)",
        violet: "0 0 54px rgba(123, 97, 255, 0.18)"
      },
      keyframes: {
        "energy-flow": {
          "0%": { transform: "translateX(-20%) translateY(0)", opacity: "0.2" },
          "50%": { transform: "translateX(15%) translateY(-8%)", opacity: "0.75" },
          "100%": { transform: "translateX(42%) translateY(2%)", opacity: "0.25" }
        },
        "star-pulse": {
          "0%, 100%": { opacity: "0.22" },
          "50%": { opacity: "0.85" }
        }
      },
      animation: {
        "energy-flow": "energy-flow 12s ease-in-out infinite alternate",
        "star-pulse": "star-pulse 4s ease-in-out infinite"
      }
    }
  },
  plugins: [animate, typography]
};

export default config;
