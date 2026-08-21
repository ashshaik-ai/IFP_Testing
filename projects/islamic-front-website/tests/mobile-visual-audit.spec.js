// @ts-check
/**
 * Mobile Visual Audit — runs on WebKit (real Safari engine) and Chrome.
 * Catches layout overflow, clipped text, broken sticky nav, touch targets
 * too small, input zoom triggers, JS errors, horizontal scroll, and more.
 *
 * Run:  npx playwright test tests/mobile-visual-audit.spec.js --project=safari-iphone14
 * All:  npx playwright test tests/mobile-visual-audit.spec.js
 */
const { test, expect } = require('@playwright/test');

const PAGES = [
  { name: 'homepage',          path: './',                                          waitFor: '.hub-tab' },
  { name: 'student-guidance',  path: './student-guidance.html',                     waitFor: '#sgSearch' },
  { name: 'islamic-knowledge', path: './islamic-knowledge.html',                    waitFor: '.kc-sticky' },
  { name: 'learn-quran',       path: './knowledge-center/learn-quran/',             waitFor: '.if-portal-hero' },
  { name: 'learn-salah',       path: './knowledge-center/learn-salah/',             waitFor: '.if-portal-hero' },
  { name: 'seerah',            path: './knowledge-center/seerah/',                  waitFor: '.if-portal-hero' },
  { name: 'islamic-history',   path: './knowledge-center/islamic-history/',         waitFor: '.if-portal-hero' },
  { name: 'kids-islam',        path: './knowledge-center/kids-islam/',              waitFor: '.if-portal-hero' },
  { name: 'learn-arabic',      path: './knowledge-center/learn-arabic/',            waitFor: 'main' },
  { name: 'learn-urdu',        path: './knowledge-center/learn-urdu/',              waitFor: 'main' },
];

// ─── 1. JS errors + 404s on every page ──────────────────────────────────────

test.describe('No JS errors or broken assets', () => {
  for (const pg of PAGES) {
    test(`${pg.name}`, async ({ page, browserName }) => {
      const jsErrors = [];
      const broken = [];

      page.on('pageerror', e => jsErrors.push(e.message));
      page.on('response', r => {
        if (r.status() === 404) broken.push(r.url().replace(/.*localhost:\d+/, ''));
      });

      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(800);

      expect(jsErrors, `[${browserName}] JS errors on ${pg.name}:\n${jsErrors.join('\n')}`).toHaveLength(0);
      expect(broken,   `[${browserName}] 404 assets on ${pg.name}:\n${broken.join('\n')}`).toHaveLength(0);
    });
  }
});

// ─── 2. Horizontal overflow (the #1 mobile layout bug) ──────────────────────

test.describe('No horizontal overflow / scroll', () => {
  for (const pg of PAGES) {
    test(`${pg.name}`, async ({ page, browserName }) => {
      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(600);

      const overflow = await page.evaluate(() => {
        const vw = window.innerWidth;
        const offenders = [];

        // Returns true if any ancestor has overflow-x: auto or scroll
        // (meaning this element is SUPPOSED to be off-screen — it's inside a carousel)
        function insideScrollContainer(el) {
          let p = el.parentElement;
          while (p && p !== document.body) {
            const ov = getComputedStyle(p).overflowX;
            if (ov === 'auto' || ov === 'scroll') return true;
            p = p.parentElement;
          }
          return false;
        }

        document.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 2) {
            if (insideScrollContainer(el)) return; // false positive — intentional carousel item
            offenders.push({
              tag: el.tagName.toLowerCase(),
              cls: el.className.toString().slice(0, 60),
              right: Math.round(r.right),
              vw,
              overflow: Math.round(r.right - vw),
            });
          }
        });
        return offenders.slice(0, 20); // cap to 20 worst
      });

      expect(overflow,
        `[${browserName}] ${pg.name} has ${overflow.length} elements overflowing horizontally:\n`
        + overflow.map(o => `  <${o.tag} class="${o.cls}"> right=${o.right}px (overflow: ${o.overflow}px)`).join('\n')
      ).toHaveLength(0);
    });
  }
});

// ─── 3. Touch targets < 44px ─────────────────────────────────────────────────

