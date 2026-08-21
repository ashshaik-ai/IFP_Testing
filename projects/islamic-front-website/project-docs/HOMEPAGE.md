# HOMEPAGE.md — `index.html`

> The community/political landing page. Uses **localization System A** (dictionary + `data-key`), unlike the rest of the site. Orientation: [../CLAUDE.md](../CLAUDE.md). i18n details: [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) §2.

---

## 1. Purpose

Public face of Islamic Front, Mangalagiri: establishes legitimacy (founder, history), shows the 2023 electoral mandate, lists the manifesto and delivered achievements/welfare schemes, and routes visitors to the Knowledge Center and Student Guidance.

---

## 2. Section map (in document order)

| # | `id` | Class | Content |
|---|---|---|---|
| 1 | `home` | `.hero` | Badge (place), title + gold subtitle, stats, CTAs, logo emblem motif |
| 2 | `victory` | `.victory` | 2023 Anjuman election: 7 of 9 seats; candidate cards (`assets/candidates/`) |
| 3 | `achievements` | `.achievements` | Delivered work, animated counters |
| 4 | `manifesto` | `.manifesto` | 10-point manifesto; animated ring arcs (`.mf-ring-arc`), cards (`.mf-card`) |
| 5 | `scheme` | `.scheme` | Funeral aid scheme (expandable via `toggleScheme`) |
| 6 | `infra` | `.infra` | Infrastructure/development items |
| 7 | `about` | `.about` | Founder **Janab Shaik Akram**, history timeline (`tl1…tl4`) |
| 8 | `contact` | `.contact` | Islamic Front + Anjuman offices, Google Maps links |
| 9 | `knowledge` | `.kc-promo` | Promo for the Islamic Knowledge Center |

Footer: quick links, contact, founded-2011, copyright.

---

## 3. Localization (System A specifics)

- Dictionary object **`const T = { te:{…}, en:{…} }`** near the end of the page (~line 1579+).
- Every translatable element has `data-key="…"`; HTML-valued strings also have `data-html="true"`.
- `applyLang(l)` sets `textContent`/`innerHTML` from `T[l][key]`, updates `<html lang>`, `document.title`, and the language button.
- Default `te`, persisted in `localStorage['if-lang']`, applied on `DOMContentLoaded`.

**Adding/editing copy here means editing the `T` object** (both `te` and `en`) — not inline attributes. This is the key difference from every other page.

---

## 4. Interactive behaviour

| Feature | Implementation |
|---|---|
| Language toggle | `toggleLang()` → `applyLang()` |
| Funeral-aid expander | `toggleScheme(btn)` toggles `.open` + `aria-expanded` |
| Active-section highlight | `IntersectionObserver` over `TRACKED_IDS` → `.nav-active` on matching nav/drawer links |
| Mobile drawer | burger → overlay + drawer, focus moves to first link, ESC/overlay/link closes |
| Reveal on scroll | `.reveal` elements via `IntersectionObserver` (staggered) |
| Manifesto ring arcs | animate when scrolled into view |
| Stat counters | count up from 0 when in view (`formatNum` → `toLocaleString('en-IN')`) |
| Back to top | `.btt`/button appears after `scrollY > 480` |

All vanilla JS in one IIFE; scripts at end of `<body>`.

---

## 5. Content of record (do not alter)

The homepage is the canonical source for these facts. **Never paraphrase or invent** — copy exactly. Full list in [COMMUNITY_SCHEMES.md](COMMUNITY_SCHEMES.md):
- Founded **26-08-2011** by **Janab Shaik Akram**, Director, A.P. State Waqf Board.
- Operates via **Anjuman-e-Himayatul Islam**, Mangalagiri, Guntur District, AP – 522503.
- **July 2023:** won **7 of 9** Anjuman seats.
- 10-point manifesto (incl. free computer training centre, Imam/Muezzin salary increase).

---

## 6. Gotchas

- **Wrong i18n system risk:** don't add `data-te`/`data-en` here — they won't be processed. Use `data-key` + the `T` dictionary.
- **`data-html` matters:** if a string has markup and you forget `data-html="true"`, tags show as literal text.
- **Telugu line-height:** `:lang(te)` overrides exist for tall Telugu headings — keep them.
- **Nav at 68px** with `section[id] { scroll-margin-top: 68px; }` — keep in sync ([NAVIGATION.md](NAVIGATION.md)).

---

## 7. Related docs
- [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [NAVIGATION.md](NAVIGATION.md) · [COMMUNITY_SCHEMES.md](COMMUNITY_SCHEMES.md) · [SEO.md](SEO.md)
