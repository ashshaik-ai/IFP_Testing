# IMPLEMENTATION_BACKLOG.md — World-Class Roadmap (72 → 95)

Companion to [project-docs/PRODUCT_AUDIT_2026-06.md](project-docs/PRODUCT_AUDIT_2026-06.md). 100 ranked improvements, grouped P0→P3 (P0 = highest impact / best effort ratio). Columns: **Sev** (severity) · **Imp** (user impact) · **Eff** (effort: S/M/L) · **Fix**.
Legend Sev: 🔴 High · 🟠 Med · 🟡 Low. Status: ⬜ todo · ✅ done · 🟦 in progress.

---

## P0 — Foundation & highest ROI (target 72 → 80)

| # | Status | Item | Sev | Imp | Eff | Fix |
|--|--|--|--|--|--|--|
| 1 | ✅ | Homepage SEO `<head>` (description, OG, theme-color, JSON-LD) | 🔴 | High | S | Added Org+WebSite JSON-LD, OG, description, theme-color |
| 2 | ✅ | Urdu lesson script renders in Nastaliq not Amiri | 🟡 | Med | S | Scoped `.ifl-ar` font override in learn-urdu |
| 3 | ✅ | theme-color on Knowledge Center + Student Guidance | 🟠 | Med | S | Added `<meta name="theme-color">` |
| 4 | ⬜ | Wire `if-core.js` into index/islamic-knowledge/student-guidance | 🟠 | High | M | Add CSS+JS tags; verify no style clashes |
| 5 | ⬜ | Sitewide `<meta name="theme-color">` on remaining static pages | 🟡 | Low | S | Add tag to 12 sub-lessons |
| 6 | ⬜ | JSON-LD Organization + WebSite + SearchAction (site) | 🔴 | High | S | Add to homepage + KC |
| 7 | ⬜ | JSON-LD Course per learning portal | 🟠 | Med | M | Course/CreativeWork schema per portal index |
| 8 | ⬜ | JSON-LD FAQPage on islamic-knowledge FAQ section | 🟠 | Med | S | Map existing FAQs to schema |
| 9 | ⬜ | JSON-LD BreadcrumbList on all KC pages | 🟡 | Med | M | Generate from existing breadcrumb |
| 10 | ⬜ | Open Graph tags on homepage(✅ via #1)+KC+urdu index+12 sub-lessons | 🟠 | Med | M | og:title/desc/image/type/locale |
| 11 | ⬜ | Canonical `<link>` on every page | 🟠 | Med | M | Needs production domain confirmed |
| 12 | ⬜ | 360px mobile tier + 320px overflow test | 🔴 | High | M | Add 360px media query; fix RTL overflow [VISUAL-CONFIRM] |
| 13 | ⬜ | Enforce 44×44px min tap targets (nav, footer pills, chips) | 🟠 | High | S | min-height/padding on interactive els |
| 14 | ⬜ | Certificate-on-completion wired in all 7 portals | 🟠 | High | M | Call `IFCore.certificate()` on level/quiz finish |
| 15 | ⬜ | `if-quiz` parity: add to Salah, Kids, Arabic, Urdu | 🟠 | High | M | Define `IF_QUIZ` + defer tag |
| 16 | ⬜ | `if-flashcards` parity: add to Urdu, Kids | 🟠 | Med | M | Define `IF_FLASHCARDS` decks |
| 17 | ⬜ | Arabic & Urdu progress dashboard (`if-arabic/urdu-progress`) | 🔴 | High | M | Reuse portal dashboard pattern |
| 18 | ⬜ | Arabic & Urdu daily challenge widget | 🟠 | Med | M | Reuse daily-challenge pattern |
| 19 | ⬜ | Client-side site search (prebuilt JSON index) | 🔴 | High | L | Index lessons/tools/terms; modal in `if-core` |
| 20 | ⬜ | `if-fx.js` engagement pack (reduced-motion safe) | 🟠 | High | M | Progress ring, correct pulse, level burst, badge pop |

## P1 — Learning parity, depth & consistency (80 → 88)

| # | Status | Item | Sev | Imp | Eff | Fix |
|--|--|--|--|--|--|--|
| 21 | ⬜ | Convert 12 Arabic/Urdu sub-lessons to interactive template | 🔴 | High | L | +quiz, +mark-complete, +next/prev, +exercise, +if-core |
| 22 | ⬜ | Unify design tokens into `if-shared.css :root` defaults | 🟠 | Med | M | Single source; pages override intentionally |
| 23 | ⬜ | Standardise `--radius` to one value (16px) | 🟡 | Low | S | Replace 14px usages |
| 24 | ⬜ | Standardise elevation scale (`--shadow-sm/md/lg`) | 🟡 | Low | S | Replace ad-hoc shadows |
| 25 | ⬜ | Shared breakpoint scale (e.g., 360/480/768/1024) | 🟠 | Med | M | Document + migrate media queries |
| 26 | ⬜ | Shared button primitives (`.if-btn`, variants) | 🟠 | Med | M | Reduce per-page drift |
| 27 | ⬜ | Shared card primitives (`.if-card`) | 🟠 | Med | M | Consistent radius/shadow/padding |
| 28 | ⬜ | Backfill Quran lessons to ~8–10 | 🟠 | Med | M | Makki/Madani, Stories of Quran, Names of Allah |
| 29 | ⬜ | Backfill Salah lessons (Jumu'ah, Witr/Sunan, Travel, Janazah, Eid) | 🟠 | Med | M | New `salah-lessons.js` entries |
| 30 | ⬜ | Backfill Seerah (Companions deep-dive, Farewell Hajj detail) | 🟡 | Med | M | New entries |
| 31 | ⬜ | Graded end-of-level exam (10 Qs) via `if-quiz` per portal | 🟠 | High | M | Pass score → certificate |
| 32 | ⬜ | Vary reflection prompts (currently formulaic) | 🟡 | Low | M | Author diverse prompts |
| 33 | ⬜ | "Continue learning / resume" CTA on portal heroes | 🟠 | Med | M | Read last-open lesson from localStorage |
| 34 | ⬜ | Global learner dashboard (aggregate XP/streak/progress) | 🟠 | High | L | New page or homepage widget |
| 35 | ⬜ | Streaks + XP on all portals (not just Kids) | 🟠 | High | M | Generalise Kids mission system |
| 36 | ⬜ | Persistent "All Portals" switcher in shared nav | 🟠 | Med | M | Dropdown in `if-core` nav |
| 37 | ⬜ | Breadcrumbs on islamic-knowledge + student-guidance | 🟡 | Med | S | Reuse breadcrumb markup |
| 38 | ⬜ | Real Hijrah route map (Seerah) | 🟠 | Med | L | SVG/illustrated map asset |
| 39 | ⬜ | Empire-expansion maps (Islamic History) | 🟠 | Med | L | Era maps |
| 40 | ⬜ | Five Pillars infographic | 🟠 | Med | M | Shared infographic component |
| 41 | ⬜ | Tajweed rules table/infographic (Quran) | 🟠 | Med | M | Visual rule chart |
| 42 | ⬜ | Wudu/Ghusl process-flow diagrams (Salah) | 🟠 | Med | M | Step flow via if-diagrams |
| 43 | ⬜ | `if-diagrams` parity: add to Arabic, Urdu, Kids | 🟡 | Med | M | Define `IF_DIAGRAMS` |
| 44 | ⬜ | Line-length cap (`max-width:64ch`) on lesson/sub-lesson bodies | 🟠 | Med | S | Reading comfort |
| 45 | ⬜ | Mobile "jump-to / on this page" chip bar (homepage, KC) | 🟠 | Med | M | Shorten perceived scroll |
| 46 | ⬜ | Collapse-by-default long sections on mobile | 🟠 | Med | M | Accordion for 81-card guidance |
| 47 | ⬜ | Finish Telugu `CB_TE[]` card bodies (student-guidance) | 🟠 | Med | L | Active work item A1 |
| 48 | ⬜ | Category quick-filter chips (student-guidance 81 cards) | 🟠 | Med | M | Filter by taxonomy token |
| 49 | ⬜ | Surface spaced-repetition (SRS) review CTA across portals | 🟠 | Med | M | "Review due" badge from `if-srs-*` |
| 50 | ⬜ | Sitemap.xml + robots.txt | 🟡 | Med | S | Static generation |

## P2 — Premium polish, visual learning & media (88 → 92)

| # | Status | Item | Sev | Imp | Eff | Fix |
|--|--|--|--|--|--|--|
| 51 | ⬜ | Animated progress rings/bars on dashboards | 🟡 | Med | M | via `if-fx` |
| 52 | ⬜ | Confetti/burst on certificate award | 🟡 | Med | S | reduced-motion safe |
| 53 | ⬜ | Correct-answer pulse + streak micro-feedback in quizzes | 🟠 | Med | M | `if-quiz` + `if-fx` |
| 54 | ⬜ | Badge/achievement unlock animation + badge shelf | 🟠 | Med | M | Define badge set per portal |
| 55 | ⬜ | Lesson-completion celebration | 🟠 | Med | S | On accordion-complete |
| 56 | ⬜ | Card hover/press micro-interactions (lift/scale) | 🟡 | Med | S | Shared `.if-card:hover` |
| 57 | ⬜ | Skeleton loaders for JS-rendered lists | 🟡 | Low | M | Quran surahs, vocab |
| 58 | ⬜ | Snap-scroll for journey/timeline carousels | 🟡 | Med | M | CSS scroll-snap |
| 59 | ⬜ | Bottom thumb-reach tab bar on portals (mobile) | 🟠 | Med | M | Lessons/Quiz/Progress/Refs |
| 60 | ⬜ | Real audio: Arabic letter pronunciation | 🟠 | High | L | Human recordings |
| 61 | ⬜ | Real audio: Urdu letter pronunciation | 🟠 | High | L | Human recordings |
| 62 | ⬜ | Real audio: common duas (Salah/Kids) | 🟠 | High | L | Human recordings |
| 63 | ⬜ | Multi-reciter Quran audio (beyond single sample) | 🟠 | Med | L | everyayah reciter switch |
| 64 | ⬜ | Video placeholder slots: salah demonstration | 🟠 | Med | M | Labelled slot + manifest |
| 65 | ⬜ | Video placeholder slots: letter pronunciation | 🟡 | Med | M | Slot + manifest |
| 66 | ⬜ | Letter-tracing interactive (Arabic/Urdu) | 🟠 | High | L | Canvas trace |
| 67 | ⬜ | Drag-to-match vocab exercise | 🟠 | Med | M | Shared interactive |
| 68 | ⬜ | Tap-the-correct-harakat exercise | 🟡 | Med | M | Shared interactive |
| 69 | ⬜ | Prophet-story storyboards (Kids) | 🟠 | Med | L | Illustrated panels |
| 70 | ⬜ | Wudu/Salah step illustrations | 🟠 | High | L | Figure art |
| 71 | ⬜ | `assets/media/MEDIA_MANIFEST.md` (every needed asset + slot) | 🟠 | Med | S | Drop-in pipeline |
| 72 | ⬜ | Word-by-word Quran view (begin) | 🟡 | Med | L | Corpus data |
| 73 | ⬜ | Zakat thresholds infographic (KC) | 🟡 | Med | M | Visual aid |
| 74 | ⬜ | Prayer-times logic infographic (KC) | 🟡 | Low | M | Visual aid |
| 75 | ⬜ | Makkah/Madinah geography map (Seerah) | 🟡 | Med | M | Map asset |
| 76 | ⬜ | Qiblah direction visual (Salah) | 🟡 | Low | M | Compass graphic |
| 77 | ⬜ | Names of Allah interactive grid | 🟡 | Med | M | 99 names cards |
| 78 | ⬜ | Hifz planner tool (Quran) | 🟠 | Med | M | Schedule + tracking |
| 79 | ⬜ | Pull-quotes / callout styling in lessons | 🟡 | Low | S | Shared `.ifl-callout` |
| 80 | ⬜ | Dark mode (token-based) | 🟡 | Med | L | `prefers-color-scheme` |

## P3 — Stretch & retention (92 → 95+)

| # | Status | Item | Sev | Imp | Eff | Fix |
|--|--|--|--|--|--|--|
| 81 | ⬜ | Accounts + cross-device sync (only if static relaxed) | 🟠 | High | L | Backend; replaces localStorage |
| 82 | ⬜ | Parent/teacher dashboard (Kids) | 🟠 | Med | L | Needs accounts |
| 83 | ⬜ | Pronunciation feedback (record/compare) | 🟡 | Med | L | Audio analysis |
| 84 | ⬜ | Leaderboards / class challenges | 🟡 | Low | L | Needs accounts |
| 85 | ⬜ | Email/streak reminder (push) | 🟡 | Low | L | PWA push |
| 86 | ⬜ | Offline lesson packs (PWA precache) | 🟡 | Med | M | Extend sw.js |
| 87 | ⬜ | Localisation beyond TE/EN (Urdu/Arabic UI) | 🟡 | Med | L | i18n expansion |
| 88 | ⬜ | A/B test hero CTAs | 🟡 | Low | M | Lightweight flagging |
| 89 | ⬜ | Analytics + learning funnel events | 🟠 | Med | M | Privacy-respecting |
| 90 | ⬜ | Performance: subset/preload fonts, defer non-critical CSS | 🟡 | Med | M | Faster first paint |
| 91 | ⬜ | Split very large inline pages (index 3.7k lines) | 🟡 | Low | L | Maintainability |
| 92 | ⬜ | Automated link-checker in CI | 🟡 | Low | M | Catch dead cross-links |
| 93 | ⬜ | Automated HTML/JS lint in CI | 🟡 | Low | M | Quality gate |
| 94 | ⬜ | Print stylesheets for lessons/certificates | 🟡 | Low | S | Clean print |
| 95 | ⬜ | Shareable lesson deep-links + share buttons | 🟡 | Med | M | Per-lesson anchors |
| 96 | ⬜ | "Did you know" rotating homepage widget | 🟡 | Low | S | Reuse glossary/facts |
| 97 | ⬜ | Onboarding tour (first visit) | 🟡 | Med | M | Coach marks |
| 98 | ⬜ | Accessibility audit pass (ARIA, contrast, SR labels) on sub-lessons & top pages | 🟠 | Med | M | WCAG AA |
| 99 | ⬜ | Scholar-review sign-off workflow on all religious content | 🔴 | High | L | Required before go-live |
| 100 | ⬜ | Real illustrations/brand artwork replacing all schematic SVG | 🟠 | High | L | Professional art pass |

---
### Completion log
**Audit pass (T25):** #1 ✅ · #2 ✅ · #3 ✅

**Phase A — Platform Standardization (T26, 2026-06-13):** delivered via new shared `assets/css/if-standard.css` + `assets/js/if-engage.js` on all 22 pages.
- ✅ **#22** unify tokens into shared CSS · ✅ **#23** `--radius`→16px (token-level) · ✅ **#24** elevation scale (`--shadow-sm/md/lg`) · ✅ **#26** shared `.ifx-btn` primitives · ✅ **#27** shared `.ifx-card` primitive · ✅ **#37** breadcrumbs on KC + Guidance · ✅ **#20** engagement pack infrastructure (`if-engage.js` + `.ifx-*` animation CSS, reduced-motion safe).
- ✅ Hero standardization (VISUAL V-B/V-C): Seerah/History script-title → family scale; Urdu section rhythm → `80px 5vw`.
- ◐ **#4** top-3 pages — now share the *standardization + engagement* layer; full `if-core` (refs/glossary/PWA) still pending.
- ◐ **#13** tap targets — global `min-height:44px` on buttons at ≤600px; per-page nav/footer enforcement pending.
- ◐ **#25** breakpoints — explicit 320/360/380 layer added centrally; per-page migration pending.
- ◐ Engagement infra ready for **#33/#35 (continue-learning)** and **UX recently-visited** — wiring is Phase B.

**Residual drift logged (low risk):** hardcoded `border-radius:14px` in sub-lesson `.lnav` (12 files); Urdu still on the older `.lu-*` hero template (vs `.al-*`); a few one-off container widths not yet snapped to 1140.

**Phase B — Portal Parity + Engagement (T27, 2026-06-13):** new shared `assets/js/if-portal.js` dashboard + `.ifp-*` CSS; `if-quiz.js` enhanced (celebration + correct pulse).
- ✅ **#15** quiz engine → added to Arabic, Urdu, Salah (now 6/7 portals; Kids has own widget) · ✅ **#16** flashcards → added to Urdu · ✅ **#17** progress dashboard → Arabic & Urdu · ✅ **#18** daily challenge → Arabic & Urdu · ✅ **#7** recommended-next → Arabic & Urdu · ✅ completion tracking, streaks, progress rings, achievement badges, continue-learning → Arabic & Urdu (via if-portal).
- ✅ **#52** confetti on completion · ✅ **#53** correct-answer pulse (both via if-quiz, all portals) · ✅ **#33/#36** continue-learning + recently-visited (surfaced in Arabic/Urdu dashboards; homepage surfacing → Phase C).
- ◐ **#14** certificate-on-completion → done for Arabic/Urdu (all-complete screen) + all quiz portals (quiz cert); model-portal *lesson*-completion cert still pending.
- ◐ **#43** if-diagrams → still missing on Arabic/Urdu/Kids.
- Still open: **#21** sub-lesson interactivity · **#19** site search · model-portal dashboards onto shared ring/badge system · homepage continue-learning surfacing.

**Phase C (T28–T29, 2026-06-13):**
- ✅ Homepage continue-learning resume (`if-resume.js`).
- ✅ **#21** 12 sub-lessons → interactive (quiz + completion→portal progress + reflection + recommended-next + celebration) via `if-sublesson.js` + `sublesson-data.js`.
- ✅ **#19** site-wide search (`if-search.js`, "/" shortcut, mobile modal, 43-entry index, all 22 pages).
- ✅ **#71 + media infra** media placeholder system (`if-media.js`, 10 types, real-asset-ready via `data-src`); live pronunciation/audio slots on alphabet/harakat sub-lessons.
- ◐ **#38–#43 visual learning** — mind maps/timelines exist + media slots available; `if-diagrams` parity (Arabic/Urdu/Kids) queued.
- ◐ depth backfill (#28–#30) queued; model-portal dashboard unification queued.

**Phase C cont. (T30):** ✅ continue/recently-visited on the 5 model portals (`if-recent.js`); ✅ Visual Learning placeholder layer on all 7 portals (`if-visuals.js` + `visuals-data.js`) covering Tajweed chart, Hifz planner, prayer-flow, Hijrah/civilisation maps, dynasty timeline, scholar diagram, storyboards, etc. (option-a placeholders, real assets via `data-src`).

**Overall score estimate: 72 → ~81 (A/B) → ~86 (C core) → ~88 (parity+visual) → ~90 (apply+diagrams) → ~91 (XP+depth blocks) → ~92.5/100.** Universal per-lesson completion + XP; Learner Profile with achievements gallery + learning roadmap (completion-% by portal); lesson engine supports Common Mistakes / FAQ / Revision (live on Salah); "Apply It" on all 46 lessons; diagram parity on all 7 portals.

> **Next (no decision needed):** `if-diagrams` parity (Arabic/Urdu/Kids) · per-portal lesson backfill to ~8–10 · per-lesson quality scoring. **Needs assets:** real maps/audio/illustrations → drop into the Visual Learning `data-src` slots. **Needs render:** true 320–430px device pass.
