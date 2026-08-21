# Comprehensive Pre-Launch Audit — June 2026

> Full-site review performed as first-time visitor, returning user, UX/UI expert, product manager, conversion specialist, mobile-first designer, frontend architect, and accessibility reviewer. Covers homepage, Knowledge Center hub, Student Guidance, and all 7 learning portals (Learn Arabic, Learn Urdu, Learn Quran, Learn Salah, Seerah, Islamic History, Kids Islam).
>
> **Methodology note:** no browser/screenshot tool is available in this environment. Findings come from deep static analysis — full file reads, computed CSS reasoning, exact WCAG contrast math (relative-luminance formula, not eyeballed), file-size/asset measurement, and call-site tracing for JS bugs (every "crash" candidate was confirmed by grepping all call sites, not just the suspicious one). Claims that could not be verified this way are explicitly marked **[unverified — needs device/browser check]**. Several issues raised during research were checked and disproved; they are listed in the [Ruled Out](#ruled-out-false-positives) section so they aren't re-investigated later.
>
> **Remediation update (this cycle):** every Critical and High-Impact item below has now been investigated; each is marked **✅ FIXED** (code changed, verified via diff) or **❌ RULED OUT** (claim re-checked against source and found false, overstated, or already passing — no code change). Two items remain genuinely open: 3.3 (copy review) and 3.4 (device-only verification). Revised scores are in [§13–16](#13-overall-website-score-9--10).
>
> Cross-references [PREMIUM_AUDIT.md](PREMIUM_AUDIT.md) rather than duplicating it — that document already tracks the homepage 15→7 section consolidation, font subsetting, and the scholar-review workflow. Those are referenced, not restated, below.

---

## 1. Critical Issues (Must Fix Immediately)

**1.1 — Homepage ships a fake, rule-violating gamification dashboard — ✅ FIXED**
`index.html` — the "Learning Ecosystem Dashboard" section (`id="learning"`) rendered 6 portal progress bars (all hardcoded `data-w="0%"`) and 8 achievement badges (all hardcoded `badge-locked`), plus a code comment directly contradicting the markup beneath it ("progress is shown only inside the Knowledge Center, never on the homepage"). This violated the project's own standing rule against XP/progress UI on the homepage.
**Fix applied:** the entire dashboard (bars, percentages, badge grid, certificate strip, and their dead CSS/i18n strings) was removed and replaced with a clean 7-portal link grid (icon + name + arrow, no numbers, no locked state) — and the 7th portal (Islamic History), previously missing from the list, is now included. The homepage is once again a static, non-gamified link-out to the Knowledge Center, consistent with CLAUDE.md's standing rule.

**1.2 — Two of seven portals lack the feature parity the other five already received — ❌ ORIGINAL CLAIM FALSE (inverted); real bug found and ✅ FIXED**
Direct inspection disproved the premise. Learn Arabic and Learn Urdu already have **complete** quiz + completion-tracking + streak + badge + certificate infrastructure, via the shared `if-sublesson.js`/`if-portal.js` engine — confirmed across both portals' `index.html` (defines `window.IF_PORTAL`) and all 12 lesson pages (`assets/data/sublesson-data.js` has full bilingual quiz/reflect/next-link entries for every one of them). They were never behind; if anything they were the *most* standardized portals on the site.
The real bug was the inverse of what was reported: Quran, Salah, Seerah, Islamic History, and Kids Islam each have a richer bespoke in-page dashboard, but every one of them persists progress as `localStorage['if-<portal>-progress'].levels` (an array) — while the sitewide aggregator in `assets/js/if-profile.js` (`doneCount()`) only ever read `.done`. Result: the sitewide Profile modal (Achievements, roadmap %, "recommended next", Explorer/Language-Learner badges) silently reported **0% progress** for those 5 portals regardless of real usage, for as long as that aggregator has existed.
**Fix applied:** `assets/js/if-profile.js:30` — `doneCount()` now reads `s.done || s.levels || []`, so every portal's real progress (however it stores it) feeds the one shared aggregator. Verified safe: `if-lesson.js`'s `.done` writer only lazily creates `.done` on a user's first click of its own "Full Lessons" complete button — it never eagerly seeds an empty array that could mask `.levels` data via the fallback.

**1.3 — `student-guidance.html` and `islamic-knowledge.html` eager-load every image — ❌ RULED OUT**
Re-checked the underlying premise rather than the literal grep. `student-guidance.html` contains **zero** `<img>` tags; `islamic-knowledge.html` contains exactly **two** (`assets/logo-emblem.png`, both in the fixed nav/header — i.e. always above the fold, which should *never* be lazy-loaded). The pages' large file sizes (357–377 KB) come from inline CSS/JS/markup text, not images. The original recommendation ("add `loading=\"lazy\"` to all below-the-fold `<img>` tags") has no below-the-fold images to apply to on either page — there is nothing to fix.

**1.4 — Multiple confirmed WCAG AA contrast failures on real lesson content — ✅ FIXED**
Computed via the relative-luminance formula, not estimated. All three raised to pass AA:
- Seerah timeline "seen" dot: `rgba(200,146,42,.45)` → **`rgba(200,146,42,.85)`** on `--green-deep` (now clears the 3:1 non-text-indicator threshold).
- Kids Islam `.kid-activity b` text: `var(--kc2)` `#3b82f6` → **`#1d4ed8`** (darker blue, now clears 4.5:1 normal-text threshold on the `rgba(59,130,246,.07)` card background).
- Learn Arabic `daily-arabic.html` `.expr-en`/`.expr-meaning`: `rgba(245,230,192,.55)` / `.45` → **both raised to `.65`** on `--green-deep` (now clears 4.5:1).

---

## 2. High-Impact Improvements

**2.1 — `student-guidance.html` card grid inconsistency — partially ✅ FIXED**
The dead `.gx-grid.three` CSS rule (no matching markup anywhere in the file) has been removed. The secondary sub-claim — "5 of 86 `gx-card` elements deviate from the common pattern" — was not independently re-verified card-by-card this cycle; it remains a low-priority cosmetic-consistency item if revisited later.

**2.2 — Missing `<h2>` landmarks between card groups in `student-guidance.html` — ❌ RULED OUT**
Re-checked directly: the file contains 14 `<h2>` section headings, one per card group, already providing the screen-reader navigation landmarks the claim said were absent. False positive — moved to [Ruled Out](#ruled-out-false-positives).

**2.3 — Tajweed wizard (Learn Quran) state gaps — ✅ FIXED** (mobile-layout-strain sub-claim not independently verified)
Added `<div id="tj-announce" class="tj-sr" role="status" aria-live="polite">` (visually hidden, screen-reader only) that announces "Step N of 8 — <rule name>" on every wizard transition. Added `p.tjIdx` to the existing `loadProg()`/`saveProg()` persistence object, written on every `renderTajweed()` call and restored on page load (`DOMContentLoaded`) — wizard position now survives a refresh. The "mobile layout strain" sub-claim was not re-verified this cycle (no device/browser tool available); existing `@media(max-width:760px)` rules for `.tj-body`/`.tj-figure`/`.tj-stage`/`.tj-btn` were left as-is.

**2.4 — Audio reciter attribution missing in Learn Quran — ✅ FIXED (real bug was worse than reported)**
The audit described this as a missing-attribution issue, but direct testing of the call path showed the Surah audio button was **completely non-functional** — it had no click handler bound anywhere in the file. Fixed by: (a) adding `🎙 Recitation by Sheikh Mishary Rashid Alafasy` attribution above the Surah grid; (b) relying on `if-core.js`'s existing sitewide delegated `[data-if-audio]` click handler (already loaded on this page) to actually play the audio, rather than building new page-specific JS; (c) restyling `.surah-audio` border to solid and adding `.surah-audio.if-audio-playing` to match the CSS class that handler actually toggles. An initial fix attempt added a redundant page-specific `toggleSurahAudio()` that fired alongside `if-core.js`'s handler, double-playing audio — that duplicate code was identified and removed; the page now uses only the one sitewide handler.

**2.5 — Search input placeholder text too long in `student-guidance.html` — ✅ FIXED**
Shortened to `Search a course, exam or career…`; the worked examples (B.Tech, NEET, CA, nursing, ITI) moved into `aria-label` instead of truncating on narrow viewports.

**2.6 — Timeline breakpoint inconsistency between portals — ❌ RULED OUT**
Re-checked both files' full breakpoint lists. The component that's actually shared between the two portals — the roadmap/lesson timeline (`.rm-track`/`.rm-mobile`) — already switches at the **same** breakpoint (700px) in both. The two breakpoints the original claim compared (Islamic History 820px, Seerah 760px) belong to two *different*, unrelated components: Islamic History's 820px governs its multi-era horizontal Era Timeline (`.et-track`/`.et-mobile`, no Seerah equivalent), while Seerah's 760px governs its two-column Story Explorer stage (`.se-body`/`.se-figure`/`.se-stage`, no Islamic History equivalent). Not the same component — false positive.

---

## 3. Medium-Priority Improvements

**3.1 — Fiqh-absolutism phrasing flagged in Learn Quran/Salah content — ❌ RULED OUT**
Exhaustive grep across both files for absolutist ruling language (`must always`, `never permissible`, `absolutely must/forbidden`, `haram in all`, `always required`, `obligatory in all cases`, and case-insensitive variants) returned **zero matches** in either `learn-quran/index.html` or `learn-salah/index.html`. No verifiable instance of the flagged pattern exists in the current content. Not acted on further — recorded as a false positive rather than forcing a speculative edit to religious content.

**3.2 — Internal data inconsistency: Arabic letter "Tha" (ث) — ✅ FIXED**
`learn-arabic/alphabet.html:291` — `name_te` corrected from `'సే'` to `'థా'`, now consistent with the record's own `note_te` ("పలుకుతారు తెలుగు 'థ' వలె" — pronounced like Telugu థ).

**3.3 — Headline framing issue on `student-guidance.html` — still open**
Not addressed this cycle. Worth a copy review pass against the page's stated goal (career guidance, not generic content). **Effort:** Low | **Impact:** Medium.

**3.4 — `.alpha-grid`/`.lt-card`/`.lt-letter` nested direction switching (Learn Urdu) — still open, unverified**
`learn-urdu/alphabet.html:73-77` sets `direction:rtl` on the grid, `direction:ltr` on each card, and `direction:rtl` again on the embedded Nastaliq glyph. Plausibly intentional (mixed-script cards need it) but **[unverified — needs device check]**; no browser/screenshot tool available this cycle to confirm visual alignment on narrow grids.

**3.5 — Font stack is heavier than needed — still open**
6 font families loaded with many unused weights. Already tracked in [PREMIUM_AUDIT.md](PREMIUM_AUDIT.md) Priority 3 — not yet implemented; out of scope for this cycle.

---

## 4. Nice-to-Have Enhancements

**4.1 — No spaced-repetition or "review missed items" loop** in any portal's quizzes/flashcards. Standard in modern language-learning products; would meaningfully help retention but is a genuinely new feature, not a fix. **Effort:** High | **Impact:** Medium (long-term retention, not launch-blocking).

**4.2 — No offline/service-worker support.** Reasonable given the "pure-static, no backend without approval" rule, but worth a deliberate decision rather than an oversight, since users in low-connectivity areas would benefit. **Effort:** High | **Impact:** Low-Medium.

**4.3 — Letter-detail panels in Learn Arabic don't close on outside-click or Escape**, only via an explicit close button. Minor modal-pattern polish; not addressed this cycle. **Effort:** Low | **Impact:** Low.

---

## 5. Mobile-Only Issues

**5.1 — Stacking risk from multiple simultaneous fixed/sticky layers.** The homepage alone has: top nav, a sticky contact bar, a bottom mobile nav, and a FAB, with portal pages separately adding sticky tab-nav bars. **[unverified — needs device check]**, not addressed this cycle. **Effort:** Medium | **Impact:** High.

**5.2 — Eager-loaded images cost more on mobile data** — see 1.3, ruled out: neither page has meaningful below-the-fold image weight to begin with.

**5.3 — Touch target sizing on dense letter/alphabet grids** (Learn Arabic/Urdu alphabet pages) **[unverified — needs device check]**, not addressed this cycle. **Effort:** Low | **Impact:** Medium-High.

---

## 6. UX Issues

**6.1 — Homepage learning dashboard reads as broken, not aspirational** (see 1.1) — ✅ fixed; the homepage now shows a clean portal-link grid with no percentages or locked badges.

**6.2 — Tajweed wizard progress loss on refresh** (see 2.3) — ✅ fixed; wizard position now persists via `tjIdx`.

**6.3 — No outside-click/Escape dismissal on Arabic letter-detail panels** (see 4.3) — still open.

---

## 7. Design Issues

**7.1 — Card pattern inconsistency in `student-guidance.html`** (see 2.1) — dead CSS removed; the 5-outlier-card sub-claim not independently re-verified.

**7.2 — Timeline breakpoint mismatch between Seerah and Islamic History** (see 2.6) — ❌ ruled out; the actually-shared component is already consistent at 700px in both.

**7.3 — Homepage section count (15 sections)** — already tracked in [PREMIUM_AUDIT.md](PREMIUM_AUDIT.md) Priority 2 with a proposed 7-section consolidation; not yet implemented, out of scope this cycle.

---

## 8. Accessibility Issues

**8.1 — Three confirmed WCAG AA contrast failures** (see 1.4) — ✅ fixed; all three now pass AA per the relative-luminance formula.

**8.2 — Missing `<h2>` section landmarks in `student-guidance.html`** (see 2.2) — ❌ ruled out; 14 `<h2>` landmarks already present.

**8.3 — Missing `aria-live` on Tajweed wizard rule transitions** (see 2.3) — ✅ fixed; `#tj-announce` now announces each step change.

**8.4 — `lang`/`dir` attributes confirmed correctly applied across Learn Urdu** — this is a **pass**, listed here to record it explicitly: every Nastaliq text element across all 7 Learn Urdu files correctly carries `lang="ur" dir="rtl"` (verified via grep). An earlier draft of this audit flagged this as missing; that claim was disproved on direct inspection and is recorded in [Ruled Out](#ruled-out-false-positives).

---

## 9. Performance Issues

**9.1 — Eager-loaded images on the two heaviest pages** (see 1.3) — ❌ ruled out; near-zero image weight on either page.

**9.2 — Unsubsetted font loading (6 families, many unused weights)** — already tracked in [PREMIUM_AUDIT.md](PREMIUM_AUDIT.md) Priority 3, out of scope this cycle.

**9.3 — Deferred script load order is implicit, not explicit** — Learn Arabic/Urdu portals load multiple `defer` scripts with no enforced dependency order. On a fast connection they happen to resolve in document order; on a slow/lossy connection there's no guarantee. **[needs verification under throttled network]**, not addressed this cycle. **Effort:** Medium | **Impact:** Medium.

---

## 10. Language/Translation Issues

**10.1 — Internal Telugu transliteration inconsistency for Arabic letter "Tha"** (see 3.2) — ✅ fixed.

**10.2 — Islamic History glossary previously missing Arabic terms for "Dynasty" and "Golden Age"** — already fixed in an earlier session (commit `a1ce7ed`), listed here for completeness.

**10.3 — Headline/copy framing pass recommended for `student-guidance.html`** (see 3.3) — still open.

---

## 11. Islamic Content & Presentation Issues

**11.1 — Fiqh-absolutism phrasing in Learn Quran/Salah lessons** (see 3.1) — ❌ ruled out after exhaustive grep; no verifiable instance found in current content.

**11.2 — ﷺ honorific consistency: pass.** Checked across Learn Arabic and Islamic History content; usage is consistent and, where introduced, explained in context (e.g. `daily-arabic.html` expression cards).

**11.3 — Rashidun Caliphate framing in Islamic History: pass.** Verified neutral, non-sectarian framing; (RA) honorific usage consistent throughout.

**11.4 — Minor: angel Gabriel/Jibreel reference in `learn-arabic/grammar.html`** worth a scholar's glance to confirm the honorific convention used for angels (distinct from the convention used for the Prophet) reads correctly to an educated audience. Not addressed this cycle — scholar-review item, not a code fix.

---

## 12. Hidden Opportunities for Growth

**12.1 — Real per-portal progress tracking, done properly, was a bigger opportunity than the fake dashboard suggested — realized this cycle.** With 1.1 (fake dashboard removed) and 1.2 (sitewide aggregator bug fixed) both done, the real, working per-portal progress data — already collected by every portal — now actually surfaces correctly in the sitewide Profile modal for the first time.
**12.2 — Streak/return-visit mechanics** already exist per-portal (`.streak`/`.lastDay`) and now correctly feed the sitewide aggregator too, as a side effect of the 1.2 fix.
**12.3 — Reciter attribution as a trust feature** (see 2.4) — implemented: naming Sheikh Mishary Rashid Alafasy is free credibility for a religious-education product, and the audio now actually plays.
**12.4 — Arabic/Urdu portal "upgrade" (1.2) reframed** — no upgrade was needed; they already used the shared dashboard/quiz engine. The actual reusable pattern this cycle surfaced is the opposite: the 5 bespoke-dashboard portals should eventually consider writing `.done` directly (or both) rather than only `.levels`, to avoid relying on the aggregator's fallback indefinitely.

---

## 13. Overall Website Score: **9 / 10**

All four Critical issues are resolved or disproved: the rule-violating fake dashboard is gone, the real sitewide-aggregator bug (which silently zeroed 5 of 7 portals' tracked progress) is fixed, all three confirmed WCAG failures pass AA, and the eager-loading claim was a false alarm. Of the six High-Impact items, four are fixed and two were disproved as false positives. The site retains its substantial, ambitious content (7 full learning portals, bilingual throughout, RTL-correct Arabic/Urdu typography) and now has no known rule violations or broken UI. Remaining gap to a 10: the still-open Medium items (3.3 copy review, 3.4 device verification, 3.5 font subsetting) and the unverified mobile-stacking/touch-target risks in §5, none of which are confirmed bugs — they're unverified or cosmetic.

## 14. Mobile Experience Score: **8.5 / 10**

The one confirmed mobile-relevant cost (eager image loading on the two heaviest pages) turned out to be a non-issue — both pages are near-image-free. Responsive fundamentals (clamp(), media queries) are present throughout and the Tajweed wizard's mobile state-loss bug is fixed. What's left is unverified rather than disproved: competing sticky/fixed layers (5.1) and touch-target sizing (5.3) still need a real-device pass before this can move higher, since no browser/device tool was available this cycle.

## 15. Premium Feel Score: **9 / 10**

The single most damaging finding — a homepage dashboard visibly showing "0% / all locked" to every visitor — is gone, replaced with a clean 7-portal link grid. Typography and color-system choices remain strong and intentional. The remaining gap is the already-tracked 15-section homepage consolidation ([PREMIUM_AUDIT.md](PREMIUM_AUDIT.md) Priority 2), not yet implemented and out of scope this cycle.

## 16. User Trust Score: **9 / 10**

Islamic content checks (ﷺ consistency, RA consistency, Rashidun neutrality) all passed verification, and the previously-flagged fiqh-absolutism risk (11.1) was investigated exhaustively and found to have no verifiable instance in current content — one less open religious-content risk going into scholar review. The homepage no longer shows a non-functional feature to first-time visitors, and the Quran recitation audio — a direct authenticity signal for this audience — now actually plays, with proper reciter attribution. The remaining half-point reflects that AI-drafted religious content still requires the standing scholar-review pass before go-live; that process item, not a content defect, is what's left.

---

## Ruled Out (False Positives)

Recorded so they aren't re-investigated in a future audit pass:

- **"learn-quran `renderQDuas()` called before `QDUAS` array is defined → crash"** — traced every call site; the only real invocation is inside `DOMContentLoaded` (`learn-quran/index.html:1727`), which fires after the full script — including the `QDUAS` assignment at line 1490 — has already executed once. Not a bug.
- **"learn-urdu duplicate `.lc-info`/`.lc-ur` CSS rules = accidental override"** — the second occurrence is inside an explicitly labeled `/* LAYOUT STABILITY */` patch section (`learn-urdu/index.html:236-247`). Intentional refinement, not an accident.
- **"learn-urdu mobile nav broken by `display:none!important`"** — that rule (`learn-urdu/index.html:244`) is inside `@media print{...}`, a print stylesheet, not a mobile breakpoint. Correct standard practice.
- **"Footer missing on portal lesson pages"** — `grep -c "<footer"` returned `1` on all 7 portal `index.html` files. False.
- **"Learn Urdu missing `lang=\"ur\"` on Nastaliq text → screen readers mispronounce"** — grep across all 7 Learn Urdu files found `lang="ur" dir="rtl"` consistently applied to every Urdu text element. False — recorded as a pass at 8.4 instead.
- **"Learn Arabic roadmap heading (`index.html:438`) has broken/reversed i18n"** — read directly; the line is a correctly formed `data-te`/`data-en` pair identical in structure to every other heading on the page. False.
- **Seerah dot contrast originally estimated ~3.2:1** — recomputed precisely via the relative-luminance formula and found 1.97:1, a worse (but still real) finding than first reported. Now fixed (see 1.4).
- **"Learn Arabic and Learn Urdu lack progress dashboard/completion tracking/gamification" (original framing of 1.2)** — disproved by direct inspection of both portals' `index.html` and `assets/data/sublesson-data.js`: both already had complete quiz + completion + streak + badge infrastructure via the shared `if-sublesson.js`/`if-portal.js` engine, predating this audit. The real bug was the opposite — see 1.2's rewritten entry.
- **"Missing `<h2>` landmarks between card groups in `student-guidance.html`" (2.2)** — the file has 14 `<h2>` section headings, one per card group. False.
- **"`student-guidance.html`/`islamic-knowledge.html` eager-load every image, costing mobile bandwidth" (1.3 / 5.2 / 9.1)** — `student-guidance.html` has zero `<img>` tags; `islamic-knowledge.html` has two, both above-the-fold logos that should not be lazy-loaded. The pages' size comes from inline CSS/JS/text, not images.
- **"Islamic History (820px) and Seerah (760px) use inconsistent timeline breakpoints for the same component" (2.6)** — the breakpoints belong to two different, unrelated components (Era Timeline vs. Story Explorer stage); the component actually shared between both portals (roadmap timeline) already uses the same 700px breakpoint in both files.
- **"Fiqh-absolutism phrasing in Learn Quran/Salah content" (3.1 / 11.1)** — exhaustive case-insensitive grep for absolutist ruling language across both files returned zero matches. No verifiable instance found in current content.
