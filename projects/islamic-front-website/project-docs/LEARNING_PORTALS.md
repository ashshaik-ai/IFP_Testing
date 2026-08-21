# LEARNING_PORTALS.md — Arabic, Urdu & Quran

> The three structured learning portals under `knowledge-center/`. All share a layout pattern and use **localization System B** (`data-te`/`data-en`); they differ in script, font, and nav structure. Orientation: [../CLAUDE.md](../CLAUDE.md). RTL: [RTL_SUPPORT.md](RTL_SUPPORT.md).

---

## 1. Shared portal pattern

Each portal is a **landing `index.html` + 6 lesson pages**. The landing page presents a **levels roadmap**; each level lists lessons as `.ll` anchor links that deep-link into lesson pages (e.g. `alphabet.html#forms`). Common elements:
- Premium hero with script **calligraphy** and **stat chips** (Levels / Lessons / Words / Free).
- Sticky portal sub-nav.
- Back links to Knowledge Center and Home.
- Bilingual Telugu/English UI on every string.

> The Arabic, Urdu, and Quran portals were built from a shared reference design ("HERO — PREMIUM (reference design, shared with Urdu portal)"). Keep them visually in parity; a change to one usually belongs in the others.

---

## 2. Arabic portal — `knowledge-center/learn-arabic/`

| File | Focus |
|---|---|
| `index.html` | Levels roadmap, hero `تعلُّم العربية` |
| `alphabet.html` | 28 letters + `#pronunciation`, `#forms` |
| `harakat.html` | short vowels / diacritics |
| `vocabulary.html` | core vocabulary |
| `daily-arabic.html` | `#phrases`, `#expressions`, `#conversations` |
| `quranic-arabic.html` | `#words`, `#roots`, `#verses` |
| `grammar.html` | `#nouns`, `#verbs`, `#sentences` |

- **Script/font:** Arabic in **`Amiri`**, `lang="ar" dir="rtl"`, line-height ~1.5–1.7.
- **Nav:** fixed top `nav` (68px) + **sticky** `tab-nav` (`top: 68px`, not a second fixed bar). Anchored sections use `scroll-margin-top: 114px`. Hero padding-top ≈ `108px`.
- **Tables:** pair an Arabic cell (`.td-ar`) with a transliteration cell (`.td-tr`).

---

## 3. Urdu portal — `knowledge-center/learn-urdu/`

| File | Focus |
|---|---|
| `index.html` | Levels roadmap, Urdu calligraphy hero |
| `alphabet.html` | 38 Urdu letters |
| `reading-basics.html` | Level 2 reading |
| `writing-skills.html` | writing |
| `advanced-reading.html` | advanced reading |
| `daily-urdu.html` | daily phrases |
| `islamic-urdu.html` | Islamic Urdu |

- **Script/font:** Urdu in **`Noto Nastaliq Urdu`**, `lang="ur" dir="rtl"`, **taller** line-height (~2.0–2.2) — Nastaliq stacks vertically.
- **Nav (signature difference):** **two fixed bars** — `.al-nav` (68px) **and** a fixed `.lesson-nav` (46px) showing the current level + prev/next lesson buttons. Therefore:
  - any sticky `tab-nav` sits at `top: 114px`,
  - anchored sections use `scroll-margin-top: 114px`,
  - hero padding-top ≈ `154px` (68 + 46 + 40).
- **Brand fallback:** nav logo `<img>` + paired inline SVG with **page-unique IDs** (`nav-svg-ur-al`, `nav-svg-ur-rb`, …). Keep IDs unique when cloning.

---

## 3.5 Quran portal — `knowledge-center/learn-quran/`

