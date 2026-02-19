import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use repo name in lowercase to match GitHub Pages URL path.
  base: '/moviearc/',
  plugins: [react()],
})
