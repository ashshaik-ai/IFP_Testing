# AGENTS.md — Master Index

> Project map and entry point. **Daily work = 3 root files:** this, [PROJECT_RULES.md](PROJECT_RULES.md) (development rules), [LOCALIZATION_RULES.md](LOCALIZATION_RULES.md) (i18n rules). Everything else loads on demand from [project-docs/](project-docs/README.md). Code is the source of truth — if a doc disagrees, fix the doc.

## What this is

Static multilingual website for **Islamic Front, Mangalagiri** (Muslim community-welfare + political org). Three audiences: community/political (homepage), Islamic tools (Knowledge Center), education (Arabic/Urdu portals + student guidance). Default language **Telugu**, English toggle everywhere.

## Stack

Pure **HTML + CSS + vanilla JS** — no framework, no build, no deps; open an `.html` to run (`start index.html`). Pages still carry substantial inline CSS/JS, but the platform now also uses shared static assets such as `assets/css/if-standard.css`, `assets/css/if-shared.css`, and `assets/js/if-*.js` for cross-page components, search, profile, and mobile app-shell behavior. Only Node piece: `scripts/update-rates.mjs` (run by a GitHub Action). Static hosting.

## Repo map

```
index.html                     # Homepage (community/political) — i18n System A (data-key + dictionary)
islamic-knowledge.html         # Knowledge Center: Zakat, prayer times, guides — System B (data-te/-en)
student-guidance.html          # Career guidance, 81 cards — System B + CH[]/CB_TE[] arrays
rates.json                     # Gold/silver INR → Zakat calc (auto-updated; never hand-edit)
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

1. Read this file, [PROJECT_RULES.md](PROJECT_RULES.md), and [LOCALIZATION_RULES.md](LOCALIZATION_RULES.md) before editing.
2. Load only the task-relevant deep docs from [project-docs/](project-docs/README.md).
3. Check the page's localization system before changing text: `index.html` uses System A; all other pages use System B unless documented otherwise.
4. For cross-cutting UI, nav, i18n, SEO, or design changes, apply the same pattern to every affected self-contained page.
5. Verify at least Telugu/English toggle, mobile/desktop layout, console errors, and nav offsets on changed pages.
6. Do not commit or push unless explicitly asked.

## Active work

Telugu translation of the 81 `student-guidance.html` card bodies (`CB_TE[]`) — see [project-docs/DECISIONS.md](project-docs/DECISIONS.md) A1.
