import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // proxy all /api/* requests to Django backend
      "/courses": {
        target: "https://xpg4jlf7-8000.inc1.devtunnels.ms",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/courses/, ""),
      },
    },
  },
})
