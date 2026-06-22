# AGENTS.md — Master Index (Codex entry point)

> Project map and entry point. **Daily work = 3 root files:** this, [PROJECT_RULES.md](PROJECT_RULES.md) (development rules), [LOCALIZATION_RULES.md](LOCALIZATION_RULES.md) (i18n rules). Everything else loads on demand from [project-docs/](project-docs/README.md). Code is the source of truth — if a doc disagrees, fix the doc.

> **Dual-agent repo.** This project is worked on by both **Codex** (reads this file) and **Claude Code** (reads CLAUDE.md). Both share the same codebase and the same `TASK.md` handoff baton. Read `TASK.md` first every session — it tells you whether a task is in progress, blocked, or done.

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

**Daily (load always):** AGENTS.md (map) · [PROJECT_RULES.md](PROJECT_RULES.md) (rules + Definition of Done) · [LOCALIZATION_RULES.md](LOCALIZATION_RULES.md) (the two i18n systems)

**On demand → [project-docs/](project-docs/README.md):** [ARCHITECTURE](project-docs/ARCHITECTURE.md) · [PAGES](project-docs/PAGES.md) · [DESIGN_SYSTEM](project-docs/DESIGN_SYSTEM.md) (colours/fonts/components) · [NAVIGATION](project-docs/NAVIGATION.md) (68px offset math) · [LOCALIZATION](project-docs/LOCALIZATION.md) (full i18n mechanics) · [RTL_SUPPORT](project-docs/RTL_SUPPORT.md) · [MOBILE_FIRST](project-docs/MOBILE_FIRST.md) · [HOMEPAGE](project-docs/HOMEPAGE.md) · [KNOWLEDGE_CENTER](project-docs/KNOWLEDGE_CENTER.md) · [LEARNING_PORTALS](project-docs/LEARNING_PORTALS.md) · [ACCESSIBILITY](project-docs/ACCESSIBILITY.md) · [SEO](project-docs/SEO.md) · [COMMUNITY_SCHEMES](project-docs/COMMUNITY_SCHEMES.md) (facts of record) · [AUTOMATION_RATES](project-docs/AUTOMATION_RATES.md) · [DECISIONS](project-docs/DECISIONS.md) (known issues + active work)

**Task prompts → [docs/prompts/](docs/prompts/README.md):** new page · bilingual content · lessons · design-token change · SEO · QA · card translation.

## Agent workflow

1. **Read `TASK.md` first.** If STATUS is BLOCKED and direction includes `codex`, pick up that task — do not start anything else. If STATUS is DONE, confirm to the user and reset to IDLE.
2. Read this file, [PROJECT_RULES.md](PROJECT_RULES.md), and [LOCALIZATION_RULES.md](LOCALIZATION_RULES.md) before editing.
3. Load only the task-relevant deep docs from [project-docs/](project-docs/README.md).
4. Check the page's localization system before changing text: `index.html` uses System A; all other pages use System B unless documented otherwise.
5. For cross-cutting UI, nav, i18n, SEO, or design changes, apply the same pattern to every affected self-contained page.
6. Verify at least Telugu/English toggle, mobile/desktop layout, console errors, and nav offsets on changed pages.
7. Do not commit or push unless explicitly asked.
8. **Before stopping on any multi-step task**, update `TASK.md` with STATUS: BLOCKED and fill in STEPS_DONE + STEPS_REMAINING + NOTES so Claude Code can continue.

---

## Codex skill equivalents

Claude Code has a `.claude/skills/` system with invocable skills. Codex cannot call those, but must follow the same logic. When you recognise one of these tasks, apply the equivalent steps below.

### `/catalog-sync` equivalent

**Trigger:** user asks to audit the catalog, or you added a page/portal/lesson.

Steps:
1. Read `assets/data/site-catalog.js`.
2. For every entry in `pages[]`, `portals[]`, `lessons[]`: verify `id`, `url`, `title_en`, `title_te`, `desc_en`, `desc_te`, `tags[]` are all present.
3. For every non-`#` URL in the catalog, confirm the file exists on disk.
4. Glob `knowledge-center/**/*.html` + root `*.html` — flag any file not in the catalog.
5. For each portal, count its lessons in `lessons[]` and compare to `portal.total`.
6. Check `progressKey` uniqueness across all portals (pattern: `if-<id>-progress`).
7. Report: errors (file missing, count mismatch, orphan) then warnings (missing field).

### `/design-sync` equivalent

