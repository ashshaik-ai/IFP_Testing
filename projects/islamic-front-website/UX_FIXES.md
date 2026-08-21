# UX_FIXES.md — Navigation, Mobile & Interaction Consistency
**Date:** 2026-06-13 · Pre-implementation pass. Evidence-based static review. No code changed yet.
Companion: [VISUAL_FIXES.md](VISUAL_FIXES.md) · [LEARNING_FIXES.md](LEARNING_FIXES.md).

---

## 1. UX Consistency Report

### Navigation — what's consistent
- Fixed glass nav (~68px) sitewide; scroll-spy on major pages; mobile drawer present.
- **Breadcrumbs present on all Knowledge-Center pages** (portal indexes + 12 sub-lessons).
- **Sub-lessons already have back (breadcrumb) + prev/next lesson controls** (correction to earlier audit — this is good).

### Navigation — inconsistencies (evidence)
| # | Finding | Evidence | Impact |
|--|--|--|--|
| N-1 | **No breadcrumbs on the two deepest non-portal pages** | `islamic-knowledge.html` & `student-guidance.html` = bc:0 | User loses "where am I / back to hub" context |
| N-2 | **No global site search** | 0 search UI on any of 22 pages | Poor discoverability across ~50 lessons + tools |
| N-3 | **No persistent cross-portal switcher** | Moving Arabic→Quran→Salah requires going back to a hub | Friction navigating the ecosystem |
| N-4 | **Active-state styling not uniform** | scroll-spy hooks vary (2–6 per page) | Active nav item highlighting inconsistent page-to-page |
| N-5 | **Nav shrink vs anchor offset** | 60/64/68px nav heights, fixed 68px `scroll-margin-top` | Anchor jumps land slightly under nav at some widths |
| N-6 | **Top-3 pages lack shared nav affordances** | index/KC/guidance off `if-core` → no glossary/skip parity | Inconsistent header behaviour |
| N-7 | **CTA labels/placement vary** | hero CTAs differ per portal | Users re-learn the primary action each page |

### Interaction / engagement — inconsistencies (evidence)
| # | Finding | Evidence | Impact |
|--|--|--|--|
| E-1 | **No "Continue learning / resume"** anywhere | continue:0 on every page | No fast path back into a lesson |
| E-2 | **No "Recently visited"** anywhere | recent:0 on every page | No history affordance |
| E-3 | **"Recommended / next lesson" partial** | quran/seerah/kids have it; **arabic/urdu = 0** | Inconsistent guidance to the next step |
| E-4 | **No completion celebration in portals** | confetti/celebrate: only homepage(1); portals 0 | Finishing a lesson feels unrewarded |
| E-5 | **Streaks/achievements uneven** | model portals streak ~20; **arabic/urdu streak:0** | Two portals have no motivation loop |
| E-6 | **Tap targets not systematically ≥44px** | sparse `min-height`; nav links 13px / gap 24px | Small touch targets on mobile [VISUAL-CONFIRM] |

---

## 2. Mobile-First Report (320 / 360 / 390 / 430 / tablet)
- **No media query below ~380px** sitewide (sub-lessons start 400–520px) → **320–360px cramping risk [VISUAL-CONFIRM]**, especially RTL script heroes.
- **Scroll fatigue:** homepage 15 sections; student-guidance 81 cards; long portal pages. No mobile "jump-to" affordance.
- **Reading fatigue:** lesson/sub-lesson bodies are text-dense with no `max-width:64ch` cap.
- **Section density:** hubs (KC/Guidance) pack many sections with tight padding → heavy on mobile.
- **Tap targets:** nav, footer pills, mini-labels likely <44px (E-6).
- **Discoverability:** without search or a sticky in-page index, finding a specific lesson/tool on mobile means long scrolling.
- **Convenience:** no bottom tab bar / thumb-reach nav on portals.

**Recommendations to reduce endless scrolling:**
1. Sticky compact "On this page" chip bar (collapses sections) on homepage, KC, portals.
2. Collapse-by-default accordions for long card lists (Guidance 81 cards; KC sections).
3. Bottom thumb tab bar on portals: Lessons · Quiz · Progress · Search.
4. "Continue learning" card at top of each portal so returning users skip the scroll.
5. Lazy-reveal / pagination for very long lists.
6. Enforce 44px tap height; increase mobile line-height & paragraph spacing.

