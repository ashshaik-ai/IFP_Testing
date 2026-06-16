// @ts-check
// Temporary introspection script — run once to discover real selectors, then delete.
const { test } = require('@playwright/test');

test('introspect homepage selectors', async ({ page }) => {
  const errors404 = [];
  page.on('response', r => { if (r.status() === 404) errors404.push(r.url()); });

  await page.goto('./');
  await page.waitForLoadState('networkidle');

  const info = await page.evaluate(() => {
    const pickAll = (sel) => Array.from(document.querySelectorAll(sel)).slice(0, 6).map(el => ({
      tag: el.tagName, class: el.className, id: el.id,
      text: el.textContent.trim().slice(0, 60),
      attrs: el.getAttributeNames().map(a => `${a}=${el.getAttribute(a)}`).join(', ')
    }));

    // dump first 20 classes present in DOM for discovery
    const allClasses = new Set();
    document.querySelectorAll('*').forEach(el => el.classList.forEach(c => allClasses.add(c)));
    const classList = [...allClasses].slice(0, 80).join(' ');

    return {
      hubTabs: pickAll('.hub-tab, [data-tab], .hub-tabs button, .hub-tabs a'),
      hubTabsContainer: (() => { const el = document.querySelector('.hub-tabs'); return el ? { class: el.className, children: el.children.length } : null; })(),
      langButtons: pickAll('button, a[href="#"]').filter(e => /^en$/i.test(e.text.trim()) || /english/i.test(e.text) || /భాష/i.test(e.text)).slice(0, 4),
      achievementsGrid: (() => { const el = document.querySelector('.achievements-grid'); return el ? { class: el.className, overflow: getComputedStyle(el).overflowX, display: getComputedStyle(el).display } : 'NOT FOUND'; })(),
      storiesGrid: (() => { const el = document.querySelector('.stories-grid'); return el ? { class: el.className } : 'NOT FOUND'; })(),
      galleryGrid: (() => { const el = document.querySelector('.gallery-grid'); return el ? { class: el.className } : 'NOT FOUND'; })(),
      carouselWrap: (() => { const el = document.querySelector('.carousel-wrap'); return el ? 'FOUND' : 'NOT FOUND'; })(),
      classList: classList,
    };
  });

  console.log('HOMEPAGE SELECTORS:', JSON.stringify(info, null, 2));
  console.log('404s on homepage:', errors404);
});

test('introspect student-guidance selectors', async ({ page }) => {
  const errors404 = [];
  page.on('response', r => { if (r.status() === 404) errors404.push(r.url()); });

  await page.goto('./student-guidance.html');
  await page.waitForLoadState('networkidle');

  console.log('404s on student-guidance:', errors404);

  const info = await page.evaluate(() => {
    const pickAll = (sel) => Array.from(document.querySelectorAll(sel)).slice(0, 8).map(el => ({
      tag: el.tagName, class: el.className, id: el.id,
      text: el.textContent.trim().slice(0, 60),
      attrs: el.getAttributeNames().map(a => `${a}=${el.getAttribute(a)}`).join(', ')
    }));

    const allClasses = new Set();
    document.querySelectorAll('*').forEach(el => el.classList.forEach(c => allClasses.add(c)));

    return {
      streamPills: pickAll('[data-stream-id], .sg-stream-pill, .stream-pill'),
      streamPrompt: pickAll('#sgStreamPrompt, .sg-stream-prompt'),
      searchInput: pickAll('input'),
      sections: pickAll('.sg-sec, #mpc, #bipc, #commerce, #arts'),
      mpcSection: (() => { const el = document.querySelector('#mpc'); return el ? { class: el.className, hidden: el.classList.contains('sg-hide'), visible: el.offsetParent !== null } : null; })(),
      classList: [...allClasses].slice(0, 80).join(' '),
    };
  });

  console.log('STUDENT-GUIDANCE SELECTORS:', JSON.stringify(info, null, 2));
});
