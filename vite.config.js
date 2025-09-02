// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // ensures SW updates automatically
      manifest: {
        name: 'ImoScope',
        short_name: 'PWA',
        description: 'A progressive web app built with Vite + React- Upload an image and chat with ImoScope to analyze and understand it.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-192x192.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-192x192.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Matches your backend port
        changeOrigin: true,
      },
    },
  },
});
