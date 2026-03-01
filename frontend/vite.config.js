import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/events': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
      '/stats': 'http://localhost:3001',
      '/messages': 'http://localhost:3001',
    },
  },
})
