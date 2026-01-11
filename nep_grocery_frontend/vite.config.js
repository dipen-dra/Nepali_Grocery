// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('381818830866-smf0ps7geage5ib54sdavnookdqnlgcq.apps.googleusercontent.com'),
  },
  // Add this 'server' block
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'server.cert')),
    },
    host: true, // Listen on all local IPs
    proxy: {
      // Proxy requests that start with '/api'
      '/api': {
        // Forward them to your backend server
        target: 'https://192.168.1.110:8081',
        secure: false, // Allow self-signed certificates for development
        // Necessary for virtual hosted sites
        changeOrigin: true,
      },
    },
  },
})