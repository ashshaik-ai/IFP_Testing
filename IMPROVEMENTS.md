# IMPROVEMENTS.md — Deep improvement list (current state)

**As of 2026-06 · platform score ≈ 92.5 / 100.** Bug sweep: clean (balance, refs, IDs, JSON, debug all pass). This is the living "what's left to reach world-class" list. Tags: **Sev** 🔴/🟠/🟡 · **Eff** S/M/L · **Blocker?** none / RENDER (needs a browser) / ASSET (needs files) / SCHOLAR (needs review).

---

## A. Content depth (highest learning impact, mostly non-asset)
1. ✅ DONE (2026-06) — **Common Mistakes / FAQ / Revision Notes now on all 46 lessons across all 7 portals** (was Salah-only). Validated: 46/46/46, all files balanced, 0 apostrophes.
2. ✅ DONE (2026-06) — **Section-level mini-checks**: `if-lesson` renders an optional per-section `check` (inline MCQ, click-to-reveal). Live on **all 7 portals — one per lesson, 46 total** (History/Kids anchored on section body text since their headers are templated). Lessons are now interactive throughout.
3. 🟠 M — **Lesson backfill to ~8–10 per portal** where thin (Quran 6, Salah 6, Seerah 6, Kids 6).
4. 🟠 L — **Portal-specific deep content:** Quran (surah studies, ayah reflections, word-by-word scaffolding, hifz planner logic), Salah (prayer troubleshooting, daily-implementation guides), Seerah (companion/leadership deep dives), History (scholar profiles, cause-and-effect timelines), Kids (missions, parent prompts, activities), Arabic (root-pattern drills), Urdu (reading/writing exercises).
5. 🟡 S — Vary reflection prompts (currently somewhat formulaic across lessons).
6. 🔴 L — **SCHOLAR**: qualified-scholar accuracy pass on all AI-drafted religious content before go-live.
7. ✅ DONE (2026-06) — **CB_TE[] Telugu translations** of all 69 student-guidance card bodies complete; `applyLang()` wired.

## B. Visual learning (extend the Seerah pattern everywhere)
8. ◐ MOSTLY DONE — **Rich interactive visuals per portal** (real SVG/CSS, not placeholders): ✅ Seerah · ✅ Islamic History · ✅ **Learn Quran** (`if-quran-visuals.js`: tajweed-rule explorer, Makki/Madani, revelation timeline, structure stats) · ✅ **Learn Salah** (`if-salah-visuals.js`: step-by-step prayer flow, wudu steps, five-prayers table, common-mistakes quick fixes). **Remaining (asset-leaning):** Kids (storyboards, match games), Arabic/Urdu (letterform tracing, root-family maps) — these keep premium `if-media` placeholder slots until art/interactives are built.
9. 🟠 M — Add `if-diagrams`-style **comparison matrices / decision trees / concept maps** as reusable SVG components (generalise from `if-seerah-visuals`).
10. 🟡 M — Ensure **every lesson** has at least one inline visual (mind map exists; add flow/timeline where text-heavy).

## C. Real media (all ASSET-blocked — placeholders already live)
11. 🟠 L — **ASSET** Qur'an recitation + word-by-word audio (human reciters only).
12. 🟠 L — **ASSET** Arabic & Urdu letter-pronunciation audio; common-dua audio.
13. 🟠 L — **ASSET** Maps (Hijrah route, Muslim civilisations), infographics (Five Pillars, Zakat thresholds, Tajweed), prophet-story illustrations/storyboards.
14. 🟡 L — **ASSET** Video: salah demonstration, pronunciation clips.
> All of the above drop into the existing `data-if-media` / Visual-Learning slots via `data-src` with **no redesign**.

## D. Engagement & gamification (build on if-xp / if-profile)
15. ✅ DONE (2026-06) — **Learning paths with progression** in `if-lesson`: per-lesson **tier** (Beginner→Intermediate→Advanced→Expert), **state** (done ✓ / current ▶ / upcoming 🔒, soft — still openable for good UX), and a **progress bar** atop the lesson list. Applies to all 7 portals automatically.
16. 🟡 M — Streaks/XP surfaced inside each portal dashboard (model portals have bespoke dashboards; unify with the shared XP).
17. 🟡 M — Badge/achievement **unlock animation + toast** when newly earned (gallery exists; the moment-of-earning is quiet).
18. ✅ DONE (2026-06) — **"Up next" card** after marking a lesson complete: shows next lesson title with one-click open + smooth scroll; "All complete!" banner after the last lesson. In `if-lesson.js` + `if-standard.css`.
19. 🟡 M — Spaced-repetition surfacing ("X cards due") from the existing `if-srs-*` flashcard data.

