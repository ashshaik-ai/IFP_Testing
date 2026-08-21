# LEARNING_FIXES.md — Learning Experience Parity & Engagement
**Date:** 2026-06-13 · Pre-implementation pass. Evidence-based static review. No code changed yet.
Companion: [VISUAL_FIXES.md](VISUAL_FIXES.md) · [UX_FIXES.md](UX_FIXES.md).

---

## 1. Learning Experience Report
The goal: every portal should feel like **the same premium learning platform**. Today there are **three clear tiers**:

- **Tier A (full platform):** Islamic History, Learn Quran, Seerah — hero → journey → full-anatomy lessons → mind maps/timelines → quiz engine → flashcards → diagrams → progress dashboard → daily challenge → streak → "next lesson."
- **Tier B (near-platform, missing pieces):** Learn Salah (no `if-quiz`), Kids Islam (no `if-quiz`, no `if-flashcards`, no `if-diagrams`).
- **Tier C (lessons bolted on, no platform loop):** Learn Arabic (lessons + flashcards, but **no progress, no streak, no quiz, no "next"**), Learn Urdu (**lessons only** — no flashcards, progress, streak, quiz, "next"; also breaks section spacing).
- **Static tier:** the 12 Arabic/Urdu sub-lessons — real teaching content, breadcrumb + prev/next, **but read-only** (no quiz, exercise, mark-complete, completion state, or shared layer).

### Consistency checklist across portals
| Element | History | Quran | Seerah | Salah | Kids | Arabic | Urdu |
|--|--|--|--|--|--|--|--|
| Hero | ✅ | ✅ | ✅(small) | ✅ | ✅ | ✅ | ✅(flat) |
| Journey/roadmap | ✅ | ✅ | ✅ | ✅ | ✅ | ~ | ~ |
| Full-anatomy lessons | ✅10 | ✅6 | ✅6 | ✅6 | ✅6 | ✅6 | ✅6 |
| Mind maps / timeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quiz engine (`if-quiz`) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Flashcards | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Diagrams (`if-diagrams`) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Progress dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Daily challenge | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Streak | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| "Next/recommended" | ✅ | ✅ | ✅ | ~ | ✅ | ❌ | ❌ |
| Completion celebration | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Certificate on finish | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**The two universal gaps even in Tier A: no completion celebration and no certificate-on-finish anywhere.**

---

## 2. Portal Ranking (Best → Weakest)
1. **Islamic History** — most complete; 10 full lessons, every engine, dashboard, streak, "next."
2. **Learn Quran** — full stack + Tajweed wizard + audio sample + "next."
3. **Seerah** — full stack + Story Explorer + Character Academy; only nit: under-scaled hero.
4. **Learn Salah** — full stack incl. Salah Simulator; **missing standalone quiz engine**.
5. **Kids Islam** — great structure, missions, age bands; **missing quiz + flashcards + diagrams parity**.
6. **Learn Arabic** — real lessons + flashcards; **no progress/streak/quiz/"next"** → no retention loop.
7. **Learn Urdu** — lessons only; **no flashcards/progress/streak/quiz/"next"**, broken section spacing → **weakest**.
> Sub-lesson pages (12) sit below all of these as a static content tier.
> Knowledge Center is a tools/reference hub (not ranked as a course) but feels denser/less premium than the portals.

---

## 3. Visual Learning Audit (where new visuals raise understanding)
| Need | Where | Why |
|--|--|--|
| **Maps** | Hijrah route (Seerah); empire expansion per era (History); Makkah/Madinah geography (Seerah); qiblah (Salah) | Geography/movement is currently text-only |
| **Process flows** | Wudu, Ghusl, How-to-pray sequences (Salah); Hifz plan (Quran) | Step order is far clearer as a flow than prose |
| **Infographics** | Five Pillars; Zakat thresholds (KC); Tajweed rules table (Quran); prayer-times logic (KC) | Dense facts → scannable visual |
| **Timelines** | Already in engine — extend to sub-lessons & Kids prophet stories | Reuse existing component |
| **Illustrations** | Wudu/salah figures; Arabic/Urdu letterforms; prophet-story scenes (Kids) | Placeholder-only today |
| **Storyboards** | Prophet stories (Kids); Seerah key events | Narrative comprehension for young learners |
| **Diagrams** | Add `if-diagrams` to Arabic/Urdu/Kids | Engine exists; parity gap |
| **Interactive** | Letter-tracing (Arabic/Urdu); drag-to-match vocab; tap-the-harakat; flip-card decks everywhere | Turns reading into doing |
| **Audio/Video placeholders** | Arabic/Urdu letters, duas, salah demo, pronunciation | Only Quran has a real sample |

---

## 4. Engagement Audit (missing motivation systems)
- **Micro-interactions:** no correct-answer pulse, no progress tick, no card press feedback (portals).
- **Achievement animations:** badge/achievement *data* exists in Tier A, but **no unlock animation/shelf**.
- **Completion celebrations:** **none in any portal** (confetti only on homepage).
- **Progress feedback:** dashboards are static numbers; no animated ring/bar fill.
- **Motivation systems:** streaks exist in 5 portals, **absent in Arabic/Urdu**; XP/missions only in Kids.
- **Continue Learning:** **absent sitewide.**
- **Recently visited:** **absent sitewide.**
- **Recommended next:** present in Quran/Seerah/Kids; **absent in Arabic/Urdu**.

