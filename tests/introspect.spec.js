// @ts-check
const { test } = require('@playwright/test');

// Replicate the exact viewport the failing test uses
test.describe('hash deep-link in exact test viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    // Replicate the beforeEach from the failing describe
    await page.goto('./student-guidance.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
  });

  test('introspect hash deep-link state', async ({ page }) => {
    await page.goto('./student-guidance.html#mpc');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const info = await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('.sg-stream-pill'));
      return {
        hash: window.location.hash,
        isMobile: window.matchMedia('(max-width:768px)').matches,
        pills: pills.map(p => ({ id: p.getAttribute('data-stream-id'), class: p.className, pressed: p.getAttribute('aria-pressed') })),
        mpc: (() => { const el = document.querySelector('#mpc'); return el ? { class: el.className, hidden: el.classList.contains('sg-hide') } : null; })(),
        // Expose any JS global vars set by our script
        vars: {
          activeStream: window.activeStream,
          isMobileStream: window.isMobileStream,
        }
      };
    });

    console.log('HASH DEEP-LINK (exact test viewport):', JSON.stringify(info, null, 2));
  });
});
