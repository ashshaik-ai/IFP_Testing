# ARCHITECTURE.md

> High-level architecture and data flow. Orientation: [../CLAUDE.md](../CLAUDE.md).

---

## 1. Architectural style

A **static multi-page application (MPA)** of independent, self-contained HTML documents. There is no server, no API of our own, no build pipeline, and no shared asset bundle. Each `.html` file ships its own CSS (`<style>`) and JS (`<script>`).

```
Browser ──loads──▶ one .html (inline CSS + JS)
                     │
                     ├─ Google Fonts (CDN, preconnected)
                     ├─ localStorage['if-lang']  (language persistence)
                     ├─ rates.json               (fetched by Zakat calculator)
                     └─ in-browser computation    (prayer times, countdown, zakat)
```

The only "backend" is a scheduled **GitHub Action** that refreshes `rates.json` from an external rates site and commits it back. Everything a user sees is computed client-side.

---

## 2. Why this shape

- **Zero-dependency hosting** — deployable on any static host (GitHub Pages and similar). No runtime to maintain, nothing to break server-side.
- **Resilience** — no API keys, no databases; prayer times and zakat work offline-ish (rates fall back to the committed `rates.json`).
- **Authoring simplicity** — a community maintainer can edit one HTML file. The cost of this choice is **duplication** (see §4).

---

## 3. Page categories

| Category | Files | i18n system | Purpose |
|---|---|---|---|
| Homepage | `index.html` | A (dictionary/`data-key`) | Community/political landing |
| Knowledge Center | `islamic-knowledge.html` | B (`data-te`/`data-en`) | Islamic tools & guides |
| Student Guidance | `student-guidance.html` | B + `CH[]`/`CB_TE[]` arrays | Career guidance |
| Arabic portal | `knowledge-center/learn-arabic/*` | B | Arabic learning |
| Urdu portal | `knowledge-center/learn-urdu/*` | B | Urdu learning |

Details: [PAGES.md](PAGES.md).

---

## 4. The duplication trade-off (most important architectural fact)

Because there is no shared CSS/JS, the following are **copied into every page** and must be kept consistent by hand:
- the `:root` design tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)),
- the nav + mobile drawer markup, styles, and behaviour ([NAVIGATION.md](NAVIGATION.md)),
- the localization plumbing ([../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md)),
- the polish layer (scrollbar, focus, skip-link, reveal animations).

> When a task is "change X across the site", it is by definition an **N-file edit**. Budget for that and verify cross-page parity ([../PROJECT_RULES.md](../PROJECT_RULES.md) §7).

---

## 5. Client-side modules (per page, vanilla JS)

| Module | Lives in | Responsibility |
|---|---|---|
| Language engine | all pages | read/persist `if-lang`, swap strings (System A or B) |
| Nav controller | all pages | fixed nav, hamburger, drawer open/close, focus trap |
| Scroll-spy | pages w/ sub-nav | IntersectionObserver → highlight active section |
| Reveal/animation | most pages | IntersectionObserver reveal, counters, ring arcs |
| Prayer-times engine | `islamic-knowledge.html` | astronomical calc (Karachi method) → 5 timings |
| Countdown | `islamic-knowledge.html` | ticking time-until-next-prayer |
| Zakat calculator | `islamic-knowledge.html` | nisab check + 2.5% using `rates.json` |
| Card/accordion + search | `student-guidance.html`, KC | expand/collapse, live filter |

See [KNOWLEDGE_CENTER.md](KNOWLEDGE_CENTER.md) and [LEARNING_PORTALS.md](LEARNING_PORTALS.md).

---

## 6. Data flow: rates → Zakat

```
GoodReturns.in ──(daily GitHub Action: scripts/update-rates.mjs)──▶ rates.json (committed)
rates.json ──(fetch in browser)──▶ Zakat calculator ──▶ nisab + 2.5% result
```
The script never overwrites `rates.json` on a parse failure, so the calculator always has valid numbers. Full pipeline: [AUTOMATION_RATES.md](AUTOMATION_RATES.md).

---

## 7. External dependencies

| Dependency | Where | Failure behaviour |
|---|---|---|
| Google Fonts | all pages | `display=swap` → system fallback fonts |
| `rates.json` | Zakat calc | falls back to last committed values |
| GoodReturns.in | build-time only (Action) | script aborts, keeps old `rates.json` |
| Logo images | all pages | inline SVG fallback via `onerror` |
| Google Maps links | contact section | plain external links |

No third-party JS is loaded at runtime — everything is first-party vanilla JS.

---

## 8. Directory conventions

- Root holds the three top-level pages + automation + `rates.json`.
- `knowledge-center/learn-{arabic,urdu}/` each hold an `index.html` (portal landing) + lesson pages.
- `assets/` holds images and the manifesto PDF (note the `*.png.png`/`*.jpg.jpg` double-extension files — verify exact names; [../PROJECT_RULES.md](../PROJECT_RULES.md) §6).
- `.github/workflows/` holds the rates cron.
- `.claude/` is git-ignored tooling.
