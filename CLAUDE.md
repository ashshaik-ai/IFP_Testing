# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static single-page website for **Islamic Front (ఇస్లామిక్ ఫ్రంట్)**, a community organisation in Mangalagiri, Andhra Pradesh. No build system — the entire site is one self-contained file: `index.html`.

## Running the site

Open `index.html` directly in a browser. There is no build step, no server required, and no dependencies to install.

## Architecture

Everything lives in `index.html`:

- **HTML** — page structure with anchor-linked sections (`#victory`, `#achievements`, `#manifesto`, `#scheme`, `#infra`, `#about`, `#contact`)
- **CSS** — embedded in `<style>`, using CSS custom properties defined in `:root` (`--green-deep`, `--gold`, `--cream`, etc.)
- **JavaScript** — embedded in `<script>` at the bottom

### Bilingual system (Telugu / English)

All user-visible text is externalised into a `T` object with `te` (Telugu, default) and `en` (English) sub-objects. Elements that should be translated carry a `data-key="..."` attribute matching a key in `T`. Elements that contain HTML markup additionally carry `data-html="true"`.

- `applyLang(l)` — iterates all `[data-key]` elements and sets `.textContent` (or `.innerHTML` if `data-html="true"`) from `T[l][key]`
- `toggleLang()` — flips between `te` and `en` and calls `applyLang`

When adding or changing content, update **both** `T.te` and `T.en`, and add `data-key="..."` to the corresponding element.

### Assets

Images are loaded with `onerror` fallbacks (SVG placeholder or initials avatar):

```
assets/logo.png                        — nav logo
assets/founder/shaik-akram.jpg         — about section photo
assets/founder/shaik-akram-2.jpg       — hero section photo
assets/candidates/1.candidate.jpg      — 7 elected member photos
  …
assets/candidates/7.candidate.jpg
```

### Animations

Handled entirely in JavaScript via `IntersectionObserver` (no external libraries):

- **Scroll-reveal** — `.reveal` class added to cards; `.in-view` toggled when scrolled into viewport
- **Manifesto progress rings** — SVG `stroke-dashoffset` driven by `data-target` attribute, triggered on scroll
- **Hero progress bar segments** — `data-w` attribute applied as `style.width` with a short `setTimeout`
- **Hero entrance** — CSS `@keyframes fadeUp` with staggered `animation-delay`

### Manifesto card states

Cards use one of three CSS modifier classes corresponding to promise status:

| Class | Badge key | Meaning |
|---|---|---|
| `mf-done` | `mf_badge_done` | Completed |
| `mf-progress` | `mf_badge_progress` | In progress |
| `mf-pending` | `mf_badge_pending` | Upcoming |

The hero progress bar percentages (`hmfp-seg` widths) and the SVG ring `data-target` values must be updated manually to stay in sync with actual promise counts.
