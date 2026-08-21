# Prompt: Add or edit bilingual (Telugu/English) content

## Context to give Claude
> The site is Telugu-default with an English toggle. **Two i18n systems exist** — pick the right one. Read `LOCALIZATION_RULES.md` first.

## Decision: which system?
- **`index.html` only → System A** (dictionary `const T` + `data-key`, `data-html="true"` for HTML values).
- **Everything else → System B** (inline `data-te="…"` `data-en="…"`, swapped via `innerHTML`).

## Prompt template (System B — most pages)

```
On PAGE, add/edit this content in both Telugu and English:
- English: "..."
- Telugu:  "..."

Rules:
- Put both data-te="<telugu>" and data-en="<english>" on the element; the visible
  inner text should be the Telugu version.
- Keep data-te BEFORE data-en. Inside attribute values, escape " as &quot; and & as &amp;.
- Keep proper nouns / exam names / course codes / URLs / ₹ figures in Latin script in
  the Telugu string (house convention).
- If Arabic/Urdu script appears, wrap it in <span lang="ar|ur" dir="rtl"> with the right
  font (Amiri / Noto Nastaliq Urdu).
Then toggle te⇄en and confirm the string switches and layout holds in both.
```

## Prompt template (System A — homepage)

```
On index.html, add/edit copy via the T dictionary:
- Add the key to BOTH T.te and T.en.
- Put data-key="THE_KEY" on the element (add data-html="true" if the value has markup).
- The element's visible fallback text should be the Telugu version.
Then toggle languages and confirm it switches.
```

## Special case: student-guidance card content
Card headers live in the `CH[]` array, bodies in `CB_TE[]` — see [translate-card-bodies.md](translate-card-bodies.md) and `LOCALIZATION_RULES.md` §4. Keep array indices aligned with card DOM order.

## Done check
Toggle both ways · no half-translated elements · markup renders (not literal tags) · no console errors · Telugu length doesn't break layout.
