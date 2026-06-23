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
    {
      name: 'safari-iphone14',
      use: { ...devices['iPhone 14 Pro'] },
    },
    {
      name: 'safari-ipad',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'chrome-pixel7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
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
    {
      name: 'android-real',
      use: {
        browserName: 'chromium',
        /* Playwright launches Chrome on the connected Android device via ADB.
           The _android API is used in tests — this project flag signals which
           tests should target the real device. */
        channel: 'chrome',
      },
      /* Tests that should run on real Android must opt-in with:
           test.use({ ...}) or by tagging. The test file
           tests/android-real.spec.js (below) handles device launch. */
      testMatch: '**/android-real.spec.js',
    },
  ],
  webServer: {
    command: 'node scripts/serve.js',
    port: 9090,
    reuseExistingServer: true,
  },
});
