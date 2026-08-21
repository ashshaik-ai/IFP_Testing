'use strict';
const puppeteer = require('puppeteer-core');
const path = require('path'); const fs = require('fs');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve(__dirname, '../canva-export'); fs.mkdirSync(OUT, { recursive: true });
const SCALE = 3.125;
const jobs = [
  { file: '../sir-brochure-ap-2026.html', prefix: 'brochure' },
  { file: '../sir-summary-ap-2026.html', prefix: 'summary' },
  { file: '../sir-brochure-ap-2026-en.html', prefix: 'brochure-en' },
];
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  for (const j of jobs) {
    const url = 'file:///' + path.resolve(__dirname, j.file).replace(/\\/g, '/');
    const p = await b.newPage();
    await p.emulateMediaType('print');
    await p.setViewport({ width: 794, height: 1123, deviceScaleFactor: SCALE });
    await p.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
    const pages = await p.$$('.page');
    for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(OUT, `${j.prefix}-p${i + 1}.png`) });
    console.log(j.prefix, pages.length, 'pages @300dpi');
    await p.close();
  }
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
