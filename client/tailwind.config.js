/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          bg: '#F3F4F6',       // page background
          card: '#FFFFFF',      // card background
          raised: '#F9FAFB',    // raised sections (table headers, etc.)
          border: '#E5E7EB',    // card/table borders
          muted: '#D1D5DB',     // muted borders, dividers
        },
        blue: {
          primary: '#2E5A88',
          dark: '#1B4F72',
          light: '#5B8DB8',
          pale: '#E8F0F8',
          hover: '#24486E',
          50: '#EFF6FF',
        },
        text: {
          primary: '#111827',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        },
        cream: {
          50: '#FEFCF8',
          100: '#FAF7F2',
          200: '#F0EAE0',
        },
        gold: '#B8860B',
        garden: '#6B7B5E',
        terracotta: '#C4703F',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        raised: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
