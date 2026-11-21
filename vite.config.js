import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'iMood · Accesorios para iPhone',
        short_name: 'iMood',
        description: 'Catálogo de accesorios para iPhone.',
        lang: 'es',
        theme_color: '#f5f5f7',
        background_color: '#f5f5f7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Las fotos de los productos también se guardan para que el catálogo funcione sin conexión
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Fotos alojadas fuera de la app (por ejemplo, si más adelante usamos Supabase Storage)
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fotos-productos',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ]
});
