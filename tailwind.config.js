/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gym: {
          bg:       '#0C0C14',
          surface:  '#131320',
          surface2: '#1A1A2E',
          surface3: '#22223A',
          accent:   '#FF4D1C',
          warn:     '#F59E0B',
        },
      },
      fontFamily: {
        title: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
