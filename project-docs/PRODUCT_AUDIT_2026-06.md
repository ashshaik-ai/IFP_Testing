# World-Class Product Audit — Islamic Front, Mangalagiri
**Date:** 2026-06-13 · **Scope:** all 22 HTML pages + shared layer (`assets/js`, `assets/css`, `assets/data`).
**Method note (important):** this audit is grounded in *static analysis* of the real shipped markup/CSS/JS (tokens, breakpoints, components, meta, animation density) across every page, plus the known runtime behaviour of the shared engines. It is **not** a rendered device test. Items tagged **[VISUAL-CONFIRM]** need a 2-minute look in a real browser at the stated width before they are treated as fact. The companion ranked action list is in [IMPLEMENTATION_BACKLOG.md](../IMPLEMENTATION_BACKLOG.md).

---

## 1. Executive Summary

**Current overall score: 72 / 100** — a genuinely strong, coherent foundation that is *not yet* world-class.

What is already very good:
- **Brand & colour consistency is excellent.** The green/gold/cream token set (`--green-deep #0d3b1e`, `--gold #c8922a`, `--cream #faf6ee`, etc.) is identical across all 10 major pages; heading font (Playfair Display) is universal. This is rare and valuable.
- **Five of seven learning portals are now real learning platforms** (Seerah, Islamic History, Learn Quran, Learn Salah, Kids Islam): hero → journey → full-anatomy lessons (intro, sections, mind map, timeline, did-you-know, takeaways, reflection, quiz, summary, references) → progress dashboard (`if-*-progress`) → daily challenges.
- **A real shared component layer exists** (`if-core`, `if-lesson`, `if-quiz`, `if-flashcards`, `if-diagrams`) with language sync, citations, glossary, PWA, certificates.

What holds it back from world-class:
1. **The three highest-traffic pages are off the shared layer.** `index.html` (homepage), `islamic-knowledge.html` (the Knowledge Center hub), and `student-guidance.html` do **not** load `if-core.js` → no theme-color, no shared skip-link, no Trusted-Sources panel, no glossary, no PWA hooks.
2. **SEO / shareability is weak-to-absent.** The **homepage has no meta description, no Open Graph, no canonical, no structured data.** *No page on the entire site* has a canonical URL or JSON-LD. OG tags are present on only ~7 of 22 pages.
3. **Arabic & Urdu are two tiers behind.** They now have a lesson layer, but **no progress dashboard, no daily challenges, no quiz engine**, Urdu has **no flashcards**, and their **12 sub-lesson pages are static** (0 keyframes, no quizzes, no exercises, no interactivity) — they still read like textbook chapters, not a learning platform.
4. **Mobile at the smallest widths is unverified and likely cramped.** No page has a media query below ~380px; sub-lessons start at 400–520px. 320–360px behaviour is **[VISUAL-CONFIRM]** but at high risk of tight type and tap targets.
5. **No site search.** For a content ecosystem this large (7 portals, ~50 lessons, dozens of tools), the absence of search is a discoverability gap.
6. **Engagement animation is shallow beyond the homepage.** Real celebration/achievement/lesson-completion/progress animations are largely missing; sub-lessons are visually flat.
7. **All rich media is placeholder.** Audio/video/illustration/map assets are schematic SVG or "coming soon"; no real recitation beyond the Quran sample, no real illustrations.

**Path to 95/100** is in §12 — it is achievable in ~4 focused phases, mostly additive on the existing architecture.

### Category scorecard
| Area | Score | One-line verdict |
|---|---|---|
| Design-system consistency | 82 | Excellent colour/brand; minor token drift (`--radius` 14/16, two `--shadow` defs) |
| Navigation & user flow | 68 | Good in-portal nav & breadcrumbs; no global search, no persistent portal switcher |
| Mobile-first experience | 70 | Solid mobile-first base; 320–360px unverified; no shared breakpoint scale |
| Learning experience | 74 | 5 portals strong; Arabic/Urdu + 12 sub-lessons lag badly |
| Content quality | 73 | Real depth in 5 portals; sub-lessons shallow; uneven lesson counts |
| Visual learning | 64 | Mind maps/timelines exist; real maps/illustrations/infographics missing; SVG-only |
| Animation & engagement | 60 | Homepage rich; achievement/completion/progress animations missing elsewhere |
| Accessibility | 78 | Focus styles, skip-link, reduced-motion respected; sub-lessons & top pages weaker |
| SEO & shareability | 45 | Homepage meta missing; zero canonical/JSON-LD sitewide |
| Performance/architecture | 80 | Static, fast, no deps; large inline pages; fonts could be subset/preloaded better |

