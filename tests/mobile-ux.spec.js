// @ts-check
const { test, expect } = require('@playwright/test');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function swipeCarousel(page, selector, px) {
  await page.evaluate(
    ({ sel, delta }) => {
      const el = document.querySelector(sel);
      if (el) el.scrollLeft += delta;
    },
    { sel: selector, delta: px }
  );
  await page.waitForTimeout(300);
}

async function switchHubTab(page, tabId) {
  await page.locator(`.hub-tab[data-tab="${tabId}"]`).click();
  await page.waitForTimeout(250);
}

// ─── Homepage: hub-tabs navigation ────────────────────────────────────────────

test.describe('Homepage — hub-tabs navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('hub-tabs strip renders with 5 tabs', async ({ page }) => {
    const tabs = page.locator('.hub-tab');
    await expect(tabs).toHaveCount(5);
  });

  test('first tab (overview) is active on load', async ({ page }) => {
    const firstTab = page.locator('.hub-tab[data-tab="overview"]');
    await expect(firstTab).toHaveClass(/active/);
  });

  test('clicking community tab makes it active', async ({ page }) => {
    await switchHubTab(page, 'community');
    await expect(page.locator('.hub-tab[data-tab="community"]')).toHaveClass(/active/);
    await expect(page.locator('.hub-tab[data-tab="overview"]')).not.toHaveClass(/active/);
  });

  test('language toggle switches page to English', async ({ page }) => {
    const langBtn = page.locator('#lang-btn');
    await expect(langBtn).toBeVisible();
    await langBtn.click();
    await page.waitForTimeout(300);
    // After toggle, button should reflect new state
    const title = await langBtn.getAttribute('title');
    expect(title).toMatch(/Telugu/i); // Now it shows "click for Telugu"
  });

  test('all 5 hub-tab data-tab values are correct', async ({ page }) => {
    const tabs = page.locator('.hub-tab');
    const tabIds = await tabs.evaluateAll(els => els.map(el => el.getAttribute('data-tab')));
    expect(tabIds).toEqual(['overview', 'schemes', 'community', 'about', 'knowledge']);
  });
});

// ─── Homepage: mobile carousels ───────────────────────────────────────────────

test.describe('Homepage — mobile carousels (@mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('achievements-grid is display:flex with overflow-x scroll on mobile', async ({ page }) => {
    const grid = page.locator('.achievements-grid');
    await expect(grid).toBeAttached();

    const styles = await grid.evaluate(el => ({
      display: getComputedStyle(el).display,
      overflowX: getComputedStyle(el).overflowX,
      snapType: getComputedStyle(el).scrollSnapType,
    }));
    expect(styles.display).toBe('flex');
    expect(['auto', 'scroll']).toContain(styles.overflowX);
  });

  test('ach-card has scroll-snap-align:start on mobile', async ({ page }) => {
    const card = page.locator('.ach-card').first();
    await expect(card).toBeAttached();
    const snap = await card.evaluate(el => getComputedStyle(el).scrollSnapAlign);
    expect(snap).toBe('start');
  });

  test('achievements carousel scrolls when swiped', async ({ page }) => {
    const grid = page.locator('.achievements-grid');
    const before = await grid.evaluate(el => el.scrollLeft);
    await swipeCarousel(page, '.achievements-grid', 250);
    const after = await grid.evaluate(el => el.scrollLeft);
    expect(after).toBeGreaterThan(before);
  });

  test('stories-grid is display:flex with overflow-x scroll on mobile', async ({ page }) => {
    await switchHubTab(page, 'community');
    const grid = page.locator('.stories-grid');
    await expect(grid).toBeAttached();
    const styles = await grid.evaluate(el => ({
      display: getComputedStyle(el).display,
      overflowX: getComputedStyle(el).overflowX,
    }));
    expect(styles.display).toBe('flex');
    expect(['auto', 'scroll']).toContain(styles.overflowX);
  });

  test('gallery-grid is display:flex with overflow-x scroll on mobile', async ({ page }) => {
    await switchHubTab(page, 'community');
    const grid = page.locator('.gallery-grid');
    await expect(grid).toBeAttached();
    const styles = await grid.evaluate(el => ({
      display: getComputedStyle(el).display,
      overflowX: getComputedStyle(el).overflowX,
    }));
    expect(styles.display).toBe('flex');
    expect(['auto', 'scroll']).toContain(styles.overflowX);
  });

  test('.carousel-wrap elements are present', async ({ page }) => {
    const wraps = page.locator('.carousel-wrap');
    const count = await wraps.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('no horizontal page overflow from carousels', async ({ page }) => {
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 2);
  });
});

// ─── Homepage: desktop grids stay as grid ─────────────────────────────────────

test.describe('Homepage — desktop grids remain CSS grid', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('achievements-grid is display:grid on desktop', async ({ page }) => {
    const display = await page.locator('.achievements-grid').evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('grid');
  });

  test('gallery-grid is display:grid on desktop', async ({ page }) => {
    await switchHubTab(page, 'community');
    const display = await page.locator('.gallery-grid').evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('grid');
  });
});

// ─── Student Guidance: stream collapse on mobile ───────────────────────────────

