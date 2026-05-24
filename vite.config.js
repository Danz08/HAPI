// Konfigurasi Vite untuk bundling client-side assets
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: false,

  build: {
    outDir: 'public/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'client/main.js'),
      output: {
        entryFileNames: 'js/main.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/main.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },

  css: {
    postcss: './postcss.config.js',
  },

  // Proxy ke Express server saat development
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/dashboard': 'http://localhost:3000',
      '/analytics': 'http://localhost:3000',
      '/pomodoro': 'http://localhost:3000',
      '/quiz': 'http://localhost:3000',
    },
  },
});
