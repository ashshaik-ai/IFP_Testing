# LOCALIZATION.md — Deep Reference

> Full detail of the two i18n systems and RTL handling. The **daily** quick rules are in [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md); read this only when you need the mechanics. RTL specifics: [RTL_SUPPORT.md](RTL_SUPPORT.md).

---

## 1. The two UI languages

- **Telugu (`te`) default; English (`en`) toggle.** Persisted in `localStorage['if-lang']` (anything not `'en'` ⇒ `'te'`).
- `.lang-btn` toggles on every page; its label shows the language you'll switch *to*.
- Arabic/Urdu are **lesson content**, never UI languages (see §5).

---

## 2. System A — Dictionary + `data-key` (homepage only)

**`index.html` only.** A single object holds every string:

```js
const T = {
  te: { nav_title: "ఇస్లామిక్ ఫ్రంట్", /* … */ },
  en: { nav_title: "Islamic Front",     /* … */ }
};
```

Markup references a key; `data-html="true"` when the value is HTML:

```html
<div class="nav-title" data-key="nav_title">ఇస్లామిక్ ఫ్రంట్</div>
<p data-key="about_lead" data-html="true">…telugu w/ <strong>markup</strong>…</p>
```

`applyLang(l)` walks `[data-key]`, assigns `textContent` (or `innerHTML` if `data-html`), then updates `<html lang>`, `document.title`, and the lang button:

```js
function applyLang(l) {
  try { localStorage.setItem('if-lang', l); } catch (e) {}
  document.querySelectorAll('[data-key]').forEach(el => {
    const val = T[l][el.dataset.key];
    if (val === undefined) return;
    if (el.dataset.html === 'true') el.innerHTML = val; else el.textContent = val;
  });
  document.getElementById('html-root').lang = l;
  document.title = l === 'te' ? 'ఇస్లామిక్ ఫ్రంట్ – మంగళగిరి' : 'Islamic Front – Mangalagiri';
  /* + lang button label/title/aria */
}
```

**Add a string:** add the key to **both** `T.te` and `T.en`; put `data-key` (and `data-html="true"` if markup) on the element; visible fallback = Telugu.

---

## 3. System B — Inline `data-te`/`data-en` (every other page)

Each element carries both translations; `applyLang` swaps `innerHTML`:

```html
<h2 data-te="జకాత్ కాలిక్యులేటర్" data-en="Zakat Calculator">జకాత్ కాలిక్యులేటర్</h2>
```
```js
document.querySelectorAll('[data-te]').forEach(function (el) {
  var val = el.getAttribute('data-' + l);   // 'te' | 'en'
  if (val !== null) el.innerHTML = val;
});
```

Attribute values may contain HTML — escape `"`→`&quot;`, `&`→`&amp;` inside them.

**Add a string:** put `data-te` and `data-en` on the element (Telugu also as visible inner text). Done.

---

## 4. Card arrays (student-guidance.html)

Dynamic card content uses **parallel JS arrays indexed by card DOM order**:
- **`CH[]`** — headers: `{e:[title,tag,tagline], t:[teTitle,teTag,teTagline]}`; `applyLang` rewrites `.gx-title`/`.gx-best`.
- **`CB_TE[]`** *(in progress)* — body Telugu HTML; first run saves English body to `data-en-body`, then swaps per language. See [DECISIONS.md](DECISIONS.md) A1.

Keep array indices aligned with `cards` NodeList (DOM) order — that's the contract.

---

## 5. Arabic & Urdu (RTL content)

Not UI languages — RTL script inside LTR pages. Each run needs three things:

```html
<span class="lesson-ar" lang="ar" dir="rtl">قواعد النحو</span>   <!-- Amiri -->
<span class="l-hero-ur"  lang="ur" dir="rtl">اردو</span>          <!-- Noto Nastaliq Urdu -->
```

| | Arabic | Urdu |
|---|---|---|
| `lang`/`dir` | `ar`/`rtl` | `ur`/`rtl` |
| Font | Amiri | Noto Nastaliq Urdu |
| Line-height | ~1.5–1.7 | ~2.0–2.2 (clips otherwise) |

Page stays LTR; only spans flip. Tables pair script cell + transliteration (`.td-tr`). Full guide: [RTL_SUPPORT.md](RTL_SUPPORT.md).

---

## 6. Portal `<html lang="en">` quirk (known)

Portal pages (`knowledge-center/**`) render **English-first** and set `<html lang="en">` despite the global `te` default. Keep both `data-te`/`data-en` on every string; **don't** flip the initial `lang` without also converting all visible defaults to Telugu — they must agree. Tracked in [DECISIONS.md](DECISIONS.md) K3.

---

## 7. House style for mixed-script strings

Inside Telugu (`data-te`) strings, keep in **Latin/standard** form:
- Course/exam/program names: `B.Tech`, `NEET`, `JEE`, `CA`, `MBBS`, `NSP`, `UPSC`.
- URLs/portals: `scholarships.gov.in`, `maef.nic.in`, `GoodReturns.in`.
- Currency/numbers: `₹2,50,000`, `2.5%`, `18°`.
- Difficulty pills: keep `<span class="lvl …">`; translate only label text (`Very high→చాలా ఎక్కువ`, `Extreme→అత్యంత`).

Religious terms transliterate into Telugu where the page already does (జకాత్, నమాజ్, వుజూ, నిసాబ్) — follow precedent.

---

## 8. Shared invariants

- Storage key **`localStorage['if-lang']`**, default **`te`** — never rename (cross-page persistence).
- `applyLang(lang)` runs on `DOMContentLoaded`; updates `<html lang>`.
- Lang button always shows the *target* language.
- Wrap `localStorage` in try/catch.

---

## 9. QA

Toggle te⇄en both ways · no half-translated element · HTML-bearing strings render markup (not literal tags) · layout holds in both (Telugu longer/taller) · RTL additions render right-to-left in correct font · no console errors. Copy-paste prompt: [../docs/prompts/add-bilingual-content.md](../docs/prompts/add-bilingual-content.md).
