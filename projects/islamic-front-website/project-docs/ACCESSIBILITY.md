# ACCESSIBILITY.md

> Accessibility patterns already in place and the gaps to watch. Orientation: [../CLAUDE.md](../CLAUDE.md).

---

## 1. Patterns in use (keep these)

| Pattern | Where | Detail |
|---|---|---|
| **Skip link** | pages | `.skip-link` is the first focusable element; jumps to main content; visible on focus |
| **Focus-visible rings** | all | `:focus-visible` gold outline with offset on links/buttons/`[tabindex]` |
| **ARIA on nav** | all | `.nav-burger` `aria-expanded`; `.nav-drawer` `aria-hidden`; close button `aria-label` |
| **Focus management** | drawer | opening moves focus to first link; ESC/overlay/link closes |
| **Keyboard widgets** | student guidance | `.qa-item` self-assessment is `role="checkbox"`, `tabindex=0`, toggles on Enter/Space, updates `aria-checked` |
| **`lang` attributes** | all | `<html lang>` tracks UI language; Arabic/Urdu spans carry `lang="ar"`/`"ur"` for correct pronunciation by AT |
| **Labelled controls** | KC zakat | inputs have associated labels; `inputmode` set |
| **Image alts** | all | logos have `alt`; decorative emblems use empty `alt`/`aria-hidden` |
| **External link safety** | all | `target="_blank"` paired with `rel="noopener"`/`noreferrer` |
| **Language button state** | all | `.lang-btn` updates `aria-label`/`title` to describe the switch |
| **Reduced-motion friendliness** | animations | reveal/counters are enhancement-only; content is present without JS animation |

---

## 2. Known gaps / things to improve

- **No site-wide `prefers-reduced-motion` media query** — reveal animations and counters run regardless. Consider gating them.
- **Colour contrast:** gold-on-cream and muted text should be spot-checked against WCAG AA, especially small text.
- **Heading order:** verify each page has a single logical `h1` and no skipped levels (long pages risk this).
- **Scroll-spy is visual only** — fine, but ensure focus order still follows DOM.
- **Emoji-as-icon:** ensure every emoji icon is accompanied by a real text label (most are) so screen readers convey meaning.
- **Form errors (Zakat):** numeric inputs accept anything; consider validation messaging.

---

## 3. RTL & accessibility

Arabic/Urdu spans with `lang`+`dir` let screen readers switch pronunciation and announce direction correctly. **Always include `lang`** on script runs — it's an a11y feature, not just styling. See [RTL_SUPPORT.md](RTL_SUPPORT.md).

---

## 4. Testing checklist

- [ ] Tab from page load → skip link appears first and works.
- [ ] All interactive elements reachable and operable by keyboard (nav, drawer, accordions, checkboxes, language toggle).
- [ ] Focus visible at every stop.
- [ ] Drawer traps/returns focus sensibly; ESC closes.
- [ ] Screen-reader pass: language toggle announces target; Arabic/Urdu announced in correct language.
- [ ] Contrast check on gold/muted text.
- [ ] Page works with JS animations disabled (content still present).

---

## 5. Related docs
- [NAVIGATION.md](NAVIGATION.md) · [RTL_SUPPORT.md](RTL_SUPPORT.md) · [MOBILE_FIRST.md](MOBILE_FIRST.md) · [../PROJECT_RULES.md](../PROJECT_RULES.md)
