import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss() ],
  server: {
    host: true, // Exposes the project on your local network IP
    port: 5173, // Optional: specify a port (default is 5173)
  },
})
