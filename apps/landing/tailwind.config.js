/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 60px rgba(15, 23, 42, 0.18)',
      },
      colors: {
        brand: {
          50: '#edf9f3',
          100: '#d4f2e3',
          200: '#a9e5c7',
          300: '#74d2a6',
          400: '#40bd84',
          500: '#0f8a5f',
          600: '#0b6b49',
          700: '#0a553b',
          800: '#0a4330',
          900: '#0b3728',
        },
      },
      fontFamily: {
        display: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        body: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
