const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gray: { ...colors.gray, 900: "#131516", 800: "#1D1F20" },
      },
    },
    fill: {
      none: "none",
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/forms")],
};
