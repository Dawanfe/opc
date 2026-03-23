/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#111827',
        background: '#FFFFFF',
        foreground: '#111827',
        primary: {
          DEFAULT: '#111827',
          foreground: '#FAFAFA',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#111827',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FAFAFA',
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#F5F5F5',
          foreground: '#111827',
        },
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
        md: '6px',
        sm: '4px',
        xs: '2px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
