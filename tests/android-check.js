#!/usr/bin/env node
/**
 * Real Android device validation via ADB + Puppeteer CDP.
 * Run:  node tests/android-check.js
 * (Playwright's connectOverCDP doesn't work with Android Chrome — this does.)
 */
'use strict';

const { execSync } = require('child_process');
const puppeteer    = require('puppeteer-core');

const ADB  = process.env.ADB_PATH
          || `${process.env.USERPROFILE}\\AppData\\Local\\Android\\platform-tools\\adb.exe`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const BASE     = process.env.BASE_URL  || 'http://127.0.0.1:9090/';
const CDP_PORT = process.env.CDP_PORT  || '9223'; // 9222 is often taken by desktop Chrome
const CDP_HTTP = `http://localhost:${CDP_PORT}`;

function adb(cmd) {
  try { return execSync(`"${ADB}" ${cmd}`, { encoding: 'utf8', timeout: 8000 }); }
  catch (e) { return e.stdout || ''; }
}

function nodeGet(path) {
  const http = require('http');
  return new Promise((res, rej) => {
    http.get(CDP_HTTP + path, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(d));
    }).on('error', rej);
  });
}

/* ── Helpers ── */
async function noHorizOverflow(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const hits = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right <= vw + 4) return;
      let p = el.parentElement;
      while (p && p !== document.body) {
        const ov = getComputedStyle(p).overflowX;
        if (ov === 'auto' || ov === 'scroll') return;
        p = p.parentElement;
      }
      hits.push({ tag: el.tagName, cls: String(el.className).slice(0, 50), right: Math.round(r.right) });
    });
    return hits.slice(0, 8);
  });
}

async function noJsErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await sleep(1200);
  return errors;
}

