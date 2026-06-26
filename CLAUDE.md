# CLAUDE.md — Master Index

> Project map and entry point. **Daily work = 3 root files:** this, [PROJECT_RULES.md](PROJECT_RULES.md) (development rules), [LOCALIZATION_RULES.md](LOCALIZATION_RULES.md) (i18n rules). Everything else loads on demand from [project-docs/](project-docs/README.md). Code is the source of truth — if a doc disagrees, fix the doc.

> **Dual-agent repo.** This project is worked on by both **Claude Code** (reads this file) and **Codex** (reads AGENTS.md). Both share the same codebase and the same `TASK.md` handoff baton. **Read `TASK.md` at the start of every session** — it tells you whether a task is in progress, blocked by the other agent, or done.

## What this is

Static multilingual website for **Islamic Front, Mangalagiri** (Muslim community-welfare + political org). Three audiences: community/political (homepage), Islamic tools (Knowledge Center), education (Arabic/Urdu portals + student guidance). Default language **Telugu**, English toggle everywhere.

## Stack

Pure **HTML + CSS + vanilla JS** — no framework, no build, no deps; open an `.html` to run (`start index.html`). Pages still carry substantial inline CSS/JS, but the platform now also uses shared static assets such as `assets/css/if-standard.css`, `assets/css/if-shared.css`, `assets/js/if-*.js`, and the catalog registry `assets/data/site-catalog.js` for cross-page components, search, profile, JSON-LD, audits, and mobile app-shell behavior. Node scripts are maintenance-only (`scripts/update-rates.mjs`, static audit/artifact generators). Static hosting.

## Repo map

```
index.html                     # Homepage (community/political) — i18n System A (data-key + dictionary)
islamic-knowledge.html         # Knowledge Center: Zakat, prayer times, guides — System B (data-te/-en)
student-guidance.html          # Career guidance, 81 cards — System B + CH[]/CB_TE[] arrays
rates.json                     # Gold/silver INR → Zakat calc (auto-updated; never hand-edit)
assets/data/site-catalog.js    # Pages/portals/tools/lessons source of truth for search/profile/SEO/audits
assets/data/student-guidance-index.js # Generated compact authoring index for Student Guidance cards
sitemap.xml / robots.txt       # Generated from the catalog via scripts/generate-site-artifacts.mjs
knowledge-center/learn-arabic/ # portal index + 6 lessons (Amiri, RTL)
knowledge-center/learn-urdu/   # portal index + 6 lessons (Noto Nastaliq Urdu, RTL)
knowledge-center/learn-quran/  # portal index — Reading→Tajweed→Hifz→Tafseer (Amiri, Arabic nav model)
knowledge-center/learn-salah/  # portal index — Foundations→Taharah→Wudu→Ghusl→Prayer Steps→Duas (Amiri, Arabic nav model; salah-steps + prayer guide + common mistakes)
knowledge-center/seerah/       # portal index — Before Prophethood→Revelation→Makkah→Hijrah→Battles→Legacy (Amiri, Arabic nav model; interactive timeline + character cards)
knowledge-center/islamic-history/ # portal index — Rashidun→Empires→Golden Age→Powers→Colonial→Lessons (Amiri, Arabic nav model; timeline + personalities + civilization cards)
knowledge-center/kids-islam/   # portal index — kids 5–15: Beliefs→Manners→Duas→Prophet Stories→Salah/Quran→Leadership (bright kid palette; prophet-story cards + interactive quiz widget)
assets/  scripts/  .github/workflows/update-rates.yml
```
Per-page sections & anchors: [project-docs/PAGES.md](project-docs/PAGES.md).

## Documentation map

**Daily (load always):** CLAUDE.md (map) · [PROJECT_RULES.md](PROJECT_RULES.md) (rules + Definition of Done) · [LOCALIZATION_RULES.md](LOCALIZATION_RULES.md) (the two i18n systems)

