/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FEFCF8',
          100: '#FAF7F2',
          200: '#F0EAE0',
          300: '#E4DDD0',
          400: '#D4CBC0',
          500: '#B8AFA4',
        },
        blue: {
          primary: '#2E5A88',
          dark: '#1B4F72',
          light: '#5B8DB8',
          pale: '#E8F0F8',
          hover: '#24486E',
        },
        text: {
          primary: '#2C2C2C',
          secondary: '#6B6B6B',
          light: '#9A9A9A',
        },
        gold: '#B8860B',
        garden: '#6B7B5E',
        terracotta: '#C4703F',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
