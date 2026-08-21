// Fetches the latest India gold (24K) & silver per-gram rates from GoodReturns
// and writes them to ../rates.json. Run daily by .github/workflows/update-rates.yml.
//
// GoodReturns is the single source of truth. It blocks bot-like requests, so we
// send a normal browser User-Agent. If parsing fails for any reason, the existing
// rates.json is left untouched (we never overwrite good data with garbage).
//
// No external dependencies — uses Node 18+ built-in fetch.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'rates.json');

const GOLD_URL = 'https://www.goodreturns.in/gold-rates/';
const SILVER_URL = 'https://www.goodreturns.in/silver-rates/';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9'
};

async function getHtml(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

function num(str) { return parseInt(String(str).replace(/[, ]/g, ''), 10); }

// "₹15,611 per gram for 24 karat gold" — ₹ is encoded as &#8377; in the page.
function parseGold(html) {
  const m = html.match(/(?:&#8377;|₹)\s*([\d,]+)\s*<\/strong>\s*per gram for 24\s*karat/i)
        || html.match(/(?:&#8377;|₹)\s*([\d,]+)[^<]*per gram for 24\s*karat/i);
  return m ? num(m[1]) : NaN;
}

// "₹280 per gram and ₹2,80,000 per kilogram"
function parseSilver(html) {
  const m = html.match(/(?:&#8377;|₹)\s*([\d,]+)\s*<\/strong>\s*per gram\s+and/i)
        || html.match(/(?:&#8377;|₹)\s*([\d,]+)[^<]*per gram\s+and/i);
  return m ? num(m[1]) : NaN;
}

function istDateLabel(d) {
  const ist = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const dd = String(ist.getDate()).padStart(2, '0');
  const mon = ist.toLocaleString('en-US', { month: 'short' });
  return `${dd} ${mon} ${ist.getFullYear()}`;
}

function readExisting() {
  try { return JSON.parse(readFileSync(OUT, 'utf8')); } catch { return null; }
}

(async () => {
  const existing = readExisting();
  try {
    const [goldHtml, silverHtml] = await Promise.all([getHtml(GOLD_URL), getHtml(SILVER_URL)]);
    const goldGramInr = parseGold(goldHtml);
    const silverGramInr = parseSilver(silverHtml);

    // Sanity bounds so a layout change on GoodReturns can't push absurd values live.
    const goldOk = Number.isFinite(goldGramInr) && goldGramInr >= 1000 && goldGramInr <= 100000;
    const silverOk = Number.isFinite(silverGramInr) && silverGramInr >= 10 && silverGramInr <= 20000;
    if (!goldOk || !silverOk) {
      throw new Error(`Parsed values out of range: gold=${goldGramInr}, silver=${silverGramInr}`);
    }

    const now = new Date();
    const out = {
      goldGramInr,
      silverGramInr,
      date: istDateLabel(now),
      source: GOLD_URL,
      updated: now.toISOString()
    };
    writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
    console.log('Updated rates.json:', out);
  } catch (err) {
    console.error('Rate update failed — keeping existing rates.json.');
    console.error(String(err && err.message || err));
    if (!existing) process.exit(1); // nothing to fall back to
    // else: leave the last-good file in place and succeed quietly
  }
})();