**On demand → [project-docs/](project-docs/README.md):** [ARCHITECTURE](project-docs/ARCHITECTURE.md) · [PAGES](project-docs/PAGES.md) · [DESIGN_SYSTEM](project-docs/DESIGN_SYSTEM.md) (colours/fonts/components) · [NAVIGATION](project-docs/NAVIGATION.md) (68px offset math) · [LOCALIZATION](project-docs/LOCALIZATION.md) (full i18n mechanics) · [RTL_SUPPORT](project-docs/RTL_SUPPORT.md) · [MOBILE_FIRST](project-docs/MOBILE_FIRST.md) · [HOMEPAGE](project-docs/HOMEPAGE.md) · [KNOWLEDGE_CENTER](project-docs/KNOWLEDGE_CENTER.md) · [LEARNING_PORTALS](project-docs/LEARNING_PORTALS.md) · [ACCESSIBILITY](project-docs/ACCESSIBILITY.md) · [SEO](project-docs/SEO.md) · [COMMUNITY_SCHEMES](project-docs/COMMUNITY_SCHEMES.md) (facts of record) · [AUTOMATION_RATES](project-docs/AUTOMATION_RATES.md) · [DECISIONS](project-docs/DECISIONS.md) (known issues + active work)

**Task prompts → [docs/prompts/](docs/prompts/README.md):** new page · bilingual content · lessons · design-token change · SEO · QA · card translation.

## Dual-agent handoff protocol (TASK.md)

`TASK.md` at the repo root is the **live task baton** shared with Codex. Follow these rules every session:

| TASK.md status | What to do |
|---|---|
| `IDLE` | Normal — start new work freely |
| `IN_PROGRESS` by claude-code | You were interrupted — resume from `STEPS_REMAINING` |
| `BLOCKED → codex` | Codex is continuing — do NOT touch that task; ask user |
| `BLOCKED → claude-code` | Codex handed off to you — pick up from `STEPS_REMAINING` + `NOTES` |
| `DONE` | Confirm completion to user, then reset status to `IDLE` |

**Before stopping any multi-step task** (token limit, end of session, or handing off): update `TASK.md` with `STATUS: BLOCKED`, fill in `STEPS_DONE`, `STEPS_REMAINING`, `LAST_FILE_CHANGED`, and `NOTES` precise enough for Codex to continue cold.

**After completing a task**: set `STATUS: DONE`, fill `STEPS_DONE`, append a row to the task history table.

---

## Claude Skills

Reusable skills in `.claude/skills/` — invoke with `/skill-name`:

| Skill | Trigger | What it does |
|---|---|---|
| `/catalog-sync` | After adding pages/portals/lessons; before deploy | Audits `site-catalog.js` for missing files, orphaned HTML, count mismatches, field gaps |
| `/design-sync` | Changing any color, nav height, or font site-wide | Propagates token changes across all inline `<style>` blocks; handles Category B nav-height cascades |
| `/portal-audit` | After new portal; after cross-cutting change | Checks all 7 portal index pages across 12 structural dimensions (nav, i18n, a11y, scripts, SEO) |
| `/translate-cards` | Continuing CB_TE[] Telugu translation work | Batches student-guidance card translations with house-style enforcement and index alignment |
| `/lesson-scaffold` | Adding a new lesson to any portal | Generates lesson HTML, updates catalog, updates portal IF_PORTAL.lessons[], wires prev/next |
| `/caveman` | **Always active by default** | Ultra-compressed responses — drops filler/pleasantries, keeps all technical content. Stop: "normal mode". |
| `/stop-slop` | **Always active by default** (for prose) | Strips AI writing tells from shipped prose — site copy, docs, commit/PR bodies, reports. No adverbs, no em-dashes, no "not X but Y", active voice, name the actor. Governs prose; caveman governs chat. Stop: "stop slop off". |
| `/brochure-telugu-pdf` | Creating or rebuilding a Telugu community brochure PDF | Design system, translation standards, build pipeline, coordinate mapping rule, two-layer copyable PDF, testing checklist. Full runbook: `project-docs/BROCHURE_PIPELINE.md` |

