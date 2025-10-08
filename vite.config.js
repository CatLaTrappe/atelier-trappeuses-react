import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages (serving at /<repo>/), you'll set this base to '/<repo>/' when needed.
  // base: '/atelier-trappeuses-react/',
})
