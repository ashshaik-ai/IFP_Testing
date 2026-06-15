# AUTOMATION_RATES.md — Gold/Silver Rates Pipeline

> The only server-side/automation piece in the project: a daily job that refreshes `rates.json`, which feeds the Zakat calculator. Orientation: [../CLAUDE.md](../CLAUDE.md). Consumer: [KNOWLEDGE_CENTER.md](KNOWLEDGE_CENTER.md) §5.

---

## 1. What it does

`scripts/update-rates.mjs` fetches the latest **India gold (24K)** and **silver** per-gram prices (INR) from **GoodReturns** and writes them to `rates.json` at the repo root. A GitHub Action runs it daily and commits the file if it changed. The Zakat calculator fetches `rates.json` in the browser to value gold/silver holdings against the nisab.

```
GoodReturns.in ──fetch──▶ update-rates.mjs ──write──▶ rates.json ──commit (Action)──▶ repo
rates.json ──fetch in browser──▶ Zakat calculator
```

---

## 2. `rates.json` shape

```json
{
  "goldGramInr": 15573,
  "silverGramInr": 275,
  "date": "05 Jun 2026",
  "source": "https://www.goodreturns.in/gold-rates/",
  "updated": "2026-06-05T06:49:56.430Z"
}
```

> **Never hand-edit this file.** It is machine-generated; manual values will be overwritten or mislead the calculator.

---

## 3. The script (`scripts/update-rates.mjs`)

- **Runtime:** Node 18+ (uses built-in `fetch`); **zero dependencies**.
- **Sources:** `https://www.goodreturns.in/gold-rates/` and `/silver-rates/`.
- **Bot avoidance:** sends a normal browser `User-Agent` (GoodReturns blocks bot-like requests).
- **Parsing:** regex against the page (e.g. gold: `₹<amount> per gram for 24 karat`, with `₹` sometimes encoded as `&#8377;`).
- **Safety contract:** **if parsing fails, it leaves the existing `rates.json` untouched** — it never overwrites good data with garbage. (Failure path keeps the last known-good file.)
- **Output:** writes `../rates.json` relative to the script.

> GoodReturns is the **single source of truth** for rates. If its HTML changes and the regex breaks, the script no-ops (old rates persist) — you'll see no commits. Fix by updating the regex in `parseGold`/`parseSilver`.

---

## 4. The workflow (`.github/workflows/update-rates.yml`)

- **Triggers:** daily cron `30 2 * * *` (**02:30 UTC = 08:00 IST**, after GoodReturns posts the day's rate) + manual `workflow_dispatch`.
- **Permissions:** `contents: write` (to commit `rates.json`).
- **Concurrency:** group `update-rates`, cancel-in-progress (no overlapping runs).
- **Steps:** checkout → setup Node 20 → `node scripts/update-rates.mjs` → commit `rates.json` **only if it changed**, as user `rates-bot` with message `chore: update gold/silver rates from GoodReturns`.

---

## 5. Running locally

```bash
node scripts/update-rates.mjs      # fetches live rates, rewrites rates.json
git diff -- rates.json             # inspect what changed
```
If you're offline or GoodReturns blocks you, the script will error/parse-fail and `rates.json` stays as-is.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No daily commits | regex no longer matches GoodReturns HTML | update `parseGold`/`parseSilver` regex |
| Action fails | GoodReturns blocked the runner / network | re-run; check `User-Agent`; it self-protects `rates.json` |
| Zakat shows stale prices | rates not updating | check Action runs + `rates.json` `updated` timestamp |
| Wrong currency/format | parsing picked wrong number | verify `num()` strip + the matched group |

---

## 7. Rules

- Don't add npm dependencies to keep the script zero-install.
- Keep the **fail-safe** behaviour (never overwrite on parse failure).
- Keep the source attribution (`source` field + on-page "GoodReturns.in" credit in the Zakat section).
- If the production domain changes, the script and workflow are unaffected (they only touch `rates.json`).

---

## 8. Related docs
- [KNOWLEDGE_CENTER.md](KNOWLEDGE_CENTER.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [../PROJECT_RULES.md](../PROJECT_RULES.md)