test.describe('Student Guidance — mobile stream collapse (@mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./student-guidance.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
  });

  test('stream prompt #sgStreamPrompt is visible on mobile load', async ({ page }) => {
    const prompt = page.locator('#sgStreamPrompt');
    await expect(prompt).toBeAttached();
    await expect(prompt).toBeVisible();
  });

  test('all 4 stream sections hidden on mobile load (activeStream=none)', async ({ page }) => {
    for (const id of ['mpc', 'bipc', 'commerce', 'arts']) {
      const sec = page.locator(`#${id}`);
      const hidden = await sec.evaluate(el => el.classList.contains('sg-hide'));
      expect(hidden, `#${id} should have sg-hide on mobile load`).toBe(true);
    }
  });

  test('tapping MPC pill reveals #mpc and hides others', async ({ page }) => {
    await page.locator('.sg-stream-pill[data-stream-id="mpc"]').click();
    await page.waitForTimeout(300);

    expect(await page.locator('#mpc').evaluate(el => el.classList.contains('sg-hide'))).toBe(false);
    for (const id of ['bipc', 'commerce', 'arts']) {
      expect(await page.locator(`#${id}`).evaluate(el => el.classList.contains('sg-hide')),
        `#${id} should be hidden when MPC active`).toBe(true);
    }
  });

  test('MPC pill gets aria-pressed=true after tap', async ({ page }) => {
    const pill = page.locator('.sg-stream-pill[data-stream-id="mpc"]');
    await pill.click();
    await page.waitForTimeout(200);
    await expect(pill).toHaveAttribute('aria-pressed', 'true');
  });

  test('tapping active pill again collapses back to none (toggle-off)', async ({ page }) => {
    const pill = page.locator('.sg-stream-pill[data-stream-id="mpc"]');
    await pill.click();
    await page.waitForTimeout(200);
    await pill.click(); // toggle off
    await page.waitForTimeout(200);

    expect(await page.locator('#mpc').evaluate(el => el.classList.contains('sg-hide'))).toBe(true);
    await expect(page.locator('#sgStreamPrompt')).toBeVisible();
    await expect(pill).toHaveAttribute('aria-pressed', 'false');
  });

  test('switching BiPC→MPC hides BiPC and shows MPC', async ({ page }) => {
    await page.locator('.sg-stream-pill[data-stream-id="bipc"]').click();
    await page.waitForTimeout(200);
    await page.locator('.sg-stream-pill[data-stream-id="mpc"]').click();
    await page.waitForTimeout(200);

    expect(await page.locator('#mpc').evaluate(el => el.classList.contains('sg-hide'))).toBe(false);
    expect(await page.locator('#bipc').evaluate(el => el.classList.contains('sg-hide'))).toBe(true);
  });

  test('search shows cards across all streams regardless of active stream', async ({ page }) => {
    // Start with no stream (none state)
    const input = page.locator('#sgSearch');
    await input.fill('engineering');
    await page.waitForTimeout(400);

    const visibleCards = page.locator('.gx-card:not(.sg-hide)');
    expect(await visibleCards.count()).toBeGreaterThan(0);

    // Prompt should be hidden when searching
    await expect(page.locator('#sgStreamPrompt')).toBeHidden();
  });

  test('hash deep-link #mpc auto-selects MPC and shows section', async ({ page }) => {
    await page.goto('./student-guidance.html#mpc');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('.sg-stream-pill[data-stream-id="mpc"]')).toHaveClass(/active/);
    expect(await page.locator('#mpc').evaluate(el => el.classList.contains('sg-hide'))).toBe(false);
  });

  test('All pill tap shows all 4 stream sections', async ({ page }) => {
    await page.locator('.sg-stream-pill[data-stream-id="all"]').click();
    await page.waitForTimeout(300);

    for (const id of ['mpc', 'bipc', 'commerce', 'arts']) {
      expect(await page.locator(`#${id}`).evaluate(el => el.classList.contains('sg-hide')),
        `#${id} should be visible after tapping All`).toBe(false);
    }
  });
});

// ─── Student Guidance: desktop shows everything ───────────────────────────────

test.describe('Student Guidance — desktop shows all streams on load', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./student-guidance.html');
    await page.waitForLoadState('networkidle');
  });

  test('all 4 stream sections are visible on desktop load', async ({ page }) => {
    for (const id of ['mpc', 'bipc', 'commerce', 'arts']) {
      expect(await page.locator(`#${id}`).evaluate(el => el.classList.contains('sg-hide')),
        `#${id} should be visible on desktop`).toBe(false);
    }
  });

  test('stream prompt is hidden on desktop', async ({ page }) => {
    const prompt = page.locator('#sgStreamPrompt');
    if (await prompt.count()) {
      await expect(prompt).toBeHidden();
    }
  });
});

// ─── Regression: no JS errors ─────────────────────────────────────────────────

test.describe('Regression — no JS console errors', () => {
  for (const path of ['./', './student-guidance.html']) {
    test(`no console errors on ${path}`, async ({ page }) => {
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Filter out known pre-existing 404s for missing placeholder images
      const realErrors = errors.filter(e => !e.includes('story') && !e.includes('.jpg') && !e.includes('.png') && !e.includes('.webp'));
      expect(realErrors, `JS errors on ${path}: ${realErrors.join('; ')}`).toHaveLength(0);
    });
  }
});
