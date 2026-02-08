import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
