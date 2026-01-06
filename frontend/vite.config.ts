import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Usar esbuild (padrão) para minificação - mais rápido que terser
    minify: 'esbuild',
  },
  esbuild: {
    // Remove console.log em produção
    drop: ['console', 'debugger'],
  },
  server: {
    strictPort: true,
  },
})

