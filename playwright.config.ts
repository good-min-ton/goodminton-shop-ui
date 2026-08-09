import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run dev --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    // Reuse a server a developer already has running, but never in CI: there the
    // suite must control the env below, and a reused server would not have it.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // The suite provisions its own configuration rather than relying on
    // .env.local, which is gitignored and therefore absent in CI and in a fresh
    // clone. Both are placeholders - every backend call in the specs is mocked
    // by page.route - but they have to be *set*, because the API clients treat
    // an empty base URL as "not configured" and refuse to make the request the
    // mock is waiting for.
    env: {
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8080/api',
      NEXT_PUBLIC_RAG_API_URL: 'http://127.0.0.1:8081',
    },
  },
});
