import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = path.join(ROOT, 'project-docs/audits/LATEST_STATIC_AUDIT.md');
const OUT_JSON = path.join(ROOT, 'project-docs/audits/LATEST_STATIC_AUDIT.json');
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'playwright-report', 'test-results', '.agents']);

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}
function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}
function urlFile(url) {
  const clean = url.split('#')[0];
  if (!clean) return '';
  if (clean.endsWith('/')) return `${clean}index.html`;
  return clean;
}
function loadCatalog() {
  const code = read('assets/data/site-catalog.js');
  const sandbox = { window: {}, module: { exports: null } };
  sandbox.window.window = sandbox.window;
  vm.runInNewContext(code, sandbox, { filename: 'site-catalog.js' });
  return sandbox.window.IF_SITE_CATALOG || sandbox.module.exports;
}
function heading(level, text) {
  return `${'#'.repeat(level)} ${text}\n`;
}
function htmlTags(text) {
  const tags = [];
  let start = -1;
  let quote = '';
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (start < 0) {
      if (ch === '<') start = i;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '>') {
      tags.push(text.slice(start, i + 1));
      start = -1;
    }
  }
  return tags;
}

const catalog = loadCatalog();
const htmlFiles = walk(ROOT).filter(f => /\.html$/i.test(f) && !rel(f).startsWith('project-docs/audits/'));
const trackedSource = walk(ROOT).filter(f => /\.(html|js|css|md)$/i.test(f) && !rel(f).startsWith('project-docs/audits/'));
const issues = [];

function add(severity, check, file, detail) {
  issues.push({ severity, check, file, detail });
}

