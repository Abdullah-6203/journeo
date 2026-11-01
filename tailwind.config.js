/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Indian Royal Heritage Exact Palette
        pearl: '#F9F5ED',
        white: '#FFFFFF',
        sandstone: {
          DEFAULT: '#D6B995',
          light: '#EAD7BF',
          dark: '#BFA07A',
        },
        maroon: {
          DEFAULT: '#844C49',
          light: '#A1625F',
          dark: '#683634',
        },
        gold: {
          DEFAULT: '#B89A60',
          light: '#CFB580',
          dark: '#9E8047',
        },
        espresso: {
          DEFAULT: '#44352F',
          light: '#5E4C44',
          dark: '#2E221E',
        },
        secondary: '#82766B',
        border: {
          soft: '#E8DFD2',
        },
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(68, 53, 47, 0.05), 0 1px 2px rgba(68, 53, 47, 0.03)',
        'soft-md': '0 4px 12px rgba(68, 53, 47, 0.07), 0 1px 3px rgba(68, 53, 47, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(68, 53, 47, 0.09), 0 4px 6px -2px rgba(68, 53, 47, 0.04)',
        'soft-xl': '0 20px 35px -5px rgba(68, 53, 47, 0.10), 0 8px 10px -4px rgba(68, 53, 47, 0.03)',
        'glow-royal': '0 8px 24px -4px rgba(132, 76, 73, 0.28)',
      }
    },
  },
  plugins: [],
}
