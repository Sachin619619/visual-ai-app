import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['framer-motion'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'pdf': ['jspdf', 'html2canvas'],
          'icons': ['lucide-react'],
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['tests/**', 'node_modules/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
