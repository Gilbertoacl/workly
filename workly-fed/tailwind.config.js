/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        surfaceAlt: 'var(--color-surface-alt)',
        textPrimary: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        btnPrimary:'var(--color-primary)',
        btnPrimaryHover: 'var(--color-primary-hover)', 
        primary: {
          DEFAULT: 'var(--color-primary)',
          text: 'var(--color-primary-text)',
        },
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
      },
      transitionDuration: {
        DEFAULT: 'var(--transition-speed, 200ms)',
      },
    },
    screens: {
      sm: '481px', 
      md: '769px',  
      lg: '1025px', 
      xl: '1280px', 
    },
  },
  plugins: [
  ],
};