/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#2563eb',    // Blue-600
        accent: '#9333ea',     // Purple-600
        soft: '#f9fafb',       // Gray-50
      },
    },
  },
  plugins: [],
};
