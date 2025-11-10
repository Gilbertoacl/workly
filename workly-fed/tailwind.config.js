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
        btnPrimary: 'var(--color-primary)',
        btnPrimaryHover: 'var(--color-primary-hover)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          text: 'var(--color-primary-text)',
        },
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card, 0 0% 100%))',
          foreground: 'hsl(var(--card-foreground, 222.2 47.4% 11.2%))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover, 0 0% 100%))',
          foreground: 'hsl(var(--popover-foreground, 222.2 47.4% 11.2%))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary, 210 40% 96.1%))',
          foreground: 'hsl(var(--secondary-foreground, 222.2 47.4% 11.2%))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted, 210 40% 96.1%))',
          foreground: 'hsl(var(--muted-foreground, 215.4 16.3% 46.9%))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent, 210 40% 96.1%))',
          foreground: 'hsl(var(--accent-foreground, 222.2 47.4% 11.2%))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive, 0 84.2% 60.2%))',
          foreground: 'hsl(var(--destructive-foreground, 210 40% 98%))',
        },
        input: 'hsl(var(--input, 214.3 31.8% 91.4%))',
        ring: 'hsl(var(--ring, 215 20.2% 65.1%))',
        chart: {
          '1': 'hsl(var(--chart-1, 142 76% 36%))',
          '2': 'hsl(var(--chart-2, 217 91% 60%))',
          '3': 'hsl(var(--chart-3, 48 96% 53%))',
          '4': 'hsl(var(--chart-4, 12 85% 62%))',
          '5': 'hsl(var(--chart-5, 280 83% 55%))',
        },
      },

      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },

      borderRadius: {
        DEFAULT: 'var(--border-radius)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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

  plugins: [require('tailwindcss-animate')],
};
