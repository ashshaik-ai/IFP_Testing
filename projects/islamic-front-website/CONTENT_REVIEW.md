# CONTENT_REVIEW.md — Scholar review register

All religious lesson content is **AI-drafted** and **must be verified by a qualified scholar before go-live** (see [CONTENT_STANDARDS.md](CONTENT_STANDARDS.md) §3). This is the tracking register and workflow.

## How to mark a lesson reviewed
Add a `reviewed` field to the lesson object in its `assets/data/<portal>-lessons.js` entry:
```js
reviewed: { by: 'Mufti / Sheikh Name', date: '2026-07' }
```
`if-lesson.js` then renders a **"✓ Scholar-reviewed · <name> · <date>"** badge at the top of that lesson. With no `reviewed` field, no badge shows (honest absence). Go-live is gated on **all Tier 1** lessons reviewed.

## Risk tiers (review in this order)
**Tier 1 — Fiqh & Aqeedah (highest risk; rulings/creed). Review FIRST.**
| Portal | Lessons | Why |
|---|---|---|
| Learn Salah | why, wudu, ghusl, howtopray, fiveprayers, khushu (6) | Validity of worship, purity rulings, rakah counts |
| Learn Quran | whatis, begin, tajweed, hifz, tafseer, adab (6) | Tajweed rules, tafseer meaning, adab of the Mushaf |
| Kids Islam | k1 (beliefs/Allah & Prophet ﷺ), k5 (salah/Quran basics) (2) | Core aqeedah + worship taught to children |

**Tier 2 — Historical / biographical narrative (accuracy of events, dates, names).**
| Portal | Lessons |
|---|---|
| Seerah | all 6 (before-prophethood → legacy) |
| Islamic History | all 10 (prearabia → modern) |
| Kids Islam | k3 (duas), k4 (prophet stories) |

**Tier 3 — Language & general (lower doctrinal risk).**
| Portal | Lessons |
|---|---|
| Learn Arabic | all 6 · Learn Urdu | all 6 |
| Kids Islam | k2 (manners), k6 (leadership) |

## What each review should confirm
- **Accuracy** of every factual/ruling claim; flag anything disputed or madhhab-specific (note the position taken).
- **Citations:** Tier 1 lessons should attribute the specific ayah/hadith for each ruling (add to `refs`/`cite` or inline).
- **Honorifics & adab** per CONTENT_STANDARDS (ﷺ / AS / RA).
- **Quiz/section-check answers** are correct.
- **Balanced, non-sectarian, non-political** tone.

## Status (fill in as reviews complete)
| Lesson | Tier | Status | Reviewer | Date |
|---|---|---|---|---|
| salah/wudu | 1 | ⬜ pending | | |
| salah/ghusl | 1 | ⬜ pending | | |
| salah/howtopray | 1 | ⬜ pending | | |
| salah/fiveprayers | 1 | ⬜ pending | | |
| salah/why · khushu | 1 | ⬜ pending | | |
| quran/tajweed · hifz · tafseer · adab | 1 | ⬜ pending | | |
| quran/whatis · begin | 1 | ⬜ pending | | |
| kids/k1 · k5 | 1 | ⬜ pending | | |
| seerah (×6) | 2 | ⬜ pending | | |
| islamic-history (×10) | 2 | ⬜ pending | | |
| kids/k3 · k4 | 2 | ⬜ pending | | |
| arabic (×6) · urdu (×6) | 3 | ⬜ pending | | |
| kids/k2 · k6 | 3 | ⬜ pending | | |

> Reviews can be batched by topic. Once a Tier-1 batch is signed off, add `reviewed:{by,date}` to those lessons and tick the row. Sub-lesson quizzes (`sublesson-data.js`) and flashcards are recall/factual and lower-risk, but a quick accuracy pass is advisable.
