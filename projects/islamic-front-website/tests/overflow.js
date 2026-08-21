'use strict';
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
async function chk(f) {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const p = await b.newPage(); await p.emulateMediaType('print');
  await p.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.resolve(__dirname, f).replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const r = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => ({ pg: i + 1, sh: pg.scrollHeight })));
  const bad = r.filter(x => x.sh > 1124);
  console.log(path.basename(f), bad.length ? 'OVERFLOW: ' + JSON.stringify(bad) : 'all pages OK (<=1123px)');
  await b.close();
}
(async () => { await chk('../sir-brochure-ap-2026.html'); await chk('../sir-summary-ap-2026.html'); })()
  .catch(e => { console.error(e.message); process.exit(1); });
