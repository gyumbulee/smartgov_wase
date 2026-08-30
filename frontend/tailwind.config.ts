import type { Config } from "tailwindcss";

// SmartGov-Wase brand palette — see Branding Direction doc.
// Green is used for primary actions, active nav, links, success states,
// progress indicators, and branding — NOT for every component background.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0B7A3B",      // Primary Green
          "deep-green": "#07552B",
          "light-green": "#EAF6EF",
          gold: "#C9A227",        // Restrained accent — use sparingly
        },
        surface: {
          DEFAULT: "#FFFFFF",
          bg: "#F7F9F8",
        },
        ink: {
          DEFAULT: "#17201B",     // Primary text
          muted: "#66736B",       // Secondary/muted text
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
