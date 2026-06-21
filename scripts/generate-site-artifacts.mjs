import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogCode = fs.readFileSync(path.join(ROOT, 'assets/data/site-catalog.js'), 'utf8');
const sandbox = { window: {}, module: { exports: {} } };
vm.runInNewContext(catalogCode, sandbox, { filename: 'site-catalog.js' });

const catalog = sandbox.window.IF_SITE_CATALOG || sandbox.module.exports;
const records = catalog.all()
  .filter((item) => item.url && !item.url.includes('#'))
  .filter((item, index, arr) => arr.findIndex((other) => other.url === item.url) === index)
  .sort((a, b) => (a.order || 999) - (b.order || 999) || a.url.localeCompare(b.url));

const now = new Date().toISOString().slice(0, 10);
const urls = records.map((item) => {
  const priority = item.kind === 'page' ? '0.90' : item.kind === 'portal' ? '0.80' : '0.65';
  return [
    '  <url>',
    `    <loc>${escapeXml(catalog.abs(item.url))}</loc>`,
    `    <lastmod>${now}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].join('\n');
}).join('\n');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  '</urlset>',
  ''
].join('\n'));

fs.writeFileSync(path.join(ROOT, 'robots.txt'), [
  'User-agent: *',
  'Allow: /',
  `Sitemap: ${catalog.abs('sitemap.xml')}`,
  ''
].join('\n'));

console.log(`Generated sitemap.xml and robots.txt from ${records.length} catalog records.`);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