## E. Navigation & UX
20. 🟠 RENDER — **Device pass at 320/360/390/430px** on: hero, KC grouped nav, search modal, XP HUD, profile modal, dense lesson blocks, Seerah interactive visuals. (Only item that strictly needs a browser.)
21. 🟡 S — **Bottom-edge crowding**: search FAB + XP HUD + back-to-top all pin to the bottom on portals; verify/triage spacing at 320px (corners differ, likely OK).
22. 🟠 M — **Knowledge Center nav full redesign** to a true mega-menu/launchpad (this pass grouped it into labeled categories; a richer card-based redesign is the next step) — RENDER-assisted.
23. ✅ DONE (2026-06) — **Search index expanded**: catalog now has 68 entries (was ~44) including all 46 inline lessons across 5 portals with desc_en/te, anchored fragment URLs, and `id="lesson-X"` in if-lesson.js.
24. 🟡 M — "Continue / Recently visited" surfaced on model portals (Arabic/Urdu have it via if-portal; model portals only via the strip — make consistent).
25. 🟡 S — KC footer link-row: apply canonical portal order (kept Home-first; needs Home special-cased).
26. 🟡 M — Student Guidance: integrate into the canonical order (#8) and the learning roadmap/profile.

## F. Accessibility
27. ◐ MOSTLY DONE (2026-06) — Accessibility: ✓/✗ on quiz answers (no colour-only), `aria-live` feedback, focus-visible outlines, modal focus-return + focus-in, **and a full Tab focus-trap inside the search & profile modals**. **Remaining (needs rendering):** complete ARIA labelling sweep + colour-contrast audit at WCAG AA.
28. 🟡 S — Focus-trap + `Esc` already on modals; verify focus return to trigger on close.
29. 🟡 S — Colour-contrast audit of muted text on cream/green backgrounds.
30. 🟡 S — Respect `prefers-reduced-motion` everywhere (mostly done; verify SMIL caravan + confetti).

## G. SEO & structured data
31. ✅ DONE (2026-06) — JSON-LD via `if-jsonld.js`: **Course** per portal, **FAQPage** built from each portal's real lesson FAQs, **BreadcrumbList** on KC pages (relative URLs resolved to absolute at runtime; built with JSON.stringify so always valid). Homepage already had Organization + WebSite.
32. 🟠 M — `canonical` + per-page Open Graph on all 22 pages (needs production domain) — **ASSET/decision (domain)**.
33. 🟡 S — `sitemap.xml` + `robots.txt`.

## H. Performance
34. 🟡 M — Subset/preload fonts; the large multi-family Google Fonts load is render-blocking.
35. 🟡 M — Lazy-load offscreen images/sections; defer non-critical inline CSS on the 3.7k-line homepage.
36. 🟡 L — Split very large inline pages (index.html, islamic-knowledge.html) for maintainability.
37. 🟡 S — Extend `sw.js` precache to enable offline lesson packs.

## I. Architecture / tech debt
38. ◐ MOSTLY DONE (2026-06) — Design-token unification: all hardcoded `border-radius:14px` in the 12 sub-lessons replaced with `var(--radius,16px)` (now token-driven). **Remaining:** a few one-off container widths not snapped to 1140 (low impact).
39. 🟡 M — Migrate Urdu portal from the older `.lu-*` hero template onto the `.al-*` family (visual parity with the other portals).
40. 🟡 S — Consolidate the growing fixed-position widget set (search/XP/back-to-top) behind one bottom toolbar to reduce clutter and z-index risk.
41. 🟡 S — Add a tiny build/validation script in CI (brace/apostrophe/dup-id/link checks) so this bug sweep runs automatically.

---

### Suggested next sprint (max value, no blockers)
1. **A1** depth blocks to all portals · 2. **A2** section-level checks · 3. **B8** rich visuals for History + Quran + Salah · 4. **D15** learning-path unlocks · 5. **G31** JSON-LD Course/FAQ/Breadcrumb.
These five move the score from ~92.5 toward ~95 without any external assets or rendering. The remaining ceiling (95→100) then depends on **real media (C)**, a **device pass (E20)**, and **scholar review (A6)**.
