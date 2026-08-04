import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Dev server proxy: forward /api -> backend /api/v1
  server: {
    proxy: {
      '^/api': {
        target: 'http://192.168.1.30:8000',
        changeOrigin: true,
        secure: false,
        // Rewrite /api/... to /api/v1/...
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },
})