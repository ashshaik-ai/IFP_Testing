'use strict';
// Extract correct Telugu text + positions from the DOM (perfect Unicode),
// per .page, so we can overlay an accurate invisible text layer on the image PDF.
const puppeteer = require('puppeteer-core');
const path = require('path'); const fs = require('fs');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const file = process.argv[2];
const out = process.argv[3];
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const p = await b.newPage(); await p.emulateMediaType('print');
  await p.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.resolve(__dirname, file).replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const data = await p.evaluate(() => {
    const pages = [...document.querySelectorAll('.page')];
    return pages.map(pg => {
      const pr = pg.getBoundingClientRect();
      const items = [];
      const walker = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT, null);
      let n;
      while ((n = walker.nextNode())) {
        const raw = n.textContent;
        if (!raw || !raw.trim()) continue;
        const re = /\S+/g; let m;
        while ((m = re.exec(raw))) {            // per WORD: correct text, single-line rect
          const range = document.createRange();
          range.setStart(n, m.index);
          range.setEnd(n, m.index + m[0].length);
          const r = range.getBoundingClientRect();
          if (r.width < 0.5 || r.height < 1) continue;
          items.push({ t: m[0], x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height });
        }
      }
      return items;
    });
  });
  fs.writeFileSync(out, JSON.stringify(data));
  console.log('pages:', data.length, 'nodes:', data.reduce((a, x) => a + x.length, 0));
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
