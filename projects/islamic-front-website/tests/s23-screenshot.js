'use strict';
const puppeteer = require('puppeteer-core');
const fs        = require('fs');
const path      = require('path');
const { execSync } = require('child_process');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ADB   = process.env.ADB_PATH || `${process.env.USERPROFILE}\\AppData\\Local\\Android\\platform-tools\\adb.exe`;
const BASE  = 'http://127.0.0.1:9090/';
const OUT   = 'test-results/s23-screenshots';

fs.mkdirSync(OUT, { recursive: true });

function adb(cmd) {
  try { return execSync(`"${ADB}" ${cmd}`, { encoding: 'utf8', timeout: 10_000 }); }
  catch (e) { return e.stdout || ''; }
}

function wakeScreen() {
  adb('shell input keyevent KEYCODE_WAKEUP');
}

const PAGES = [
  { name: 'homepage',         path: '' },
  { name: 'knowledge-center', path: 'islamic-knowledge.html' },
  { name: 'student-guidance', path: 'student-guidance.html' },
  { name: 'learn-arabic',     path: 'knowledge-center/learn-arabic/' },
  { name: 'learn-urdu',       path: 'knowledge-center/learn-urdu/' },
  { name: 'learn-quran',      path: 'knowledge-center/learn-quran/' },
  { name: 'learn-salah',      path: 'knowledge-center/learn-salah/' },
  { name: 'seerah',           path: 'knowledge-center/seerah/' },
  { name: 'islamic-history',  path: 'knowledge-center/islamic-history/' },
  { name: 'kids-islam',       path: 'knowledge-center/kids-islam/' },
  { name: 'womens-guidance',  path: 'knowledge-center/womens-guidance/' },
  { name: 'special-prayers',  path: 'knowledge-center/special-prayers/' },
];

// S23 Ultra logical viewport; DPR=1 for fast CDP screenshots (avoids timeout)
const VIEWPORT = { width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 1 };

(async () => {
  console.log('\n=== S23 Screenshot Capture ===\n');

  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9223',
    defaultViewport: VIEWPORT,
    protocolTimeout: 180_000,
  });

  // Wake screen and keep it on throughout
  wakeScreen();
  adb('shell settings put system screen_off_timeout 600000'); // 10 min timeout
  await sleep(800);

  const allPages = await browser.pages();
  const page = allPages[0] || await browser.newPage();
  await page.setViewport(VIEWPORT);

  for (const pg of PAGES) {
    for (const lang of ['te', 'en']) {
      try {
        await page.goto(BASE + pg.path, { waitUntil: 'load', timeout: 25_000 });
        await sleep(1500); // let fonts + JS settle

        // Switch to English if needed (default is Telugu)
        if (lang === 'en') {
          await page.evaluate(() => {
            const btn = document.getElementById('lang-btn')
                     || document.querySelector('.lang-btn')
                     || document.querySelector('[data-action="lang-toggle"]');
            if (btn) btn.click();
          });
          await sleep(700);
        }

        const file = path.join(OUT, `${pg.name}-${lang}.png`);
        await page.screenshot({ path: file, fullPage: false, type: 'png' });
        console.log(`  ✓ ${pg.name} [${lang}]  →  ${file}`);
      } catch (e) {
        console.log(`  ✗ ${pg.name} [${lang}]  ERROR: ${e.message.slice(0, 100)}`);
      }
    }
  }

  // Also capture alphabet pages (key ones for text overlap)
  const EXTRA = [
    { name: 'arabic-alphabet', path: 'knowledge-center/learn-arabic/alphabet.html' },
    { name: 'urdu-alphabet',   path: 'knowledge-center/learn-urdu/alphabet.html' },
  ];
  for (const pg of EXTRA) {
    for (const lang of ['te', 'en']) {
      try {
        await page.goto(BASE + pg.path, { waitUntil: 'load', timeout: 25_000 });
        await sleep(1500);
        if (lang === 'en') {
          await page.evaluate(() => {
            const btn = document.getElementById('lang-btn') || document.querySelector('.lang-btn');
            if (btn) btn.click();
          });
          await sleep(700);
        }
        const file = path.join(OUT, `${pg.name}-${lang}.png`);
        await page.screenshot({ path: file, fullPage: false, type: 'png' });
        console.log(`  ✓ ${pg.name} [${lang}]  →  ${file}`);
      } catch (e) {
        console.log(`  ✗ ${pg.name} [${lang}]  ERROR: ${e.message.slice(0, 100)}`);
      }
    }
  }

  await browser.disconnect();
  console.log(`\nAll done. Screenshots in: ${OUT}/\n`);
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
