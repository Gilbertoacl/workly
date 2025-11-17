/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        surfaceAlt: 'var(--color-surface-alt)',
        textPrimary: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },

        error: 'var(--color-error)',
      },

      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },

      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        md: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)',
      },
    },

    fontFamily: {
      JuaRegular: ['Jua', 'sans-serif'],
    },

    screens: {
      sm: '481px',
      md: '769px',
      lg: '1025px',
      xl: '1280px',
    },
  },

  plugins: [require('tailwindcss-animate')],
};
