import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    disabled: true,
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
