# LOCALIZATION_RULES.md

> Daily i18n rules. Full mechanics, code, and edge cases: [project-docs/LOCALIZATION.md](project-docs/LOCALIZATION.md). RTL: [project-docs/RTL_SUPPORT.md](project-docs/RTL_SUPPORT.md).

---

## 1. The basics

- **Telugu (`te`) default, English (`en`) toggle.** Stored in `localStorage['if-lang']` (anything not `'en'` ⇒ `'te'`). `.lang-btn` toggles; its label shows the language you switch *to*.
- Arabic/Urdu are **lesson content**, never UI languages.

## 2. Which system? (decide before editing)

| Page | System | How |
|---|---|---|
| `index.html` **only** | **A** — dictionary | `data-key="…"` + keys in `const T = {te:{…}, en:{…}}`; add `data-html="true"` for HTML values |
| **everything else** | **B** — inline | `data-te="…" data-en="…"` on the element (swapped via `innerHTML`) |

Using the wrong system fails silently.

## 3. Add a string

**System B (most pages):**
```html
<h2 data-te="జకాత్ కాలిక్యులేటర్" data-en="Zakat Calculator">జకాత్ కాలిక్యులేటర్</h2>
```
Both attributes; Telugu also as visible inner text; keep `data-te` before `data-en`. Inside attribute values escape `"`→`&quot;`, `&`→`&amp;`.

**System A (homepage):** add the key to **both** `T.te` and `T.en`; put `data-key` (+ `data-html="true"` if markup) on the element; visible fallback = Telugu.

**student-guidance cards:** headers in `CH[]`, bodies in `CB_TE[]` — arrays indexed by card DOM order. Keep indices aligned. → [project-docs/LOCALIZATION.md](project-docs/LOCALIZATION.md) §4.

## 4. RTL (Arabic/Urdu) — one rule

Wrap each script run in **three** things; page stays LTR:
```html
<span lang="ar" dir="rtl">…</span>   <!-- font: Amiri,  line-height ~1.6 -->
<span lang="ur" dir="rtl">…</span>   <!-- font: Noto Nastaliq Urdu, line-height ~2.1 -->
```
Pair script with transliteration + Telugu/English gloss. Detail: [project-docs/RTL_SUPPORT.md](project-docs/RTL_SUPPORT.md).

## 5. House style (mixed-script Telugu strings)

Keep **Latin/standard**: course/exam names (`B.Tech`, `NEET`, `CA`), URLs (`scholarships.gov.in`), currency/numbers (`₹2,50,000`, `2.5%`, `18°`). Translate difficulty-pill **labels** only, keeping the `<span class="lvl …">` (`Very high→చాలా ఎక్కువ`, `Extreme→అత్యంత`). Transliterate religious terms into Telugu per page precedent (జకాత్, నమాజ్, వుజూ, నిసాబ్).

## 6. Invariants & known quirk

- Storage key `localStorage['if-lang']`, default `te` — never rename.
- `applyLang(lang)` runs on `DOMContentLoaded` and updates `<html lang>`.
- **Quirk:** portal pages render English-first with `<html lang="en">` despite the `te` default — keep both attributes; don't flip `lang` without converting visible defaults. → [project-docs/LOCALIZATION.md](project-docs/LOCALIZATION.md) §6.

## 7. Done check

Toggle te⇄en both ways · nothing half-translated · HTML strings render markup (not literal tags) · layout holds in both (Telugu is longer/taller) · RTL renders right-to-left in correct font · no console errors. Prompt: [docs/prompts/add-bilingual-content.md](docs/prompts/add-bilingual-content.md).
