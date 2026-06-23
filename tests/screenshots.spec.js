// @ts-check
/**
 * Screenshot capture spec — runs on all device profiles and saves named PNGs.
 * In CI these become downloadable artifacts. Locally: playwright-screenshots/
 *
 * Run all:   npx playwright test tests/screenshots.spec.js
 * One page:  npx playwright test tests/screenshots.spec.js --grep "homepage"
 */
const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'playwright-screenshots');

const PAGES = [
  { name: 'homepage',          path: './',                                    waitFor: '.hub-tab',   scroll: true },
  { name: 'knowledge-center',  path: './islamic-knowledge.html',              waitFor: '#zakat',     scroll: false },
  { name: 'student-guidance',  path: './student-guidance.html',               waitFor: '.sg-nav',    scroll: false },
  { name: 'learn-quran',       path: './knowledge-center/learn-quran/',       waitFor: '.al-hero',   scroll: false },
  { name: 'learn-salah',       path: './knowledge-center/learn-salah/',       waitFor: '.al-hero',   scroll: false },
  { name: 'learn-arabic',      path: './knowledge-center/learn-arabic/',      waitFor: '.al-hero',   scroll: false },
  { name: 'learn-urdu',        path: './knowledge-center/learn-urdu/',        waitFor: 'main',       scroll: false },
  { name: 'seerah',            path: './knowledge-center/seerah/',            waitFor: '.al-hero',   scroll: false },
  { name: 'islamic-history',   path: './knowledge-center/islamic-history/',   waitFor: '.al-hero',   scroll: false },
  { name: 'kids-islam',        path: './knowledge-center/kids-islam/',        waitFor: '.al-hero',   scroll: false },
];

test.beforeAll(() => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
});

for (const pg of PAGES) {
  test.describe(pg.name, () => {

    test('viewport screenshot', async ({ page, browserName }, testInfo) => {
      await page.goto(pg.path);
      await page.waitForSelector(pg.waitFor, { timeout: 10_000 });
      await page.waitForTimeout(1200); // let animations settle

      const device = testInfo.project.name;
      const file = path.join(OUT_DIR, `${device}--${pg.name}--viewport.png`);
      await page.screenshot({ path: file, fullPage: false });
    });

    test('full-page screenshot', async ({ page, browserName }, testInfo) => {
      await page.goto(pg.path);
      await page.waitForSelector(pg.waitFor, { timeout: 10_000 });
      await page.waitForTimeout(1200);

      // Scroll to bottom to trigger lazy images / reveal animations
      if (pg.scroll) {
        await page.evaluate(async () => {
          await new Promise(resolve => {
            let y = 0;
            const step = () => {
              window.scrollBy(0, 300);
              y += 300;
              if (y < document.body.scrollHeight) requestAnimationFrame(step);
              else { window.scrollTo(0, 0); resolve(); }
            };
            step();
          });
        });
        await page.waitForTimeout(600);
      }

      const device = testInfo.project.name;
      const file = path.join(OUT_DIR, `${device}--${pg.name}--full.png`);
      await page.screenshot({ path: file, fullPage: true });
    });

  });
}
