import { tailwindConfig } from '@gitcoin/themes';
import type { CSSProperties } from 'react';
import type { Config } from 'tailwindcss';
import { getWhitelabelThemeColors } from './config/features';

const config: Config = {
  presets: [tailwindConfig],
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        grow: {
          '0%, 100%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1)' },
        },
        checkmark: {
          '0%': {
            opacity: '0',
            transform: 'scale(0)',
          },
          '10%, 50%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        grow: 'grow 1.4s cubic-bezier(0.42, 0, 0.275, 1.155) both',
        checkmark: 'checkmark 5.6s cubic-bezier(0.42, 0, 0.275, 1.155) both',
        rotate: 'rotate 35s linear infinite',
      },
      colors: {
        ...getWhitelabelThemeColors(),
        neutral: {
          100: '#F2F3F8',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    ({
      addUtilities,
    }: {
      addUtilities: (utilities: Record<string, CSSProperties>) => void;
    }) => {
      const confettiUtilities = {
        '.confetti-1': {
          width: '12px',
          height: '12px',
          left: '12px',
          top: '16px',
          position: 'absolute' as const,
          animationDelay: '0.7s',
        },
        '.confetti-2': {
          width: '18px',
          height: '18px',
          left: '168px',
          top: '84px',
          position: 'absolute' as const,
          animationDelay: '1.4s',
        },
        '.confetti-3': {
          width: '10px',
          height: '10px',
          left: '32px',
          top: '162px',
          position: 'absolute' as const,
          animationDelay: '2.1s',
        },
        '.confetti-4': {
          width: '20px',
          height: '20px',
          left: '82px',
          top: '-12px',
          position: 'absolute' as const,
          animationDelay: '2.8s',
        },
        '.confetti-5': {
          width: '14px',
          height: '14px',
          left: '125px',
          top: '162px',
          position: 'absolute' as const,
          animationDelay: '3.5s',
        },
        '.confetti-6': {
          width: '10px',
          height: '10px',
          left: '16px',
          top: '16px',
          position: 'absolute' as const,
          animationDelay: '4.2s',
        },
        '.checkmark': {
          position: 'relative' as const,
          padding: '30px',
        },
        '.checkmark__check': {
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          zIndex: 10,
          transform: 'translate3d(-50%, -50%, 0)',
          fill: '#fff',
        },
      };

      addUtilities(confettiUtilities);
    },
  ],
};
export default config;