/* ── Test runner ── */
async function run() {
  const results = { pass: 0, fail: 0, items: [] };

  function pass(name) {
    results.pass++;
    results.items.push({ status: 'PASS', name });
    console.log(`  ✓ ${name}`);
  }
  function fail(name, reason) {
    results.fail++;
    results.items.push({ status: 'FAIL', name, reason });
    console.log(`  ✗ ${name}\n      ${reason}`);
  }

  /* ─ 1. ADB device check ─ */
  console.log('\n=== Android Real-Device Check ===\n');
  const devices = adb('devices').split('\n').map(l => l.trim()).filter(l => l.endsWith('device'));
  if (!devices.length) {
    console.log('ERROR: No Android device connected. Run: adb devices');
    process.exit(1);
  }
  console.log(`Device: ${devices[0]}\n`);

  /* ─ 2. Port forward (use 9223 — 9222 is often taken by desktop Chrome) ─ */
  adb(`forward tcp:${CDP_PORT} localabstract:chrome_devtools_remote`);
  adb('reverse tcp:9090 tcp:9090');

  /* ─ 3. Open Chrome on device ─ */
  adb(`shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -a android.intent.action.VIEW -d "${BASE}"`);
  await new Promise(r => setTimeout(r, 3000));

  /* ─ 4. Verify CDP hits Android Chrome (not desktop Chrome) ─ */
  let versionInfo;
  try {
    const verRaw = await nodeGet('/json/version');
    versionInfo = JSON.parse(verRaw);
    const ua = versionInfo['User-Agent'] || '';
    console.log('CDP browser:', versionInfo['Browser']);
    console.log('User-Agent:', ua.slice(0, 80));
    if (ua.includes('Windows') && !ua.includes('Android')) {
      console.log('WARNING: CDP is hitting desktop Chrome (port conflict). Ensure ADB forward on port ' + CDP_PORT + '.');
      console.log('Close desktop Chrome or run: adb forward tcp:' + CDP_PORT + ' localabstract:chrome_devtools_remote');
      process.exit(1);
    }
  } catch (e) {
    console.log('ERROR: Cannot reach CDP at', CDP_HTTP, '—', e.message);
    process.exit(1);
  }

  const browserWsUrl = versionInfo.webSocketDebuggerUrl;
  console.log('Browser WS:', browserWsUrl);

  /* ─ 5. Connect puppeteer via browser URL ─ */
  let browser, page;
  try {
    browser = await puppeteer.connect({ browserURL: CDP_HTTP, defaultViewport: null, protocolTimeout: 120000 });
    const pages = await browser.pages();
    page = pages[0] || await browser.newPage();
    console.log('Puppeteer connected. Pages:', pages.length);
  } catch (e) {
    console.log('ERROR: Cannot connect via puppeteer:', e.message);
    process.exit(1);
  }

  console.log('\n--- Running checks ---\n');

  /* ─ Tests ─ */
  const PAGES = [
    { name: 'homepage',         path: '' },
    { name: 'knowledge-center', path: 'islamic-knowledge.html' },
    { name: 'learn-arabic',     path: 'knowledge-center/learn-arabic/' },
    { name: 'learn-urdu',       path: 'knowledge-center/learn-urdu/' },
    { name: 'student-guidance', path: 'student-guidance.html' },
    { name: 'islamic-history',  path: 'knowledge-center/islamic-history/' },
    { name: 'seerah',           path: 'knowledge-center/seerah/' },
    { name: 'kids-islam',       path: 'knowledge-center/kids-islam/' },
  ];

  for (const pg of PAGES) {
    try {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));

      await page.goto(BASE + pg.path, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(800);

      // Horizontal overflow
      const overflow = await noHorizOverflow(page);
      if (overflow.length === 0) {
        pass(`${pg.name} — no horizontal overflow`);
      } else {
        fail(`${pg.name} — horizontal overflow`, JSON.stringify(overflow));
      }

      // JS errors
      if (errors.length === 0) {
        pass(`${pg.name} — no JS errors`);
      } else {
        fail(`${pg.name} — JS errors`, errors.slice(0, 2).join('; '));
      }

      page.removeAllListeners('pageerror');
    } catch (e) {
      fail(`${pg.name}`, e.message.slice(0, 120));
    }
  }

  /* ─ Popover test (learn-arabic) ─ */
  try {
    await page.goto(BASE + 'knowledge-center/learn-arabic/alphabet.html',
      { waitUntil: 'load', timeout: 25000 });
    await page.waitForSelector('.letter-card', { timeout: 12000 });
    await sleep(1500); // let JS fully initialize on real device
    await page.evaluate(() => document.querySelector('.letter-card').click());
    await page.waitForSelector('#lp-pop.open', { timeout: 8000 });
    pass('learn-arabic — letter popover opens on tap');
  } catch (e) {
    fail('learn-arabic — letter popover opens on tap', e.message.slice(0, 160));
  }

  /* ─ Urdu card highlight test ─ */
  try {
    await page.goto(BASE + 'knowledge-center/learn-urdu/alphabet.html',
      { waitUntil: 'load', timeout: 25000 });
    await page.waitForSelector('.lt-card', { timeout: 12000 });
    await sleep(1500);
    await page.evaluate(() => document.querySelector('.lt-card').click());
    await page.waitForSelector('#lp-pop.open', { timeout: 8000 });
    const hasActive = await page.$eval('.lt-card', el => el.classList.contains('active'));
    if (hasActive) pass('learn-urdu — card.active set on tap');
    else fail('learn-urdu — card.active set on tap', 'active class not found on card');
  } catch (e) {
    fail('learn-urdu — card.active set on tap', e.message.slice(0, 160));
  }

  /* ─ Lang toggle (homepage) ─ */
  try {
    await page.goto(BASE, { waitUntil: 'load', timeout: 25000 });
    await sleep(1000);
    const before = await page.$eval('#lang-btn, .lang-btn', el => el.textContent?.trim());
    await page.evaluate(() => (document.getElementById('lang-btn') || document.querySelector('.lang-btn')).click());
    await sleep(600);
    const after = await page.$eval('#lang-btn, .lang-btn', el => el.textContent?.trim());
    if (before !== after) pass('homepage — language toggle works');
    else fail('homepage — language toggle works', `text unchanged: "${before}"`);
  } catch (e) {
    fail('homepage — language toggle works', e.message.slice(0, 160));
  }

  /* ─ Summary ─ */
  console.log(`\n=== Results: ${results.pass} passed, ${results.fail} failed ===\n`);
  if (results.fail > 0) {
    console.log('Failed tests:');
    results.items.filter(i => i.status === 'FAIL').forEach(i =>
      console.log(`  ✗ ${i.name}: ${i.reason}`));
    console.log('');
  }

  await browser.disconnect();
  process.exit(results.fail > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('Unexpected error:', e.message);
  process.exit(1);
});
