import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use repo name casing to match GitHub Pages path.
  base: '/MovieArc/',
  plugins: [react()],
})
