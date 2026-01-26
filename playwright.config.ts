import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] }, // Use Chromium-based mobile device
    },
  ],
  webServer: {
    command: "E2E_MOCK=true yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      E2E_MOCK: "true",
      GRPC_API_KEY: "test-api-key",
      NEXTAUTH_SECRET: "test-secret-for-e2e",
    },
  },
})
