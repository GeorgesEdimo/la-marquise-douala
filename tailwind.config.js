/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        md: '2rem',
        lg: '2.5rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d2d2d',
          light: '#4a4a4a',
          dark: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#c9a44c',
          light: '#debb6e',
          dark: '#a88530',
        },
        gold: '#c9a44c',
        cream: {
          DEFAULT: '#faf8f4',
          dark: '#f0ece3',
        },
        ink: '#1a1a1a',
        muted: '#8a8279',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        accent: ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.35em',
        noblesse: '0.5em',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0,0,0,0.08)',
        'soft-lg': '0 24px 60px -18px rgba(0,0,0,0.12)',
        gold: '0 12px 32px -10px rgba(201,164,76,0.35)',
        card: '0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 50px -20px rgba(0,0,0,0.15)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        kenburns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) both',
        'fade-in': 'fadeIn 1s ease both',
        kenburns: 'kenburns 8s ease-out both',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}
