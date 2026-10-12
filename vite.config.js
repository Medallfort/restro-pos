import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy -> nefs l-origin: cookie (SameSite=Strict) kaykhdem bla CORS
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
  // Tests dyal frontend (npm test). Backend 3ndo tests dyalo (node --test)
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
