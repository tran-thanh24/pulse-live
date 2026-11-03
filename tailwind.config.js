/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          bg: '#070816',
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#22D3EE',
          highlight: '#FACC15',
          text: '#FFFFFF',
          muted: '#A1A1AA',
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

