import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0E1111",
        card: "#1F2937",
        sand: "#D6B56D",
        turf: "#2E7D32",
        text: "#F9FAFB",
        muted: "#9CA3AF",
        danger: "#DC2626"
      },
      boxShadow: {
        soft: "0 10px 24px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
