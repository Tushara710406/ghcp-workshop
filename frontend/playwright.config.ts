// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  
  // Auto-start dev server before tests
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 180 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
