# Prompt: Add a new page

## Context to give Claude
> This is a pure static HTML/CSS/JS site with **no build step and no shared CSS/JS** — every page is self-contained. Read `CLAUDE.md`, `LOCALIZATION_RULES.md`, `project-docs/DESIGN_SYSTEM.md`, and `project-docs/NAVIGATION.md` first.

## Prompt template

```
Create a new page `PATH/NAME.html` for the Islamic Front site.

Requirements:
- Clone the closest existing page (PICK ONE: index.html / islamic-knowledge.html /
  a portal lesson) as the structural template.
- Reuse the standard :root design tokens, the polish layer (custom scrollbar,
  ::selection, :focus-visible, .skip-link), the 68px fixed nav, and the mobile drawer.
- Localization: use System B (inline data-te / data-en) on EVERY user-visible string
  — both languages from the start. (Only index.html uses System A / data-key.)
- Default language Telugu; persist via localStorage['if-lang']; toggle button in nav.
- Rename ALL page-unique IDs: the logo SVG-fallback id, section ids, data-spy targets.
- Load only the fonts this page needs (add Amiri/Noto Nastaliq Urdu only if it shows
  Arabic/Urdu script).
- Set nav at 68px and compute hero padding-top + scroll-margin-top per NAVIGATION.md §5.
- Add the standard SEO <head> block (see project-docs/SEO.md), unique title/description.
- Keep facts of record exact (project-docs/COMMUNITY_SCHEMES.md) — never invent.

Then run the Definition of Done checklist (PROJECT_RULES.md §7) and tell me the results.
```

## Pitfalls to avoid
- Adding `data-te`/`data-en` on the homepage (wrong system) or `data-key` elsewhere.
- Duplicate IDs copied from the template.
- Forgetting mobile offset recomputation.
- Loading both script fonts when only one (or none) is needed.