Also available: `/new-portal` · `/i18n-check` · `/a11y-audit` · `/deploy` · `/verify` · `/code-review`

## Active work

No active tasks. See [project-docs/DECISIONS.md](project-docs/DECISIONS.md) for completed work and known issues.

---

## Quality Standards (always active — no invocation needed)

These rules apply automatically on every task. Do not wait to be asked.

### Accessibility (WCAG 2.2 AA)
- Every `<img>` must have `alt=""` (empty for decorative) or a descriptive alt text
- Every icon-only button must have `aria-label="..."` and `aria-hidden="true"` on the SVG/icon inside
- Interactive elements (buttons, links) must be ≥ 44×44px touch target
- Never remove focus outlines; if restyling, use `outline` or `box-shadow` replacement
- Use semantic HTML: `<main>`, `<nav>`, `<header>`, `<footer>`, `<h1>`–`<h6>` in order, `<button>` not `<div onclick>`
- Color contrast: text on background must pass AA (4.5:1 normal text, 3:1 large text)
- Add `aria-expanded`, `aria-controls`, `aria-current` on interactive disclosure/nav patterns

### Performance (Core Web Vitals)
- All `<script src>` must have `defer` — never block the parser
- Inline only above-the-fold critical CSS; load rest via `<link rel="stylesheet">`
- Images: always include `width` + `height` attributes to prevent layout shift (CLS)
- Add `loading="lazy"` to all below-fold images
- Add `fetchpriority="high"` to the hero/LCP image only
- Preconnect to external font origins: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- Never add render-blocking third-party scripts

### SEO & Metadata
- Every page must have: `<title>`, `<meta name="description">`, `<link rel="canonical">`, `og:title`, `og:description`, `og:url`
- `<title>` format: `Page Name | Islamic Front Mangalagiri` — max 60 chars
- Meta description: plain text, 120–155 chars, no markdown
- One `<h1>` per page only; heading hierarchy must be sequential (no skipping h2→h4)
- JSON-LD structured data must match the page's actual content (no stale copy-paste)
- Never duplicate `<title>`, `<meta name="description">`, or `<link rel="canonical">` tags on the same page

### UI & Design
- Mobile-first: design for 375px width first, then expand
- Spacing must be consistent — use the existing CSS custom properties, do not introduce arbitrary `px` values
- Never break the 68px fixed nav — `scroll-margin-top` ≥ 110px on all anchor targets, hero `padding-top` ≥ 110px, sticky sub-nav `top: 68px`
- RTL support: Arabic/Urdu text must use `dir="rtl"` and Amiri / Noto Nastaliq Urdu fonts
- Do not introduce new color values not in the existing palette — use `var(--gold)`, `var(--green-deep)`, etc.
- Buttons must have a visible hover + focus state

### Debugging — find root cause first
- Never patch a symptom without identifying the root cause
- Read the full error message and stack trace before proposing a fix
- Reproduce the issue consistently before touching code
- One fix at a time — verify it works before the next change

### Verification before claiming done
- Run the relevant check (open in browser, grep, node script) before saying "done" or "fixed"
- Evidence before assertions: state what you ran and what the output was
- Never claim tests pass, styles look correct, or a bug is fixed without a fresh verification in the same response

### Communication — always concise
- Respond in the fewest words that fully answer the question
- No preamble ("Great question!", "Sure!", "I'll now...") — start with the answer
- No trailing summaries of what you just did — the diff speaks for itself
- Use a table or bullet list instead of paragraphs when listing multiple items
- If explaining a change, one sentence max per change — not a paragraph
- Never repeat information already stated earlier in the same response

### Token efficiency (agent self-discipline)
- Read only the files needed for the task — do not load all HTML files when only one is being changed
- Use `grep` / `glob` to locate the exact lines before reading entire files
- When continuing a multi-step task, read `TASK.md` + the `LAST_FILE_CHANGED` only — not the whole repo
- Prefer `Edit` (diff) over `Write` (full rewrite) whenever less than 40% of a file changes
