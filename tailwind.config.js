/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Journeo Refined Earthy Sage Palette
        ivory: {
          DEFAULT: '#E8E9DC', // Main light background
          dark: '#DFE3D3',    // Alternate section background
          light: '#F1F0E6',   // Card background
        },
        sage: {
          DEFAULT: '#C8D2BE', // Soft sage green
          light: '#DFE3D3',   // Alternate section
          dark: '#667363',    // Secondary text
        },
        'deep-green': {
          DEFAULT: '#49634F', // Forest green accent
          light: '#5C7763',
          dark: '#344B3C',    // Primary text
        },
        terracotta: {
          DEFAULT: '#C87950',
          light: '#D8916E',
          dark: '#A85E37',
        },
        gold: {
          DEFAULT: '#B99A68', // Muted gold accent
          dark: '#A98954',
          light: '#D4AF37',
        },
        olive: {
          DEFAULT: '#B7C3A7', // Light olive
        },
        card: {
          DEFAULT: '#F1F0E6', // Card background
        },
        'warm-brown': {
          DEFAULT: '#65513D',
          light: '#7F6750',
          dark: '#4C3B2B',
        },
        text: {
          DEFAULT: '#344B3C', // Primary text
          muted: '#667363',   // Secondary text
          subtle: '#889684',  // Subtle text
        },
        border: {
          DEFAULT: '#C9D0BF', // Subtle borders
          subtle: '#DFE3D3',
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
