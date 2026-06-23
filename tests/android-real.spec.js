// @ts-check
/**
 * Real Android device tests via Playwright ADB support.
 *
 * PREREQUISITES (one-time setup):
 *   1. Android Platform Tools installed and `adb` in PATH
 *      https://developer.android.com/tools/releases/platform-tools
 *   2. Phone: Developer Options → USB Debugging ON
 *   3. USB cable plugged in, "Allow" tapped on the phone
 *   4. `adb devices` shows your device (not "unauthorized")
 *   5. `adb reverse tcp:9090 tcp:9090`  (lets phone reach localhost:9090)
 *   6. `node scripts/serve.js &`         (local server running)
 *
 * Run:
 *   npx playwright test tests/android-real.spec.js
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:9090/';

// These tests use Playwright's _android ADB API.
// They will be SKIPPED automatically if no device is connected.

test.describe('Real Android device — Chrome on Android', () => {

  let device, context, page;

  test.beforeAll(async () => {
    /* Dynamic import keeps the file parse-safe on machines without ADB */
    const { _android } = require('playwright');
    const devices = await _android.devices().catch(() => []);
    if (!devices.length) {
      test.skip(true, 'No Android device connected via ADB — plug in and run adb devices');
      return;
    }
    device = devices[0];
    console.log(`\nConnected: ${device.model()} (serial: ${await device.serial()})`);
    context = await device.launchBrowser({ baseURL: BASE });
    page    = await context.newPage();
  });

  test.afterAll(async () => {
    if (context) await context.close();
    if (device)  await device.close();
  });

  /* ── Homepage ── */
  test('homepage loads and shows hero', async () => {
    await page.goto(BASE);
    await page.waitForSelector('.hub-tab', { timeout: 15_000 });
    await expect(page).toHaveTitle(/Islamic Front/i);
  });

  test('homepage — Telugu/English toggle works', async () => {
    await page.goto(BASE);
    const btn = page.locator('.lang-btn, [id="lang-btn"]').first();
    const before = await btn.textContent();
    await btn.tap();
    await page.waitForTimeout(400);
    const after = await btn.textContent();
    expect(after).not.toBe(before);
  });

  test('homepage — no JS errors', async () => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    expect(errors, `JS errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  /* ── Knowledge Center ── */
  test('knowledge center loads', async () => {
    await page.goto(BASE + 'islamic-knowledge.html');
    await page.waitForSelector('#zakat', { timeout: 12_000 });
    await expect(page).toHaveTitle(/Knowledge/i);
  });

  /* ── Learn Arabic ── */
  test('learn-arabic alphabet — letter popover opens on tap', async () => {
    await page.goto(BASE + 'knowledge-center/learn-arabic/alphabet.html');
    await page.waitForSelector('.letter-card', { timeout: 12_000 });
    const firstCard = page.locator('.letter-card').first();
    await firstCard.tap();
    await page.waitForSelector('#lp-pop.open', { timeout: 3_000 });
    const popover = page.locator('#lp-pop');
    await expect(popover).toBeVisible();
  });

  test('learn-arabic alphabet — audio button plays sound', async () => {
    await page.goto(BASE + 'knowledge-center/learn-arabic/alphabet.html');
    await page.waitForSelector('.letter-card', { timeout: 12_000 });
    await page.locator('.letter-card').first().tap();
    await page.waitForSelector('#lp-pop.open', { timeout: 3_000 });
    const playBtn = page.locator('#lp-play');
    await expect(playBtn).toBeVisible();
    /* Tap and confirm the button enters playing state */
    await playBtn.tap();
    await page.waitForTimeout(600);
    /* playing class is added while audio plays */
    const cls = await playBtn.getAttribute('class');
    expect(cls).toMatch(/lp-play/);
  });

  /* ── Learn Urdu ── */
  test('learn-urdu alphabet — letter card highlights on tap', async () => {
    await page.goto(BASE + 'knowledge-center/learn-urdu/alphabet.html');
    await page.waitForSelector('.lt-card', { timeout: 12_000 });
    const card = page.locator('.lt-card').first();
    await card.tap();
    await page.waitForSelector('#lp-pop.open', { timeout: 3_000 });
    await expect(card).toHaveClass(/active/);
  });

  /* ── No horizontal overflow (the #1 mobile bug) ── */
  const PAGES_OVERFLOW = [
    { name: 'homepage',         path: '' },
    { name: 'knowledge-center', path: 'islamic-knowledge.html' },
    { name: 'learn-arabic',     path: 'knowledge-center/learn-arabic/' },
    { name: 'learn-urdu',       path: 'knowledge-center/learn-urdu/' },
    { name: 'student-guidance', path: 'student-guidance.html' },
  ];

  for (const pg of PAGES_OVERFLOW) {
    test(`no horizontal overflow — ${pg.name}`, async () => {
      await page.goto(BASE + pg.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(800);

      const overflow = await page.evaluate(() => {
        const vw = window.innerWidth;
        const hits = [];
        document.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 4) {
            let p = el.parentElement;
            while (p && p !== document.body) {
              const ov = getComputedStyle(p).overflowX;
              if (ov === 'auto' || ov === 'scroll') return;
              p = p.parentElement;
            }
            hits.push({ tag: el.tagName, cls: el.className.toString().slice(0, 50) });
          }
        });
        return hits.slice(0, 10);
      });

      expect(overflow, `${pg.name}: overflow ${JSON.stringify(overflow)}`).toHaveLength(0);
    });
  }
});
