import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
        extend: {
          colors: {
            primary: {
              blue: '#2563eb',
              'blue-light': '#3b82f6',
              'blue-dark': '#1d4ed8',
              'blue-hover': '#1e40af',
            },
            secondary: {
              emerald: '#10b981',
              'emerald-light': '#34d399',
              'emerald-dark': '#059669',
            },
            accent: {
              purple: '#8b5cf6',
              'purple-light': '#a78bfa',
              'purple-dark': '#7c3aed',
            },
            text: {
              primary: '#1f2937',
              secondary: '#6b7280',
              light: '#9ca3af',
            },
            background: {
              white: '#ffffff',
              gray: '#f9fafb',
              'gray-light': '#f3f4f6',
            },
            gradient: {
              'blue-purple': 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              'emerald-blue': 'linear-gradient(135deg, #10b981, #2563eb)',
            },
          },
      fontFamily: {
        'cairo': ['var(--font-cairo)', 'sans-serif'],
        'sans': ['var(--font-cairo)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-left': 'slideLeft 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
export default config
