import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 배포 경로: https://m-se0k.github.io/NetflixClone/
  base: '/NetflixClone/',
  plugins: [react()],
})
