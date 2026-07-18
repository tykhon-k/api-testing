import { defineConfig } from "@playwright/test";

/**
 * API-level testing: no browsers launched, only Playwright's `request` context.
 * Point at any environment with API_BASE_URL; defaults to the local server.
 */
export default defineConfig({
  testDir: "./tests-ts",
  fullyParallel: false, // tests share one API instance and reset per test
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.API_BASE_URL ?? "http://localhost:3000",
    extraHTTPHeaders: { Accept: "application/json" },
  },
});
