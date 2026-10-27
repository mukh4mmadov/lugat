import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    // Build output holds the large TOPIK audio; watching it crashes dev on Windows (EBUSY).
    watch: { ignored: ["**/dist/**", "**/dev-dist/**"] },
  },
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: "K-TALIM",
        short_name: "K-TALIM",
        description:
          "Premium Korean vocabulary learning platform with flashcards, quizzes, and smart review for Uzbek learners.",
        start_url: "/",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,mjs,css,html,ico,png,svg,woff2,woff,ttf,eot}"],
        navigateFallbackDenylist: [/\.(?:pdf|mp3)(?:$|[?#])/i],
        runtimeCaching: [
          // Workbox matches RegExp routes against the full URL, so same-origin
          // paths are matched by function. Audio is left to the browser because
          // it streams with range requests that a cache-first route would break.
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /^\/topik\/.*\.pdf$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "topik-pdf-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-woff2-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
      registerType: "autoUpdate",
      // PWAUpdate owns registration so the worker is registered only once.
      injectRegister: null,
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
