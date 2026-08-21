# Prompt: Add an Arabic or Urdu lesson

## Context to give Claude
> Read `project-docs/LEARNING_PORTALS.md`, `project-docs/RTL_SUPPORT.md`, and `project-docs/NAVIGATION.md`. Arabic and Urdu portals share a design but differ in font, line-height, and nav structure.

## Key differences to honour

| | Arabic | Urdu |
|---|---|---|
| Folder | `knowledge-center/learn-arabic/` | `knowledge-center/learn-urdu/` |
| Script font | `Amiri` | `Noto Nastaliq Urdu` |
| `lang` / `dir` | `ar` / `rtl` | `ur` / `rtl` |
| Line-height | ~1.5–1.7 | **~2.0–2.2** (or Nastaliq clips) |
| Nav | nav 68 + **sticky** tab-nav (top 68) | nav 68 + **fixed** lesson-nav 46 |
| `scroll-margin-top` | 114px | 114px |
| Hero padding-top | ~108px | ~154px |

## Prompt template

```
Add a new lesson `knowledge-center/learn-LANG/NAME.html` (LANG = arabic|urdu).

- Clone an existing lesson in that portal as the template.
- Wrap every Arabic/Urdu run in <span lang="ar|ur" dir="rtl"> with the correct font;
  keep the page itself LTR. Pair script with transliteration + Telugu/English gloss.
- Bilingual UI: data-te + data-en on all UI strings (System B). Default Telugu.
- Rename page-unique IDs (logo SVG fallback id, section ids, data-spy).
- Set nav offsets per the table above (Arabic vs Urdu differ — don't mix them).
- Add the lesson to the portal index.html levels roadmap and wire prev/next lesson links.
- Use the matching script font load only (Amiri for Arabic, Nastaliq for Urdu).
- Apply the same change to BOTH portals if it's a structural/shared-design fix.

Run the Definition of Done (PROJECT_RULES.md §7), including an RTL check.
```

## Pitfalls
- Reusing Arabic line-height for Urdu (Nastaliq clips).
- Using the Arabic single-sticky-bar offsets on an Urdu page (it has two fixed bars → 114/154).
- Duplicate SVG-fallback IDs across lessons.
- Setting `dir="rtl"` on the whole page.