---

## 5. Top 50 Learning Improvements (prioritized by impact)

### Tier 1 — Platform parity (make all portals one platform)
1. Add `if-quiz` to Salah, Kids, Arabic, Urdu.
2. Add `if-flashcards` to Urdu and Kids.
3. Add `if-diagrams` to Arabic, Urdu, Kids.
4. Add progress dashboard to Arabic & Urdu.
5. Add daily challenge to Arabic & Urdu.
6. Add streak system to Arabic & Urdu.
7. Add "recommended next lesson" to Arabic & Urdu.
8. **Certificate-on-completion** wired in all 7 portals (engine already supports it).
9. **Lesson-completion celebration** (shared, reduced-motion safe) in all portals.
10. Graded **end-of-level exam** (10 Qs) via `if-quiz` per portal.

### Tier 2 — Turn sub-lessons into real lessons (12 pages)
11. Add an end-of-page **quiz** to every sub-lesson.
12. Add **"mark complete"** + completion state to sub-lessons.
13. Add a short **practice exercise** to each sub-lesson.
14. Wire sub-lessons to the shared layer (refs/glossary/progress).
15. Feed sub-lesson completion into the portal progress dashboard.
16. Add letter-tracing interactive to alphabet sub-lessons.
17. Add audio pronunciation slots to alphabet/harakat sub-lessons.
18. Add worked examples to grammar/vocabulary sub-lessons.
19. Add flashcard decks tied to each vocab/alphabet sub-lesson.
20. Add "next sub-lesson" recommendation tuned to the roadmap.

### Tier 3 — Depth & assessment
21. Backfill Quran to ~8–10 lessons (Makki/Madani, Stories of the Quran, Names of Allah).
22. Backfill Salah (Jumu'ah, Witr & Sunan, Travel/Combining, Janazah overview, Eid).
23. Backfill Seerah (Companions deep-dive, Farewell Hajj detail).
24. Increase per-lesson quiz from 2 → 4–5 questions.
25. Add varied question types (true/false, match, fill-blank) to `if-quiz`.
26. Vary reflection prompts (currently formulaic).
27. Add "Did you know?" depth where thin (Kids).
28. Add scenario/application questions (not just recall).
29. Add spaced-repetition "review due" surfacing from `if-srs-*`.
30. Add per-lesson key-terms tied to the glossary.

### Tier 4 — Engagement & motivation
31. Correct/incorrect quiz micro-feedback (pulse + check) everywhere.
32. Animated progress rings/bars on all dashboards.
33. Badge/achievement unlock animation + badge shelf.
34. Confetti/burst on certificate award.
35. "Continue learning" entry on every portal hero.
36. "Recently visited lessons" strip.
37. Streak flame indicator in portal nav.
38. XP/points generalised from Kids to all portals.
39. Level-up animation when a level completes.
40. End-of-lesson "up next" suggestion card.

### Tier 5 — Visual learning & interactivity
41. Hijrah route map (Seerah) + empire maps (History).
42. Wudu/Ghusl/Prayer process-flow diagrams (Salah).
43. Five Pillars + Tajweed infographics.
44. Prophet-story storyboards (Kids).
45. Drag-to-match vocab + tap-the-harakat exercises.
46. Names of Allah interactive grid (Quran/KC).
47. Hifz planner tool (Quran).
48. Real recitation audio beyond the single Quran sample (multi-reciter).
49. Salah demonstration video placeholder slots.
50. Media manifest so production art/audio drops in without code changes.

---

## 6. Learning Quick Wins (<30 min each)
- Add `if-quiz` opt-in config + defer tag to Salah & Kids (engine already built). *(items 1)*
- Add `if-flashcards` defer tag + a starter deck to Urdu. *(item 2)*
- Add "recommended next lesson" block to Arabic & Urdu (copy Quran's). *(item 7)*
- Wire `IFCore.certificate()` to fire on level/quiz completion (one call per portal). *(item 8)*
- Bump per-lesson quiz to 4 questions in the data files. *(item 24)*

*All build on existing engines (additive), but each touches a portal file — batch in Phase B and validate (brace/quiz counts, no apostrophe breaks) as in prior tasks.*

---

## 7. Final Pre-Implementation Recommendations
1. **Standardize before building.** Lock the design tokens + portal hero/section template (VISUAL Tier 1) first — every later feature inherits consistency for free.
2. **Promote shared CSS/JS primitives** (`.if-card`, `.if-btn`, token block, `if-fx.js`) so fixes are 1-file, not 22-file. This is the single highest-leverage move.
3. **Close portal parity** (quiz/flashcards/diagrams/progress/streak/next) so Arabic & Urdu join the platform — then no portal "feels weaker."
4. **Upgrade the 12 sub-lessons** from read-only to interactive — this removes the last "documentation site" feeling.
5. **Add the universal engagement layer** (completion celebration, progress animation, certificate, continue-learning) — biggest perceived "premium" jump for least content work.
6. **Do a real device pass at 320/360px** before shipping mobile fixes (the only items I can't verify statically).
7. **Sequence:** Phase A (standardize tokens + hero/section + nav/anchor + breadcrumbs + 360px) → Phase B (parity + engagement layer) → Phase C (depth + visual learning + search) → keep scholar-review gate for religious content.
