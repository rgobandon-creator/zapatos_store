/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#241611',
        leather: '#A9673A',
        cognac: '#C17A3D',
        cream: '#F1EAE0',
        parchment: '#E8DFD1',
        ink: '#1B1410',
        stitch: '#D9C6AC'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      backgroundImage: {
        'stitch-line': "repeating-linear-gradient(90deg, currentColor 0, currentColor 6px, transparent 6px, transparent 12px)"
      }
    }
  },
  plugins: []
}
