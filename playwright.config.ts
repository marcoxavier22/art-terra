import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config({ path: '.env.local' });

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

/**
 * Smoke tests. They need the app running against a database with the seed applied and
 * a test admin (E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD in .env.local). The disposable
 * stack in scripts/local-stack provides exactly that — see the README.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  reporter: [['list']],
  use: {
    baseURL,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    launchOptions: process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testMatch: /public\.spec\.ts/,
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm start',
        url: `${baseURL}/robots.txt`,
        reuseExistingServer: true,
        timeout: 240_000,
      },
});
