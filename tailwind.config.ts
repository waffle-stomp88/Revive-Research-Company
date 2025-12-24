import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem",
        md: ".375rem",
        sm: ".1875rem",
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        cyan: {
          DEFAULT: "#21d8ff",
          50: "#21d8ff0D",
          100: "#21d8ff1A",
          200: "#21d8ff33",
          300: "#21d8ff4D",
          400: "#21d8ff66",
          500: "#21d8ff80",
        },
        yellow: {
          DEFAULT: "#E7FB10",
          50: "#E7FB100D",
          100: "#E7FB101A",
          200: "#E7FB1033",
          300: "#E7FB104D",
          400: "#E7FB1066",
          500: "#E7FB1080",
        },
        brand: {
          cyan: "#21d8ff",
          yellow: "#E7FB10",
          purple: "#9d4edd",
          pink: "#ec4899",
          orange: "#f97316",
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["JetBrains Mono", "var(--font-mono)", "Menlo", "monospace"],
        display: ["Bebas Neue", "Space Grotesk", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.9" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow-yellow": {
          "0%, 100%": {
            borderColor: "rgba(231, 251, 16, 0.6)",
            boxShadow: "0 0 20px rgba(231, 251, 16, 0.2), inset 0 0 20px rgba(231, 251, 16, 0.04)",
          },
          "50%": {
            borderColor: "rgba(231, 251, 16, 0.9)",
            boxShadow: "0 0 30px rgba(231, 251, 16, 0.5), inset 0 0 20px rgba(231, 251, 16, 0.1)",
          },
        },
        "pulse-glow-cyan": {
          "0%, 100%": {
            borderColor: "rgba(33, 216, 255, 0.6)",
            boxShadow: "0 0 20px rgba(33, 216, 255, 0.2), inset 0 0 20px rgba(33, 216, 255, 0.04)",
          },
          "50%": {
            borderColor: "rgba(33, 216, 255, 0.9)",
            boxShadow: "0 0 30px rgba(33, 216, 255, 0.5), inset 0 0 20px rgba(33, 216, 255, 0.1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "pulse": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-subtle": "pulse-subtle 4s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "product-glow": "product-glow 0.4s ease-in-out forwards",
        "product-glow-red": "product-glow-red 0.4s ease-in-out forwards",
        "product-glow-blue": "product-glow-blue 0.4s ease-in-out forwards",
        "pulse-glow-purple": "pulse-glow-purple 2.5s ease-in-out infinite",
        "pulse-glow-yellow": "pulse-glow-yellow 2.5s ease-in-out infinite",
        "pulse-glow-cyan": "pulse-glow-cyan 2.5s ease-in-out infinite",
      },
      boxShadow: {
        "glow-sm": "0px 0px 20px 5px rgba(231, 251, 16, 0.45)",
        "glow-md": "0px 0px 35px 8px rgba(231, 251, 16, 0.55)",
        "glow-lg": "0px 0px 50px 12px rgba(231, 251, 16, 0.65)",
        "glow-xl": "0px 0px 70px 18px rgba(231, 251, 16, 0.75)",
        "glow-red-sm": "0px 0px 20px 5px rgba(239, 68, 68, 0.45)",
        "glow-red-md": "0px 0px 35px 8px rgba(239, 68, 68, 0.55)",
        "glow-red-lg": "0px 0px 50px 12px rgba(239, 68, 68, 0.65)",
        "glow-red-xl": "0px 0px 70px 18px rgba(239, 68, 68, 0.75)",
        "glow-blue-sm": "0px 0px 20px 5px rgba(0, 212, 255, 0.45)",
        "glow-blue-md": "0px 0px 35px 8px rgba(0, 212, 255, 0.55)",
        "glow-blue-lg": "0px 0px 50px 12px rgba(0, 212, 255, 0.65)",
        "glow-blue-xl": "0px 0px 70px 18px rgba(0, 212, 255, 0.75)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
