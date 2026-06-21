# PROJECT_RULES.md

> Daily rules. Orientation: [AGENTS.md](AGENTS.md) or [CLAUDE.md](CLAUDE.md). Deep rationale lives in [project-docs/DECISIONS.md](project-docs/DECISIONS.md); design detail in [project-docs/DESIGN_SYSTEM.md](project-docs/DESIGN_SYSTEM.md).

---

## 1. Non-negotiables

1. **No build tools / frameworks / deps.** Pure HTML/CSS/JS; must run by opening an `.html`.
2. **Shared static layer exists.** Prefer existing shared assets (`assets/css/if-standard.css`, `assets/css/if-shared.css`, `assets/js/if-*.js`) for cross-cutting behavior, then patch page-local inline code only where the page has bespoke UI.
3. **Telugu is default.** Never ship a page that defaults to English by accident (portals are a known exception — [LOCALIZATION_RULES.md](LOCALIZATION_RULES.md)).
4. **Never hand-edit `rates.json`** — machine-generated ([project-docs/AUTOMATION_RATES.md](project-docs/AUTOMATION_RATES.md)).
5. **Facts of record are immutable** — founder, dates, 7/9 seats, manifesto, addresses. Copy exactly from [project-docs/COMMUNITY_SCHEMES.md](project-docs/COMMUNITY_SCHEMES.md).
6. **UTF-8 always.** Telugu/Arabic/Urdu written literally — don't entity-escape or re-encode.
7. **Religious content is sourced.** Don't alter Quran/Hadith text, transliteration, translation, or citation numbers without a verified reason.

---

## 2. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use existing shared CSS/JS for cross-cutting fixes | Recreate shared behavior separately in each page |
| Add `data-te`+`data-en` (or `data-key`) for new text | Ship English-only or Telugu-only strings |
| Keep nav at 68px and sync all offsets | Change nav height without fixing cascades |
| Use `:root` colour variables | Hardcode brand hex inline |
| Wrap Arabic/Urdu in `lang`+`dir`+font spans | Switch the whole page to `dir="rtl"` |
| Keep the SVG logo fallback + unique IDs | Drop the fallback or duplicate IDs |
| Verify asset filenames before referencing | Blindly trust/rename `*.png.png` files |
| Preserve sourced religious text & citations | Reword Quran/Hadith/prayer content |
| Match surrounding code style | Introduce a new house style |

---

## 3. Conventions (quick)

- **Bilingual from birth:** new user-visible text carries both languages immediately, using the page's existing system (A or B).
- **Page-unique IDs:** SVG-fallback ids, section ids, `data-spy` targets. Rename when cloning a template.
- **Anchored sections need `scroll-margin-top`** = sum of *fixed* bars above ([project-docs/NAVIGATION.md](project-docs/NAVIGATION.md)).
- **Mobile-first CSS**, use `clamp()`, keep the polish layer (scrollbar, `::selection`, `:focus-visible`, `.skip-link`).
- **JS:** vanilla, IIFE + `'use strict'`, event delegation for repeated items, IntersectionObserver for spy/animation, `try/catch` around `localStorage`, scripts at end of `<body>`.
- **External links:** `rel="noopener"`/`noreferrer`.
- **Assets** in `assets/`; always `alt` (empty `alt=""`+`aria-hidden` for decorative). Beware double-extension files (`logo.png.png`).
- **Keep `data-te` before `data-en`** for clean diffs.

---

## 4. Definition of Done (QA checklist)

Verify on every affected page:

- [ ] **Both languages:** toggle te⇄en — every new/changed string switches, nothing half-translated, layout holds in both.
- [ ] **Mobile + desktop:** ~375px and ~1280px; nav, drawer, hero, sticky bars behave; no horizontal scroll.
- [ ] **Nav offsets:** anchors land with headings clear of fixed bar(s), mobile too.
- [ ] **RTL** (if touched): correct direction + font; surrounding LTR unaffected; Urdu line-height not clipping.
- [ ] **Logo fallback:** break `src` → SVG shows; ids unique.
- [ ] **A11y:** skip-link, drawer focus + ESC, keyboard-operable widgets, `:focus-visible`.
- [ ] **No console errors** on load or language toggle.
- [ ] **Cross-page parity:** cross-cutting change applied to **all** relevant pages identically.
- [ ] **Facts of record unchanged.**
- [ ] **Docs updated** if a pattern/decision changed (project-docs + DECISIONS.md).

---

## 5. Git

- Working branch `main`; PRs target `master`. Branch before committing on default.
- Commits: imperative, scoped (`fix:`/`chore:`/`feat:`). Commit/push only when asked.
- Don't commit `.claude/` or temp `_logo_*.py` (git-ignored).

---

## 6. When in doubt

Read the relevant [project-docs/](project-docs/README.md) page, or grab a ready prompt from [docs/prompts/](docs/prompts/README.md). If a task seems to require changing a fact of record or a settled convention, **stop and confirm**.
