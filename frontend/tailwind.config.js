/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A', // Deep slate for premium look
        panel: 'rgba(30, 41, 59, 0.7)', // Slate 800 with transparency
        primary: '#3B82F6', // Blue 500
        accent: '#10B981' // Emerald 500
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