for (const file of trackedSource) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/\?\?\?\?|�|Prophet \?/);
  if (m) add('high', 'corrupted-text', rel(file), `Found "${m[0]}"`);
}

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const ids = new Map();
  for (const m of text.matchAll(/(?:^|[\s<])id=["']([^"']+)["']/g)) ids.set(m[1], (ids.get(m[1]) || 0) + 1);
  for (const [id, count] of ids) if (count > 1) add('high', 'duplicate-id', rel(file), `${id} appears ${count} times`);

  for (const tag of htmlTags(text)) {
    if (/\sdata-te=/.test(tag) && !/\sdata-en=/.test(tag)) add('medium', 'i18n-missing-en', rel(file), tag.slice(0, 120));
    if (/\sdata-en=/.test(tag) && !/\sdata-te=/.test(tag) && !/\sdata-key=/.test(tag)) add('medium', 'i18n-missing-te', rel(file), tag.slice(0, 120));
  }

  if (!/<link\s+rel=["']manifest["']/.test(text)) add('low', 'pwa-manifest-missing', rel(file), 'No manifest link');
  if (!/<meta\s+property=["']og:title["']/.test(text)) add('low', 'og-title-missing', rel(file), 'No og:title');
  if (!/<script[^>]+application\/ld\+json|if-jsonld\.js/.test(text)) add('low', 'jsonld-missing', rel(file), 'No static or shared JSON-LD');
}

const catalogUrls = catalog.all().map(x => x.url).filter(Boolean);
for (const url of catalogUrls) {
  const clean = urlFile(url);
  if (!clean) continue;
  const full = path.join(ROOT, clean);
  if (!fs.existsSync(full)) add('high', 'catalog-url-missing', clean, `Catalog URL missing for ${url}`);
  if (url.includes('#')) {
    const id = url.split('#')[1];
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      const html = fs.readFileSync(full, 'utf8');
      // Inline portals (if-lesson.js) inject lesson anchors dynamically at runtime;
      // skip static anchor check for those entries to avoid false positives.
      const isDynLesson = id.startsWith('lesson-') && html.includes('if-lesson.js');
      if (!isDynLesson && !new RegExp(`\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(html)) {
        add('high', 'catalog-anchor-missing', clean, `Missing #${id}`);
      }
    }
  }
}

const catalogSet = new Set(catalogUrls.map(urlFile));
for (const file of htmlFiles) {
  const r = rel(file);
  if (r === 'project-docs/audits/Islamic Front Design Audit.html') continue;
  if (!catalogSet.has(r) && !/project-docs\//.test(r)) add('medium', 'html-not-in-catalog', r, 'HTML page is not represented in site catalog');
}

// JS syntax validation: try executing each data file in a sandbox; catch parse errors early.
const JS_DATA_FILES = [
  'assets/data/site-catalog.js',
  'assets/data/student-guidance-index.js',
  'assets/data/quran-lessons.js',
  'assets/data/salah-lessons.js',
  'assets/data/seerah-lessons.js',
  'assets/data/history-lessons.js',
  'assets/data/kids-lessons.js',
  'assets/data/arabic-lessons.js',
  'assets/data/urdu-lessons.js',
  'assets/data/visuals-data.js',
  'assets/data/diagrams-data.js',
  'assets/data/sublesson-data.js',
];
for (const f of JS_DATA_FILES) {
  if (!fs.existsSync(path.join(ROOT, f))) continue;
  try {
    const code = read(f);
    const sb = { window: {}, location: { pathname: '/' }, document: { readyState: 'complete' } };
    sb.window.window = sb.window;
    vm.runInNewContext(code, sb, { filename: f, timeout: 5000 });
  } catch (e) {
    add('high', 'js-syntax-error', f, String(e.message || e).slice(0, 200));
  }
}

const sw = read('sw.js');
const SW_CRITICAL = [
  'assets/data/site-catalog.js', 'assets/data/student-guidance-index.js',
  'assets/js/if-search.js', 'assets/js/if-profile.js', 'assets/js/if-share.js',
  'assets/js/if-lesson.js', 'assets/js/if-xp.js',
  'assets/data/quran-lessons.js', 'assets/data/salah-lessons.js',
  'assets/data/seerah-lessons.js', 'assets/data/kids-lessons.js', 'assets/data/history-lessons.js',
];
for (const critical of SW_CRITICAL) {
  if (!sw.includes(critical)) add('medium', 'service-worker-precache-gap', 'sw.js', `${critical} is not precached`);
}

const sgHtml = read('student-guidance.html');
const sgLiveCards = (sgHtml.match(/<div class="gx-card"/g) || []).length;
let sgIndexedCards = 0;
try {
  const sgIndexCode = read('assets/data/student-guidance-index.js');
  const sgSandbox = { window: {}, module: { exports: null } };
  sgSandbox.window.window = sgSandbox.window;
  vm.runInNewContext(sgIndexCode, sgSandbox, { filename: 'student-guidance-index.js' });
  const sgIndex = sgSandbox.window.IF_STUDENT_GUIDANCE_INDEX || sgSandbox.module.exports || {};
  sgIndexedCards = sgIndex.count || 0;
} catch (e) {
  add('medium', 'authoring-index-missing', 'assets/data/student-guidance-index.js', 'Student Guidance index could not be loaded');
}
if (sgLiveCards !== sgIndexedCards) {
  add('medium', 'authoring-index-drift', 'assets/data/student-guidance-index.js', `Indexed ${sgIndexedCards}, live page has ${sgLiveCards}`);
}

const counts = issues.reduce((a, x) => (a[x.severity] = (a[x.severity] || 0) + 1, a), {});
const now = new Date().toISOString();
let md = heading(1, 'LATEST_STATIC_AUDIT.md');
md += `Generated: ${now}\n\n`;
md += `Catalog records: ${catalog.all().length} - Student Guidance indexed cards: ${sgIndexedCards} - HTML pages scanned: ${htmlFiles.length} - Issues: ${issues.length}\n\n`;
md += `Severity counts: high ${counts.high || 0} - medium ${counts.medium || 0} - low ${counts.low || 0}\n\n`;
md += heading(2, 'Findings');
if (!issues.length) {
  md += '- No issues found by static guardrails.\n';
} else {
  for (const issue of issues) md += `- **${issue.severity}** - ${issue.check} - \`${issue.file}\` - ${issue.detail}\n`;
}
md += '\n## Agent Notes\n';
md += '- Start future audit/fix work from this report before scanning large HTML files.\n';
md += '- The catalog is `assets/data/site-catalog.js`; update it when adding pages, portals, tools, lessons, aliases, or share metadata.\n';
md += '- The Student Guidance authoring index is `assets/data/student-guidance-index.js`; regenerate it with `node scripts/extract-student-guidance-index.mjs` after card edits.\n';
md += '- This report is static-only; run Playwright for rendered mobile overflow and language-toggle checks.\n';

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.writeFileSync(OUT_MD, md, 'utf8');
fs.writeFileSync(OUT_JSON, JSON.stringify({ generated: now, counts, catalogRecords: catalog.all().length, studentGuidanceCards: sgIndexedCards, issues }, null, 2), 'utf8');
console.log(`Wrote ${rel(OUT_MD)} and ${rel(OUT_JSON)} with ${issues.length} issue(s).`);
if ((counts.high || 0) > 0) process.exitCode = 1;
