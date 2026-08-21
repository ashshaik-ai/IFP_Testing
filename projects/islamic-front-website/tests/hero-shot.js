'use strict';
const puppeteer = require('puppeteer-core');
const fs        = require('fs');
const path      = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT   = 'test-results/hero-shots';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 1 };

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9223',
    defaultViewport: VIEWPORT,
    protocolTimeout: 120_000,
  });

  const allPages = await browser.pages();
  const page = allPages[0] || await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Telugu hero
  await page.goto('http://127.0.0.1:9090/', { waitUntil: 'load', timeout: 25_000 });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, 'hero-te.png'), fullPage: false });
  console.log('hero-te done');

  // English hero
  await page.evaluate(() => {
    const btn = document.getElementById('lang-btn') || document.querySelector('[data-action="lang-toggle"]');
    if (btn) btn.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT, 'hero-en.png'), fullPage: false });
  console.log('hero-en done');

  // Scroll to show bottom nav with Achievements
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  // Grab the nav badge area — scroll just past hero to show hub tabs
  await page.evaluate(() => window.scrollTo(0, 200));
  await sleep(500);
  await page.screenshot({ path: path.join(OUT, 'nav-en.png'), fullPage: false });
  console.log('nav-en done');

  // Switch back to Telugu for same
  await page.evaluate(() => {
    const btn = document.getElementById('lang-btn') || document.querySelector('[data-action="lang-toggle"]');
    if (btn) btn.click();
  });
  await sleep(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, 'hero-te-scroll0.png'), fullPage: false });
  console.log('hero-te-scroll0 done');

  await browser.disconnect();
  console.log('All done →', OUT);
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
