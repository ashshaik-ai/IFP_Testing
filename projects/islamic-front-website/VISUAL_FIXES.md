# VISUAL_FIXES.md — Visual Consistency & Layout Standardization
**Date:** 2026-06-13 · Pre-implementation pass. Static analysis of real CSS values across all pages. No code changed yet.
Companion: [UX_FIXES.md](UX_FIXES.md) · [LEARNING_FIXES.md](LEARNING_FIXES.md) · [audit](project-docs/PRODUCT_AUDIT_2026-06.md).

---

## 1. Visual Consistency Report

### What is already consistent (keep / protect)
- **Colour tokens** identical sitewide (green/gold/cream).
- **Secondary hero heading** is standardized: `clamp(32px,5vw,58px)` on arabic/urdu/quran/salah/seerah/history.
- **Section padding** is `80px 5vw` on 6 of 7 portals — a real shared rhythm.
- **Container width family**: the 7 portals share the same max-width set (520/560/580/600/700/768/900/1080/1100/1140/1200) → clearly one template.
- **Fluid type**: every page uses `clamp()` (7–13 instances).

### Inconsistencies found (evidence)
| # | Finding | Evidence | Impact |
|--|--|--|--|
| V-A | **Hero heights not standardized** | Homepage `100vh/100svh`; Quran/Salah hero inner stage `min-height:260–290px`; Seerah `~290/200px`; **Urdu hero `min-height:auto`**; **Arabic, History, Student-Guidance have NO hero min-height** (content-collapses) | Heroes feel grand on some portals, flat/short on others |
| V-B | **Hero script-title scale varies ~80%** | Arabic `clamp(58,8.5vw,124)`, Quran/Salah `(50,7.5vw,108)`, Urdu `(46,7.5vw,104)`, **Seerah `(40,6vw,86)`, History `(40,6vw,88)`**, Kids `(76,17vw,158)` | Seerah/History heroes look ~30% smaller → "less premium" |
| V-C | **Urdu breaks section rhythm** | Urdu uses `padding:80px 20px` + `60px 16px` vs siblings' `80px 5vw` | Misaligned gutters & uneven vertical rhythm vs other portals |
| V-D | **Hub pages much denser than portals** | islamic-knowledge sections `~28px 24px`; student-guidance `~16px 18px` vs portals' `80px 5vw` | Hubs feel cramped/"documentation", portals feel airy → not "same platform" |
| V-E | **Homepage rhythm differs from portals** | Homepage `100px 5vw` vs portals `80px 5vw` | Acceptable (grander) but undocumented drift |
| V-F | **Container width drift** | Primary content max-width appears as 1080 / 1100 / 1140 / 1180 / 1200 across pages | Content blocks don't line up page-to-page |
| V-G | **`--radius` 14 vs 16** | 16px on index/guidance/kids; 14px on portals | Card corners differ subtly between pages |
| V-H | **Two `--shadow` definitions** | `0 6px 28px rgba(13,59,30,.09)` (guidance) vs `0 4px 24px rgba(0,0,0,.10)` (portals); index/KC hardcode | Elevation feels different across pages |
| V-I | **Nav height shrink vs anchor offset** | Canonical 68px, but 60/64px variants exist; `scroll-margin-top:68px` fixed | Anchored sections can sit a few px under the nav at some widths |
| V-J | **Seerah/History least fluid-tuned** | clamp count 7 (vs 12–13 on homepage/urdu) | Fewer responsive type steps → coarser scaling |

### Visual hierarchy / white space / balance
- Portals: good hierarchy (big script hero → standardized subtitle → 80px sections). **Seerah/History under-scaled heroes weaken the top-of-page hierarchy.**
- Hubs (KC, Guidance): hierarchy is flatter and denser; long card lists with tight padding reduce balance and increase clutter.
- White space is generous on portals, tight on hubs → the two halves of the site feel like different products.

---

## 2. Top 50 Visual Improvements (prioritized by impact)