---

## 2. Page-by-Page Audit

### `index.html` — Homepage (3,777 lines)
- **Strengths:** richest page — 15 sections (`home, victory, achievements, manifesto, scheme, infra, about, contact, stories, gallery, events, volunteer, community-contact, learning, knowledge`), fixed glass nav (68px), scroll-spy (6 hooks), FAB, 5 keyframes / 73 transitions. Own skip-link + focus styles.
- **Issues:** **No meta description / OG / canonical / JSON-LD** (Sev: High, SEO). **Not on shared layer** → no theme-color, no glossary, no PWA (Sev: Med). Very long single scroll; 15 sections may overwhelm on mobile **[VISUAL-CONFIRM 360px]**. Heavy DOM (3.7k lines) — consider lazy sections.
- **Fix:** add SEO head block (done as quick win), section-jump "On this page" chip bar on mobile, consider PWA/theme-color.

### `islamic-knowledge.html` — Knowledge Center hub (2,563 lines)
- **Strengths:** 16 sections incl. live tools (Zakat calc, prayer times, pillars, wudu/salah guides, hadith, FAQs); breadcrumb present; has meta description + 0 OG.
- **Issues:** **Off shared layer** (no theme-color/Trusted-Sources/glossary/PWA) (Sev: Med). No OG (Sev: Med, SEO). This hub is the gateway to all portals yet has **no search** and a long flat section list (Sev: Med). FAQs present but **no FAQPage JSON-LD** (Sev: Med, SEO).
- **Fix:** wire `if-core`; add OG + FAQ JSON-LD; add a portal/tool quick-filter or search.

### `student-guidance.html` — Career guidance, 81 cards (2,538 lines)
- **Strengths:** rich taxonomy tokens (`--t-sci/-med/-com/...`), OG (3 tags), `--radius:16px`, defined `--shadow`.
- **Issues:** Off shared layer (Sev: Med). 81 cards = heavy scroll/filtering load on mobile **[VISUAL-CONFIRM]**; verify filter/search affordance. Active work (Telugu `CB_TE[]` bodies) still incomplete (Sev: Med, content). Only 1 keyframe / 13 transitions → flat (Sev: Low).
- **Fix:** finish CB_TE translations; add category quick-filter chips that collapse the list; wire `if-core`.

