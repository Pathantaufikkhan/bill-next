/** @type {import('tailwindcss').Config} */
const config: import('tailwindcss').Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Replace Tailwind's default gray with safer hex colors
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        primary: {
          light: "#4ade80",
          DEFAULT: "#22c55e",
          dark: "#15803d",
        },
        secondary: {
          light: "#60a5fa",
          DEFAULT: "#3b82f6",
          dark: "#1d4ed8",
        },
        accent: "#f59e0b",
      },
    },
  },
  plugins: [],
};

export default config;
  