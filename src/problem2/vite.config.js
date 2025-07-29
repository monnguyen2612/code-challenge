import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    },
    // Performance optimizations
    target: 'es2015',
    cssCodeSplit: true,
    reportCompressedSize: false
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    // Performance optimizations for dev server
    hmr: {
      overlay: false
    }
  },
  preview: {
    port: 4173,
    open: true
  },
  optimizeDeps: {
    include: []
  },
  // Performance optimizations
  esbuild: {
    target: 'es2015'
  }
}) 