/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#09090b",
        surface: "#111113",
        elevated: "#18181b",
        card: "#1c1c20",
        ink: "#fafafa",
        muted: "#71717a",
        subtle: "#a1a1aa",
        accent: "#22c55e",
        brand: {
          50: "rgba(34,197,94,0.06)",
          100: "rgba(34,197,94,0.10)",
          200: "rgba(34,197,94,0.18)",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        border: {
          subtle: "rgba(255,255,255,0.06)",
          DEFAULT: "rgba(255,255,255,0.10)",
          hover: "rgba(255,255,255,0.16)",
        },
        danger: {
          100: "rgba(239,68,68,0.10)",
          200: "rgba(239,68,68,0.20)",
          400: "#f87171",
          600: "#ef4444",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body:    ["Plus Jakarta Sans", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
      },
      boxShadow: {
        glow:    "0 0 40px rgba(34,197,94,0.12)",
        "glow-lg": "0 0 60px rgba(34,197,94,0.18)",
        card:    "0 4px 32px rgba(0,0,0,0.5)",
        button:  "0 4px 20px rgba(34,197,94,0.3)",
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        "gradient-dark":   "linear-gradient(180deg, #18181b 0%, #111113 100%)",
        "mesh-bg": "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(34,197,94,0.08) 0%, transparent 60%)",
      },
      animation: {
        "fade-up":     "fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in":     "fade-in 0.35s ease both",
        "float":       "float 3s ease-in-out infinite",
        "pulse-ring":  "pulse-ring 1.4s ease-out infinite",
        "spin-smooth": "spin-smooth 0.7s linear infinite",
        shimmer:       "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
