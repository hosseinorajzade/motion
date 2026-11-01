import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from https://<user>.github.io/<REPO_NAME>/
// The deploy workflow sets BASE_PATH to "/<REPO_NAME>/" automatically.
// If you build manually, change the fallback below to your repository name.
const REPO_NAME = 'motion-portfolio'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'serve' && !isPreview ? '/' : process.env.BASE_PATH ?? `/${REPO_NAME}/`,
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap', 'lenis'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
}))
