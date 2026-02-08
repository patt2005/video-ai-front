import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Avoid CORS: browser calls same origin, Vite forwards to Vidu API
      '/api/vidu': {
        target: 'https://api.vidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vidu/, ''),
      },
    },
  },
})
