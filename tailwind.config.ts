import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT: '#1b2735', strong: '#0f2a43', deep: '#12283f' },
        body:   '#48586c',
        subtle: '#6b7a8d',
        faint:  '#7b8a9d',
        line:   { DEFAULT: '#e2e8f0', soft: '#eef1f5', field: '#d5dde7' },
        canvas: { DEFAULT: '#f4f6f9', raised: '#fafbfd' },
        brand:  { blue: '#2563eb', green: '#0a7a4a' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(16,24,40,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
