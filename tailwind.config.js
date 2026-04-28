/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif-en': ['Cormorant Garamond', 'serif'],
        'serif-ar': ['Amiri', 'serif'],
      },
    },
  },
  plugins: [],
}
