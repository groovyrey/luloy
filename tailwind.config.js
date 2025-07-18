/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'background-color': 'var(--background-color)',
        'text-color': 'var(--text-color)',
        'primary-color': 'var(--primary-color)',
        'light-text-color': 'var(--light-text-color)',
      },
    },
  },
  plugins: [],
}
