/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        secondary: '#164e63',
        accent: '#f59e0b'
      }
    }
  },
  plugins: []
};
