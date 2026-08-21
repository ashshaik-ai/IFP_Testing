// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:9090/';

module.exports = defineConfig({
  testDir: './tests',
  // WebKit full-page captures of the long portal pages (16000+ CSS px) are
  // genuinely slow, and the suite grew from 1 tracked spec to 15. 30s at full
  // parallelism was timing out on the 2-core CI runner, not failing on merit.
  timeout: 60_000,
  workers: process.env.CI ? 2 : '50%',
  retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'safari-iphone14',
      use: { ...devices['iPhone 14 Pro'] },
      testIgnore: '**/android-real.spec.js',
    },
    {
      name: 'safari-ipad',
      use: { ...devices['iPad Pro 11'] },
      testIgnore: '**/android-real.spec.js',
    },
    {
      name: 'chrome-pixel7',
      use: { ...devices['Pixel 7'] },
      testIgnore: '**/android-real.spec.js',
    },
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/android-real.spec.js',
    },
    /* Real Android device via ADB (NOT Appium — Playwright uses ADB directly).
       Setup:
         1. Install Android Platform Tools: https://developer.android.com/tools/releases/platform-tools
         2. Phone: Settings → About → tap Build Number 7× → Developer Options → USB Debugging ON
         3. Plug in USB, tap Allow on the phone
         4. Run: adb devices   (should show your device, not "unauthorized")
         5. Run: adb reverse tcp:9090 tcp:9090   (so the phone can reach localhost)
         6. Run: npx playwright test --project=android-real
    */
    /* Real Android device via ADB + Chrome DevTools Protocol.
       No Appium. Just: USB Debugging ON + USB cable + run this project. */
    {
      name: 'android-real',
      use: { browserName: 'chromium' },
      testMatch: '**/android-real.spec.js',
    },
  ],
  webServer: {
    command: 'node scripts/serve.js',
    port: 9090,
    reuseExistingServer: true,
  },
});
