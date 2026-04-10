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
        gb: {
          bg: "#0E0E10",
          card: "rgba(255,255,255,0.028)",
          border: "rgba(255,255,255,0.07)",
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
          beast: "#dc2626",
          purple: "#a78bfa",
          gold: "#E8A820",
        },
        t: {
          1: "#F0EDE8",
          2: "#D0C8BC",
          3: "#C0B8AC",
          4: "#928982",
          5: "#7A7268",
          6: "#5A534C",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
