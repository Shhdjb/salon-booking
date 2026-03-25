import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        salon: {
          gold: "#C9A882",
          "gold-dark": "#B8956F",
          "gold-light": "#D4B896",
          "gold-pale": "#E8DCC4",
          brown: "#3D3429",
          "brown-soft": "#4A3F35",
          "brown-muted": "#6B5D52",
          "brown-logo": "#5C4F44",
          cream: "#F8F4EF",
          "cream-warm": "#F5EDE4",
          "cream-border": "#E8DDD4",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 5vw, 4.5rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.3" }],
      },
      lineHeight: {
        "arabic-tight": "1.25",
        "arabic-relaxed": "1.8",
        "arabic-loose": "2",
      },
      maxWidth: {
        content: "80rem",
        narrow: "42rem",
        "7xl": "80rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(61, 52, 41, 0.06)",
        premium: "0 12px 40px -8px rgba(61, 52, 41, 0.12)",
        "premium-lg": "0 24px 60px -12px rgba(61, 52, 41, 0.15)",
        "gold-glow": "0 0 50px -12px rgba(201, 168, 130, 0.35)",
        "gold-soft": "0 4px 20px -4px rgba(201, 168, 130, 0.25)",
        glass: "0 8px 32px rgba(61, 52, 41, 0.08)",
        "glass-strong": "0 8px 40px rgba(61, 52, 41, 0.12)",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, rgba(248,244,239,0.97) 0%, rgba(245,237,228,0.85) 40%, rgba(245,237,228,0.4) 100%)",
        "gradient-gold": "linear-gradient(135deg, #C9A882 0%, #B8956F 100%)",
        "gradient-gold-soft": "linear-gradient(135deg, rgba(201,168,130,0.15) 0%, rgba(184,149,111,0.05) 100%)",
      },
      transitionDuration: {
        "400": "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
