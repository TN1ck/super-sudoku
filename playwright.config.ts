import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", {open: "never", outputFolder: "playwright-report"}],
        ["json", {outputFile: "test-results/playwright-results.json"}],
      ]
    : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    colorScheme: "light",
    locale: "en-US",
    screenshot: "only-on-failure",
    trace: process.env.CI ? "on" : "retain-on-failure",
    video: process.env.CI ? "on" : "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {...devices["Desktop Chrome"]},
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:4173",
  },
});