A single self-contained `index.html` (no separate lesson pages yet). Built as the **third sibling**, cloning the **Arabic nav model** (one fixed nav 68px + sticky `al-sticky` at `top:68px`; **not** Urdu's two-bar model). Hero `القرآن الكريم` in Amiri.

| Section (`id`) | Content |
|---|---|
| `#home` | Hero — "Learn Quran", subtitle, stats (6 Levels / 40+ Topics / 8 Surahs / Free) |
| `#why` | Why Learn the Quran — 3 `why-card`s |
| `#journey` | **Quran Learning Journey** roadmap — 6 nodes (Reading → Harakat → Tajweed → Mastery → Hifz → Tafseer) |
| `#levels` | 6 `lc` level cards; bodies use **syllabus chips** (`.lc-topics`/`.lc-topic`) + a **Goal** callout (`.lc-goal`) instead of `.ll` deep-links (no lesson pages exist) |
| `#surahs` | **Featured Surahs** — 8 `surah-card`s rendered by JS from `SURAHS[]`; Learn/Tafseer/Memorize buttons scroll to `#lc4`/`#lc6`/`#lc5` |
| `#challenge` | **Daily Quran Challenge** — gamified checklist + streak/badges persisted in `localStorage['if-quran-challenge']` (daily reset), Ayah-of-the-day + motivation |
| `#knowledge` | Quran Knowledge Center — 8 `why-card`s |
| `#coming` | All Islamic Learning Modules grid (Quran = "You Are Here") |

- **New JS state:** `localStorage['if-quran-challenge']` `{date,done[4],streak,best,total,lastComplete}` — separate from the shared `if-lang` key.
- **Surahs/challenge/ayah/motivation re-render on language toggle** (called inside `applyLang`).
- Arabic & Urdu portal "Modules" grids now link to it as **Available Now** (was "Coming Soon"); KC hub (`islamic-knowledge.html`) lists it in the portals promo grid + footer.

---

## 3.6 Salah portal — `knowledge-center/learn-salah/`

A single self-contained `index.html`. Built as the **fourth sibling**, cloning the **Quran portal** (Arabic nav model: one fixed nav 68px + sticky `al-sticky` at `top:68px`). Hero `الصَّلَاة` in Amiri. Unique nav SVG id `nav-svg-sl`.

| Section (`id`) | Content |
|---|---|
| `#home` | Hero — "Learn Salah" / "Prayer Steps, Duas, and Conditions", stats (6 Levels / 8 Prayer Steps / 8 Prayers / Free) |
| `#why` | Why Learn Salah — 3 `why-card`s |
| `#journey` | **Salah Learning Journey** roadmap — 6 nodes (Foundations → Taharah → Wudu → Ghusl & Prep → Prayer Steps → Duas & Advanced) |
| `#levels` | 6 `lc` level cards (syllabus chips + Goal callout). **Level 5** holds the bespoke **`.salah-steps`** component — 8 static `.ss-step` rows (Takbir→Qiyam→Fatihah→Ruku→Sujood→Jalsa→Tashahhud→Salam), each Arabic + transliteration + translation. `#lc5.lc-open .lc-body` max-height bumped to 3600px. |
| `#guide` | **Interactive Salah Guide** — 8 prayer cards rendered by JS from `PRAYERS[]` (reuses `.surah-*` + new `.surah-meta` for rakats/timing); Learn/Steps buttons scroll to `#lc5` |
| `#challenge` | **Daily Salah Challenge** — gamified checklist (Pray all 5 / Learn 1 Dua / Revise 1 step / Improve Khushu) + streak/badges in `localStorage['if-salah-challenge']` (daily reset), Dua-of-the-day (`DUAS[]`) + motivation |
| `#mistakes` | **Common Mistakes** — 5 static `.miss-card`s (Wudu / Salah / Posture / Recitation / Concentration), each with ✗ mistake → ✓ correction rows |
| `#knowledge` | Salah Knowledge Center — 8 `why-card`s |
| `#coming` | All Islamic Learning Modules grid (Salah = "You Are Here") |

- **New JS state:** `localStorage['if-salah-challenge']` `{date,done[4],streak,best,total,lastComplete}` — separate from `if-lang`.
- **Prayers/challenge/dua/motivation re-render on language toggle** (called inside `applyLang`).
- **New CSS namespaces vs. Quran template:** `.salah-steps`/`.ss-*` (prayer steps), `.surah-meta` (prayer rakats/timing chips), `.miss-*` (common-mistakes cards).
- Quran, Arabic & Urdu portal "Modules" grids now link to it as **Available Now**; KC hub lists it in the portals promo grid + footer.

---

## 3.7 Seerah portal — `knowledge-center/seerah/`

A single self-contained `index.html`. Built as the **fifth sibling**, cloning the **Salah portal** (Arabic nav model). Hero `السِّيرَة النَّبَوِيَّة` in Amiri (smaller clamp — the phrase is long). Unique nav SVG id `nav-svg-sr`. Note: H1 is just the title (`Seerah`/`సీరా`); the descriptive subtitle lives in `.al-hero-lead`.

| Section (`id`) | Content |
|---|---|
| `#home` | Hero — "Seerah" / "Life of the Prophet ﷺ", stats (6 Levels / 10 Key Events / 8 Character Traits / Free) |
| `#why` | Why Study the Seerah — 3 `why-card`s |
| `#journey` | **Seerah Learning Journey** roadmap — 6 nodes (Before Prophethood → Revelation → Makkah → Hijrah & Madinah → Events & Battles → Character & Legacy) |
| `#levels` | 6 `lc` level cards (syllabus chips + Goal callout) matching the 6 Seerah periods |
| `#timeline` | **Interactive Seerah Timeline** — 10 event cards rendered by JS from `EVENTS[]` (reuses `.surah-*`; year in the `.surah-no` badge + a `.tl-lesson` key-lesson callout); each "Learn More" scrolls to its level (`lvl`) |
| `#character` | **Character of the Prophet ﷺ** — 8 trait cards rendered by JS from `CHAR[]` (reuses `.surah-*` + new `.char-apply` "how to practise" callout) |
| `#challenge` | **Daily Seerah Challenge** — gamified checklist (Learn 1 event / Read 1 story / Practice 1 Sunnah / Reflect on 1 lesson) + streak/badges in `localStorage['if-seerah-challenge']` (daily reset), Reflection-of-the-day (`REFLECT[]`, Quran ayat + hadith) + motivation |
| `#knowledge` | Seerah Knowledge Center — 8 `why-card`s |
| `#coming` | All Islamic Learning Modules grid (Seerah = "You Are Here") |

- **New JS state:** `localStorage['if-seerah-challenge']` `{date,done[4],streak,best,total,lastComplete}` — separate from `if-lang`.
- **Timeline/character/challenge/reflection/motivation re-render on language toggle** (called inside `applyLang`).
- **New CSS namespaces vs. Salah template:** `.tl-lesson` (timeline key-lesson callout), `.char-apply` (character practical-application callout); `.char-sec` shares the `.surah-*` card chrome on a cream background. The `.salah-steps`/`.ss-*`/`.miss-*`/`.surah-meta` rules were dropped (not used here).
- Salah, Quran, Arabic & Urdu portal "Modules" grids now link to it as **Available Now**; KC hub lists it in the portals promo grid (section renamed **Learning Portals**) + footer.

---

## 3.8 Islamic History portal — `knowledge-center/islamic-history/`

A single self-contained `index.html`. Built as the **sixth sibling**, cloning the **Seerah portal** (Arabic nav model; timeline + people-card pattern). Hero `التَّارِيخُ الإِسْلَامِيّ` in Amiri. Unique nav SVG id `nav-svg-ih`. localStorage key `if-history-challenge`. This portal has **two** JS-rendered card sections plus a static contributions grid, so the sticky nav carries 8 spy links (it scrolls horizontally).

| Section (`id`) | Content |
|---|---|
| `#home` | Hero — "Islamic History" / "From the Caliphate to the Modern Era", stats (6 Levels / 9 Key Eras / 10 Personalities / Free) |
| `#why` | Why Study Islamic History — 3 `why-card`s |
| `#journey` | **Islamic History Learning Journey** roadmap — 6 nodes (Rashidun → Empires → Golden Age → Muslim Powers → Colonial Era → Lessons) |
| `#levels` | 6 `lc` level cards (syllabus chips + Goal callout); Level 1 & 3 carry an extra chip group (the four Caliphs / the key scholars) |
| `#timeline` | **Interactive History Timeline** — 9 era cards rendered by JS from `EVENTS[]` (reuses `.surah-*`; time period in the `.surah-no` badge + a `.tl-lesson` callout); each "Learn More" scrolls to its level (`lvl`) |
| `#personalities` | **Great Muslim Personalities** — 10 figure cards rendered by JS from `PEOPLE[]` (reuses `.surah-*` + `.char-apply` "Legacy" callout) |
| `#civilization` | **Islamic Civilization & Contributions** — 8 **static** `why-card`s (Mathematics, Medicine, Astronomy, Architecture, Education, Libraries, Trade, Governance) |
| `#challenge` | **Daily History Challenge** — checklist (Learn 1 event / Study 1 scholar / Discover 1 contribution / Reflect on 1 lesson) + streak/badges in `localStorage['if-history-challenge']`, Reflection-of-the-day (`REFLECT[]`, Quran + hadith) + motivation |
| `#knowledge` | History Knowledge Center — 8 `why-card`s |
| `#coming` | All Islamic Learning Modules grid (Islamic History = "You Are Here") |

- **New JS state:** `localStorage['if-history-challenge']` `{date,done[4],streak,best,total,lastComplete}`.
- **Timeline/personalities/challenge/reflection/motivation re-render on language toggle**; the civilization grid is static `data-te`/`data-en`.
- Reuses the Seerah CSS namespaces (`.tl-lesson`, `.char-apply`, `.char-sec` on the `.surah-*` chrome) unchanged — no new component CSS.
- Seerah, Salah, Quran, Arabic & Urdu portal "Modules" grids now link to it as **Available Now**; KC hub lists it in the portals promo grid + footer.

---

## 3.9 Kids' Islam portal — `knowledge-center/kids-islam/`

A single self-contained `index.html` for **children aged 5–15**. Built as the **seventh sibling**, cloning the Islamic History/Seerah structure but **brightened for kids**: a 6-colour accent palette (`--kc1..--kc6`) cycled across `why-card` accents and `lc-num` chips, a playful emoji hero (`🕌` with a bob animation + `⭐🌙⭐`) replacing the Arabic-only calligraphy display, rounded pill buttons, emoji roadmap dots, and friendly bilingual copy. Unique nav SVG id `nav-svg-ki`. Two localStorage keys: `if-kids-challenge` and `if-kids-quiz`.

| Section (`id`) | Content |
|---|---|
| `#home` | Hero — "Kids' Islam" / "Islamic Education for Children" ("Ages 5–15" badge), emoji display, stats (6 Levels / 7 Prophet Stories / 5 Quizzes / Free) |
| `#why` | Let's Learn Islam! — 3 `why-card`s |
| `#journey` | **My Islam Adventure** roadmap — 6 emoji nodes (My First Islam → Good Manners → Daily Duas → Prophet Stories → Salah & Quran → Young Leader) |
| `#levels` | 6 `lc` level cards (emoji `lc-num`, syllabus chips + Goal callout) matching the 6 kid levels |
| `#stories` | **Interactive Prophet Stories** — 7 cards rendered by JS from `PROPHETS[]` (reuses `.surah-*` + a kid emoji avatar `.kid-ava`, per-card colour via `--ka`, `.tl-lesson` callout); "Learn More" → `#lc4` |
| `#quiz` | **Islamic Quiz Corner** — a self-contained interactive multiple-choice quiz: category chips (All/Prophets/Salah/Duas/Manners/Quran), one question at a time from `QUIZ[]`, answer feedback (correct/wrong styling), **+10 points** per correct, rank emoji, and best score in `localStorage['if-kids-quiz']` |
| `#challenge` | **Daily Islamic Challenge** — checklist (Learn 1 dua / Read 1 story / Do 1 good deed / Memorize 1 ayah) + streak/reward badges in `localStorage['if-kids-challenge']`, "Today's Golden Words" (`REFLECT[]`) + kid motivation |
| `#knowledge` | Kids' Knowledge Center — 8 `why-card`s (Why We Pray, Why We Fast, Loving Parents, …) |
| `#coming` | All Islamic Learning Modules grid (Kids' Islam = "You Are Here") |

- **New JS:** `renderQuiz`/`answerQuiz`/`nextQuiz` quiz engine (state: `quizCat`, `quizPool`, `quizPos`, `quizPoints`, `quizAnswered`); `renderStories`; standard challenge/reflect/mot. All re-render on language toggle (`buildPool()` runs once before `applyLang` on boot).
- **New CSS:** `--kc1..--kc6` palette, `.kid-hero-emoji`/`.kid-hero-stars` (+ `kidBob`/`kidTwinkle` keyframes), `.kid-ava`, `.quiz-*` widget styles, `why-card`/`lc-num` nth-child colour cycling. Footer brand uses an emoji trio instead of Arabic.
- With this portal live, the only remaining "Coming Soon" module is **Duas & Adhkar**. All six prior portals + the KC hub link to it as **Available Now**.

---

## 4. Lesson page anatomy (Arabic & Urdu portals)

```
[fixed nav 68px]
[(_Urdu only:_) fixed lesson-nav 46px  |  (_Arabic:_) sticky tab-nav]
[hero: lesson title + script calligraphy]
[content: letter/word tables, example blocks, conjugation/pattern blocks]
[prev/next lesson navigation]
[footer]
```
RTL script always wrapped in `lang`+`dir`+font spans; transliteration and Telugu/English gloss alongside. See [RTL_SUPPORT.md](RTL_SUPPORT.md).

---

## 5. Localization

- System B inline `data-te`/`data-en` on all UI strings.
- **Known quirk:** portal pages initialise `<html lang="en">` and render English-first, even though the site default is Telugu. Keep both attributes on every string; don't flip the initial `lang` without also converting the visible defaults. See [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) §6 and [DECISIONS.md](DECISIONS.md).

---

## 6. Gotchas

- **Don't switch the whole page to `dir="rtl"`** — only the script spans flip.
- **Urdu line-height** must stay generous or Nastaliq glyphs clip.
- **Keep Arabic vs Urdu nav offsets distinct** (Arabic: sticky tab-nav at 68; Urdu: second fixed bar → 114). Mixing them breaks anchor landing.
- **Cross-portal parity:** apply structural fixes to both portals.

---

## 7. Related docs
- [RTL_SUPPORT.md](RTL_SUPPORT.md) · [NAVIGATION.md](NAVIGATION.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md)
