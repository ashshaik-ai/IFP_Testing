// @ts-check
const { test } = require('@playwright/test');

const PAGES = [
  { name: 'homepage', path: './' },
  { name: 'student-guidance', path: './student-guidance.html' },
  { name: 'islamic-knowledge', path: './islamic-knowledge.html' },
  { name: 'learn-arabic', path: './knowledge-center/learn-arabic/' },
  { name: 'learn-urdu', path: './knowledge-center/learn-urdu/' },
  { name: 'learn-quran', path: './knowledge-center/learn-quran/' },
  { name: 'learn-salah', path: './knowledge-center/learn-salah/' },
  { name: 'seerah', path: './knowledge-center/seerah/' },
  { name: 'islamic-history', path: './knowledge-center/islamic-history/' },
  { name: 'kids-islam', path: './knowledge-center/kids-islam/' },
];

test.describe('Full site audit', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const pg of PAGES) {
    test(`audit: ${pg.name}`, async ({ page }) => {
      const issues = [];
      const res404 = [];
      page.on('pageerror', e => issues.push('JS ERROR: ' + e.message));
      page.on('response', r => { if (r.status() === 404) res404.push(r.url().split('/').pop()); });

      await page.goto(pg.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(600);

      const audit = await page.evaluate(() => {
        const vw = window.innerWidth;
        const bodyW = document.body.scrollWidth;

        // Touch targets < 44px
        const smallTouchTargets = [];
        document.querySelectorAll('button, a, [role=button], input, select').forEach(el => {
          const r = el.getBoundingClientRect();
          if ((r.width > 0 || r.height > 0) && (r.width < 44 || r.height < 44)) {
            smallTouchTargets.push({ tag: el.tagName, class: el.className.slice(0,40), text: el.textContent.trim().slice(0,30), w: Math.round(r.width), h: Math.round(r.height) });
          }
        });

        // Images without alt
        const noAlt = [];
        document.querySelectorAll('img').forEach(img => {
          if (!img.hasAttribute('alt')) noAlt.push(img.src.split('/').pop());
        });

        // Contrast: text on background (rough: light-on-light or dark-on-dark)
        // Headings with font-size < 13px
        const tinyText = [];
        document.querySelectorAll('p, span, li, td, th, label').forEach(el => {
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs > 0 && fs < 12 && el.textContent.trim().length > 2) {
            tinyText.push({ tag: el.tagName, class: el.className.slice(0,30), fs: Math.round(fs), text: el.textContent.trim().slice(0,20) });
          }
        });

        // Horizontal overflow
        const hOverflow = bodyW > vw + 2;

        // Fixed elements that might block content
        const fixed = Array.from(document.querySelectorAll('*')).filter(el => {
          const pos = getComputedStyle(el).position;
          return pos === 'fixed' || pos === 'sticky';
        }).map(el => ({ id: el.id, class: el.className.slice(0,40), pos: getComputedStyle(el).position }));

        // Form inputs without labels
        const unlabelledInputs = [];
        document.querySelectorAll('input:not([type=hidden]), textarea, select').forEach(inp => {
          const id = inp.id;
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = inp.hasAttribute('aria-label') || inp.hasAttribute('aria-labelledby');
          if (!hasLabel && !hasAriaLabel) unlabelledInputs.push({ type: inp.type, id: inp.id, name: inp.name });
        });

        // Empty heading tags
        const emptyHeadings = [];
        document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
          if (!h.textContent.trim()) emptyHeadings.push(h.tagName);
        });

        // Multiple H1s
        const h1Count = document.querySelectorAll('h1').length;

        // Viewport meta
        const hasMeta = !!document.querySelector('meta[name=viewport]');

        return {
          hOverflow, bodyW, vw,
          smallTouchTargets: smallTouchTargets.slice(0,10),
          noAlt: noAlt.slice(0,10),
          tinyText: tinyText.slice(0,10),
          fixed: fixed.slice(0,8),
          unlabelledInputs,
          emptyHeadings,
          h1Count,
          hasMeta,
        };
      });

      console.log(`\n=== AUDIT: ${pg.name.toUpperCase()} ===`);
      if (audit.hOverflow) console.log(`  ⚠ HORIZONTAL OVERFLOW: body ${audit.bodyW}px > vw ${audit.vw}px`);
      if (!audit.hasMeta) console.log(`  ⚠ MISSING viewport meta tag`);
      if (audit.h1Count !== 1) console.log(`  ⚠ H1 count: ${audit.h1Count} (should be 1)`);
      if (audit.emptyHeadings.length) console.log(`  ⚠ Empty headings: ${audit.emptyHeadings.join(', ')}`);
      if (audit.unlabelledInputs.length) console.log(`  ⚠ Unlabelled inputs:`, JSON.stringify(audit.unlabelledInputs));
      if (audit.noAlt.length) console.log(`  ⚠ Images without alt:`, audit.noAlt.join(', '));
      if (audit.tinyText.length) console.log(`  ⚠ Tiny text (<12px):`, JSON.stringify(audit.tinyText));
      if (audit.smallTouchTargets.length) console.log(`  ⚠ Small touch targets (${audit.smallTouchTargets.length}):`, JSON.stringify(audit.smallTouchTargets.slice(0,5)));
      if (res404.length) console.log(`  ⚠ 404s:`, res404.join(', '));
      if (issues.length) console.log(`  ✗ JS ERRORS:`, issues);
      if (!audit.hOverflow && !audit.unlabelledInputs.length && !issues.length) console.log(`  ✓ No critical issues`);

      // Screenshot for visual audit
      await page.screenshot({ path: `test-results/audit-${pg.name}.png`, fullPage: false });
    });
  }
});
