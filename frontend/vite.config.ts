import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Alias @/ -> src/. TypeScript lo declara aparte en tsconfig.app.json.
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  build: { chunkSizeWarningLimit: 800 },
  server: {
    port: 5173,
  },
})
