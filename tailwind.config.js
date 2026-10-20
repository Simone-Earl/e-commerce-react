/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',  // Very light green tint
          100: '#d1fae5',
          500: '#10b981', // Vibrant Emerald
          600: '#059669', // Deep Green (Primary Buttons)
          700: '#047857', // Darker Green (Hover states)
          900: '#064e3b', // Darkest Forest Green
        },
        // A soft, earthy off-white with a hint of green to replace pure white
        themebg: '#f4f7f6', 
      }
    },
  },
  plugins: [],
}