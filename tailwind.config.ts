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
        brand: {
          50: "#e8f4fd",
          100: "#c5e2f9",
          200: "#8ec5f3",
          300: "#5aabe9",
          400: "#2a8fd4",
          500: "#1a6bb5",
          600: "#155a96",
          700: "#104878",
          800: "#0d1b2a",
          900: "#0a1628",
        },
        navy: {
          DEFAULT: "#0d1b2a",
          light: "#1a2d42",
          dark: "#0a1628",
        },
        surface: {
          DEFAULT: "#f8fafc",
          hover: "#f1f5f9",
        },
        border: {
          DEFAULT: "#e5edf5",
          active: "#1a6bb5",
        },
        heading: "#0a1628",
        label: "#273951",
        body: "#64748d",
        muted: "#94a3b8",
        success: {
          DEFAULT: "#15be53",
          text: "#108c3d",
        },
        warning: {
          DEFAULT: "#f59e0b",
          text: "#9b6829",
        },
        error: "#ea2261",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
        mono: ["Source Code Pro", "SFMono-Regular", "monospace"],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "8px",
      },
      boxShadow: {
        ambient: "rgba(23,23,23,0.06) 0px 3px 6px",
        standard: "rgba(23,23,23,0.08) 0px 15px 35px",
        elevated:
          "rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px",
        deep: "rgba(3,3,39,0.25) 0px 14px 21px -14px, rgba(0,0,0,0.1) 0px 8px 17px -8px",
      },
      letterSpacing: {
        display: "-0.96px",
        heading: "-0.64px",
        subheading: "-0.22px",
      },
    },
  },
  plugins: [],
};
export default config;