### Tier 1 — Standardize the system (highest impact)
1. **Define one design-token block** (radius, shadow scale, spacing scale, container width) in `if-shared.css :root`; pages override only intentionally.
2. **Standardize portal hero min-height** — e.g. `clamp(360px,52vh,520px)` on all 7 portal heroes (fix Urdu `auto`, Arabic/History no-height).
3. **Normalize hero script-title scale** — bump Seerah/History to ~`clamp(48px,7vw,104px)` to match Quran/Salah/Arabic family (Kids stays oversized by design).
4. **Fix Urdu section padding** to `80px 5vw` to match sibling portals.
5. **Pick one canonical content width** (recommend `1140px`) and apply to all primary containers.
6. **Unify `--radius` to 16px** sitewide.
7. **Unify elevation** into `--shadow-sm/md/lg` and replace ad-hoc shadows.
8. **Raise hub section padding** (KC, Guidance) toward portal rhythm (e.g. `56–72px`) so the site feels like one product.
9. **Document the homepage's grander 100px rhythm** as an intentional exception (or align to 88px).
10. **Align `scroll-margin-top`** to the actual nav height at each breakpoint (68/64/60).

### Tier 2 — Component-level consistency
11. Shared `.if-card` (radius/shadow/padding/hover) to replace per-page card styles.
12. Shared `.if-btn` primary/secondary/ghost variants; standardize CTA padding & height.
13. Standardize card grid `gap` (portals vary) to one value (e.g. 20–24px).
14. Standardize section heading style (size, weight, gold underline/eyebrow) across portals.
15. Standardize "eyebrow/label" chip styling (the `3px 9px` mini-labels differ).
16. Consistent divider/`<hr>` treatment between sections.
17. Standardize hero CTA button placement & size across portals.
18. Standardize breadcrumb visual style (it exists on KC pages — make it identical).
19. Consistent footer spacing/àlignment (lu-footer is shared — verify no per-page overrides).
20. Standardize icon sizes in cards/section headers.

### Tier 3 — Hero & top-of-page polish
21. Add a consistent hero background treatment (gradient/pattern) across portals.
22. Consistent hero overline + title + subtitle + CTA vertical spacing.
23. Ensure RTL script heroes (Arabic/Urdu) have matching baseline/line-height.
24. Add subtle hero entrance animation parity (some portals have it, some flat).
25. Consistent hero stat/triple-badge row styling where used.
26. Standardize the journey/roadmap band styling across portals.
27. Standardize "level card" visual (number badge, title, meta) across portals.
28. Consistent progress-dashboard card styling across the 5 portals that have it.
29. Standardize quiz card visuals (where `if-quiz` is present).
30. Standardize mind-map / timeline visual treatment from the engine across portals.

### Tier 4 — Spacing, alignment & rhythm details
31. Cap lesson/body text to `max-width:64ch` for reading comfort.
32. Standardize paragraph spacing & line-height in lesson bodies.
33. Align card columns to a shared grid (12-col or fixed minmax).
34. Consistent vertical gap between section title and content.
35. Consistent left/right gutters (`5vw`) on hubs (currently fixed px).
36. Remove orphaned one-off max-widths (340/380/980/1180) → snap to scale.
37. Standardize image/figure aspect ratios and rounding.
38. Consistent table styling (Tajweed/Zakat tables) sitewide.
39. Standardize blockquote / Arabic-verse callout styling.
40. Consistent badge/pill radius (full-round vs 20px drift).

### Tier 5 — Sub-lesson visual parity (12 pages)
41. Bring sub-lesson hero/title scale in line with portal type scale.
42. Apply portal section padding (`80px 5vw` responsive) to sub-lessons.
43. Standardize sub-lesson breakpoints (currently 400/500/520/560/680…) to the shared scale.
44. Add the gold eyebrow/section-heading treatment to sub-lessons.
45. Standardize sub-lesson card/example styling to `.if-card`.
46. Consistent prev/next lesson control styling across all 12 sub-lessons.
47. Match RTL line-height/letter-spacing across Arabic vs Urdu sub-lessons.
48. Add consistent figure/diagram framing to sub-lessons.
49. Standardize sub-lesson footer to the shared `lu-footer`.
50. Verify Kids palette (`--cream #fdf8ef`, `--kc1..6`) is applied consistently within Kids only (no leakage).

---

## 3. Visual Quick Wins (<30 min each)
- Fix Urdu section padding `80px 20px → 80px 5vw` (V-C). *(~10 min)*
- Bump Seerah & History hero script-title clamp to match family (V-B). *(~10 min)*
- Add `min-height` to Arabic/History/Urdu portal heroes (V-A). *(~15 min)*
- Unify `--radius` to 16px on the 7 portals (V-G). *(~15 min)*
- Add `max-width:64ch` to lesson body text (item 31). *(~10 min)*
- Snap one-off container widths to 1140 on each page (V-F, partial). *(~20 min/page)*

*Note: most are 1–2 line CSS edits but span multiple self-contained pages (N-file). Batch them in Phase A and re-validate visually at 360/768/1200px.*
