
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from "vite-plugin-qrcode";


export default defineConfig({
  plugins: [
    react(),
    qrcode()  // 👈 Add this line
  ],
  server: {
    host: true // 👈 Important: enables access from other devices
  }
})