### Learning portal indexes — `seerah`, `islamic-history`, `learn-quran`, `learn-salah`, `kids-islam`
- **Strengths:** full learning anatomy, shared layer, breadcrumbs, scroll-spy, progress key, daily challenges (4–6 each), full-anatomy lessons from `assets/data/*-lessons.js`. **These are the model to copy.**
- **Issues (shared):** **no certificate trigger wired inline** in any (the engine supports it but portals do not call it on level/quiz completion) (Sev: Med, engagement). Real **audio/video/illustration are placeholders** (Sev: Med). Quiz engine present on only seerah/quran/history — **Salah & Kids lack the standalone quiz/flashcard parity** (Salah has flashcards+diagrams but no `if-quiz`; Kids has neither `if-quiz` nor `if-flashcards` nor `if-diagrams`) (Sev: Med). Lesson counts uneven: History 10 vs Quran/Salah/Seerah/Kids 6 (Sev: Low–Med, content).
- **Fix:** wire certificate-on-completion; add `if-quiz`+`if-flashcards`+`if-diagrams` to every portal for parity; backfill lessons where thin (e.g., Quran could add Makki/Madani, Stories of the Quran; Salah could add Jumu'ah, Witr/Sunnah, Travel prayer, Janazah overview).

### `learn-arabic/index.html` & `learn-urdu/index.html`
- **Strengths:** now carry the full-anatomy lesson layer (6 lessons each) cross-linking sub-pages; on shared layer (`if-core`).
- **Issues:** **No progress dashboard, no daily challenges, no `if-quiz`** (Sev: High for "learning platform" parity). **Urdu has no flashcards** while Arabic does (Sev: Med, inconsistency). Urdu lesson Arabic-script (`ar`) renders in Amiri, not Nastaliq (Sev: Low, polish — quick win applied). No certificate (Sev: Med).
- **Fix:** add `if-flashcards` (Urdu), `if-quiz`, a progress dashboard + daily challenge widget to both; Nastaliq override (done).

### 12 sub-lesson pages — `learn-arabic/{alphabet,harakat,vocabulary,grammar,quranic-arabic,daily-arabic}.html`, `learn-urdu/{alphabet,reading-basics,writing-skills,daily-urdu,islamic-urdu,advanced-reading}.html`
- **Strengths:** real teaching content; breadcrumbs present; consistent palette.
- **Issues (systemic):** **Off shared layer** (no theme-color/refs/glossary/PWA). **0 keyframes, ~7–12 transitions → visually flat/weak animation** (Sev: Med). **No quizzes, no exercises, no flashcards, no progress, no completion state** — pure read-only (Sev: High, learning). **No OG, no JSON-LD** (Sev: Med). Inconsistent breakpoints (400/500/520/560/680…) (Sev: Low). These are the pages that "still feel like a table of contents / textbook," exactly as the brief warns.
- **Fix:** template upgrade — inject `if-core`, add a short end-of-page quiz + "mark complete" + next/prev lesson nav + practice exercise; standardise breakpoints.

---

## 3. Portal-by-Portal Audit (learning maturity)

| Portal | Hero | Journey | Curriculum (full-anatomy) | Quiz engine | Flashcards | Diagrams | Progress | Daily challenge | Certificate | Maturity |
|---|---|---|---|---|---|---|---|---|---|---|
| Seerah | ✅ | ✅ | ✅ 6 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | **A−** |
| Islamic History | ✅ | ✅ | ✅ 10 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | **A−** |
| Learn Quran | ✅ | ✅ | ✅ 6 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | **A−** |
| Learn Salah | ✅ | ✅ | ✅ 6 | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | **B+** |
| Kids Islam | ✅ | ✅ | ✅ 6 | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | **B** |
| Learn Arabic | ✅ | partial | ✅ 6 (+6 sub-pages) | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | **C+** |
| Learn Urdu | ✅ | partial | ✅ 6 (+6 sub-pages) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **C** |
| Knowledge Center (`islamic-knowledge`) | n/a | n/a | reference/tools hub (not a course) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | tools hub |

**Verdict:** Arabic & Urdu are the portals that "still feel like a table of contents." Kids & Salah are close to A− but lack quiz/flashcard parity (and Kids lacks all three shared interactive engines). No portal yet awards a certificate on completion, despite the engine supporting it — a missed engagement lever everywhere.

---

## 4. Design Consistency Report
**Strengths:** identical colour tokens across all pages; Playfair Display headings everywhere; shared `.lu-footer`, focus-visible styles, reduced-motion handling in shared CSS.
**Inconsistencies found (evidence):**
- `--radius`: **16px** on `index`, `student-guidance`, `kids-islam`; **14px** on all other portals. *(Sev: Low)*
- `--shadow`: `0 6px 28px rgba(13,59,30,0.09)` (student-guidance) vs `0 4px 24px rgba(0,0,0,0.10)` (portals); `index`/`islamic-knowledge` define **no** shadow token and hardcode. *(Sev: Low)*
- `--cream`: `#faf6ee` everywhere except Kids `#fdf8ef` *(intentional kid warmth — keep, but document)*.
- Breakpoint scale is ad-hoc across 16+ distinct values — no shared system. *(Sev: Med)*
- Buttons/cards/shadows are re-declared per page rather than shared → drift risk over time. *(Sev: Med, debt)*
**Recommendation:** promote a single design-token block + button/card/shadow primitives into `if-shared.css` (`:root` defaults), let pages override only intentionally. Standardise radius to one value (recommend 16px) and one elevation scale (sm/md/lg).

---

## 5. Mobile UX Report (320 / 360 / 390 / 430 / tablet)
- **Mobile-first base is real:** `overflow-x:hidden` on homepage, fluid `5vw` padding, viewport meta on all 22 pages.
- **320–360px [VISUAL-CONFIRM]:** smallest media query sitewide is ~380–420px (sub-lessons 400–520px). High risk of cramped headings, multi-column cards not collapsing, and Arabic/Urdu RTL script overflow at 320px. **Action: add a 360px tier and test.**
- **Touch targets [VISUAL-CONFIRM]:** nav links (`font-size:13px`, `gap:24px`) and footer pill links (`padding:7px 16px`) may fall under the 44×44px target on small screens. **Action: enforce min 44px tap height on all interactive chips/links.**
- **Perceived scroll length:** homepage (15 sections) and student-guidance (81 cards) are very long. **Action:** mobile "jump-to" chip bar, collapse-by-default accordions, and lazy reveal to shorten perceived scroll.
- **Reading fatigue:** lesson bodies and sub-lessons are text-dense. **Action:** cap line length (`max-width: 64ch`), increase paragraph spacing, add pull-quotes and visual breaks.
- **Recommendation for premium feel:** sticky compact progress bar on lesson pages, snap-scroll for journey/timeline, skeleton loaders, and a bottom tab bar on portals for thumb reach.

---

## 6. Learning Experience Report
- **Model portals (Seerah/History/Quran):** complete; mainly need certificate-on-completion, real media, and richer assessments (currently 2 Qs/lesson — add a graded end-of-level exam via `if-quiz`).
- **Salah/Kids:** add quiz/flashcard parity; Kids needs all three interactive engines + age-band gating in UI.
- **Arabic/Urdu:** biggest lift — add progress dashboard, daily challenge, quiz, flashcards (Urdu), and convert the 12 static sub-lessons into interactive lessons (quiz + mark-complete + exercises + next/prev).
- **Cross-cutting gaps:** no spaced-repetition surfacing across portals (SRS exists in `if-flashcards` but isn't promoted), no streaks/XP on non-Kids portals, no "resume where you left off," no global learner dashboard aggregating all portals.

---

## 7. Content Quality Report
- **Depth:** strong in the 5 model portals (full anatomy, references to Quran.com/Sunnah.com etc.).
- **Shallow:** 12 Arabic/Urdu sub-lessons (no exercises/quizzes/citations panel); Kids fun-facts thin in places.
- **Uneven counts:** History 10 vs others 6 — backfill Quran (Makki/Madani, Stories of the Quran, Names of Allah), Salah (Jumu'ah, Witr & Sunan, Travel/Combining, Janazah overview, Eid), Seerah (Companions deep-dive), to ~8–10 each.
- **Citations:** present via Trusted-Sources on shared-layer pages; **absent on sub-lessons and the 3 top pages** (off shared layer).
- **Repetition:** "Trusted Sources" lists repeat per portal (acceptable); reflection prompts are formulaic — vary them.
- **Authenticity caveat (unchanged):** all religious lesson content is AI-drafted and needs a qualified-scholar pass before go-live (see scholar-review queue in IMPLEMENTATION_PROGRESS.md).

---

## 8. Animation & Engagement Report
- **Homepage:** rich (5 keyframes, 73 transitions) — good benchmark.
- **Portals:** moderate (3 keyframes, ~36–40 transitions) — mostly fade/slide on scroll; **repetitive**, no celebration.
- **Sub-lessons:** **flat (0 keyframes, 7–12 transitions)** — no micro-interactions.
- **Missing entirely (sitewide):** lesson-completion animation, quiz-correct/streak micro-feedback, achievement/badge unlock, animated progress rings/bars, confetti on certificate, hover/press states on cards beyond color. *(Sev: Med across the board — high engagement ROI.)*
- **Recommendation:** add a small shared `if-fx.js` (respecting `prefers-reduced-motion`): progress-ring fill, correct-answer pulse + check, level-complete burst, badge pop, streak flame. Reuse on all portals → instant premium lift.

---

## 9. Visual Learning Report
Present: text/SVG **mind maps** and **timelines** in `if-lesson`; schematic **diagrams** on 4 portals (`if-diagrams`).
**Needed (by type):**
- **Maps:** Hijrah route, expansion of empires (History), Makkah/Madinah geography (Seerah), qiblah direction (Salah). *(none real yet)*
- **Illustrations:** wudu/salah step figures, Arabic/Urdu letterform tracing, prophet-story scenes (Kids). *(placeholders only)*
- **Infographics:** Five Pillars, Zakat thresholds, Tajweed rules table, prayer-times logic.
- **Storyboards:** prophet stories (Kids), Seerah key events.
- **Process flows:** wudu sequence, ghusl sequence, how-to-pray, hifz plan.
- **Audio placeholders:** present (Quran live sample only); needed for Arabic/Urdu letters, duas, surah recitation.
- **Video placeholders:** none — add for salah demonstration, letter pronunciation.
- **Interactive:** Salah simulator & Tajweed wizard exist (good); add letter-tracing, drag-to-match (vocab), tap-the-correct-harakat, flip-card decks everywhere.
**Recommendation:** create an asset manifest (`assets/media/MEDIA_MANIFEST.md`) listing every needed asset with target page + slot; ship labelled placeholder slots now so production art drops in without code changes.

---

## 10. Navigation Report
- **In-portal:** good — fixed nav, scroll-spy, breadcrumbs on all KC pages, mobile drawer.
- **Gaps:**
  - **No site search** anywhere (Sev: High for discoverability at this scale).
  - **No persistent cross-portal switcher** — moving Arabic→Urdu→Quran relies on going back to a hub (Sev: Med).
  - **Breadcrumbs absent** on `islamic-knowledge` and `student-guidance` (deep pages) (Sev: Low–Med).
  - **No "resume / continue learning"** entry point on portal heroes (Sev: Med).
  - **Top 3 pages off shared layer** → inconsistent nav affordances (no glossary/skip parity) (Sev: Med).
- **Recommendation:** add a lightweight client-side search (prebuilt JSON index of lessons/tools/terms) in `if-core`; add a compact "All Portals" menu in the shared nav; add breadcrumbs to the two top pages.

---

## 11. Top 100 Improvements — see [IMPLEMENTATION_BACKLOG.md](../IMPLEMENTATION_BACKLOG.md)
The full ranked list (100 items, each with Severity / Impact / Effort / Fix, grouped into P0–P3 tiers) lives in the backlog file so it can be worked and checked off. Summary of tiers:
- **P0 (do first, high impact / low–med effort):** homepage SEO head ✅, sitewide theme-color, wire top-3 pages to shared layer, 360px mobile pass, certificate-on-completion, Arabic/Urdu quiz+flashcard+progress parity, `if-fx.js` engagement pack, site search, JSON-LD (Organization/Course/FAQ/Breadcrumb).
- **P1:** sub-lesson interactive upgrade, design-token unification, lesson backfill to ~8–10/portal, real maps/infographics, global learner dashboard, OG on all pages.
- **P2:** real audio/video, illustrations/storyboards, streaks/XP sitewide, snap-scroll & skeletons.
- **P3:** accounts/sync (only if static constraint is relaxed), pronunciation feedback, multi-reciter audio.

---

## 12. World-Class Roadmap (72 → 95)

**Phase A — Consistency & SEO foundation (72 → 80, ~1–2 days)**
Homepage SEO head ✅ · theme-color sitewide · wire top-3 pages to `if-core` · unify design tokens into `if-shared.css` · JSON-LD (Organization, WebSite, Course, FAQPage, BreadcrumbList) · OG on all pages · 360px mobile pass + 44px tap targets.

**Phase B — Learning parity & engagement (80 → 88, ~3–5 days)**
`if-quiz`+`if-flashcards`+`if-diagrams` on every portal · certificate-on-completion · `if-fx.js` (progress rings, correct-answer pulse, level-complete burst, badge pop, streak) · Arabic/Urdu progress dashboard + daily challenge · convert 12 sub-lessons to interactive (quiz + mark-complete + next/prev + exercise).

**Phase C — Depth, visual learning & search (88 → 92, ~1 week)**
Lesson backfill to ~8–10/portal · real maps + infographics + process flows · media manifest + labelled placeholder slots · client-side site search · global learner dashboard ("continue learning", aggregate XP/streaks) · varied reflection/assessment + graded end-of-level exams.

**Phase D — Premium media & retention (92 → 95, ongoing)**
Real audio (Arabic/Urdu letters, duas, multi-reciter), video demos (salah, pronunciation), professional illustrations/storyboards, snap-scroll & skeleton loaders, scholar-review sign-off on all religious content. *(Accounts/sync only if the pure-static constraint is intentionally relaxed.)*

### Benchmark deltas (what the references have that we lack)
- **Duolingo / Brilliant:** streaks, XP, instant micro-feedback, bite-sized interactive steps, celebration animation → *we lack engagement FX + streaks/XP outside Kids.*
- **Khan Academy:** mastery progress, unit tests, "continue" resume, global dashboard → *we lack graded exams + aggregate dashboard.*
- **Quran.com / Bayyinah:** real multi-reciter audio, word-by-word, tafsir depth → *our audio is a single sample; word-by-word missing.*
- **Yaqeen:** authoritative citations, polished long-form, infographics → *we cite sources but lack infographics & scholar sign-off.*
- **Noor Kids:** warm illustrated storytelling, character continuity → *Kids has structure but placeholder art.*

---
*End of audit. Quick-win fixes applied this pass are logged in [IMPLEMENTATION_PROGRESS.md](../IMPLEMENTATION_PROGRESS.md) (T25). The ranked, checkable backlog is [IMPLEMENTATION_BACKLOG.md](../IMPLEMENTATION_BACKLOG.md).*
