/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'jet-black': '#0A0A0A',
        'deep-black': '#050505',
        'cerulean': {
          DEFAULT: '#007AB7',
          light: '#0097E2',
          dark: '#005D8C',
          glow: 'rgba(0, 122, 183, 0.45)',
        },
        'neon-rose': {
          DEFAULT: '#FF2D95',
          light: '#FF5BAF',
          dark: '#D81577',
          glow: 'rgba(255, 45, 149, 0.45)',
        },
        surface: {
          elevated: '#111318',
          secondary: '#171A21',
          muted: '#20242D',
          glass: 'rgba(17, 19, 24, 0.75)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(0, 122, 183, 0.5)',
        'glow-rose': '0 0 25px -5px rgba(255, 45, 149, 0.5)',
        'glow-dual': '0 0 35px -5px rgba(0, 122, 183, 0.3), 0 0 35px -5px rgba(255, 45, 149, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #050505 0%, #0A0A0A 55%, #10131B 100%)',
        'gradient-accent': 'linear-gradient(110deg, #007AB7 0%, #FF2D95 100%)',
        'gradient-radial-blue': 'radial-gradient(circle at 50% 0%, rgba(0, 122, 183, 0.25) 0%, transparent 65%)',
        'gradient-radial-rose': 'radial-gradient(circle at 100% 50%, rgba(255, 45, 149, 0.20) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
