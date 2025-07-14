/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm-h': {'raw': '(min-height: 600px)'},
        'md-h': {'raw': '(min-height: 800px)'},
      },
      colors: {
        primary: {
          50: "#fef7f0",
          100: "#fdeee0",
          200: "#fbd5c0",
          300: "#f8b595",
          400: "#f58a68",
          500: "#FF6B35",
          600: "#e85a2b",
          700: "#c44822",
          800: "#a03a1e",
          900: "#83311c",
          950: "#471a0e",
          DEFAULT: "#FF6B35",
          dark: "#432012"
        },
        secondary: {
          50: "#f0f4f8",
          100: "#d9e6f0",
          200: "#b7cfe3",
          300: "#85aecd",
          400: "#4c89b3",
          500: "#2d6a99",
          600: "#1e5280",
          700: "#1a4268",
          800: "#193857",
          900: "#1a3049",
          950: "#0B2545",
          DEFAULT: "#0B2545",
          light: "#2a2d40",
          dark: "#0d0f1a"
        },
        tertiary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          DEFAULT: "#0ea5e9"
        },
        accent: {
          50: "#fef7f0",
          100: "#fdeee0",
          200: "#fbd5c0",
          300: "#f8b595",
          400: "#f58a68",
          500: "#FF6B35",
          600: "#e85a2b",
          700: "#c44822",
          800: "#a03a1e",
          900: "#83311c"
        },
        success: {
          50: "#fef7f0",
          100: "#fdeee0",
          200: "#fbd5c0",
          300: "#f8b595",
          400: "#f58a68",
          500: "#FF6B35",
          600: "#e85a2b",
          700: "#c44822",
          800: "#a03a1e",
          900: "#83311c"
        },
        warning: {
          50: "#fefdf0",
          100: "#fefbe0",
          200: "#fef5c0",
          300: "#feec95",
          400: "#fddd68",
          500: "#fcc935",
          600: "#eeab2b",
          700: "#ca8722",
          800: "#a6691e",
          900: "#83551c"
        },
        error: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337"
        }
      },
      fontFamily: {
        "display": ["Inter", "system-ui", "-apple-system", "sans-serif"],
        "heading": ["Inter", "system-ui", "-apple-system", "sans-serif"],
        "body": ["Inter", "system-ui", "-apple-system", "sans-serif"]
      },
      backgroundImage: {
        "gradient-custom": "linear-gradient(to bottom right, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #FF6B35 0%, #e85a2b 100%)",
        "gradient-secondary": "linear-gradient(135deg, #0B2545 0%, #1a4268 100%)",
        "gradient-main": "linear-gradient(135deg, #FF6B35 0%, #0B2545 100%)"
      }
    }
  },
  plugins: [
    require("@tailwindcss/typography")
  ]
}
