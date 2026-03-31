/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F1117',
        panel: '#161921',
        card: '#1C1F2B',
        border: '#2A2D3A',
        hover: '#252836',
        accent: '#3B82F6',
        'accent-hover': '#2563EB',
        green: '#22C55E',
        warn: '#F59E0B',
        red: '#EF4444',
        t1: '#E2E8F0',
        t2: '#94A3B8',
        t3: '#64748B',
        t4: '#475569',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
