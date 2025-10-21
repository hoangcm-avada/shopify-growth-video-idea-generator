import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This base path is correctly configured for your repository name.
  base: '/shopify-growth-video-idea-generator/', 
})