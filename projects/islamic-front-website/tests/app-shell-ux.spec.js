// @ts-check
const { test, expect } = require('@playwright/test');

const MOBILE_PAGES = [
  './',
  './islamic-knowledge.html',
  './student-guidance.html',
  './knowledge-center/names-of-allah/',
  './knowledge-center/islamic-calendar/',
  './knowledge-center/hajj-umrah/',
  './knowledge-center/special-prayers/',
  './knowledge-center/womens-guidance/',
  './knowledge-center/learn-arabic/',
  './knowledge-center/learn-quran/',
  './knowledge-center/learn-salah/',
  './knowledge-center/seerah/',
  './knowledge-center/islamic-history/',
  './knowledge-center/kids-islam/',
];

const LONG_APP_PAGES = [
  './islamic-knowledge.html',
  './student-guidance.html',
  './knowledge-center/names-of-allah/',
  './knowledge-center/islamic-calendar/',
  './knowledge-center/hajj-umrah/',
  './knowledge-center/special-prayers/',
  './knowledge-center/womens-guidance/',
  './knowledge-center/learn-arabic/',
  './knowledge-center/learn-quran/',
  './knowledge-center/learn-salah/',
  './knowledge-center/seerah/',
  './knowledge-center/islamic-history/',
  './knowledge-center/kids-islam/',
];

const DESKTOP_APP_PAGES = LONG_APP_PAGES;

test.describe('Phase 3 mobile app shell UX', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of MOBILE_PAGES) {
    test(`bottom nav stays at bottom on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const nav = page.locator('#bottom-nav');
      await expect(nav).toBeVisible();
      const box = await nav.boundingBox();
      expect(box, `bottom-nav missing box on ${path}`).toBeTruthy();
      expect(box.y).toBeGreaterThan(700);
      expect(Math.round(box.y + box.height)).toBeGreaterThanOrEqual(830);
    });

    test(`mobile chrome is not duplicated on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const duplicateChrome = await page.evaluate(() => {
        return ['#btt', '#sgtt', '.back-to-top', '#ifsr-fab', '#ifxp', '.mobile-help-fab']
          .map(sel => Array.from(document.querySelectorAll(sel)))
          .flat()
          .filter(el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
          })
          .map(el => el.id || el.className);
      });
      expect(duplicateChrome).toEqual([]);
    });
  }

  for (const path of LONG_APP_PAGES) {
    test(`long page is contained into app screens on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(700);

      await expect(page.locator('#if-app-tabs')).toBeVisible();
      await expect(page.locator('.if-app-tab')).toHaveCount(5);

      const state = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('.if-app-screen'));
        return {
          ready: document.body.classList.contains('if-app-screen-ready'),
          hidden: sections.filter(s => getComputedStyle(s).display === 'none').length,
          total: sections.length,
          tabsTop: Math.round(document.getElementById('if-app-tabs').getBoundingClientRect().top),
        };
      });
      expect(state.ready).toBe(true);
      expect(state.total).toBeGreaterThanOrEqual(3);
      expect(state.hidden).toBeGreaterThan(0);
      expect(state.tabsTop).toBeLessThan(844 * 2);
    });
  }

  test('mobile pages have no horizontal overflow and no tiny visible controls', async ({ page }) => {
    for (const path of MOBILE_PAGES) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
      const result = await page.evaluate(() => {
        const vw = window.innerWidth;
        const small = Array.from(document.querySelectorAll('button, a, [role=button], input, select'))
          .filter(el => {
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) return false;
            return r.width < 44 || r.height < 44;
          })
          .map(el => ({
            tag: el.tagName,
            id: el.id,
            className: String(el.className).slice(0, 40),
            text: el.textContent.trim().slice(0, 24),
            w: Math.round(el.getBoundingClientRect().width),
            h: Math.round(el.getBoundingClientRect().height),
          }));
        return { overflow: document.body.scrollWidth > vw + 2, small };
      });
      expect(result.overflow, `${path} has horizontal overflow`).toBe(false);
      expect(result.small, `${path} tiny controls`).toEqual([]);
    }
  });
});

test.describe('KC navigation regression coverage', () => {
  test('desktop does not show mobile app chrome', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const path of DESKTOP_APP_PAGES) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const visibleChrome = await page.evaluate(() => {
        const visible = el => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
        };
        return ['.bottom-nav', '.if-app-tabs', '.if-learning-dashboard', '.if-kc-dashboard', '.if-sg-dashboard', '.nav-overlay', '.nav-drawer']
          .flatMap(sel => Array.from(document.querySelectorAll(sel)))
          .filter(visible)
          .map(el => el.id || String(el.className));
      });
      expect(visibleChrome, `${path} has desktop mobile chrome`).toEqual([]);
    }
  });

  test('mobile app tabs sit below visible header and move up when header hides', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./islamic-knowledge.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await expect(page.locator('body')).not.toHaveClass(/nav-hidden/);
    const beforeTop = await page.locator('#if-app-tabs').evaluate(el => getComputedStyle(el).top);
    expect(parseFloat(beforeTop)).toBeGreaterThanOrEqual(60);

    await page.evaluate(() => {
      const tabs = document.getElementById('if-app-tabs');
      window.scrollTo(0, Math.max(0, tabs.offsetTop + 320));
    });
    await page.waitForTimeout(350);
    await expect(page.locator('body')).toHaveClass(/nav-hidden/);
    const after = await page.locator('#if-app-tabs').boundingBox();
    expect(after.y).toBeLessThanOrEqual(8);
  });

  test('Islamic Calendar loads and toggles language without page errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('./knowledge-center/islamic-calendar/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    await page.locator('#lang-btn').click();
    await page.waitForTimeout(300);
    await page.locator('#lang-btn').click();
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
    await expect(page.locator('#cal-grid')).toBeVisible();
  });

  test('homepage bottom nav labels survive language toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.locator('#lang-btn').click();
    await page.waitForTimeout(300);

    const labels = await page.locator('#bottom-nav .bn-label').evaluateAll(nodes => nodes.map(n => n.textContent.trim()));
    expect(labels).toEqual(['Home', 'Guidance', 'Achievements', 'Manifesto', 'More']);
    expect(labels).not.toContain('Knowledge');
    expect(labels).not.toContain('Profile');
  });

  test('Urdu sub-lesson hides header on mobile scroll and keeps lesson nav usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./knowledge-center/learn-urdu/reading-basics.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);
    await page.evaluate(() => window.scrollBy(0, 360));
    await page.waitForTimeout(350);

    await expect(page.locator('body')).toHaveClass(/nav-hidden/);
    const lessonTop = await page.locator('.lesson-nav').evaluate(el => Math.round(el.getBoundingClientRect().top));
    expect(lessonTop).toBeLessThanOrEqual(4);
  });
});
