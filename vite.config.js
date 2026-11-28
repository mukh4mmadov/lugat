import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

const VENDOR_CHUNKS = {
  react: ["react", "react-dom", "react-router", "react-router-dom", "scheduler"],
  supabase: ["@supabase"],
  motion: ["framer-motion", "motion-dom", "motion-utils"],
  state: ["@reduxjs", "react-redux", "redux", "immer", "reselect"],
  i18n: ["i18next", "react-i18next"],
};

function vendorChunk(id) {
  if (!id.includes("node_modules")) return undefined;
  const name = id.split("node_modules/").pop();
  return Object.keys(VENDOR_CHUNKS).find((chunk) =>
    VENDOR_CHUNKS[chunk].some((pkg) => name === pkg || name.startsWith(`${pkg}/`)),
  );
}

export default defineConfig({
  build: {
    rollupOptions: { output: { manualChunks: vendorChunk } },
  },
  server: {
    watch: { ignored: ["**/dist/**", "**/dev-dist/**"] },
  },
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: "K-TALIM",
        short_name: "K-TALIM",
        description:
          "Everything to learn Korean and prepare for TOPIK in one place: vocabulary, grammar, listening, reading, speaking and real TOPIK papers.",
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
        importScripts: ["/push-sw.js"],
        globPatterns: ["**/*.{js,mjs,css,html,ico,png,svg,woff2,woff,ttf,eot}"],
        globIgnores: ["**/pdf*.{js,mjs}", "**/paper[0-9]*.js", "**/paperII*.js", "**/Admin*.js", "**/universities-*.js", "**/korea/**", "**/node_modules/**"],
        navigateFallbackDenylist: [/\.(?:pdf|mp3)(?:$|[?#])/i],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/topik-assets\/.*\.pdf$/i.test(url.pathname),
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
        clientsClaim: true,
      },
      registerType: "prompt",
      injectRegister: null,
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