test.describe('Touch targets ≥ 44×44px', () => {
  for (const pg of PAGES) {
    test(`${pg.name}`, async ({ page, browserName }, testInfo) => {
      test.skip(testInfo.project.name === 'desktop-chrome', '44px touch targets are a mobile/touch constraint');
      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(600);

      const small = await page.evaluate(() => {
        const hits = [];
        const selectors = 'a, button, [role="button"], input[type="checkbox"], input[type="radio"], summary';
        document.querySelectorAll(selectors).forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return; // invisible/hidden
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return;
          if (r.width < 44 || r.height < 44) {
            hits.push({
              tag: el.tagName.toLowerCase(),
              cls: el.className.toString().slice(0, 50),
              text: (el.textContent || '').trim().slice(0, 30),
              w: Math.round(r.width),
              h: Math.round(r.height),
            });
          }
        });
        return hits.slice(0, 30);
      });

      // Warn (soft) — don't hard-fail, just report
      if (small.length > 0) {
        console.warn(
          `[${browserName}] ${pg.name} — ${small.length} small touch targets:\n`
          + small.map(s => `  <${s.tag}> "${s.text}" class="${s.cls}" ${s.w}×${s.h}px`).join('\n')
        );
      }
      // Hard fail only if more than 10 (systemic problem)
      expect(small.length,
        `[${browserName}] ${pg.name} has ${small.length} touch targets < 44×44px (showing first 30):\n`
        + small.map(s => `  <${s.tag}> "${s.text}" ${s.w}×${s.h}px`).join('\n')
      ).toBeLessThanOrEqual(10);
    });
  }
});

// ─── 4. Input zoom — font-size must be ≥ 16px (iOS Safari auto-zooms below) ─

test.describe('Input font-size ≥ 16px (prevents iOS Safari zoom)', () => {
  for (const pg of PAGES) {
    test(`${pg.name}`, async ({ page, browserName }) => {
      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');

      const bad = await page.evaluate(() => {
        const hits = [];
        document.querySelectorAll('input, select, textarea').forEach(el => {
          const style = getComputedStyle(el);
          if (style.display === 'none') return;
          const fs = parseFloat(style.fontSize);
          if (fs < 16) {
            hits.push({
              tag: el.tagName.toLowerCase(),
              type: el.getAttribute('type') || '',
              id: el.id || '',
              cls: el.className.toString().slice(0, 50),
              fontSize: fs,
            });
          }
        });
        return hits;
      });

      expect(bad,
        `[${browserName}] ${pg.name} inputs with font-size < 16px (triggers iOS zoom):\n`
        + bad.map(b => `  <${b.tag} type="${b.type}" id="${b.id}"> font-size: ${b.fontSize}px`).join('\n')
      ).toHaveLength(0);
    });
  }
});

// ─── 5. Fixed nav stays at top (sticky positioning) ─────────────────────────

