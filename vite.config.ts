import {defineConfig} from "vite-plus";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";

// https://viteplus.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: "Super Sudoku",
        short_name: "super-sudoku",
        description: "Play over 500 Sudoku puzzles ranging from easy to evil",
        theme_color: "#1F2937",
        background_color: "#1F2937",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    open: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
  fmt: {
    bracketSpacing: false,
    printWidth: 120,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "all",
    sortTailwindcss: {
      config: "./tailwind.config.js",
      functions: ["clsx", "twMerge"],
    },
    ignorePatterns: [
      "dist/**",
      "artifacts/**",
      "tmp/**",
      "sudokus/**",
      "public/**",
      "playwright-report/**",
      "test-results/**",
      "package-lock.json",
    ],
  },
  lint: {
    plugins: ["typescript", "react", "oxc"],
    env: {
      browser: true,
      es2024: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: [
      "dist/**",
      "node_modules/**",
      "*.min.js",
      "coverage/**",
      "artifacts/**",
      "tmp/**",
      "playwright-report/**",
      "test-results/**",
      "postcss.config.js",
      "tailwind.config.js",
    ],
    rules: {
      curly: ["warn", "all"],
      "no-unused-vars": "warn",
      "no-unused-expressions": "warn",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      "react/no-children-prop": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
    overrides: [
      {
        files: ["**/*.worker.ts"],
        env: {
          worker: true,
        },
      },
      {
        files: ["scripts/**/*.{js,ts}", "playwright.config.ts", "vite.config.ts"],
        env: {
          node: true,
        },
      },
    ],
  },
});
