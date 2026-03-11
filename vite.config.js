import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev tenancy fix:
 * - If you run frontend on localhost:5173, browser sends Host=localhost
 * - Backend resolves tenant by Host, so it may 404
 *
 * Solution:
 * - Use Vite proxy so /api requests go to a tenant host (demo.local) with changeOrigin=true
 * - Set VITE_API_URL=/api in .env for dev
 */
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://demo.local',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