---

## 3. Top 50 UX Improvements (prioritized by impact)

### Tier 1 — Orientation & discoverability
1. Add client-side **site search** (prebuilt JSON index) reachable from nav on every page.
2. Add **"Continue learning"** card (last-opened lesson) to every portal hero.
3. Add **"Recently visited"** strip (localStorage) on portals + homepage learning section.
4. Add **"Recommended next lesson"** to Arabic & Urdu (parity with Quran/Seerah/Kids).
5. Add **breadcrumbs** to islamic-knowledge & student-guidance.
6. Add a **persistent "All Portals" switcher** in the shared nav.
7. Add a mobile **"jump-to / on this page"** sticky chip bar (homepage, KC, portals).
8. Add a **bottom tab bar** on portals (mobile thumb reach).
9. Standardize **scroll-spy active states** across all pages.
10. Fix **anchor offset** to match nav height per breakpoint.

### Tier 2 — Mobile ergonomics
11. Enforce **44×44px** min tap target on nav links, footer pills, chips, buttons.
12. Add a **360px breakpoint tier**; test 320–360px for overflow (RTL heroes).
13. Cap body text **`max-width:64ch`**; bump mobile line-height to ~1.7.
14. **Collapse long card lists** (Guidance 81, KC sections) by default on mobile.
15. Increase mobile paragraph spacing in lessons/sub-lessons.
16. Make hero CTAs full-width & thumb-height on mobile.
17. Ensure drawer/menu close affordance is large and consistent.
18. Add `:active`/press feedback on all tappable cards.
19. Verify horizontal scroll (`overflow-x:hidden`) on all pages, not just homepage.
20. Lazy-load offscreen images/sections to speed mobile first paint.

### Tier 3 — Navigation consistency
21. Unify CTA label/placement convention across portals.
22. Identical breadcrumb visual + behaviour everywhere.
23. Wire top-3 pages to shared layer for nav-affordance parity.
24. Consistent "back to hub" link on every deep page.
25. Sticky mini progress bar in lesson view (shows % through lessons).
26. Persistent language toggle position/behaviour across all pages.
27. Consistent focus-visible order & skip-link on every page.
28. Keyboard nav for accordions/quizzes uniform across portals.
29. Standardize external-link affordance (Trusted Sources).
30. Consistent 404/empty states (currently none).

### Tier 4 — Feedback & micro-interactions
31. Correct/incorrect **quiz answer feedback** (pulse + check/x) uniform.
32. **Lesson-completion** toast/checkmark on every portal.
33. **Progress feedback** animation when % advances.
34. Button hover/press micro-interactions (shared).
35. Toast styling/position uniform (IFCore.toast exists — apply everywhere).
36. Loading **skeletons** for JS-rendered lists (Quran surahs, vocab).
37. Inline validation on Zakat calculator inputs (KC).
38. Smooth accordion open/close timing consistent across portals.
39. "Copied"/"Saved" confirmations consistent.
40. Reduced-motion fallback verified on every interaction.

### Tier 5 — Retention & journey
41. "**Resume where you left off**" banner on return visits (sitewide).
42. "**Up next**" suggestion card at end of each lesson.
43. Streak indicator in nav on portals that have streaks.
44. Gentle "you're X% done" nudge on portal hero.
45. Cross-portal "you might also like" recommendations.
46. Daily-challenge entry point surfaced on homepage learning section.
47. Save/bookmark a lesson for later.
48. Share-this-lesson control with deep link.
49. "Mark complete" on sub-lessons (currently read-only).
50. First-visit lightweight onboarding/coach-marks.

---

## 4. UX Quick Wins (<30 min each)
- Add breadcrumbs to islamic-knowledge & student-guidance (reuse KC markup). *(N-1)*
- Add "Recommended next lesson" block to Arabic & Urdu (copy Quran's). *(E-3)*
- Fix `scroll-margin-top` to match nav height at each breakpoint. *(N-5)*
- Add `min-height:44px` + padding to nav/footer/chips (per page). *(E-6)*
- Add `overflow-x:hidden` to any page missing it. *(item 19)*
- Add `max-width:64ch` to lesson body (also in VISUAL). *(item 13)*

*All low-risk and additive, but span multiple self-contained pages — batch + re-verify in Phase A.*
