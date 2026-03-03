import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss() ],
  server: {
    host: true, 
    port: 5173, 
    https: {
      // 2. Point to the files you created with mkcert
      key: fs.readFileSync('./localhost+3-key.pem'),
      cert: fs.readFileSync('./localhost+3.pem'),
    },
    
  },
})
