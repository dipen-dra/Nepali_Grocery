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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Add this 'server' block
  server: {
    host: true, // Listen on all local IPs
    proxy: {
      // Proxy requests that start with '/api'
      '/api': {
        // Forward them to your backend server
        target: 'http://192.168.1.110:8081',
        // Necessary for virtual hosted sites
        changeOrigin: true,
      },
    },
  },
})