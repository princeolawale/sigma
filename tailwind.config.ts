import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#071014",
        panel: "#101a20",
        line: "#24343b",
        acid: "#54f0b2",
        cyan: "#5bc8ff"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(84, 240, 178, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
