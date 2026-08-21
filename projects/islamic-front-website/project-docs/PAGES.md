# PAGES.md

> Inventory of every page, its sections/anchors, and which subsystems it uses. Orientation: [../CLAUDE.md](../CLAUDE.md).

---

## Top-level pages

### `index.html` — Homepage (community / political) · ~2,135 lines
- **i18n:** System A (dictionary `const T`, `data-key`). ~218 keyed elements. See [HOMEPAGE.md](HOMEPAGE.md).
- **Sections (anchors):** `#home` (hero), `#victory` (2023 election), `#achievements`, `#manifesto`, `#scheme` (funeral aid), `#infra`, `#about` (founder), `#contact`, `#knowledge` (KC promo).
- **Nav targets:** Our Victory, Achievements, Manifesto, About, Contact + pills to `student-guidance.html` and `islamic-knowledge.html`.
- **JS:** language engine, nav drawer + scroll-spy (`TRACKED_IDS`), reveal animations, animated counters, manifesto ring arcs, back-to-top.
- **Content of record:** founder, dates, election result, manifesto — see [COMMUNITY_SCHEMES.md](COMMUNITY_SCHEMES.md).

### `islamic-knowledge.html` — Islamic Knowledge Center · ~2,522 lines
- **i18n:** System B (`data-te`/`data-en`).
- **Sections (anchors):** `#learn-arabic`, `#learn-urdu` (portal entries), `#basics`, `#pillars`, `#wudu`, `#salah-guide`, `#salah` (prayer times), `#zakat`, `#quran`, `#hadith`, `#guides`, `#akhlaq`, `#modern-life`, `#quran-science`, `#faqs`.
- **Interactive tools:** Zakat calculator, daily prayer times (browser-computed, Karachi method), next-prayer countdown, step-through wudu guide, step-through salah guide.
- **Navigation:** `.kc-jump` (hero quick links) + `.kc-sticky` sticky sub-nav with `data-spy` scroll-spy.
- Details: [KNOWLEDGE_CENTER.md](KNOWLEDGE_CENTER.md).

### `student-guidance.html` — Student career guidance · ~1,682 lines
- **i18n:** System B + parallel arrays `CH[]` (card headers) and `CB_TE[]` (card bodies, in progress).
- **Sections:** 13 sections — intro/self-assessment, §2 After 10th (cards 0–11), §3 After MPC (12–23), §4 After BiPC (24–36), §5 Commerce (37–46), §6 Arts (47–56), §7 Entrance Exams (57–65), §8 Govt Jobs (66–74), §9 Reality table, §10 Passion vs Career, §11 Scholarships (75–80), §12 Islamic perspective, §13 Success stories.
- **81 expandable cards** total, indexed by DOM order (the `CH[]`/`CB_TE[]` contract).
- **JS:** accordion (event delegation), live search/filter across cards, language engine, back-to-top, self-assessment checkboxes (keyboard accessible).
- **Best SEO of the set** (has `keywords`, `robots`, partial OG). See [SEO.md](SEO.md).

---

## Arabic portal — `knowledge-center/learn-arabic/`

### `index.html` — Arabic portal landing · ~1,022 lines
- Roadmap of **levels** → lesson links (`.ll` anchors) into the lesson pages with deep anchors (e.g. `alphabet.html#pronunciation`).
- Hero with Arabic calligraphy (`تعلُّم العربية`), stat chips (Levels / Lessons / Quran Words / Free).
- Sticky portal sub-nav.

### Lessons (6)
| File | Lines | Focus | Key anchors |
|---|---|---|---|
| `alphabet.html` | 409 | 28 letters, forms | `#pronunciation`, `#forms` |
| `harakat.html` | 470 | short vowels/diacritics | — |
| `vocabulary.html` | 381 | core words | — |
| `daily-arabic.html` | 467 | phrases/conversation | `#phrases`, `#expressions`, `#conversations` |
| `quranic-arabic.html` | 546 | Quran words/roots/verses | `#words`, `#roots`, `#verses` |
| `grammar.html` | 499 | nouns/verbs/sentences | `#nouns`, `#verbs`, `#sentences` |

- **RTL:** Arabic in `Amiri`, `lang="ar" dir="rtl"`. See [RTL_SUPPORT.md](RTL_SUPPORT.md).
- **Nav:** fixed nav 68px + sticky `tab-nav` (top 68px); `scroll-margin-top: 114px`.

---

## Urdu portal — `knowledge-center/learn-urdu/`

### `index.html` — Urdu portal landing · ~1,015 lines
- Mirror of the Arabic portal structure (levels → lessons), Urdu calligraphy in hero.

### Lessons (6)
| File | Lines | Focus |
|---|---|---|
| `alphabet.html` | 547 | 38 Urdu letters (Nastaliq) |
| `reading-basics.html` | 351 | Level 2 reading |
| `writing-skills.html` | 386 | writing |
| `advanced-reading.html` | 404 | advanced reading |
| `daily-urdu.html` | 606 | daily phrases |
| `islamic-urdu.html` | 360 | Islamic Urdu |

- **RTL:** Urdu in `Noto Nastaliq Urdu`, `lang="ur" dir="rtl"` (needs taller line-height). See [RTL_SUPPORT.md](RTL_SUPPORT.md).
- **Nav:** fixed `.al-nav` 68px **+** fixed `.lesson-nav` 46px; `tab-nav`/anchors offset to `114px`; hero padding-top `154px`. This two-fixed-bar layout is the Urdu-lesson signature ([NAVIGATION.md](NAVIGATION.md)).

---

## Non-page assets

| Path | Purpose |
|---|---|
| `rates.json` | gold/silver per-gram INR for Zakat — auto-updated ([AUTOMATION_RATES.md](AUTOMATION_RATES.md)) |
| `assets/logo*.png`, `logo_2.jpg` | brand logos (note `*.png.png` doubles) |
| `assets/founder/` | founder photos |
| `assets/candidates/` | 7 candidate photos (election) |
| `assets/Islamic_Front_Manifesto.pdf` | downloadable manifesto |
| `scripts/update-rates.mjs` | rates fetcher (Node 18+) |
| `.github/workflows/update-rates.yml` | daily rates cron |

---

## Cross-page navigation graph

```
index.html ⇄ islamic-knowledge.html ⇄ student-guidance.html
                     │
        ┌────────────┴────────────┐
   learn-arabic/index       learn-urdu/index
        │                          │
   6 Arabic lessons          6 Urdu lessons  (deep-anchored from portal levels)
```
Every page links back to Home and the Knowledge Center; portals link back to KC.
