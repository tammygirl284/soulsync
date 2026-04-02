import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        // SoulSync / Blinklife palette
        blue: {
          DEFAULT: "#2563eb",
          hover:   "#1d4ed8",
          light:   "#eff6ff",
          border:  "#bfdbfe",
        },
        border: {
          DEFAULT: "#efefef",
          strong:  "#e0e0e0",
        },
        muted: "#aaa",
        hint:  "#ccc",
      },
    },
  },
  plugins: [],
};

export default config;
