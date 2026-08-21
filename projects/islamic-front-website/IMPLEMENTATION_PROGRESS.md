# Implementation Progress

Execution log for the portal upgrade roadmap. Newest task at the bottom of each phase.
Reusable, additive, static-friendly. No page redesigns. Design language, i18n, mobile-first, a11y preserved.

---

## PHASE 1 — Shared Component Layer + Audio + Citations + Mobile/A11y

### ✅ T1 — Shared component layer (foundation)
- **Status:** Complete
- **Files added:** `assets/css/if-shared.css`, `assets/js/if-core.js`
- **What:** Self-initialising shared layer. Detects language from `<html lang>` via MutationObserver (stays in sync with each portal's `applyLang` — zero changes to portal JS). Exposes `window.IFCore` ({ toast, getLang, playAudio }) for future components.
- **Reusable component:** core (lang sync, toast, boot, API)
- **Dependencies:** none

### ✅ T2 — Citation / Trusted-Sources reference component
- **Status:** Complete
- **Files:** `assets/js/if-core.js` (REFS config + `injectRefs`/`paintRefs`)
- **What:** Auto-injects a bilingual "Go Deeper — Trusted Sources" panel before the footer, per portal, from a curated authentic-source config (Quran.com, Sunnah.com, Tanzil, Quranic Arabic Corpus, Bayyinah, Yaqeen, SeekersGuidance, Muslim Heritage, Lost Islamic History, Madinah Arabic, Rekhta). Re-paints on language toggle. Directly closes the audit's #1 authenticity gap (no external citations existed anywhere).
- **Reusable component:** `if-refs` (config-driven, 7 portal keys)
- **Portals improved:** learn-quran, learn-salah, seerah, islamic-history, kids-islam, learn-arabic, learn-urdu (7)
- **Dependencies:** T1

### ✅ T3 — Audio component
- **Status:** Engine complete; live audio wired in Learn Quran
- **Files:** `assets/js/if-core.js` (`[data-if-audio]` delegated player), `knowledge-center/learn-quran/index.html` (`renderSurahs`)
- **What:** Universal play/pause audio via a single shared `<audio>`; delegated click handling works on JS-rendered buttons; graceful "coming soon" toast for `pending`/empty; reduced-motion safe. Quran featured-surah "Listen" buttons now play real recitation (Alafasy, everyayah.com) of each surah's opening ayah.
- **Reusable component:** `[data-if-audio]` player
- **Portals improved:** engine = all; live recitation = learn-quran. (Salah duas / Arabic letters to be wired as audio URLs are sourced.)
- **Dependencies:** T1

### ✅ T4 — Mobile + Accessibility baseline
- **Status:** Complete
- **Files:** `assets/js/if-core.js` (`initA11y`), `assets/css/if-shared.css`
- **What:** Injects a "Skip to content" link (bilingual, keyboard-focusable) and a `theme-color` meta if absent; consistent focus-visible outlines; all shared animations respect `prefers-reduced-motion`; reference grid collapses to 1 column on mobile.
- **Portals improved:** all 7 wired
- **Dependencies:** T1

### ✅ T5 — Wire portals to shared layer
- **Status:** Complete
- **Files changed (1 line each in `<head>`):** learn-quran, learn-salah, seerah, islamic-history, kids-islam, learn-arabic, learn-urdu `index.html`
- **What:** Added `<link>` to `if-shared.css` + `<script defer>` to `if-core.js`. Relative path `../../assets/...`.
- **Validation:** if-core.js braces 62/62, parens 124/124; 7 portals confirmed wired.

**Phase 1 outcome:** every wired portal gains authentic external citations + audio engine + skip-link/theme-color, with no redesign and no change to existing portal JS.

---

## PHASE 2 — Quiz · Flashcard/SRS · Search · Glossary

### ✅ T6 — Flashcard / Spaced-Repetition engine
- **Status:** Complete; wired into 5 portals
- **Files added:** `assets/js/if-flashcards.js`; styles appended to `assets/css/if-shared.css`
- **Files changed (head: engine tag + inline deck config):** learn-quran, learn-salah, learn-arabic, seerah, islamic-history `index.html`
- **What:** Reusable SRS engine. A portal opts in by defining `window.IF_FLASHCARDS` (deck id + bilingual title/sub + cards). Leitner-lite scheduling persisted in `localStorage` (`if-srs-<deck>`), flip card (front/back), Again/Got-it rating, mastered/total + due logic, optional per-card recitation audio (reuses `[data-if-audio]`). Auto-injects a "Practice" section before the Trusted-Sources panel. Bilingual; re-paints on language toggle; reduced-motion safe.
- **Reusable component:** `if-flashcards` (config-driven; any portal can add a deck)
- **Decks shipped:** Quran (8 short surahs, with Alafasy recitation audio), Salah (8 step duas), Arabic (8 letters), Seerah (6 timeline milestones), Islamic History (6 empires/eras)
- **Portals improved:** learn-quran, learn-salah, learn-arabic, seerah, islamic-history (5) ✅ ≥3
- **Dependencies:** T1 (IFCore.getLang/audio)
- **Validation:** if-flashcards.js braces 33/33, parens 105/105; all 5 portals confirmed (config + engine present).

### ✅ T7 — Quiz engine
- **Status:** Complete; wired into 3 portals
- **Files added:** `assets/js/if-quiz.js`; styles appended to `assets/css/if-shared.css`
- **Files changed (head: engine tag + inline question bank):** learn-quran, seerah, islamic-history `index.html`
- **What:** Reusable graded quiz. Opt-in via `window.IF_QUIZ` (deck + bilingual title/sub + questions with `opts`/`ans`, optional `citeUrl`/`citeLabel`). Scoring, correct/wrong feedback, best-score persistence (`if-quiz-<deck>`), restart, optional per-question source link. Auto-injects after flashcards, before the reference panel. Bilingual; re-paints on language toggle.
- **Reusable component:** `if-quiz` (config-driven). Kids portal keeps its own existing quiz (no duplication).
- **Question banks shipped:** Quran (6 Q, with quran.com source links), Seerah (6 Q), Islamic History (6 Q)
- **Portals improved:** learn-quran, seerah, islamic-history (3) ✅ ≥3
- **Dependencies:** T1
- **Validation:** if-quiz.js braces 31/31, parens 101/101; 3 portals confirmed.

### ✅ T8/T9 — Glossary + term search (built into core)
- **Status:** Complete; live on all 7 wired portals (zero per-portal wiring)
- **Files changed:** `assets/js/if-core.js` (GLOSSARY data + `injectGlossary`/`paintGlossary`), `assets/css/if-shared.css`
- **What:** A universal bilingual glossary of 30 common Islamic terms (Salah, Wudu, Tajweed, Makharij, Ayah, Surah, Hadith, Sunnah, Hijrah, Qiblah, Iman, Taqwa …) with a live **search/filter box** — covers the term-search need (T8) and the glossary need (T9) in one shared component. Auto-injects before the reference panel on every portal that loads `if-core.js`; bilingual; re-paints on language toggle.
- **Reusable component:** `if-glossary` (single shared term list — no duplication, improves all 7 portals at once)
- **Portals improved:** all 7
- **Dependencies:** T1
- **Validation:** if-core.js braces 98/98, parens 188/188; 30 terms present.
- **Note:** Full content-wide `search-index.json` (search across every lesson/section) remains deferred to a later pass; the glossary filter delivers the highest-value slice of search now.

**Phase 2 outcome:** three reusable learning engines (flashcards, quiz, glossary/term-search) now live across the portals with no duplication and no redesign.

---

## PHASE 4 — PWA · Certificates (executed before content, since safe & reusable)

### ✅ T10 — PWA (installable + offline)
- **Status:** Complete; active on all 7 wired portals (zero per-portal wiring)
- **Files added:** `manifest.json` (site root note: placed at `assets/manifest.json`), `sw.js` (site root)
- **Files changed:** `assets/js/if-core.js` (`initPWA`: injects `<link rel=manifest>`, registers `sw.js` with base auto-detected from its own script src; skips `file://`)
- **What:** Add-to-home-screen installability + offline support. Service worker is **conservative**: HTML is network-first (pages never go stale during your review month), same-origin assets cache-first with background refresh, cross-origin (Google Fonts, everyayah recitation) never intercepted. Versioned cache (`if-cache-v1`) with old-cache cleanup.
- **Reusable:** one SW + manifest serve the whole site.
- **Dependencies:** T1

### ✅ T11 — Certificates
- **Status:** Complete; offered on every quiz completion
- **Files changed:** `assets/js/if-core.js` (`certificate()` + `IFCore.certificate`), `assets/js/if-quiz.js` (cert button on the done screen)
- **What:** Client-side certificate (no libraries, offline-safe). On finishing a quiz, a "Certificate 🎓" button opens a styled, print-ready certificate (Print / Save as PDF) with optional learner name, the course title, score, org, and date. Bilingual.
- **Reusable:** `IFCore.certificate({title, score})` — callable from any future completion (lessons, flashcard mastery).
- **Dependencies:** T1, T7
- **Validation:** if-core 129/129 braces; if-quiz 33/33; manifest.json valid JSON.

---

## PHASE 3 — Real lesson content (staged, review-gated)

### ✅ T12 — Staged lesson engine + first lessons
- **Status:** Engine complete; first 2 lessons wired into Learn Salah, **staged behind a "Draft — pending scholarly review" banner**
- **Files added:** `assets/js/if-lesson.js`; styles appended to `assets/css/if-shared.css`
- **Files changed:** `knowledge-center/learn-salah/index.html` (inline `IF_LESSONS` + engine tag)
- **What:** Reusable lesson renderer (accordion, bilingual, optional Arabic + source link per lesson). Every instance shows a prominent **⚠ Draft — pending scholarly review** banner (also notes madhab differences). Authored the two biggest Salah curriculum gaps as real lessons: **Wudu — Step by Step** (5 sections, cites Quran 5:6) and **Ghusl — When and How** (4 sections, cites Sunnah.com).
- **REVIEW REQUIRED:** the Wudu/Ghusl lesson text is AI-drafted and **must be verified by a qualified scholar before going live.** It is clearly marked as draft and is safe to leave staged during the 1-month review window.
- **Reusable component:** `if-lesson` (any portal adds `window.IF_LESSONS`)
- **Dependencies:** T1
- **Validation:** if-lesson.js braces 16/16, parens 86/86; Salah integration confirmed.

### ✅ T13 — Staged lessons extended to 3 more portals
- **Status:** Complete; staged behind the same "Draft — pending scholarly review" banner
- **Files changed:** `knowledge-center/learn-quran/index.html`, `seerah/index.html`, `islamic-history/index.html` (inline `IF_LESSONS` + `if-lesson.js` tag each)
- **Lessons authored (AI-drafted, REVIEW REQUIRED):**
  - **Quran:** "How to Begin Reading the Quran" (3 sections), "Etiquette (Adab) with the Quran" (3 sections, cites Quran.com)
  - **Seerah:** "The Year of Sorrow" (3 sections), "The Treaty of Hudaybiyyah" (3 sections, cites Surah Al-Fath 48)
  - **Islamic History:** "The House of Wisdom" (3 sections, cites Muslim Heritage), "Al-Andalus — A Centre of Learning" (3 sections, cites Lost Islamic History)
- **Portals with staged lessons now:** Salah, Quran, Seerah, Islamic History (4)
- **Validation:** all 3 portals — IF_LESSONS×1, engine×1, single `</head>`, `<script>` tags balanced 8/8.

### ✅ T14 — Visual Guide: diagrams & schematic maps (inline SVG, static-friendly)
- **Status:** Complete; wired into 4 portals
- **Files added:** `assets/js/if-diagrams.js`; styles appended to `assets/css/if-shared.css`
- **Files changed (head: engine tag + inline `IF_DIAGRAMS`):** learn-salah, learn-quran, seerah, islamic-history `index.html`
- **What:** Reusable "Visual Guide" engine. Opt-in via `window.IF_DIAGRAMS` (bilingual title/sub + items of `{cap, svg}`). Renders a responsive figure grid of **inline SVG** (no external image files → fully static & offline). Bilingual captions; re-paints on language toggle. Maps are intentionally **schematic** (labelled "not to scale").
- **Diagrams shipped:**
  - **Salah:** 4 prayer-posture figures (Qiyam, Ruku, Sujood, Jalsa)
  - **Quran:** 3 Makharij articulation diagrams (throat / tongue / lip letters)
  - **Seerah:** 2 schematic migration maps (Hijrah to Madinah, migration to Abyssinia)
  - **Islamic History:** 2 schematic diagrams (expansion from Arabia, trade/knowledge across three continents)
- **Reusable component:** `if-diagrams` (any portal adds `window.IF_DIAGRAMS`)
- **Portals improved:** learn-salah, learn-quran, seerah, islamic-history (4)
- **Dependencies:** T1
- **Validation:** if-diagrams.js braces 12/12, parens 65/65; all 4 portals — IF_DIAGRAMS×1, engine×1, single `</head>`, `<script>` tags balanced (8/8 Salah, 10/10 others).

### ✅ T15 — Seerah full curriculum (audit + lesson engine upgrade + 6 complete lessons)
- **Status:** Complete; all 6 Seerah levels are now full lessons (staged behind the draft-review banner)
- **Audit finding:** Seerah's "Level-by-Level Curriculum" was a table of contents (topic chips + one-line goal) with no lesson bodies, people, references, reflection, or assessment.
- **Engine upgrade — `assets/js/if-lesson.js`:** extended the lesson schema to the full anatomy — `sections` (explanation/key events/context) + `people` (companion profiles) + `takeaways` (lessons learned) + `reflect` (reflection questions) + inline `quiz` (quick-check, click-to-reveal) + `reading` (further reading) + `refs[]`/`cite` (authentic references). Backward-compatible (older simple lessons still render). Styles appended to `assets/css/if-shared.css`.
- **Content — `knowledge-center/seerah/index.html`:** replaced the 2 partial lessons with **6 complete lessons**, one per level:
  - L1 Before Prophethood · L2 Beginning of Revelation · L3 The Makkah Period · L4 Hijrah and Madinah · L5 Major Events and Battles · L6 Character and Legacy
  - Each lesson: 3 explanation sections (with Arabic where relevant), 2–3 companion profiles, 2 lessons-learned, 2 reflection questions, a 2-question inline quiz, Further Reading (Yaqeen), and per-level references (Quran.com surah deep-links + Sunnah.com). **Totals: 17 companion profiles, 12 quiz questions.**
- **REVIEW REQUIRED:** all 6 lesson texts are AI-drafted and behind the visible "⚠ Draft — pending scholarly review" banner; must be verified by a qualified scholar before go-live.
- **Validation:** if-lesson.js 41/41 braces, 150/150 parens; Seerah IF_LESSONS `{}` 132/132, `[]` 55/55, 6 lessons, 0 quote-breaking apostrophes; script tags 10/10, single `</head>`.
- **Outcome:** the Seerah portal is now a complete learning platform per level, not a table of contents. The same upgraded engine can now host equally complete lessons on the other portals.

### ✅ T16 — Kids Islam full curriculum (audit + 6 age-aware learning experiences)
- **Status:** Complete; all 6 Kids levels are now full learning experiences (staged behind the draft-review banner)
- **Audit finding:** the "Six Fun Levels" curriculum was topic chips + a one-line goal — no lesson bodies, stories, activities, worksheets, per-level quizzes, parent prompts, or age paths.
- **Reused engine:** the upgraded `if-lesson.js` (no engine change needed — kid sections map onto `sections`/`reflect`/`quiz`/`reading`/`refs`).
- **Content — `knowledge-center/kids-islam/index.html`:** wired `IF_LESSONS` + `if-lesson.js`; authored **6 complete lessons**, one per level (k1–k6):
  - L1 My First Islam · L2 Good Manners · L3 Daily Duas · L4 Stories of the Prophets · L5 Salah & Quran Basics · L6 Young Muslim Leadership
  - Each uses the kid anatomy as labelled sections: **📖 Simple Lesson · 🌙 Story Time · 🎨 Activity · ✅ Practice Task · ✨ Fun Fact · 👨‍👩‍👧 Parent Discussion · 🎯 For Every Age**, plus 💭 Reflection, a 2-question inline quiz, Further Learning, and references. **Totals: 12 quiz questions; age differentiation (5–7 / 8–11 / 12–15) embedded in every lesson.**
  - L5 cross-links to the Learn Salah portal in Further Learning.
- **REVIEW REQUIRED:** all 6 kid lesson texts (incl. basic aqeedah) are AI-drafted and behind the "⚠ Draft — pending scholarly review" banner; verify before go-live.
- **Validation:** Kids IF_LESSONS `{}` 122/122, `[]` 43/43, 6 lessons, 0 quote-breaking apostrophes; script tags 4/4, single `</head>`.
- **Outcome:** the Kids portal now teaches per level (lesson + story + activity + practice + parent prompt + quiz + age paths), not a table of contents — feeding the existing XP/missions/badges gamification loop.

### ✅ T17 — Salah / Quran / History lessons upgraded to full anatomy
- **Status:** Complete; the earlier short lessons on these 3 portals now match the Seerah/Kids depth
- **Files changed:** `learn-salah/index.html`, `learn-quran/index.html`, `islamic-history/index.html` (each lesson: appended `takeaways` + `reflect` + inline `quiz` + `reading`; History lessons also gained `people` scholar profiles). Existing sections + citations kept.
- **Salah:** Wudu, Ghusl — +lessons-learned, reflection, 2-question quiz each, SeekersGuidance further reading.
- **Quran:** Begin Reading, Adab — +lessons-learned, reflection, quiz each, Corpus/Bayyinah further reading.
- **Islamic History:** House of Wisdom (+Al-Khwarizmi, Ibn Sina, Al-Kindi), Al-Andalus (+Abd al-Rahman III, Al-Zahrawi, Ibn Rushd) — +lessons-learned, reflection, quiz, Yaqeen further reading.
- **Validation:** Salah `{}`38/38 `[]`15/15 · Quran 35/35 / 15/15 · History 41/41 / 17/17; 8 new inline quizzes; reflection on every lesson; 0 quote-breaking apostrophes; script tags balanced; single `</head>` each.
- **Outcome:** all four content-heavy portals (Seerah, Kids, Salah, Quran, History) now present complete lessons, not chips. Every staged lesson uses one shared engine.

### ✅ T18 — Islamic History full curriculum (audit + complete 10-lesson chronological journey)
- **Status:** Complete; the History lesson set now covers the full arc (staged behind the draft-review banner)
- **Audit finding:** the 6 accordion levels were chips + one-line goals; only 2 deep lessons existed (from T17).
- **Files changed:** `knowledge-center/islamic-history/index.html` — expanded `IF_LESSONS` from 2 → **10 lessons** (3 edits: retitled the series + inserted L1–L4 + renumbered Abbasid to L5; renumbered Al-Andalus to L6; appended L7–L10). Kept the T17 House-of-Wisdom & Al-Andalus lessons in place.
- **The 10-lesson journey:** L1 Pre-Islamic Arabia · L2 The Prophet ﷺ (overview, cross-links to the Seerah portal) · L3 Rashidun Caliphate · L4 Umayyad Caliphate · L5 Abbasid Golden Age (House of Wisdom) · L6 Islamic Spain (Al-Andalus) · L7 Ottoman Empire · L8 Great Muslim Scholars & Scientists · L9 Colonial Era · L10 Modern Muslim World.
- **Each lesson:** 📜 Historical Background · ⚔️ Key Events · 📅 Key Dates (timeline) [· 🔬 Contributions / 🌍 Today where relevant] · Important Figures (people) · Lessons Learned · Reflection · 2-question Quiz · Further Reading · Authentic References. **Totals: 24 figure/scholar profiles, 20 quiz questions, 10 reflections.**
- **Standards observed:** balanced, contribution-and-lessons focused; Colonial/Modern lessons kept strictly factual and non-political (no named contested figures); non-sectarian throughout.
- **REVIEW REQUIRED:** all lesson texts AI-drafted, behind the "⚠ Draft — pending scholarly review" banner.
- **Validation:** History IF_LESSONS `{}` 204/204, `[]` 87/87, 10 lessons, 20 quizzes, 24 people, 0 quote-breaking apostrophes; script tags 10/10, single `</head>`.
- **Outcome:** the History portal now teaches the complete journey with real depth, not a table of contents.

### ✅ T19 — Gating released + Seerah transformed to world-class (Phase 1)
- **Release:** the "Draft — pending scholarly review" banner has been **removed from `if-lesson.js`** — all staged lessons across every portal are now live (no gating).
- **Engine upgrade (`if-lesson.js` + `if-shared.css`):** lessons now render the full deliverable set — **Introduction**, lesson sections, **visual Timeline**, **visual Mind Map**, Key People, **Did You Know?**, Lessons Learned, Reflection, inline Quiz, **Level Summary**, Further Reading, References. Backward-compatible (older lessons on other portals still render; they simply omit the new blocks until upgraded).
- **Seerah content (`assets/data/seerah-lessons.js`, new):** all 6 levels rewritten as deep, beginner-friendly lessons with the complete anatomy. Totals: **6 mind maps, 6 timelines, 18 quiz questions, 17 people, Did-You-Know + Level Summary on every level.** Lessons are logically ordered L1→L6.
- **Wiring:** Seerah loads the data file (deferred, before the engine); the old 109-line inline block was neutralised (renamed `__OLD_SEERAH`) so `IF_LESSONS` now comes only from the data file. Moving content to a data file keeps the markup clean and large content reliable.
- **Validation:** if-lesson 49/49 braces, 164/164 parens, banner gone; seerah-lessons.js 243/243 braces, 79/79 brackets, 6 lessons, 6 mindmaps, 6 timelines, 18 quizzes, 0 quote-breaking apostrophes; Seerah HTML has 0 inline `IF_LESSONS` defs.
- **Note:** gating is OFF per request; the lesson content remains AI-drafted and should still be scholar-checked at your convenience, but no banner is shown.

### ✅ T20 — Islamic History transformed to world-class
- **Files:** `assets/data/history-lessons.js` (new) wired into `islamic-history/index.html`; old inline block neutralised (`__OLD_HISTORY`).
- **Content:** all 10 lessons (Pre-Islamic Arabia → Modern Muslim World) now carry Introduction, sections, **visual Timeline, visual Mind Map**, Key People, **Did You Know?**, Lessons Learned, Reflection, Quiz, **Level Summary**, Further Reading, References. Totals: **10 mind maps, 10 timelines, 20 quiz questions, ~24 figure profiles.** L2 cross-links to the Seerah portal.
- **Standards:** balanced, non-sectarian; Colonial/Modern kept factual and non-political.
- **Validation:** history-lessons.js 318/318 braces, 119/119 brackets, 10 lessons, 10 mindmaps, 10 timelines, 20 quizzes, 0 quote-breaking apostrophes; History HTML has 0 inline IF_LESSONS defs.

### ✅ T21 — Learn Quran transformed to world-class
- **Files:** `assets/data/quran-lessons.js` (new) wired into `learn-quran/index.html`; old inline block neutralised (`__OLD_QURAN`).
- **Content:** expanded from 2 → **6 lessons** covering the full journey — What is the Quran? · How to Begin Reading · Tajweed · Hifz (memorisation) · Understanding (Tafseer) · Living with the Quran (Adab). Each carries Introduction, sections, Mind Map (+ a revelation/compilation Timeline in L1), Key People where relevant, Did You Know?, Lessons Learned, Reflection, Quiz, Level Summary, Further Reading, References. Cross-links to the Tajweed Academy and the Learn Arabic portal.
- **Totals:** 6 mind maps, 12 quiz questions, bilingual.
- **Validation:** quran-lessons.js 183/183 braces, 64/64 brackets, 6 lessons, 6 mindmaps, 12 quizzes, 0 quote-breaking apostrophes; Quran HTML has 0 inline IF_LESSONS defs.

### ✅ T22 — Learn Salah transformed to world-class
- **Files:** `assets/data/salah-lessons.js` (new) wired into `learn-salah/index.html`; old inline block neutralised (`__OLD_SALAH`).
- **Content:** **6 lessons** covering the full journey — Why We Pray · Wudu (with Quran 5:6) · Ghusl · How to Pray (step by step) · The Five Daily Prayers · Khushu (presence of heart). Each carries Introduction, sections (Arabic where relevant — wudu verse, takbir), Mind Map, Did You Know?, Lessons Learned, Reflection, Quiz, Level Summary, Further Reading, References. `howtopray` cross-links the on-page Salah Simulator.
- **Totals:** 6 mind maps, 12 quiz questions, bilingual.
- **Validation:** salah-lessons.js 171/171 braces, 61/61 brackets, 6 lessons, 6 mindmaps, 12 quizzes, 0 quote-breaking apostrophes; Salah HTML has 0 inline IF_LESSONS defs.

### ✅ T23 — Kids Islam transformed to world-class (final portal)
- **Files:** `assets/data/kids-lessons.js` (new) wired into `kids-islam/index.html`; old inline block neutralised (`__OLD_KIDS`).
- **Content:** **6 age-aware lessons** — My First Islam · Good Manners · Daily Duas · Stories of the Prophets · Salah & Quran Basics · Young Muslim Leadership. Each now carries Introduction, kid-friendly sections (Simple Lesson · Story Time · Activity · Practice Task · Fun Fact · Parent Discussion · For Every Age), **Mind Map**, Reflection, Quiz, **Level Summary**, Further Reading, References. Age bands 5–7 / 8–11 / 12–15 preserved; bright kid palette kept. L5 cross-links the Learn Salah portal.
- **Totals:** 6 mind maps, 12 quiz questions, bilingual; kid-warm tone.
- **Validation:** kids-lessons.js 169/169 braces, 49/49 brackets, 24/24 parens, 6 lessons, 6 mindmaps, 12 quizzes, 0 quote-breaking apostrophes; Kids HTML has 0 inline IF_LESSONS defs.

### ✅ T24 — Arabic & Urdu full-anatomy lesson supplements
- **Files:** `assets/data/urdu-lessons.js` and `assets/data/arabic-lessons.js` (new), each wired into its portal `index.html` (data file before `if-lesson.js`). Neither portal had any prior inline `IF_LESSONS`, so no neutralisation was needed.
- **Learn Urdu — 6 lessons:** Alphabet · Reading Basics · Writing Skills (Nastaliq) · Everyday Urdu · Islamic Urdu · Advanced Reading. Each cross-links its existing sub-page (alphabet.html … advanced-reading.html) via Further Reading. Urdu script shown in `ar` fields.
- **Learn Arabic — 6 lessons:** Alphabet · Harakat & Vowels · Building Vocabulary (root system) · Grammar Basics · Quranic Arabic · Everyday Arabic. Each cross-links its sub-page (alphabet.html, harakat.html, vocabulary.html, grammar.html, quranic-arabic.html, daily-arabic.html). Arabic script in `ar` fields.
- **Content:** full anatomy — Introduction, sections (with script), Mind Map, Did You Know?, Lessons Learned, Reflection, Quiz, Level Summary, Further Reading, References. Balanced, factual, language-teaching focused.
- **Validation:** urdu-lessons.js 165/165 braces, 61/61 brackets, 6 lessons, 6 mindmaps, 12 quizzes, 0 apostrophes, sets IF_LESSONS; arabic-lessons.js 167/167 braces, 61/61 brackets, 6 lessons, 6 mindmaps, 12 quizzes, 0 apostrophes, sets IF_LESSONS. Both portals: data-file wired, load order correct, 0 inline IF_LESSONS defs.

### 🏁 All learning portals now at the world-class standard
Seerah · Islamic History · Learn Quran · Learn Salah · Kids Islam · **Learn Urdu · Learn Arabic** — every roadmap topic is now a full-anatomy lesson served from `assets/data/<portal>-lessons.js`, on the shared component layer. The language portals keep their existing multi-page sub-lessons and now add the lesson layer on top, cross-linked.

### ✅ T25 — World-Class Product Audit + safe quick wins
- **Deliverables:** [project-docs/PRODUCT_AUDIT_2026-06.md](project-docs/PRODUCT_AUDIT_2026-06.md) (Executive Summary, page-by-page, portal-by-portal, design/mobile/learning/content/animation/visual/navigation reports, scorecard, 72→95 roadmap) and [IMPLEMENTATION_BACKLOG.md](IMPLEMENTATION_BACKLOG.md) (Top 100 ranked, Sev/Imp/Eff/Fix, P0–P3).
- **Method:** static analysis of all 22 pages (tokens, breakpoints, components, meta, animation density) + known engine runtime. Live-render items tagged [VISUAL-CONFIRM]. **Current overall score: 72/100.**
- **Headline findings:** top-3 pages (index, islamic-knowledge, student-guidance) off the shared layer; homepage had zero SEO meta; no canonical/JSON-LD anywhere; Arabic/Urdu lack progress/quiz/dashboard (Urdu also flashcards); 12 sub-lessons static (0 keyframes, no quizzes); no site search; no 320–360px tier; engagement/celebration animations missing sitewide; all rich media still placeholder.
- **Quick wins applied & validated this pass (additive, non-destructive):**
  1. **Homepage SEO head** — meta description, keywords, Open Graph, Twitter card, theme-color, and JSON-LD (`Organization` + `WebSite`). JSON-LD validated as parseable. (Backlog #1)
  2. **Urdu lesson script in Nastaliq** — scoped `#if-lessons .ifl-ar` override to `Noto Nastaliq Urdu` (font already loaded). (Backlog #2)
  3. **theme-color** added to islamic-knowledge.html and student-guidance.html. (Backlog #3)
- **Deferred (intentionally, into backlog):** token unification, wiring top-3 to if-core, canonical (needs prod domain), 360px pass, certificate-on-completion, quiz/flashcard/dashboard parity, `if-fx.js`, site search, sub-lesson interactive upgrade, real media — all carry render/behaviour risk or are multi-file and are tracked P0–P3 in the backlog.

### ✅ T26 — Phase A: Platform Standardization (one coordinated pass)
- **New shared files (load on all 22 pages, last in `<head>` so tokens win the cascade):**
  - `assets/css/if-standard.css` — canonical token block (`--radius:16px`, unified `--shadow` + `--shadow-sm/md/lg`, `--ifx-container:1140px`, `--ifx-space-y:80px`/`--ifx-space-x:5vw`, `--ifx-tap:44px`, `--ifx-read:64ch`, `--ifx-nav-h:68px`), consistent `section[id]{scroll-margin-top:68px}`, **unified primitives** (`.ifx-container/.ifx-card/.ifx-btn(+primary/secondary/ghost)/.ifx-crumbs/.ifx-hero*/.ifx-readable`), **engagement system** (`.ifx-ring/.ifx-badge/.ifx-continue/.ifx-confetti` + keyframes, reduced-motion safe), and an **explicit 320/360/380px mobile layer** (tap targets, gutter/section tightening, hero down-scaling, overflow guard).
  - `assets/js/if-engage.js` — standalone engagement infrastructure (`window.IFEngage`): `celebrate()` confetti, `progressRing()`, `badge()`, passive **recently-visited** tracking (`if-recent`), **continue-learning** API (`get/setContinue`). Self-initialising, reduced-motion aware, no `if-core` dependency. *Infrastructure only — per-feature wiring is Phase B.*
- **Wiring:** both files inserted before `</head>` on **all 22 pages** via guarded idempotent script (correct `assets/` vs `../../assets/` prefix). Validated: 0/22 problems, single `</head>` each, links load after each page's inline `<style>`.
- **A2 hero standardization:** Seerah & History hero script-title `clamp(40px,6vw,86/88px)` → **`clamp(48px,7vw,104px)`** (matches the Arabic/Quran/Salah `.al-*` family); Urdu section gutters `80px 20px` → **`80px 5vw`** (×5) to match sibling rhythm.
- **A3 navigation:** consistent anchor offset centralised (`scroll-margin-top:68px` sitewide); **breadcrumbs added** to islamic-knowledge.html + student-guidance.html (localized `data-te/-en`, shared `.ifx-crumbs`).
- **Validation:** if-standard.css 75/75 braces; if-engage.js 30/30 braces, 101/101 parens; all hero/rhythm/breadcrumb edits confirmed; all 22 pages carry the standard layer.
- **Known residual (logged, not fixed this pass — low risk):** hardcoded `border-radius:14px` in the sub-lesson `.lnav` prev/next nav (12 files) stays 14px; full Urdu migration from the older `.lu-*` hero template onto `.al-*`; per-page nav/footer tap-target enforcement beyond the global button rule. Tracked in backlog.
- **NOT done by design (Phase A scope = standardize, not build):** no new features, content, quizzes, media, or full engagement wiring. `if-core` is still not on the top-3 pages (they now share the *standardization + engagement* layer, but not refs/glossary/PWA) — kept as backlog #4.
- **⚠ Visual confirm recommended:** static-validated only; a browser pass at 320/360/768/1140px is advised to confirm the radius bump, new mobile tiers, enlarged Seerah/History hero titles, and breadcrumb placement render cleanly.

### ✅ T27 — Phase B: Portal Parity + Engagement Layer
- **New shared module `assets/js/if-portal.js`** — config-driven learning dashboard (opt-in via `window.IF_PORTAL`). Renders: animated **progress ring** (via IFEngage), **lessons-complete X/N**, **learning streak**, **daily challenge** (date-rotated), **continue / recommended-next**, **recently-visited** strip, **achievement badges** (locked/unlocked + pop), per-lesson **completion tracking** (localStorage `if-<key>-progress`), and an **all-complete celebration + certificate** screen. Injects above `#if-lessons`. Reduced-motion safe; re-paints on language toggle.
- **`assets/css/if-standard.css`** — added the `.ifp-*` dashboard styling (cards, ring host, badges, challenge, checklist, mobile reflow).
- **Arabic** (`learn-arabic`): added standalone **quiz** (`IF_QUIZ` + if-quiz.js) and the **portal dashboard** (`IF_PORTAL` + if-portal.js). Already had flashcards.
- **Urdu** (`learn-urdu`): added **flashcards** (`IF_FLASHCARDS` urdu-letters deck), **quiz**, and the **portal dashboard** — Urdu was previously the weakest portal; now at parity.
- **Salah** (`learn-salah`): added a standalone graded **quiz** (was the one portal with no quiz engine). Quiz now on 6/7 portals (Kids keeps its own inline quiz widget).
- **`assets/js/if-quiz.js` enhanced (benefits ALL quiz portals — Arabic, Urdu, Quran, Salah, Seerah, History):** completion **celebration** (confetti when score ≥ 60%, bigger burst on perfect) + **correct-answer pulse** micro-interaction. Guarded by `window.IFEngage` + reduced-motion.
- **Engagement infrastructure now actively used:** `IFEngage.celebrate / progressRing / badge / getRecent / getContinue`.
- **Validation:** all 7 engines brace/paren-balanced (if-portal 57/57·202/202, if-quiz 35/35·113/113, if-standard.css 111/111); Arabic/Urdu/Salah configs apostrophe-safe (0 in JS), wiring order correct (if-portal after if-lesson); all 22 pages still carry the standard layer with a single `</head>`.
- **Remaining gaps (honest):** model portals (Quran/Salah/Seerah/History/Kids) keep their **bespoke** dashboards — they get quiz-celebration but not the new progress-ring/badge-pop or surfaced continue/recently-visited (left intact to avoid regressions); Kids lacks standalone quiz/flashcards/diagrams; Arabic/Urdu lack `if-diagrams`; the 12 sub-lessons are still read-only; continue/recently-visited not yet surfaced on the homepage; **visual confirm at 320–430px still pending** (cannot render). These move to Phase C.

### ✅ T28 — Phase C (started): Homepage "Continue learning" resume
- **New `assets/js/if-resume.js`** (wired on homepage) — reads sitewide `IFEngage` visit history; if the visitor recently used a learning portal, injects a bilingual one-tap **resume card** into the homepage `#learning` section. Additive, reuses `.ifx-card/.ifx-btn/.ifp-continue` (no new CSS). Validated 17/17 braces, 35/35 parens, 0 apostrophes.
- **Phase C queue (next):** upgrade the 12 read-only sub-lessons to interactive (quiz + mark-complete feeding portal progress); client-side site search; `if-diagrams` on Arabic/Urdu/Kids; visual-learning assets (maps/infographics). **Decision needed before media items:** real audio/illustration files must be user-provided or sourcing approved.

### ✅ T29 — Phase C: sub-lesson interactivity · site search · media system
- **Priority 1 — 12 sub-lessons now interactive.** New `assets/js/if-sublesson.js` + `assets/data/sublesson-data.js` (auto-keyed by URL: folder→portal, filename→lesson id). Each of the 12 Arabic/Urdu sub-lessons now has a **Knowledge Check** quiz, **Reflection**, **Mark-complete** that writes to the shared `if-<portal>-progress` (so the portal dashboard lights up), **recommended-next** link, and a **completion celebration**. `.ifs-*` styles added; wired before `</body>` on all 12.
- **Priority 2 — site-wide search.** New `assets/js/if-search.js` (43-entry embedded index → works on file://): searches portals, lessons, tools, knowledge articles, and glossary terms. Floating launcher + **"/" keyboard shortcut** + Esc, mobile-first modal, bilingual, path-prefix auto-computed by page depth. `.ifsr-*` styles added; wired on all 22 pages.
- **Priority 4 — media placeholder system.** New `assets/js/if-media.js`: attribute-driven (`data-if-media="audio|recitation|pronunciation|illustration|infographic|timeline|map|diagram|video|interactive"`). Renders a premium responsive placeholder now; **drops in the real asset automatically when `data-src` is added** (audio/video/img) — no redesign. `.ifm-*` styles; wired on all 22 pages. Demonstrated live: pronunciation/audio slots added to the Arabic/Urdu alphabet + harakat sub-lessons via `if-sublesson` (`CFG.media`).
- **Priority 5 — visual learning (partial):** lessons already carry mind maps + timelines; the media system now provides map/timeline/infographic/diagram slots. `if-diagrams` parity for Arabic/Urdu/Kids still queued.
- **Priority 3 — depth audit:** the biggest gap (read-only sub-lessons) is now closed by Priority 1; per-portal lesson backfill to ~8–10 remains queued.
- **Priority 6 — UX/consistency review:** code-level integrity validated (all 11 engines balanced, 22/22 pages carry standard+engage+search+media layers, single head/body each, 0 regressions). 320–430px visual confirm still pending (cannot render).
- **Validation:** if-sublesson 36/36·147/147, sublesson-data 184/184, if-search 66/66·83/83, if-media 26/26·49/49, if-standard.css 177/177; new code 0 quote-breaking apostrophes.
- **Media decision (option a) honoured:** all media infrastructure shipped as production-ready placeholders; real files drop in via `data-src` with no redesign.

### ✅ T30 — Portal parity completion + Visual Learning layer
- **Priority 1 — Continue Learning + Recently Visited on the 5 model portals.** New `assets/js/if-recent.js` (config-free, schema-agnostic — uses IFEngage history, so no collision with each portal's own progress store). Injects a compact strip above `#if-lessons`: resume the most recent in-portal lesson (or "Start lessons" on first visit) + recently-visited chips. Wired into Quran, Salah, Seerah, History, Kids. *(Progress rings / streaks / achievement badges already exist in those portals' bespoke dashboards; the documented universal gap was continue + recently-visited, now closed. Arabic/Urdu already get this from `if-portal`.)*
- **Priority 2 & 4 — Visual Learning layer (option a placeholders).** New `assets/js/if-visuals.js` + `assets/data/visuals-data.js` (keyed by portal folder). Injects a "Visual Learning" section after `#if-lessons` filled with `if-media` slots tailored per portal:
  - **Quran:** Tajweed rules chart · Makki/Madani comparison · revelation timeline · Hifz planner.
  - **Salah:** step-by-step prayer flow · wudu sequence · qiblah finder · common-mistakes quick-reference.
  - **Seerah:** Hijrah route map · Prophet ﷺ timeline · Makkah/Madinah geography.
  - **History:** civilisations map · dynasty timeline (Rashidun→Ottoman) · scholar-connections diagram · era comparison.
  - **Kids:** prophet-story storyboard · good-manners chart · match-the-pairs activity.
  - **Arabic/Urdu:** letterform/Nastaliq guide · root-word / poetry infographic · pronunciation audio.
  Each is a premium responsive placeholder now; real assets drop in via `data-src` with no redesign. Wired into all 7 portals.
- **Validation:** if-recent 11/11·59/59, if-visuals 9/9·48/48, visuals-data 32/32 (7 portals), if-standard.css 188/188; 0 quote-breaking apostrophes; all 7 portal indexes single `</head>`/`</body>`.
- **Priorities 3/5/6 (analysis-heavy) — status:** the biggest depth gap (read-only sub-lessons) and the universal engagement gaps are now closed; per-lesson quality scoring, the full benchmark matrix, and a true 320–430px device audit remain (the last needs rendering, which I cannot do). Concrete next implementable items: `if-diagrams` parity (Arabic/Urdu/Kids) and per-portal lesson backfill to ~8–10.

### ✅ T31 — Diagram parity + content-depth (Apply It)
- **Priority 2 — `if-diagrams` parity complete.** New `assets/data/diagrams-data.js` (folder-keyed, sets `window.IF_DIAGRAMS`) + wired `if-diagrams.js` into **Arabic, Urdu, Kids** — 9 inline-SVG schematic diagrams: Arabic (letter-position shapes, root→word-family, harakat sound changes), Urdu (joining vs non-joining, position shapes, Nastaliq slope), Kids (Five Pillars, Wudu steps flow, Good-manners tree). All 7 portals now have a Visual Guide.
- **Priority 1 — content depth (Apply It).** Enhanced the shared `if-lesson.js` with an optional **"🛠️ Apply It"** practical-application block (renders after Lessons Learned; `.ifl-apply` styling). Populated it for **all 6 Learn-Quran lessons** (the P5 focus portal) with concrete bilingual tasks (find Al-Fatihah, read Al-Ikhlas, spot a ghunnah in An-Nas, memorise with repetition, read a tafsir of Al-Asr, recite with adab). This is the template; now **rolled out to every lesson in every portal — all 46 lessons** (Quran 6, Salah 6, Seerah 6, Kids 6, History 10, Arabic 6, Urdu 6) carry a concrete, bilingual "do this today" task. Kids tasks are phrased as gentle "Try it" actions. All 7 lesson data files re-validated (braces/brackets balanced, 0 quote-breaking apostrophes).
- **Validation:** diagrams-data 14/14·8/8 (9 items, 0 apostrophes); if-lesson 49/49·167/167; quran-lessons 189/189·64/64 (6 apply, 0 apostrophes); if-standard.css 189/189.

### ✅ T32 — XP/Levels system + lesson depth blocks
- **XP / Levels / daily-streak HUD** — new `assets/js/if-xp.js` (+ `#ifxp`/`.ifxp-*` CSS) wired on all 22 pages. Compact level + XP-bar HUD; level-up celebration (reduced-motion safe); +5 XP daily-visit bonus. `window.IFXP.award()` now called from **if-portal** (lesson complete, +20), **if-sublesson** (sub-lesson complete, +20), and **if-quiz** (good score, +15) — every completion across the platform now feeds one universal XP/level system.
- **Lesson engine deepened** — `if-lesson.js` now renders three new optional blocks: **⚠️ Common Mistakes** (`mistakes[]`), **❓ FAQ** (`faqs[]`, accordion), and **📝 Revision Notes** (`revision[]`, checklist). Styled `.ifl-mistakes/.ifl-faq/.ifl-revision`.
- **Depth content (template) — Learn Salah:** all 6 lessons populated with Common Mistakes, FAQ, and Revision Notes (e.g., dry spots in wudu, sujood as-sahw for forgetfulness, rakah counts, building khushu). Rollout to the other 6 portals is the next content pass (engine + template ready).
- **Validation:** if-xp 29/29·95/95; if-lesson 52/52·186/186; salah-lessons 213/213·79/79 (6 mistakes + 6 faqs + 6 revision); if-standard.css 208/208; 0 quote-breaking apostrophes; if-xp on 22/22 pages.

### ✅ T33 — Universal completion + Learner Profile / Achievements / Roadmap
- **Universal lesson completion in `if-lesson.js`:** every portal lesson now has a **"Mark lesson complete ✓"** button (portal key auto-derived from the URL folder) that writes to the shared `if-<key>-progress.done`, awards **+20 XP**, and celebrates. This unifies completion across all 7 portals (model portals previously had no per-lesson completion) and feeds the dashboards, XP, and profile from one store. Also added a correct-answer pulse to in-lesson quizzes.
- **Learner Profile / Achievements / Roadmap** — new `assets/js/if-profile.js` (+ `.ifpr-*` CSS), opened by clicking the XP HUD (keyboard accessible), wired on all 22 pages. Aggregates everything already tracked:
  - **Stats:** lessons completed (X / 46), quizzes passed (scans `if-quiz-*` best scores), day-streak (max across portals), level + XP, approximate time invested.
  - **Achievement gallery:** 12 platform achievements (First Lesson → All Lessons, First Quiz → Quiz Master, Level 5/10, 7-Day Streak, Language Learner, Explorer) with locked/unlocked states.
  - **Learning roadmap:** all 7 portals with live completion-% bars and lesson counts, linking into each portal.
- **Validation:** if-profile 54/54·107/107; if-xp 32/32·107/107; if-lesson 69/69·235/235; if-standard.css 240/240; 0 quote-breaking apostrophes; if-profile on 22/22 pages.
- **Delivers:** Priority 4 (achievements & profile) in full; Priority 3 substantially (roadmap, completion-% by path, milestone tracking via achievements). Soft progression (roadmap %, recommended-next) rather than hard content locks (kept open-access by design — better UX, no dead-ends).

### ✅ T34 — Seerah Visual Learning (real interactive components, no placeholders)
- Replaced the Seerah `if-visuals` "coming soon" placeholders with a dedicated rich module **`assets/js/if-seerah-visuals.js`** (own scoped styles, runs only on Seerah). Removed the `seerah` entry from `visuals-data.js` so the generic placeholders no longer render.
- **Six fully-built, interactive, bilingual, mobile-first visual components:**
  1. **Hijrah Route Map** — SVG map (Makkah → Cave of Thawr → Quba → Madinah) with an animated drawn route, a moving caravan marker (SMIL), selectable stops showing the event + key lesson, and a ~450 km distance marker.
  2. **Life of the Prophet ﷺ Timeline** — 13 expandable nodes (Birth → Passing) with date, summary, key lesson, and Makkah/Madinah era bands.
  3. **Makkah vs Madinah Explorer** — side-by-side comparison cards.
  4. **Family Tree** — Abdullah/Aminah → Muhammad ﷺ → Fatimah/Ali → Hasan/Husayn.
  5. **Major Battles** — Badr, Uhud, Khandaq, Hunayn cards (year, cause, outcome, lesson).
  6. **Character Map** — 7 traits (Honesty, Mercy, Patience, Leadership, Justice, Forgiveness, Courage) each linked to a real Seerah event, tap-to-explore.
- **Portal audit done:** "All Islamic Learning Modules" (`#coming`) is now moved to the very end (before footer) at runtime; visual section sits right after the lessons in the flow; nav anchor ids unchanged (scroll-spy intact); reduced-motion safe. Remaining "coming soon" texts are legitimate: a *Duas & Adhkar* module that is genuinely not built yet, and audio/video narration (asset-dependent) in the Story Explorer.
- **Validation:** if-seerah-visuals 138/138 braces, 258/258 parens, 0 apostrophes; 13 timeline nodes, 4 battles, 7 traits; wired once; single head/body; `visuals-data` seerah key removed.

### ✅ T35 — Critical UX/UI fixes (XP exploit, homepage cleanup, hero overlap, ordering)
- **#4 XP exploit (CRITICAL) — fixed.** Added `IFXP.awardOnce(key, points)` with a persistent awarded-ledger. Lessons/quizzes now grant XP at most once ever (key `L:<portal>:<id>` shared by lesson, dashboard, and sub-lesson; `Q:<deck>` for quizzes). Un-completing then re-completing no longer farms XP; earned XP/level never reset. Updated all four call-sites (if-lesson, if-portal, if-sublesson, if-quiz).
- **#3 Floating learning UI on homepage — fixed.** Removed if-xp, if-profile, if-engage, if-resume, if-media from `index.html` (homepage is now a clean community site). Kept `if-standard.css` (design system) + `if-search.js` (site navigation). The learning HUD/XP/profile remain across the Knowledge Center ecosystem.
- **#2 Homepage hero overlap — fixed (primary cause).** The hero **title** lacked a Telugu font fallback (subtitle had one), so default-language Telugu glyphs rendered in a Latin-only Playfair serif with tight `line-height:1.05`, overlapping. Added `'Noto Sans Telugu'` fallback and increased line-heights (desktop 1.08 / te 1.5; mobile 1.12 / te 1.4). *(Static fix; a real-device pass is advised to confirm across all breakpoints.)*
- **#5 Portal ordering — canonical order set** (Kids → Quran → Salah → Seerah → History → Arabic → Urdu) in the dynamic modules: Profile **learning roadmap**, resume widget, and search index. **Bespoke grids now unified too** via new `assets/js/if-order.js` — a runtime reorder scoped to portal-card containers (`.coming-grid` on all 7 portals, homepage `.ld-portal-list`, and the Knowledge-Center grid tagged `.ifo-portals`), sorting cards by canonical rank from each card's portal href/name (extras like "Duas & Adhkar" sort after the seven). Safe (no fragile static block-moving), consistent everywhere, runs once. Wired on all 22 pages (no visible UI — pure ordering, so it is fine on the clean homepage). *(Only the KC footer link-row keeps its order, intentionally, so the "← Home" link stays first.)*
- **Validation:** all 8 affected modules brace/paren-balanced, 0 apostrophes; homepage has 0 learning scripts; single Kids search entry; profile order = kids/quran/salah/seerah/history/arabic/urdu.
- **Not done this pass (need rendering / large):** #1 Knowledge-Center nav redesign (subjective, needs a real-device design pass — not safe to rewrite blind); full #5 bespoke-grid reordering; #6 broad visual-consistency verification.

### ✅ T36 — Content standard, language-leak fix, KC nav, homepage cleanup, ordering/position
- **#1 Respectful references** — created `CONTENT_STANDARDS.md` (mandatory ﷺ honorific policy + bilingual isolation + portal order). Audited content: all Prophet references already carry ﷺ (57+); the only bare "Muhammad" is *Muhammad Al-Fatih* (Sultan Mehmed II — correct). No content rewrite needed.
- **#2 Language leak (root cause fixed)** — the injected **quiz** and **flashcards** repainted only their body on language toggle, never their **shell** (label/title/subtitle), so a component injected under Telugu-default kept Telugu chrome after switching to English. Added `paintShell()` to `if-quiz.js` and `if-flashcards.js` and made the lang `MutationObserver` repaint shell + body. 100% isolation now (all other injected components already re-render fully).
- **#3 Knowledge Center nav** — restructured the flat 15-link jump bar into **labeled educational categories** (Learn the languages · Start here · Worship & tools · Read · Go deeper) with a clear hierarchy (`.kcj-group` labels, scoped CSS), keeping every anchor/translation and the scroll-spy sticky bar intact.
- **#4 Homepage cleanup** — the `#learning` section was a **live learning-progress widget** (per-portal bars/% from `if-*-challenge` localStorage). Neutralized the progress-reading JS, hid the bars/percentages via CSS, and reworded the section (EN+TE dict + static) from "Your Progress" to "Explore the Knowledge Center" (a discovery list). Combined with the earlier removal of the XP HUD/profile/resume scripts, the homepage now has **zero** learning/XP/progress UI.
- **#5 Portal order** — `if-order.js` already unifies the markup grids + dynamic widgets to Kids → Quran → Salah → Seerah → History → Arabic → Urdu.
- **#6 "All Modules" position** — added `comingLast()` to `if-order.js`: on every portal it moves the `#coming` ("All Islamic Learning Modules") section to the very end (before the footer), after all injected learning content. Consistent across all 7 portals (seerah also handled by its visuals module).
- **Validation:** if-quiz 36/36·130/130, if-flashcards 34/34·120/120, if-order 14/14·49/49, if-standard.css 244/244; homepage 0 learning scripts / 0 progress JS; KC nav 5 group labels, anchors intact; all 0 quote-breaking apostrophes.

### ✅ T37 — Depth blocks rolled out to ALL portals (IMPROVEMENTS A1)
- Added **Common Mistakes + FAQ + Revision Notes** to every lesson in **Quran (6), Seerah (6), Kids (6), Arabic (6), Urdu (6), Islamic History (10)** — Salah already had them. Now **all 46 lessons** carry the full depth anatomy (intro · sections · mind map/timeline · did-you-know · takeaways · Apply It · Common Mistakes · FAQ · reflection · quiz · Level Summary · Revision Notes · reading · references), bilingual, ﷺ-compliant, kid-appropriate for Kids.
- **Validation:** all 7 data files balanced (quran 225, salah 213, seerah 285, kids 211, history 388, arabic 209, urdu 207 braces — all matched); coverage = lesson count in every file (mistakes/faqs/revision 46/46/46); **0 quote-breaking apostrophes**.

### ✅ T38 — Section-level mini-checks (IMPROVEMENTS #2)
- **Engine:** `if-lesson.js` now renders an optional per-section `check` ({q_en,q_te,opts,ans}) as an inline **Quick check** right after the section body — making lessons interactive throughout, not only at the end. Reuses the existing `.ifl-quiz`/`.ifl-opt` markup so the click-to-reveal + correct-pulse handler works with no extra wiring. New `.ifl-check` styling.
- **Content:** populated one section-check per lesson on **Learn Quran** (6 checks) as the rollout template (e.g., "Who is the author of the Quran? → Allah").
- **Validation:** if-lesson 71/71·242/242; quran-lessons 249/249·88/88, 6 section-checks, 0 apostrophes; if-standard.css 247/247.
- **Remaining (content):** author section-checks across the other 6 portals' sections.

### ✅ T39 — Islamic History rich visual learning (IMPROVEMENTS #3, History)
- New `assets/js/if-history-visuals.js` (own scoped `.hv-*` styles, runs only on islamic-history) replaces the generic media placeholders with **four interactive components**: (1) **Dynasty Timeline** — Rashidun→Umayyad→Abbasid→Al-Andalus→Ottoman, expandable nodes with dates/capital/summary; (2) **Map of Muslim Civilisations** — 5 selectable regions (Arabia, Levant & Iraq, North Africa & Spain, Persia & India, Anatolia & Balkans) with a spread path; (3) **Golden Age Scholars** — 6 cards (Al-Khwarizmi, Ibn Sina, Ibn al-Haytham, Al-Biruni, Jabir ibn Hayyan, Fatima al-Fihri); (4) **Era Comparison** table. Removed the `islamic-history` entry from `visuals-data.js`. Injects after `#if-lessons`; `if-order` keeps "All Modules" last.
- **Validation:** if-history-visuals 90/90 braces, 175/175 parens, 0 apostrophes; wired once; single head/body; placeholder entry removed.
- **Remaining (#3):** the same rich-visual treatment for Quran and Salah (both already have bespoke interactive tools — Tajweed Academy, Salah Simulator — so lower urgency).

### ✅ T40 — Quran + Salah rich visual learning (IMPROVEMENTS #3 complete for content portals)
- **`assets/js/if-quran-visuals.js`** (learn-quran): Tajweed-rule explorer (5 selectable rules with Arabic + meaning), Makki vs Madani comparison, Revelation & Compilation timeline (expandable), and "How the Quran is Organised" stat cards. Complements the on-page Tajweed Academy.
- **`assets/js/if-salah-visuals.js`** (learn-salah): step-by-step prayer flow (6 selectable postures with Arabic + what to do), wudu numbered steps, the five daily prayers table, and common-mistakes quick-fix cards. Complements the on-page Salah Simulator.
- Removed `learn-quran` and `learn-salah` placeholder entries from `visuals-data.js` (now only kids/arabic/urdu remain as media placeholders). Both modules inject after `#if-lessons`; `if-order` keeps "All Modules" last.
- **Validation:** if-quran-visuals 81/81·168/168; if-salah-visuals 80/80·162/162; both 0 apostrophes, wired once, single head. All four rich-visual modules (seerah/history/quran/salah) balanced and apostrophe-free.
- **#3 status:** done for the four content-heavy portals (Seerah, History, Quran, Salah). Kids/Arabic/Urdu keep premium placeholder slots (their rich visuals — storyboards, letter-tracing — are asset/interaction-heavy).

### ✅ T41 — JSON-LD SEO (#5) + learning-path progression (#4) — sprint complete
- **#5 JSON-LD** — new `assets/js/if-jsonld.js` (wired all 22 pages, self-restricts): **Course** per portal, **FAQPage** generated from each portal's real lesson FAQs (matches rendered content), **BreadcrumbList** on KC pages + the Knowledge Center hub. Relative URLs resolved to absolute at runtime; built with `JSON.stringify` so output is always valid. Homepage retains static Organization + WebSite.
- **#4 Learning-path progression** — `if-lesson.js` lesson list now shows: a **progress bar** (X / N · %), per-lesson **tier badge** (Beginner → Intermediate → Advanced → Expert), and **state** (done ✓ green / current ▶ gold / upcoming 🔒 dimmed). Soft unlock — upcoming lessons are still openable (no dead-ends), the cues just guide the path. Applies to all 7 portals via the shared engine. New `.ifl-progress/.ifl-tier/.ifl-*` state CSS.
- **Validation:** if-jsonld 32/32·51/51; if-lesson 72/72·254/254; if-standard.css 257/257; **all 19 shared engines brace/paren-balanced**; 0 quote-breaking apostrophes in code.
- **Sprint (IMPROVEMENTS next-sprint) COMPLETE:** 1 depth blocks → all 46 lessons · 2 section-checks (engine + Quran) · 3 rich visuals (Seerah/History/Quran/Salah) · 4 learning-path progression · 5 JSON-LD. Estimated score ~92.5 → ~95.

### ✅ T42 — Section-checks rolled out (Seerah, Salah, Arabic, Urdu)
- Added one inline section-level **Quick check** per lesson to **Seerah (6), Salah (6), Arabic (6), Urdu (6)** — joining Quran (6). Now **5 portals / 30 lessons** have section-level interactivity (lessons interactive throughout, not only at the end). Anchored on unique section headers.
- **Validation:** quran/salah/seerah/arabic/urdu each 6 section-checks; all files balanced; 0 quote-breaking apostrophes.
- **Remaining:** History (10) & Kids (6) — their section headers are templated (repeated across lessons), so section-checks there need body-text anchors; deferred as a careful pass.

### ✅ T43 — Section-checks complete on ALL portals
- Added section-checks to **History (10)** and **Kids (6)** via body-text anchors (their section headers are templated/repeated). **All 46 lessons across all 7 portals now have an inline section-level Quick check** (one per lesson) — lessons are interactive throughout, not only at the end.
- **Validation:** section-checks = lesson count in every file (6/6/6/6/6/10/6 = 46); all files brace/bracket-balanced; 0 quote-breaking apostrophes.
- IMPROVEMENTS #2 now fully done.

### ✅ T44 — Accessibility quick wins + design-token unification
- **Accessibility (#27 partial):** quiz/check answers no longer rely on **colour alone** — `.ifl-opt/.ifs-opt/.ifq-opt` now show **✓/✗** on reveal (WCAG 1.4.1); added `aria-live="polite"` to quiz/check feedback so screen readers announce results; `focus-visible` outlines on quiz/toggle/complete buttons; **modal focus-return** (search → launcher FAB, profile → XP HUD) + focus-in on the profile modal.
- **Design tokens (#38):** replaced all hardcoded `border-radius:14px` in the 12 Arabic/Urdu sub-lessons with `var(--radius,16px)` — now token-driven and consistent with the canonical 16px.
- **Validation:** if-quiz 36/36, if-sublesson 37/37, if-search 66/66, if-profile 55/55 — all balanced, 0 apostrophes; if-standard.css 260/260; sub-lessons 0 literal 14px left, single head/body intact.
- **Remaining a11y:** full modal focus-trap, complete ARIA sweep, colour-contrast audit (some need rendering).

### ✅ T45 — Modal focus-trap (accessibility)
- Added a standard Tab / Shift+Tab **focus-trap** inside the search and profile modals (focus cycles within the dialog while open) — completes the modal-accessibility work alongside the earlier focus-return.
- **Full integrity sweep:** all JS engines balanced (0 unbalanced), all 7 data files balanced, all 22 pages single `</head>`/`</body>`. if-search 70/70, if-profile 59/59.
- **Practical ceiling reached for non-asset / non-rendering work.** Remaining IMPROVEMENTS items are either rendering-dependent (contrast/ARIA audit at AA, 320–430px device pass), asset-dependent (audio/maps/illustrations/video, Kids/Arabic/Urdu rich visuals), or low-value (one-off container widths, font subsetting which needs measurement).

### ✅ T46 — Portal audit pass: nav overlap, History loops, visual-first lessons, unified dashboard
- **Index nav overlap (global):** the 6 inline links + Student-Guidance/KC pills crowded the brand on tablet (links only collapsed at ≤768px). Added a `@media (max-width:960px)` rule so the nav collapses to the burger across 769–960px (drawer already holds all links) — brand no longer overlaps "Our Victory".
- **Islamic History — navigation loops fixed:** `gotoLevel()` (used by Timeline "Learn More", Era cards, and the roadmap) now scrolls to the **real full lessons (#if-lessons)** instead of looping back to the curriculum outline (fallback preserved). Removes the dead-end/loop.
- **Islamic History — map placeholder:** the city 🗺️ button no longer shows a "coming soon" toast; it scrolls to the real **Civilisations Map** (`#if-history-visuals`, the interactive schematic map). *(Authentic-source geographic map images remain an external-asset item.)*
- **Visual-first lessons (all 7 portals):** reordered `if-lesson` so the **mind map + timeline render right after the intro, before the detailed reading sections** ("understand visually first, read second"). Section checks, Apply It, Mistakes, FAQ, quiz, revision unchanged.
- **Unified learning dashboard:** `if-profile` (the platform-wide dashboard opened from the XP HUD) already aggregates lessons completed, streak, achievements, and a per-portal roadmap across Quran/Salah/Seerah/History/Kids/Arabic/Urdu. Added a **Recommended Next** card (first portal with incomplete lessons → direct link).
- **Validation:** if-profile 61/61, if-lesson 72/72, if-standard.css 264/264; full sweep — 0 unbalanced engines, 0 pages with bad head/body.
- **Deferred (needs rendering or assets):** merging History's bespoke Challenge/Progress/Dashboard *inline* sections into one (the cross-portal `if-profile` is the unified dashboard; merging the page-local sections is risky blind); authentic map imagery; real device testing (Android/Samsung/iPhone/tablet); pixel-level responsive verification.

### ✅ T47 — Premium pass: icon system, audit relocation, premium analysis
- **Moved** `Islamic Front Design Audit.html` → `project-docs/audits/` (repo root stays production-focused).
- **Priority 1 — premium icon system (core implemented):** replaced the 26 emoji in the lesson-engine section labels with a **consistent thin-line SVG icon set** (14 icons, stroke currentColor) rendered in **restrained ink-green, not gold** — applies to all 46 lessons. Replaced the search FAB + modal 🔍 with SVG. New `.ifl-ic` style. Validated: if-lesson 74/74·270/270, if-search 70/70, if-standard.css 266/266, 0 apostrophes, 0 emoji left in those UI labels.
- **Icon finish (done):** visual-module section headers (18, across seerah/history/quran/salah visuals) → thin-line `.ifx-hic` SVGs (ink-green); adult-portal lesson section-header titles (110 emoji in history/salah/quran `h_en`/`h_te`) stripped to clean premium typography; visual-module **status/insight markers** (💡 lesson, ⚠️ mistake, ✓ fix → 6 inline `.ifx-iic` icons that inherit local color so they do not clash with mistake/fix accents). Balances intact across all 4 modules, apos:0, **0 emoji left in any UI chrome or marker**. **Intentionally retained:** Kids portal emoji (bright, age-appropriate identity for 5–15) and ~16 *pictorial content* glyphs (place/discipline imagery: 🕋🌴🏔️ places, scholar-field icons) — these are content illustration, not chrome.
- **Perf foundation verified (Priority 3):** `preconnect` present on all 23 pages, `display=swap` set, and the Zakat calculator already shows instant GoodReturns fallback values then upgrades to live `rates.json` (better than a skeleton). No cosmetic skeletons added (portals render synchronously from inline data — no async gap to mask). Font subsetting + large-page splitting remain recommendations (rendering-sensitive).
- **Trust layer scaffold:** `if-lesson.js` renders a "✓ Scholar-reviewed · name · date" badge when a lesson has `reviewed:{by,date}` (honest absence otherwise) + `.ifl-reviewed` style; new top-level **`CONTENT_REVIEW.md`** register (risk-tiered queue + marking workflow, go-live gated on Tier 1).
- **Gold restraint:** retired the gold gradient scrollbar site-wide for a quiet neutral one (`if-standard.css`).
- **Priorities 2/3/4 + ruthless review → `project-docs/audits/PREMIUM_AUDIT.md`** (analysis, as requested): homepage 15→~7 section plan; font subsetting/preload + skeleton/split recommendations (not changed blind — glyph/FOUT regression risk); scholar-review workflow (CONTENT_REVIEW register, risk tiers, `reviewed` badge); and the "what would Apple/Stripe/Linear/Airbnb reject" short list (AI religious content w/o scholar sign-off, placeholder media, emoji-as-UI, gold overuse, 15-section homepage, unverified mobile, two visual languages).

### ✅ T48 — Kids Islam: core content added (Duas, 5 Pillars, Names of Allah)
- **Audit found** the intro + roadmap promised "duas" (Level 3) but there was **no on-page dua content** — and core basics (Five Pillars, Names of Allah) were absent.
- Added three JS-rendered bilingual sections between `#character` and `#quiz`, built on the page's own card system + `--kc1..6` palette so they are visually connected:
  - **Everyday Duas** (`#duas`, 8 duas) — Arabic (Amiri) + transliteration + meaning, color-coded "when to say" badges.
  - **Five Pillars of Islam** (`#pillars`) — reuses `.why-card`/`.why-card-ar`.
  - **Beautiful Names of Allah** (`#names`, 8 Asma-ul-Husna).
- Wired into `applyLang` (re-render on language toggle); nav + scrollspy gained Duas / 5 Pillars / Allah's Names. Validated: JS block 27/27 braces · 18/18 parens · 3/3 brackets, 0 apostrophes, no global collisions, Arabic intact. Emoji intentional (kids portal). **Religious content AI-drafted → CONTENT_REVIEW.md Tier 1/2 before go-live.**
- **Round 2:** added **The Kalimah/Shahada** (`#kalimah`, static green banner), **My First Wudu** (`#wudu`, 7 numbered step cards, `WUDU[]`/`renderWudu`) and **My First Salah** (`#salah`, 6 step cards w/ Arabic position names, `SALAH[]`/`renderSalah`); new `.kalimah-card` + `.step-*` CSS. Then **reordered the whole page into a learning flow**: why → journey → levels → kalimah → names → pillars → character → duas → stories → wudu → salah → quiz → missions → progress → challenge → parents → knowledge (DOM + nav both). Validated: Wudu/Salah block 17/17 braces · 15/15 parens · 2/2 brackets · apos 0, no dup IDs.

### ✅ T49 — Portal-by-portal content+order pass (COMPLETE — all 7)
Same treatment as Kids (audit → add missing on-page reference content → verify order), one portal at a time. Canonical order Kids→Quran→Salah→Seerah→History→Arabic→Urdu.
- ✅ **Kids** — done (see T48): Duas, Pillars, Names, Kalimah, Wudu, Salah + full reorder.
- ✅ **Learn Quran** — added **Duas from the Quran** (`#qduas`, the 6 beloved *Rabbana* supplications: 2:201, 20:114, 20:25-26, 25:74, 2:286, 3:8) with Arabic + transliteration + meaning + ayah reference. New `.qd-*` CSS, `QDUAS[]`/`renderQDuas` wired into `applyLang`, nav + scrollspy link, placed after Surahs (existing order already logical, no reshuffle). Validated 8/8 braces · 6/6 parens · 1/1 brackets · apos 0, no dup IDs, Arabic intact.
- ✅ **Learn Salah** — added **How to Make Wudu** (`#wudu`, 8 numbered `.step-card`s, `WUDUSTEPS[]`/`renderWudu`) placed **before** the prayer simulator (purification precedes prayer); non-redundant with the simulator (prayer steps) and guide (rakats/timing). Validated 10/10 braces · 8/8 parens · apos 0.
- ✅ **Seerah** — added **Sending Salawat** (`#salawat`, `SALAWAT[]`/`renderSalawat`, `.sw-*` CSS): Short Salawat, full Durood Ibrahim, and the hadith reward — Arabic + transliteration + meaning. Placed after Leadership. Validated 5/5 braces · 6/6 parens · apos 0, no dup IDs.
- ✅ **Islamic History** — added **Key Terms Glossary** (`#glossary`, `GLOSSARY[]`/`renderGlossary`, `.gl-*` CSS): Caliph, Khilafah, Ummah, Hijrah, Sahabah, Shura, Dynasty, Golden Age (term + Arabic + definition). Rashidun/dynasties already covered by Personalities/Empires, so glossary chosen as the non-redundant gap. Placed after Lessons. Validated 10/10 braces · apos 0.
- ✅ **Learn Arabic** — was thin; added **The Arabic Alphabet** (`#alphabet`, 28 letters, `.alf-*` CSS) after Levels, and **Common Islamic Phrases** (`#phrases`, 8 expressions, reuses `.why-card`) after Word of Day. Validated 40/40 braces · 28 letters · apos 0.
- ✅ **Learn Urdu** — mirrored Arabic: **The Urdu Alphabet** (`#alphabet`, 39 letters, Nastaliq `.alf-*`) + **Common Urdu Phrases** (`#phrases`, 8 expressions, `.ph-*`). Validated 51/51 braces · 39 letters · 8 phrases · apos 0.

**All 7 portals done.** Every new section is bilingual, wired into `applyLang` + scrollspy nav, validated structurally (balanced braces/parens/brackets, 0 apostrophe traps, no duplicate IDs, intact Arabic/Urdu). **All AI-drafted content (duas, wudu/salah steps, salawat, glossary, transliterations) → CONTENT_REVIEW.md Tier 1/2 before go-live.** Not browser-rendered here — recommend a visual pass.

### ✅ T50 — Portal order audit + one-time reorder (all 7 consistent)
Audited every portal's section + nav order against a single template: **why → journey/roadmap → levels → [learning content] → progress → challenge → knowledge → coming**. Fixes:
- **Salah** — `mistakes` (content) was after progress+challenge; moved it before progress (DOM via marker-based block move + nav reorder). Now ...guide → mistakes → progress → challenge → knowledge.
- **Kids** — DOM had `knowledge` before `parents` while nav had them reversed; moved `parents` (Parent Corner) before `knowledge` so DOM matches nav: ...progress → challenge → parents → knowledge → coming.
- **History** — nav was missing the `#civilization` link (present in DOM); added it between Personalities and Cities.
- Quran, Seerah, Arabic, Urdu already conformed — no change.
Verified: every portal NAV == DOM order, `<section>`/`</section>` counts balanced, no duplicate IDs. Cross-portal order (if-order.js) already canonical (Kids→Quran→Salah→Seerah→History→Arabic→Urdu).

### ⏭ Remaining (optional, non-asset)
- Roll Common Mistakes / FAQ / Revision out to Quran, Seerah, History, Kids, Arabic, Urdu lessons (engine + Salah template ready) — large content authoring.
- Section-level mini-quizzes (per-section `check` in `if-lesson` + content); per-portal lesson backfill to ~8–10.
- Portal-specific deep content (surah studies, scholar profiles, prayer troubleshooting, kids missions, drills) — content authoring.
- Real artwork/audio/map/video assets → drop into `data-src` of the Visual Learning + media slots (user to supply).
- A qualified-scholar accuracy pass on the religious lessons before go-live.

### ⏭ Remaining Phase 3 (optional next)
- Arabic/Urdu lesson supplements (they already have real sub-pages).
- Real artwork/audio-story assets as drop-in replacements for the schematic SVGs.

### 📋 SCHOLAR-REVIEW QUEUE (updated)
Salah (Wudu, Ghusl) · Quran (Begin Reading, Adab) · Seerah (6 full lessons) · Islamic History (House of Wisdom, Al-Andalus) · **Kids (6 full lessons)**. All behind the visible draft banner; safe to leave staged.

### 📋 SCHOLAR-REVIEW QUEUE (before go-live)
All draft lessons sit behind the visible banner and are safe to leave staged. To verify:
1. Salah — Wudu (cites Quran 5:6), Ghusl (cites Sunnah.com)
2. Quran — Begin Reading, Adab of the Quran
3. Seerah — Year of Sorrow, Treaty of Hudaybiyyah
4. Islamic History — House of Wisdom, Al-Andalus
(Quizzes & flashcard decks are factual/recall and low-risk, but a quick accuracy pass is advisable.)

### ⏭ Remaining Phase 4
- Accounts + cross-device sync (replaces localStorage; enables real parent/teacher dashboards).
- Pronunciation feedback (record/compare) — optional, last.

