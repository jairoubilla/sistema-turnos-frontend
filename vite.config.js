import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'sistema-turnos-frontend-production.up.railway.app'
    ],
    host: true,
    port: 4173
  }
})
