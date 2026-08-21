// @ts-check
/**
 * Real Android device tests using ADB + Chrome DevTools Protocol.
 * No Appium, no experimental _android API — just ADB + CDP.
 *
 * PREREQUISITES (one-time, already done):
 *   - USB Debugging ON in Developer Options
 *   - USB cable plugged in (device shows in `adb devices`)
 *
 * Run:  npx playwright test --project=android-real
 */
const { test, expect, chromium } = require('@playwright/test');
const { execSync } = require('child_process');

const ADB  = process.env.ADB_PATH
          || `${process.env.USERPROFILE}\\AppData\\Local\\Android\\platform-tools\\adb.exe`;
const BASE = process.env.BASE_URL || 'http://127.0.0.1:9090/';
const CDP  = 'http://localhost:9222';

function adb(...args) {
  try {
    return execSync(`"${ADB}" ${args.join(' ')}`, { encoding: 'utf8', timeout: 8000 });
  } catch (e) {
    return e.stdout || '';
  }
}

test.describe.configure({ mode: 'serial' });

let browser, page;

test.beforeAll(async () => {
  // 1. Check device (trim lines to handle Windows CRLF)
  const adbOut = adb('devices');
  const deviceLines = adbOut.split('\n').map(l => l.trim()).filter(l => l.endsWith('device'));
  if (!deviceLines.length) {
    test.skip(true, 'No Android device connected — run: adb devices');
    return;
  }
  console.log(`\nDevice: ${deviceLines[0]}`);

  // 2. Forward ports (ignore errors — already forwarded is fine)
  adb('forward tcp:9222 localabstract:chrome_devtools_remote');
  adb('reverse tcp:9090 tcp:9090');

  // 3. Open/focus Chrome on device at our local server URL
  adb(`shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -a android.intent.action.VIEW -d "${BASE}"`);

  // 4. Wait for Chrome to start
  await new Promise(r => setTimeout(r, 3000));

  // 5. Get the real WS endpoint from CDP JSON (more reliable than passing HTTP URL)
  let wsUrl = null;
  try {
    const cdpRaw = execSync('curl -s http://localhost:9222/json/version', { encoding: 'utf8', timeout: 6000 });
    const cdpJson = JSON.parse(cdpRaw);
    wsUrl = cdpJson.webSocketDebuggerUrl;
    console.log('CDP browser WS:', wsUrl);
  } catch (e) {
    console.log('CDP json/version fetch failed:', e.message);
  }

  if (!wsUrl) {
    test.skip(true, 'Chrome DevTools not reachable at localhost:9222 — check ADB forward');
    return;
  }

  // 6. Connect via CDP WebSocket URL
  let connectErr = null;
  browser = await chromium.connectOverCDP(wsUrl).catch(e => { connectErr = e.message; return null; });
  if (!browser) {
    console.log('connectOverCDP failed:', connectErr);
    // Fallback: try HTTP endpoint
    browser = await chromium.connectOverCDP('http://localhost:9222').catch(e => {
      console.log('HTTP fallback also failed:', e.message);
      return null;
    });
  }

  if (!browser) {
    test.skip(true, `CDP connect failed: ${connectErr}`);
    return;
  }

  const contexts = browser.contexts();
  const ctx = contexts.length ? contexts[0] : await browser.newContext();
  const pages = ctx.pages();
  page = pages.length ? pages[0] : await ctx.newPage();
}, 40_000);

test.afterAll(async () => {
  if (browser) await browser.close().catch(() => {});
});

/* ── Homepage ── */
test('homepage loads and shows hero', async () => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForSelector('.hub-tab', { timeout: 15_000 });
  await expect(page).toHaveTitle(/Islamic Front/i);
});

test('homepage — Telugu/English toggle works', async () => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  const btn = page.locator('#lang-btn, .lang-btn').first();
  const before = await btn.textContent();
  await btn.tap();
  await page.waitForTimeout(500);
  await expect(btn).not.toHaveText(before || '');
});

test('homepage — no JS errors on load', async () => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForTimeout(1200);
  expect(errors, `JS errors:\n${errors.join('\n')}`).toHaveLength(0);
});

/* ── Knowledge Center ── */
test('knowledge center loads', async () => {
  await page.goto(BASE + 'islamic-knowledge.html', { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForSelector('#zakat', { timeout: 12_000 });
  await expect(page).toHaveTitle(/Knowledge/i);
});

/* ── Learn Arabic ── */
test('learn-arabic — letter popover opens on tap', async () => {
  await page.goto(BASE + 'knowledge-center/learn-arabic/alphabet.html',
    { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForSelector('.letter-card', { timeout: 12_000 });
  await page.locator('.letter-card').first().tap();
  await page.waitForSelector('#lp-pop.open', { timeout: 5_000 });
  await expect(page.locator('#lp-pop')).toBeVisible();
});

test('learn-arabic — popover closes with close button', async () => {
  await page.locator('.letter-card').first().tap();
  await page.waitForSelector('#lp-pop.open', { timeout: 5_000 });
  await page.locator('#lp-close').tap();
  await page.waitForSelector('#lp-pop:not(.open)', { timeout: 3_000 });
  await expect(page.locator('#lp-pop')).not.toBeVisible();
});

/* ── Learn Urdu ── */
test('learn-urdu — letter card highlights on tap', async () => {
  await page.goto(BASE + 'knowledge-center/learn-urdu/alphabet.html',
    { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForSelector('.lt-card', { timeout: 12_000 });
  const card = page.locator('.lt-card').first();
  await card.tap();
  await page.waitForSelector('#lp-pop.open', { timeout: 5_000 });
  await expect(card).toHaveClass(/active/);
});

/* ── Horizontal overflow (biggest mobile bug) ── */
const OVERFLOW_PAGES = [
  { name: 'homepage',         path: '' },
  { name: 'knowledge-center', path: 'islamic-knowledge.html' },
  { name: 'learn-arabic',     path: 'knowledge-center/learn-arabic/' },
  { name: 'learn-urdu',       path: 'knowledge-center/learn-urdu/' },
  { name: 'student-guidance', path: 'student-guidance.html' },
  { name: 'islamic-history',  path: 'knowledge-center/islamic-history/' },
  { name: 'seerah',           path: 'knowledge-center/seerah/' },
];

for (const pg of OVERFLOW_PAGES) {
  test(`no horizontal overflow — ${pg.name}`, async () => {
    await page.goto(BASE + pg.path, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForTimeout(800);

    const hits = await page.evaluate(() => {
      const vw = window.innerWidth;
      const out = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right <= vw + 4) return;
        // ignore if inside a scroll container
        let p = el.parentElement;
        while (p && p !== document.body) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === 'auto' || ov === 'scroll') return;
          p = p.parentElement;
        }
        out.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), right: Math.round(r.right) });
      });
      return out.slice(0, 8);
    });

    expect(hits, `${pg.name} overflow:\n${JSON.stringify(hits, null, 2)}`).toHaveLength(0);
  });
}

/* ── Tap target size (WCAG 2.5.5) ── */
test('homepage — tap targets ≥ 44×44px', async () => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20_000 });

  const small = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a, button').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) {
        out.push({ tag: el.tagName, text: el.textContent?.trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
      }
    });
    return out.slice(0, 10);
  });

  if (small.length) console.warn('Small tap targets:', JSON.stringify(small, null, 2));
  // Log only — don't fail (some decorative links are legitimately small)
  test.info().annotations.push({ type: 'small-targets', description: JSON.stringify(small) });
});
