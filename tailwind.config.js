/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Journeo Palette
        ivory: {
          DEFAULT: '#F7F4EA',
          dark: '#EAE8DC',
          light: '#FDFBF7',
        },
        sage: {
          DEFAULT: '#87977B',
          light: '#A5B39C',
          dark: '#68785D',
        },
        'deep-green': {
          DEFAULT: '#344B38',
          light: '#47634C',
          dark: '#223325',
        },
        terracotta: {
          DEFAULT: '#C87950',
          light: '#D8916E',
          dark: '#A85E37',
        },
        'warm-brown': {
          DEFAULT: '#65513D',
          light: '#7F6750',
          dark: '#4C3B2B',
        },
        text: {
          DEFAULT: '#302F29',
          muted: '#636158',
          subtle: '#8C897D',
        },
        border: {
          DEFAULT: '#E2DEC9',
          subtle: '#EFECE0',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(48, 47, 41, 0.05), 0 1px 2px rgba(48, 47, 41, 0.03)',
        'soft-md': '0 4px 14px rgba(48, 47, 41, 0.06), 0 1px 3px rgba(48, 47, 41, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(48, 47, 41, 0.08), 0 4px 8px -2px rgba(48, 47, 41, 0.03)',
        'card-hover': '0 14px 34px -5px rgba(52, 75, 56, 0.12), 0 6px 12px -3px rgba(52, 75, 56, 0.04)',
      }
    },
  },
  plugins: [],
}
