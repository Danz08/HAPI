import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Entry point
  root: path.resolve(__dirname, 'client'),

  // Build configuration
  build: {
    // Output to public/dist/ for Express static serving
    outDir: path.resolve(__dirname, 'public/dist'),
    emptyOutDir: true,

    // Generate manifest for asset mapping
    manifest: true,

    rollupOptions: {
      input: path.resolve(__dirname, 'client/main.js'),
      output: {
        // Predictable filenames for easy EJS referencing
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },

  // CSS processing (Tailwind via PostCSS)
  css: {
    postcss: path.resolve(__dirname),
  },

  // Dev server (for HMR during development)
  server: {
    port: 5173,
    strictPort: false,
    // Proxy API calls to Express
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/dashboard': 'http://localhost:3000',
      '/analytics': 'http://localhost:3000',
      '/pomodoro': 'http://localhost:3000',
      '/quiz': 'http://localhost:3000',
      '/curhat': 'http://localhost:3000',
    },
  },
});
