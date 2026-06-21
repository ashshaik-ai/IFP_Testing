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

Also available: `/new-portal` · `/i18n-check` · `/a11y-audit` · `/deploy` · `/verify` · `/code-review`

## Active work

Telugu translation of the 81 `student-guidance.html` card bodies (`CB_TE[]`) — see [project-docs/DECISIONS.md](project-docs/DECISIONS.md) A1.
