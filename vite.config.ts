import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.mp4'],
  server: {
    proxy: {
      '/api/vidu': {
        target: 'https://api.vidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vidu/, ''),
      },
    },
  },
})
