import type { Config } from "tailwindcss"

// In Tailwind v4 most configuration lives in CSS (@theme block in globals.css).
// This file only needs to declare the content paths and dark mode strategy.
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
}

export default config
