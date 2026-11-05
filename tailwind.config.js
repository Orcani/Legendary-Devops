/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Identité « Parcours + soleil » (D-32). Les gammes slate et blue, utilisées dans tout le code,
      // sont redéfinies : gris teintés d'indigo et gamme indigo. Le jaune « soleil » = la progression.
      colors: {
        slate: {
          50: '#FAFAFD', 100: '#F1F2F9', 200: '#E2E5F2', 300: '#C9CDE3', 400: '#9CA2C4', 500: '#6B7299',
          600: '#535A82', 700: '#3D4469', 800: '#2A3058', 900: '#1B2048', 950: '#121633',
        },
        blue: {
          50: '#EEF0FB', 100: '#DDE1F7', 200: '#C4CAF1', 300: '#A9B1EC', 400: '#8C96E8', 500: '#5B67CF',
          600: '#2E3A87', 700: '#252F70', 800: '#1E2559', 900: '#171C45', 950: '#10132F',
        },
        encre: '#1E2559',
        lavande: '#8C96E8',
        brume: '#EEF0FB',
        soleil: { DEFAULT: '#F2C14E', clair: '#FBEBC2', fonce: '#8A6500' },
      },
      fontFamily: {
        sans: ['"Lexend Variable"', 'Lexend', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-once': 'pulse 0.6s ease-in-out 1',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
