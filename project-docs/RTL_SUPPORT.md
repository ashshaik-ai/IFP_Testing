# RTL_SUPPORT.md

> How right-to-left Arabic and Urdu script is rendered inside otherwise left-to-right pages. Orientation: [../CLAUDE.md](../CLAUDE.md). Portal context: [LEARNING_PORTALS.md](LEARNING_PORTALS.md).

---

## 1. Core principle: RTL is per-element, not per-page

The pages stay **LTR**. Only the spans/cells containing Arabic or Urdu script are flipped to RTL. This keeps the Telugu/English UI, layout, and navigation untouched while displaying authentic script.

Every RTL element needs **three** things:
1. `lang` — `ar` (Arabic) or `ur` (Urdu)
2. `dir="rtl"`
3. the correct **font** — `Amiri` for Arabic, `Noto Nastaliq Urdu` for Urdu

```html
<!-- Arabic -->
<span class="lesson-ar" lang="ar" dir="rtl">قواعد النحو</span>

<!-- Urdu -->
<span class="l-hero-ur" lang="ur" dir="rtl">اردو</span>
```

---

## 2. Fonts

| Script | Font (Google Fonts) | Line-height | Notes |
|---|---|---|---|
| Arabic | **Amiri** (400/700), serif | ~1.5–1.7 | Naskh-style; clean for Quranic text |
| Urdu | **Noto Nastaliq Urdu** (400/700), serif | **~2.0–2.2** | Nastaliq cascades vertically — needs tall line-height or glyphs clip |

Load the script font **only on pages that use it** (Arabic lessons add Amiri; Urdu lessons add Nastaliq) — see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §2. `islamic-knowledge.html` includes Arabic snippets (prayer/wudu) and loads Amiri.

---

## 3. Recurring RTL component classes

Arabic (lesson pages):
- `.lesson-ar` — big lesson-title script
- `.td-ar` — Arabic table cell (paired with `.td-tr` transliteration)
- `.ex-ar` — example sentence
- `.conj-root`, `.conj-ar` — conjugation blocks
- `.pattern-example-ar`, `.pb-ar` — grammar pattern blocks

Urdu (lesson pages):
- `.l-hero-ur` — hero script
- `.lt-letter`, `.dp-letter`, `.dp-form-letter` — letter displays
- `.uq-letter` — quiz/letter cells
- `.pron-table td:first-child` — pronunciation table script cell

All set `direction: rtl` (and usually `text-align: right`/`center`) in the page CSS.

---

## 4. Pairing script with gloss

Teaching tables and example blocks consistently show:
```
[ RTL script cell ]  +  [ transliteration ]  +  [ Telugu/English meaning ]
```
e.g. `<td><span class="td-ar" lang="ar" dir="rtl">مُسْلِم</span><div class="td-tr">muslim</div></td>`.
Keep this triplet pattern so learners get script + pronunciation + meaning together.

---

## 5. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Wrap each script run in `lang`+`dir`+font | Set `dir="rtl"` on `<body>`/`<html>` |
| Give Urdu generous line-height | Reuse Arabic line-height for Urdu (clips) |
| Keep transliteration + gloss beside script | Show bare script with no pronunciation |
| Load only the needed script font | Load both Amiri + Nastaliq everywhere |
| Use `Amiri` for Quranic Arabic | Substitute a non-Arabic serif |

---

## 6. Punctuation & numerals

Content uses Western/standard punctuation and Arabic-Indic where authored; don't normalise script text. Inside Telugu/English sentences, embedded Arabic terms still get their own `lang="ar" dir="rtl"` span when shown in script (otherwise transliterated into Telugu/Latin — see [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) §8).

---

## 7. Testing RTL changes

- Confirm the script renders **right-to-left** and joins correctly (especially Urdu Nastaliq — initial/medial/final forms).
- Confirm surrounding Telugu/English/Latin is **unaffected** (still LTR).
- Check line-height: no vertical clipping of Nastaliq.
- Verify the correct font actually loaded (no fallback serif).

---

## 8. Related docs
- [LEARNING_PORTALS.md](LEARNING_PORTALS.md) · [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [KNOWLEDGE_CENTER.md](KNOWLEDGE_CENTER.md)
