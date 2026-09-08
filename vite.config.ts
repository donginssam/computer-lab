/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeManifestIcons: false,
      manifest: {
        name: "동인쌤의 컴퓨터실",
        short_name: "동인쌤의 컴퓨터실",
        description: "눌러 보고, 돌려 보고, 비교해 보며 배우는 중학교 정보 시뮬레이터",
        lang: "ko",
        display: "standalone",
        background_color: "#f5f7fa",
        theme_color: "#16213a",
        categories: ["education"],
        screenshots: [
          {
            src: "screenshot-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "양팔저울로 가짜 동전 찾기 — 저울질을 한 단계씩 따라가는 화면",
          },
          {
            src: "screenshot-narrow.png",
            sizes: "540x960",
            type: "image/png",
            form_factor: "narrow",
            label: "양팔저울로 가짜 동전 찾기 — 휴대폰에서 본 화면",
          },
        ],
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        globPatterns: ["**/*.{html,js,css,ico,png,svg,woff2}"],
        // Screenshots only feed the install dialog, so they never need to be offline.
        globIgnores: ["**/screenshot-*.png"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
})
