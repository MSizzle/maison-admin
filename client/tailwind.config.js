/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          700: '#1e293b',
          800: '#1a1f2e',
          850: '#151922',
          900: '#0f1117',
          950: '#0a0c10',
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
        },
      },
    },
  },
  plugins: [],
};
