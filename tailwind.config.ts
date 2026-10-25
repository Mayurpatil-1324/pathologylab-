import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7fd",
          100: "#dfedfb",
          200: "#c7e0f8",
          300: "#9fcbf3",
          400: "#6eaced",
          500: "#1677C8", // Primary
          600: "#1063aa",
          700: "#0e4f8b",
          800: "#0f4473",
          900: "#123b61",
        },
        teal: {
          50: "#eefcfb",
          100: "#d3f7f5",
          200: "#aceeeb",
          300: "#75dedb",
          400: "#36c3c1",
          500: "#16A6A1", // Secondary
          600: "#118583",
          700: "#116b6a",
          800: "#125656",
          900: "#134848",
        },
        navy: {
          50: "#f4f6fa",
          100: "#e8ecf4",
          200: "#d5dde9",
          300: "#b5c4d8",
          400: "#8ea4c2",
          500: "#6a84ab",
          600: "#4f688e",
          700: "#3d5071",
          800: "#2d3c56",
          900: "#183153", // Heading
          950: "#101f35",
        },
        slateText: "#526174",
        borderSoft: "#E4EAF0",
        bgLight: "#F7FAFC",
        successGreen: "#16835D",
        errorRed: "#D64545",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(24, 49, 83, 0.06), 0 1px 4px -1px rgba(24, 49, 83, 0.04)",
        cardHover: "0 8px 24px -4px rgba(22, 119, 200, 0.12), 0 4px 12px -2px rgba(24, 49, 83, 0.06)",
        dropdown: "0 10px 25px -5px rgba(24, 49, 83, 0.1), 0 8px 10px -6px rgba(24, 49, 83, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
