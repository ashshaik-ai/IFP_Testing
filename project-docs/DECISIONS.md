# DECISIONS.md — Implementation Notes & Known Decisions

> Lightweight ADR-style log of *why* the project is the way it is, plus active work and known issues. Read this to avoid re-litigating settled choices or re-discovering known quirks. Orientation: [../AGENTS.md](../AGENTS.md) or [../CLAUDE.md](../CLAUDE.md).

---

## Architectural decisions

### D1 — Pure static HTML/CSS/JS, no build tools
**Decision:** No framework, bundler, or dependencies; each page self-contained.
**Why:** Deployable on any static host; a community maintainer can edit one file; nothing to break server-side; resilient (works without APIs).
**Cost / consequence:** Heavy **duplication** — design tokens, nav, drawer, i18n, and polish are copied into every page. Cross-cutting changes are N-file edits. Accepted deliberately. See [ARCHITECTURE.md](ARCHITECTURE.md) §4.

### D2 — Two localization systems
**Decision:** Homepage uses a dictionary + `data-key` (System A); all other pages use inline `data-te`/`data-en` (System B).
**Why:** The homepage has many long, HTML-rich strings better managed in one `T` object; later pages favoured inline attributes for locality (translation lives next to markup).
**Consequence:** You must know which system a page uses before editing. Unifying them is **not** currently planned (risk/effort). See [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md).

### D3 — Per-element RTL, page stays LTR
**Decision:** Arabic/Urdu wrapped in `lang`+`dir`+font spans; never flip the whole page.
**Why:** The UI (Telugu/English) and layout stay stable while authentic script renders correctly; mixed-script teaching tables need LTR structure with RTL cells.
See [RTL_SUPPORT.md](RTL_SUPPORT.md).

### D4 — 68px nav standard
**Decision:** All fixed navs are exactly 68px; dependent offsets derived from it.
**Why:** Consistency across pages; earlier pages drifted (56/62px) causing anchor mis-landing. Standardised to 68px and all `scroll-margin-top`/hero padding/sticky `top` recomputed.
**Consequence:** Nav height changes cascade — see [NAVIGATION.md](NAVIGATION.md) §5.

### D5 — Logo SVG fallback everywhere
**Decision:** Every logo `<img>` has an `onerror` that reveals an inline SVG with a page-unique ID.
**Why:** Brand must never disappear if an asset 404s; assets have messy names (`*.png.png`).
See [NAVIGATION.md](NAVIGATION.md) §6.

### D6 — Browser-computed prayer times (Karachi method)
**Decision:** Compute the five timings client-side from Mangalagiri coordinates (Karachi method, Fajr/Isha 18°) rather than calling an API.
**Why:** No API keys/uptime dependency; works without a backend. Explicit on-page disclaimer that the **local masjid is authoritative**.
See [KNOWLEDGE_CENTER.md](KNOWLEDGE_CENTER.md) §3.

### D7 — Rates via daily GitHub Action, fail-safe
**Decision:** `update-rates.mjs` scrapes GoodReturns daily; commits `rates.json` only on change; never overwrites on parse failure.
**Why:** Keep the Zakat calculator current without a server; protect against bad scrapes.
See [AUTOMATION_RATES.md](AUTOMATION_RATES.md).

---

## Active work

### A1 — Telugu localization of student-guidance card bodies (IN PROGRESS)
**Context:** In `student-guidance.html`, the 81 expandable card **headers** are translated via the `CH[]` array, but the card **bodies** (`.gx-body-in`: field rows, pros/cons, myths, scholarship details) are still English-only when switched to Telugu.
**Plan:**
1. Add `CB_TE[0..80]` — one Telugu HTML string per card body, indexed by DOM order.
2. In `applyLang()`, after the header swap: on first run save the English body to `data-en-body`, then set `innerHTML` to `CB_TE[i]` for `te` or restore from `data-en-body` for `en`.
**Constraints:** preserve exact body HTML structure (`.gx-field`/`.gx-pc`/`.gx-myth`, `.lvl` pills); keep proper nouns/exam names/₹ in Latin; keep array indices aligned with DOM order. See [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) §4.
**Status:** specified and approved; implementation pending.

---

## Known issues / tech debt

| ID | Issue | Notes |
|---|---|---|
| K1 | **Two i18n systems** | Divergent; intentional but a maintenance tax (D2). |
| K2 | **CSS/JS duplication** | No shared assets; cross-cutting edits are N-file (D1). |
| K3 | **Portal `<html lang="en">` quirk** | Portals render English-first despite `te` default; keep both `data-te`/`data-en`; don't flip `lang` without converting visible defaults. [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) §6. |
| K4 | **Inconsistent SEO meta** | No canonical/JSON-LD; some pages lack OG/Twitter. Plan in [SEO.md](SEO.md). |
| K5 | **Asset double extensions** | `logo.png.png`, `logo_2.jpg.jpg`, `logo-emblem.png.png` coexist with clean names; verify `src` before referencing/renaming. [../PROJECT_RULES.md](../PROJECT_RULES.md) §6. |
| K6 | **No `prefers-reduced-motion`** | Reveal/counter animations always run. [ACCESSIBILITY.md](ACCESSIBILITY.md) §2. |
| K7 | **No sitemap/robots.txt** | Consider adding for the 18 pages. [SEO.md](SEO.md) §5. |
| K8 | **Telugu heading height** | Telugu glyphs are tall; `:lang(te)` line-height overrides exist — preserve them. |

---

## Conventions settled (don't re-decide)

- Storage key `localStorage['if-lang']`, default `te`. (Renaming breaks cross-page persistence.)
- Brand palette + fonts as in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- External links: `rel="noopener"`/`noreferrer`.
- Scripts at end of `<body>`, IIFE, `'use strict'`, `try/catch` around `localStorage`.
- Facts of record immutable ([COMMUNITY_SCHEMES.md](COMMUNITY_SCHEMES.md)).

---

## How to log a new decision
Append an entry under the right section: ID, **Decision**, **Why**, **Consequence**, and a link to the affected doc. Keep it short. If it changes a pattern, also update the relevant `project-docs` file and, if user-facing rules change, [../PROJECT_RULES.md](../PROJECT_RULES.md).