**Trigger:** user wants to change a color token, nav height, or font site-wide.

Steps:
1. Grep for the old token value across all `*.html` and `assets/css/*.css`.
2. If token is nav `height:68px` — also update `scroll-margin-top`, hero `padding-top`, and sticky `top` in every affected file (Category B cascade: all four values change together).
3. If token is a color (`--gold`, `--green-deep`, etc.) — swap value in every `:root {}` block.
4. If token is a font — update `font-family` declaration AND the Google Fonts `<link href>` URL.
5. Re-grep for the old value to confirm zero stale occurrences.
6. Report: files changed, cascade applied, verification result.

### `/portal-audit` equivalent

**Trigger:** user asks for portal consistency check, or after adding/modifying a portal.

Check every portal index in `knowledge-center/*/index.html` across these dimensions:
- Nav `height:68px` fixed, brand `href="../../"`, `.lang-btn` `min-height:44px`
- `[id]{scroll-margin-top}` ≥ 110px
- `<h1>` has both `data-te` and `data-en`; hero `padding-top` ≥ 110px
- Sticky sub-nav `position:sticky; top:68px`; links have `data-spy` matching section `id` values
- `window.IF_PORTAL = {` present with `key`, `name_en`, `name_te`, `lessons[]`
- Script order: IF_PORTAL config → `if-core.js` → data file → `if-lesson.js` → `if-portal.js`
- Every `data-te` element also has `data-en` (and vice versa)
- `div#ifp-root` and `div#if-lessons` injection anchors present
- `<main>` landmark, one `<h1>`, skip link, `<footer>` present
- Buttons/links `min-height:44px`
- All `<script src>` use relative `../../assets/` paths with `defer`
- `<title>` + `<meta description>` + JSON-LD `@type:LearningResource` + breadcrumb present

### `/translate-cards` equivalent

**Trigger:** user asks to translate student-guidance card bodies, continue CB_TE[] work.

Steps:
1. Read `student-guidance.html` — count non-empty `CB_TE[]` entries (Telugu Unicode U+0C00–U+0C7F present).
2. Report progress: X/81 complete. Next untranslated index: N.
3. Read `assets/data/student-guidance-index.js` for card metadata.
4. For the batch (default 5, or as specified): translate `CB_EN[i]` → `CB_TE[i]`.
5. House style: keep Latin for `B.Tech`, `NEET`, `JEE`, `CA`, `MBBS`, `IIT`, URLs, `₹`, stream codes (`MPC`, `BiPC`). Translate difficulty labels (`Very high` → `చాలా ఎక్కువ`, `High` → `ఎక్కువ`, `Extreme` → `అత్యంత`, `Medium` → `మధ్యస్థం`). Preserve HTML structure (same tags, same `<li>` count).
6. Write each translated body to `CB_TE[i]` — verify index alignment before writing.
7. Never overwrite an already-translated entry; never touch `CB_EN[]` or `CH[]`.
8. Report: cards translated this session, total progress X/81, next index.

### `/lesson-scaffold` equivalent

**Trigger:** user asks to add a new lesson to a portal.

Steps:
1. Confirm: portal id, lesson slug, title_en, title_te, desc_en, desc_te, sections (4–6), position (prev/next).
2. Read the portal's `index.html` to extract current `IF_PORTAL.lessons[]` and script list.
3. Create `knowledge-center/<portal>/<slug>.html` — include: fixed nav, hero with `data-te`+`data-en` on `<h1>`, sticky sub-nav with `data-spy` links, content sections each with an `id`, `div#if-sublesson-root`, prev/next nav, `window.IF_SUBLESSON` config, `if-core.js` + `if-sublesson.js` scripts.
4. All asset paths: `../../assets/` (relative, never absolute). All `<script src>` have `defer`.
5. Append to `assets/data/site-catalog.js` `lessons[]`: `{ id: '<portal>-<slug>', portal: '<portal>', kind: 'lesson', url: 'knowledge-center/<portal>/<slug>.html', title_en, title_te, tags }`.
6. Append to portal `index.html` `IF_PORTAL.lessons[]`: `{ id: '<slug>', en: '<title_en>', te: '<title_te>' }`.
7. Increment `total` on the portal's catalog entry.
8. Run catalog-sync equivalent to verify.

---

## Active work

Telugu translation of the 81 `student-guidance.html` card bodies (`CB_TE[]`) — see [project-docs/DECISIONS.md](project-docs/DECISIONS.md) A1.

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
