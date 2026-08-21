# Prompt: QA review (pre-merge)

## Context to give Claude
> Run the project's Definition of Done. Read `PROJECT_RULES.md` §7. No build step — open pages directly to verify.

## Prompt template

```
Do a QA review of CHANGE/PAGE against the Definition of Done.

Check and report pass/fail for each:
1. Bilingual: toggle te⇄en — every new/changed string switches; nothing half-translated;
   layout holds in both (Telugu runs longer/taller).
2. Responsive: ~375px and ~1280px (sweep 600/760/860 if grids change). Nav, drawer,
   hero, sticky bars behave; no horizontal scroll.
3. Nav offsets: anchor links land with headings clear of fixed bar(s)
   (scroll-margin-top correct, mobile too).
4. RTL (if Arabic/Urdu touched): correct direction + font (Amiri / Noto Nastaliq Urdu);
   surrounding LTR text unaffected; Urdu line-height not clipping.
5. Logo fallback: break the logo src → inline SVG appears; SVG ids unique on the page.
6. A11y: skip-link works; drawer focus-managed + ESC closes; interactive widgets
   keyboard-operable; :focus-visible shows.
7. Console: no errors on load or on language toggle.
8. Cross-page parity: if the change is cross-cutting, it's applied to ALL relevant pages
   identically.
9. Facts of record unchanged (COMMUNITY_SCHEMES.md).
10. Docs updated if a pattern/decision changed (project-docs + DECISIONS.md).

Summarize failures with file:line and propose fixes.
```

## Quick commands
```bash
start PAGE.html                 # open in browser (Windows)
node scripts/update-rates.mjs   # only if rates logic was touched
git diff --stat                 # scope of change
```
