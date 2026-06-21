# DESIGN_SYSTEM.md

> The visual language. Because there is **no shared stylesheet**, these tokens are duplicated in every page's inline `<style>` — change one, change all. Quick cheat-sheet is in [../CLAUDE.md](../CLAUDE.md); this is the full reference.

---

## 1. Brand colour palette (`:root` in every page)

```css
:root {
  --green-deep:  #0d3b1e;   --green-mid: #1a5c30;   --green-light: #2e8b57;
  --gold:        #c8922a;   --gold-light:#e8b84b;   --gold-pale:   #f5e6c0;
  --cream:       #faf6ee;   --white:     #ffffff;
  --text-dark:   #1a1208;   --text-mid:  #3d3018;   --text-muted:  #7a6840;
  --border:      rgba(200,146,42,0.25);
}
```

- **Greens** — nav, hero gradient (`--green-deep → #0a2e17 → #122b0f`), dark cards, footers.
- **Golds** — accents: heading highlights, badges, active states, scrollbar, focus rings, calligraphy. `--gold-light` for text-on-dark; `--gold` for borders/scrollbar.
- **Cream** — default page background.
- **Text** — `--text-dark` body; `--text-mid`/`--text-muted` secondary.

Always use the variable, never raw hex, when one exists.

---

## 2. Typography

| Role | Family | Used for |
|---|---|---|
| Display | **Playfair Display** (400–900) | h1, hero titles, nav title, section titles |
| Accent serif | **Playfair Display** | hero subtitles, pull quotes |
| Body/UI | **DM Sans** (300–500) | paragraphs, buttons, nav links |
| Telugu | **Noto Sans Telugu** (300–700) | all Telugu text |
| Arabic | **Amiri** (400/700) | `lang="ar"` script |
| Urdu | **Noto Nastaliq Urdu** (400/700) | `lang="ur"` script |

Base stack: `font-family: 'DM Sans', 'Noto Sans Telugu', sans-serif;`

**Performance:** preconnect then stylesheet; load only the script fonts a page needs (Arabic lessons add Amiri; Urdu lessons add Nastaliq):
```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=…&display=swap" rel="stylesheet">
```

**Type scale:** fluid via `clamp()` (e.g. hero title `clamp(48px,7vw,88px)`). **Telugu glyphs are tall** — `:lang(te)` line-height overrides exist (e.g. `:lang(te) .hero-title{line-height:1.4}`). Preserve them.

---

## 3. Layout & spacing

- **Gutter:** `5vw` horizontal on nav/hero/sections.
- **Max-width:** content blocks cap ~`1100px`, centered.
- **Cards/panels:** radius `12–14px`, gold border (`--border`), hover lift (`translateY(-2px)` + shadow).
- **Radius scale:** pills `100px`; cards `12–14px`; controls `6–8px`.
- **Section rhythm:** tag (small-caps) → title → lead.

---

## 4. Core components

| Component | Class(es) | Notes |
|---|---|---|
| Fixed nav | `nav`/`.al-nav`/`.sg-nav` | **68px**, green translucent + blur, gold border |
| Brand | `.nav-brand`+`.nav-logo` (+fallback SVG) | logo 42px circle |
| Nav links | `.nav-links a` | gold underline on `.nav-active` |
| Lang button | `.lang-btn` | pill, 🌐, toggles te⇄en |
| KC/Guide pills | `.nav-kc`, `.nav-guide` | gradient pills |
| Hamburger | `.nav-burger` | 3 bars → X, under ~760px |
| Drawer | `.nav-overlay`+`.nav-drawer` | slide from right, focus-managed |
| Hero | `.hero`/`.al-hero`/`.kc-hero` | gradient + crescent/calligraphy motif |
| Stat chips | `.hstat`, `.al-stat` | bordered glass |
| Sticky sub-nav | `.kc-sticky`, `.tab-nav`, `.lesson-nav` | scroll-spy |
| Callout | `.sg-callout`, `.ref-note` | info/reality banners |
| Accordion card | `.gx-card` | button-headed expandable |
| Back-to-top | `#sgtt`/`.btt` | after scroll |
| Skip link | `.skip-link` | first focusable, a11y |

---

## 5. Motifs & "premium polish" (keep when refactoring)

Crescent/star/calligraphy background glyphs at low opacity · custom gold scrollbar · `::selection` gold tint · `:focus-visible` gold outline · reveal-on-scroll (IntersectionObserver) · animated stat counters.

---

## 6. Fixed-element heights & offsets (critical)

Standard = **68px fixed nav**. Dependents must stay in sync:

| Page type | Fixed bars | `scroll-margin-top` | hero padding-top |
|---|---|---|---|
| Homepage/KC | nav 68 (+ sticky sub-nav) | `68px` | ~100px |
| Arabic lessons | nav 68 + sticky `tab-nav`(top 68) | `114px` | ~108px |
| Urdu lessons | `.al-nav` 68 + **fixed** `.lesson-nav` 46 | `114px` | ~154px |

**Hero padding formula:** `fixed bars + ~40px breathing room`. Recompute **mobile** equivalents too. Full detail: [NAVIGATION.md](NAVIGATION.md).

---

## 7. Breakpoints

| Breakpoint | Purpose |
|---|---|
| `max-width: 760px` | hide desktop pills, show hamburger |
| `860 → 600 → 420px` | progressive grid collapse |
| `min-height: 100svh` | hero mobile address-bar correctness |

Strategy: [MOBILE_FIRST.md](MOBILE_FIRST.md).

---

## 8. Iconography

Emoji as lightweight icons (🎓 ☪ ⏳ 🌐 + stream/career icons). Decorative-functional — ensure a real text label carries meaning for screen readers.

---

## 9. New-page checklist (design)

1. Copy `:root`, polish layer, nav, drawer, footer wholesale.
2. Rename page-unique IDs (SVG fallback, sections, `data-spy`).
3. Load only needed fonts.
4. Nav 68px; compute hero padding + `scroll-margin-top` per §6.
5. Run [../PROJECT_RULES.md](../PROJECT_RULES.md) Definition of Done.