test.describe('Fixed nav does not scroll off screen', () => {
  // Only test navs that are always-visible (position:fixed), not ones that
  // slide in via JS scroll detection (like kc-sticky which starts transform-hidden)
  const NAV_SELECTORS = {
    'homepage':         'nav[aria-label="Main navigation"]',
    'student-guidance': 'nav.sg-nav',
  };

  for (const [name, sel] of Object.entries(NAV_SELECTORS)) {
    test(`${name}`, async ({ page, browserName }) => {
      const pg = PAGES.find(p => p.name === name);
      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(400);

      await page.evaluate(() => { window.scrollTo(0, 500); });
      await page.waitForTimeout(400);

      const navTop = await page.evaluate(s => {
        const el = document.querySelector(s);
        if (!el) return 'NOT_FOUND';
        if (getComputedStyle(el).display === 'none') return 'HIDDEN';
        return Math.round(el.getBoundingClientRect().top);
      }, sel);

      expect(navTop, `[${browserName}] ${name}: nav not found with "${sel}"`).not.toBe('NOT_FOUND');
      expect(navTop, `[${browserName}] ${name}: nav hidden`).not.toBe('HIDDEN');
      expect(navTop).toBeLessThanOrEqual(2);
    });
  }

  // Separately verify kc-sticky IS in the DOM (even though it starts transform-hidden)
  test('islamic-knowledge: kc-sticky nav exists in DOM', async ({ page, browserName }) => {
    await page.goto('./islamic-knowledge.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);
    const exists = await page.evaluate(() => !!document.getElementById('kc-sticky'));
    expect(exists, `[${browserName}] #kc-sticky not found in DOM`).toBe(true);
  });
});

// ─── 6. Text not clipped or overflowing its container ───────────────────────

test.describe('No clipped text (overflow hidden cuts content)', () => {
  const CRITICAL_SELECTORS = [
    'h1', 'h2', 'h3',
    '.hero-title', '.hero-subtitle',
    '.sg-hero h1', '.if-portal-hero h1',
  ];

  for (const pg of PAGES) {
    test(`${pg.name}`, async ({ page, browserName }) => {
      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      const clipped = await page.evaluate((selectors) => {
        const hits = [];
        selectors.forEach(sel => {
          document.querySelectorAll(sel).forEach(el => {
            const style = getComputedStyle(el);
            if (style.display === 'none') return;
            // Check if element is taller than its container suggests
            if (el.scrollHeight > el.clientHeight + 4 &&
                (style.overflow === 'hidden' || style.overflowY === 'hidden')) {
              hits.push({
                sel,
                text: el.textContent.trim().slice(0, 60),
                clientH: el.clientHeight,
                scrollH: el.scrollHeight,
              });
            }
          });
        });
        return hits;
      }, CRITICAL_SELECTORS);

      expect(clipped,
        `[${browserName}] ${pg.name} has clipped text in critical elements:\n`
        + clipped.map(c => `  "${c.text}" (${c.sel}) clientH=${c.clientH} scrollH=${c.scrollH}`).join('\n')
      ).toHaveLength(0);
    });
  }
});

// ─── 7. Full-page screenshots (every page, every project) ───────────────────
// These go into playwright-report/screenshots/ — open the HTML report to browse.

test.describe('Screenshots — full page mobile', () => {
  for (const pg of PAGES) {
    test(`screenshot: ${pg.name}`, async ({ page, browserName }, testInfo) => {
      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(800); // let deferred scripts + animations settle

      // Scroll to trigger lazy loads + reveal animations
      await page.evaluate(async () => {
        await new Promise(resolve => {
          let y = 0;
          const step = 400;
          const timer = setInterval(() => {
            window.scrollTo(0, y);
            y += step;
            if (y > document.body.scrollHeight) { clearInterval(timer); window.scrollTo(0, 0); resolve(); }
          }, 80);
        });
      });
      await page.waitForTimeout(400);

      await testInfo.attach(`${pg.name}-${browserName}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    });
  }
});

// ─── 8. Above-fold hero visible without scrolling ───────────────────────────

test.describe('Above-fold hero content visible', () => {
  test('homepage hero CTA visible without scroll', async ({ page, browserName }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop-chrome', 'above-the-fold check is a mobile-viewport constraint');
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);

    const cta = page.locator('.hero-cta').first();
    await expect(cta, `[${browserName}] hero CTA not visible above fold`).toBeVisible();

    const box = await cta.boundingBox();
    expect(box, `[${browserName}] hero CTA bounding box null`).not.toBeNull();
    expect(box.y + box.height,
      `[${browserName}] hero CTA below fold (y=${box.y} h=${box.height})`
    ).toBeLessThan(page.viewportSize().height);
  });

  test('student-guidance hero title visible without scroll', async ({ page, browserName }) => {
    await page.goto('./student-guidance.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);

    const h1 = page.locator('h1').first();
    await expect(h1, `[${browserName}] h1 not in DOM`).toBeAttached();
    const box = await h1.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y + box.height).toBeLessThan(page.viewportSize().height + 200); // within first screen + a bit
  });
});

// ─── 9. Bottom nav present and not overlapping content ──────────────────────

test('Homepage bottom nav present and above page bottom', async ({ page, browserName }) => {
  await page.goto('./');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(400);

  const bnav = page.locator('.bottom-nav, .bn-wrap, [role="navigation"][aria-label*="main" i]').first();
  const count = await bnav.count();
  if (count === 0) {
    console.warn(`[${browserName}] no bottom nav found — skipping`);
    return;
  }

  const box = await bnav.boundingBox();
  // Bottom nav is mobile-shell only; on desktop it is display:none → no box. Skip there.
  if (!box) {
    console.warn(`[${browserName}] bottom nav not rendered (desktop shell) — skipping`);
    return;
  }
  const vh = page.viewportSize().height;
  expect(box.y, `[${browserName}] bottom nav y=${box.y} is above viewport (vh=${vh})`).toBeGreaterThan(vh - 80);
  expect(box.y + box.height, `[${browserName}] bottom nav clips below viewport`).toBeLessThanOrEqual(vh + 4);
});

// ─── 10. Scroll containers don't block page scroll ─────────────────────────

test.describe('Scroll containers — touch-action not blocking page scroll', () => {
  test('homepage horizontal carousels allow vertical page scroll', async ({ page, browserName }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);

    const blocking = await page.evaluate(() => {
      const hits = [];
      document.querySelectorAll('[style*="overflow"], .carousel-wrap, .achievements-grid, .sg-chips').forEach(el => {
        const style = getComputedStyle(el);
        const ta = style.touchAction;
        if (ta && ta !== 'auto' && ta !== 'manipulation' && ta !== 'pan-y' && ta !== 'pan-x pan-y') {
          hits.push({ cls: el.className.toString().slice(0, 60), touchAction: ta });
        }
      });
      return hits;
    });

    if (blocking.length > 0) {
      console.warn(`[${browserName}] Elements with restrictive touch-action:\n`
        + blocking.map(b => `  class="${b.cls}" touch-action: ${b.touchAction}`).join('\n'));
    }
  });
});
