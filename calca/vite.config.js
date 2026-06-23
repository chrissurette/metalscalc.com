import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'ScrapCalculator',
      fileName: 'scrap-calculator',
      formats: ['iife'],
    },
    // React is bundled in — output is self-contained for embedding
  },
})
