// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:9090/';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    // WebKit = real Safari rendering engine (catches iOS-only bugs on Windows)
    {
      name: 'safari-iphone14',
      use: { ...devices['iPhone 14 Pro'] },
    },
    {
      name: 'safari-ipad',
      use: { ...devices['iPad Pro 11'] },
    },
    // Android Chrome for comparison
    {
      name: 'chrome-pixel7',
      use: { ...devices['Pixel 7'] },
    },
    // Desktop baseline
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node scripts/serve.js',
    port: 9090,
    reuseExistingServer: true,
  },
});
