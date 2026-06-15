# Prompt: Change a design token across the whole site

## Context to give Claude
> There is **no shared stylesheet** — design tokens (`:root` variables), nav, and the polish layer are duplicated in every page. A token change is an **N-file edit** that must be applied identically everywhere. Read `project-docs/DESIGN_SYSTEM.md` and `project-docs/NAVIGATION.md`.

## Affected files (all 18 HTML pages)
`index.html`, `islamic-knowledge.html`, `student-guidance.html`, and every file under `knowledge-center/learn-arabic/` and `knowledge-center/learn-urdu/`.

## Prompt template — colour/font token

```
Change DESIGN TOKEN across the site: e.g. --gold from #c8922a to #NEWHEX
(or a font-family swap).

- Update the :root declaration in EVERY page's inline <style> identically.
- Grep for any hardcoded uses of the old value and update those too.
- Don't change the token name or the localStorage key.
- Verify both languages and mobile/desktop on a representative sample
  (homepage, KC, one Arabic lesson, one Urdu lesson).
List every file you changed.
```

## Prompt template — nav height (CASCADES!)

```
Change the fixed nav height from 68px to Npx site-wide.

For EACH page, update together (see NAVIGATION.md §5):
1. nav/.al-nav/.sg-nav height
2. any second fixed bar offset (Urdu lesson-nav)
3. sticky sub-nav `top` (kc-sticky/tab-nav)
4. hero padding-top  = fixed-bars + ~40px breathing room
5. scroll-margin-top on anchored sections = sum of FIXED bars
6. the MOBILE equivalents inside @media blocks

Recompute per page type:
- Homepage/KC: scroll-margin-top = N
- Arabic lessons: nav N + sticky tab-nav(top N); scroll-margin-top = N+46
- Urdu lessons: nav N + fixed lesson-nav 46; scroll-margin-top = N+46; hero = N+46+40

Verify anchor links land with headings clear of the nav, on mobile and desktop, both languages.
List every file and value changed.
```

## Pitfalls
- Updating desktop but forgetting the mobile media-query values.
- Treating a *sticky* sub-nav as if it added to `scroll-margin-top` (it doesn't; only *fixed* bars do).
- Missing a page (all 18 must match).
