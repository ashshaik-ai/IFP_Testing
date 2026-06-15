# MOBILE_FIRST.md

> Responsive strategy and breakpoints. Orientation: [../CLAUDE.md](../CLAUDE.md). Tokens: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

---

## 1. Approach

The site is **mobile-first**: base CSS targets small screens, and larger layouts are layered on with media queries. Most pages were tuned heavily for phones (the primary audience browses on mobile), then refined for desktop.

Key mobile-correctness choices:
- **`min-height: 100svh`** on heroes (small-viewport-height) so the hero isn't cut by the mobile browser address bar (with `100vh` fallback).
- **Fluid type** via `clamp()` everywhere — no fixed pixel headings.
- **`5vw` gutters** scale with viewport.
- **`inputmode="decimal"`** on numeric Zakat inputs for the right mobile keyboard.
- **Touch-friendly targets** — pills, accordion headers, and nav links are large tap areas.

---

## 2. Breakpoints in use

| Query | Effect |
|---|---|
| `max-width: 760px` | switch nav to hamburger; hide desktop-only pills (`.nav-guide`); drawer becomes the menu |
| `max-width: 860px` → `600px` → `420px` | progressive grid collapse (e.g. Arabic alphabet letters 5→4→3 columns; card grids to 1 column) |
| `min-height: 100svh` | hero height correctness on mobile |
| print | KC Zakat/countdown forced black-on-white for handouts |

(Exact values vary slightly per page since CSS is per-file — match the page you're editing.)

---

## 3. Component behaviour across sizes

| Component | Mobile | Desktop |
|---|---|---|
| Top nav | logo + burger; links in drawer | full link row + pills |
| Hero | stacked, taller padding, `100svh` | two-column grid, calligraphy aside |
| Stat chips | wrap to rows | inline row |
| Zakat | form + result stacked; result `position: static` | two-column; result `position: sticky` |
| Card grids | 1 column | multi-column |
| Sticky sub-nav | horizontal scroll of chips | full row |
| Letter grids (portals) | 3–4 cols | 5+ cols |

---

## 4. Nav offsets are recomputed for mobile

Whenever a fixed bar's height differs on mobile, the dependent values (`scroll-margin-top`, hero `padding-top`, sticky `top`) must be recomputed inside the media query too — not just at desktop. The 68px standard generally holds across sizes, but **verify** per page. See [NAVIGATION.md](NAVIGATION.md) §5.

---

## 5. Testing

- Check at **~375px** (small phone) and **~1280px** (laptop) minimum; sweep 600/760/860 where grids change.
- Verify hero isn't clipped by the mobile URL bar.
- Verify the drawer opens/closes and traps focus.
- Verify no horizontal scroll (`overflow-x: hidden` on body is the safety net — don't rely on it to mask real overflow).
- Verify Telugu (longer/taller) doesn't break headings or buttons at narrow widths.

---

## 6. Related docs
- [NAVIGATION.md](NAVIGATION.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [ACCESSIBILITY.md](ACCESSIBILITY.md)
