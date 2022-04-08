const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gray: { ...colors.gray, 900: "#131516", 800: "#1D1F20" },
        green: colors.emerald,
      },
    },
    fill: {
      none: "none",
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
