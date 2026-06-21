# ARCHITECTURE.md

> High-level architecture and data flow. Orientation: [../CLAUDE.md](../CLAUDE.md).

---

## 1. Architectural style

A **static multi-page application (MPA)** of HTML documents. There is no server, no API of our own, and no build pipeline. Pages still ship page-local CSS/JS, but the site now also has a shared static layer (`assets/css/if-standard.css`, `assets/css/if-shared.css`, and `assets/js/if-*.js`) for common components, mobile shell behavior, search, profile, quizzes, lessons, and engagement.

```
Browser ──loads──▶ one .html (inline CSS + JS + shared static assets)
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

## 4. The duplication trade-off

Because older pages began as self-contained files, some page-local duplication remains:
- page-specific hero, section, and card styles,
- page-specific localization plumbing ([../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md)),
- bespoke homepage/KC/Student Guidance interactions.

Shared behavior should now live in the shared static layer when practical:
- design-system hardening and mobile polish in `assets/css/if-standard.css`,
- reusable base styles in `assets/css/if-shared.css`,
- search, profile, app shell, quizzes, lessons, media, diagrams, and engagement in `assets/js/if-*.js`.

> When a task is "change X across the site", first check whether the shared layer can own it; if not, budget for page-local follow-up edits and verify cross-page parity.

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
