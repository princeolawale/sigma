import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#05070B",
        panel: "#0B1118",
        line: "#1B2B38",
        primary: "#2F8BFF",
        teal: "#3FDAC7",
        acid: "#6BE675",
        cyan: "#3FDAC7",
        danger: "#FF5C5C",
        warning: "#F5C542"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(47, 139, 255, 0.12)",
        teal: "0 18px 44px rgba(63, 218, 199, 0.16)",
        success: "0 18px 44px rgba(107, 230, 117, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
