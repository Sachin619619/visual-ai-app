/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-tertiary': '#1a1a24',
        'accent-primary': '#8b5cf6',
        'accent-secondary': '#06b6d4',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
      },
      fontFamily: {
        'heading': ['Outfit', 'system-ui', 'sans-serif'],
        'body': ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      screens: {
        'xs': '400px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
  plugins: [],
}
