import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      clientPort: 5000,
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      // This tells Vite's bundler (Rollup) to not bundle these libraries,
      // as they are designed to be loaded from a CDN or have structures
      // that are not easily bundled. This resolves the build errors.
      external: [
        'pdfjs-dist/legacy/build/pdf',
        'jszip', // Add jszip to the external array
      ],
    },
  },
});

