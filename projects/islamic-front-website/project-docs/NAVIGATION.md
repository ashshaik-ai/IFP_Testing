# NAVIGATION.md

> Navigation system, scroll-spy, mobile drawer, and the fixed-bar offset math. The **68px fixed nav is a site-wide standard** and its height cascades into several other values. Orientation: [../CLAUDE.md](../CLAUDE.md). Visual tokens: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

---

## 1. Primary fixed nav (all pages)

```css
nav { position: fixed; top: 0; left:0; right:0; z-index: 100;
      height: 68px; padding: 0 5vw;
      background: rgba(13,59,30,0.90); backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(200,146,42,0.3);
      display:flex; align-items:center; justify-content:space-between; }
```
- **Height is always 68px** (`nav`, `.al-nav`, `.sg-nav`).
- Left: brand lockup (`.nav-brand` + 42px `.nav-logo` + SVG fallback + title/sub).
- Right (`.nav-right`): desktop links, `.nav-guide`/`.nav-kc` pills, `.lang-btn`, `.nav-burger`.

---

## 2. Active-section highlight (scroll-spy)

Two implementations, same idea — an `IntersectionObserver` marks the in-view section and toggles `.nav-active` on the matching link:
- **Homepage:** `TRACKED_IDS` array → observes each section → `setNavActive(id)` updates `.nav-links a` and `.nav-drawer-links a`.
- **KC / portals:** links carry `data-spy="sectionId"`; the observer matches on that attribute (`.kc-sticky`, `.tab-nav`).

`.nav-active` styling: gold text + gold underline bar (desktop), gold left-border + ♦ marker (drawer).

---

## 3. Mobile drawer

- **Trigger:** `.nav-burger` (3 bars → animates to X via `.open`).
- **Parts:** `.nav-overlay` (dim) + `.nav-drawer` (slides from right, `min(300px, 85vw)`).
- **Behaviour:** `openDrawer()` adds `.open`, sets `aria-hidden=false`, focuses first link after the transition (~360ms). `closeDrawer()` reverses. Closes on overlay click, close button, ESC key, or selecting a link.
- Shown under ~760px; desktop-only pills (e.g. `.nav-guide`) hide at `max-width: 760px`.

---

## 4. Secondary navigation bars

| Bar | Pages | Behaviour | `top` |
|---|---|---|---|
| `.kc-jump` | KC hero | inline quick links (scrolls page) | n/a |
| `.kc-sticky` | KC | **sticky** sub-nav, scroll-spy via `data-spy` | sticks under nav |
| `.tab-nav` | Arabic lessons, some | **sticky** tab bar | `68px` |
| `.lesson-nav` | **Urdu lessons** | **fixed** second bar (level + prev/next), 46px | `68px` |
| `.sg-tools`/chips | student guidance | sticky tools/search + chip nav | under nav |

> **Urdu lessons are the only pages with two _fixed_ bars** (nav 68 + lesson-nav 46). Everything else has at most one fixed bar plus *sticky* (in-flow) sub-navs.

---

## 5. The offset math (keep in sync!)

When the nav height or a second fixed bar changes, update **all** of these together:

```
scroll-margin-top (anchored elements) = sum of FIXED bars above content
hero padding-top                      = sum of FIXED bars + breathing room (~40px)
sticky sub-nav `top`                  = height of FIXED bars above it
mobile equivalents                    = same, recalculated in @media blocks
```

**Current values:**

| Page type | Fixed bars | `scroll-margin-top` | hero padding-top |
|---|---|---|---|
| Homepage | nav 68 | `68px` (`section[id]`) | ~`100px` |
| KC | nav 68 (+ sticky sub-nav) | `68px` | per hero |
| Arabic lessons | nav 68 (+ sticky tab-nav @68) | `114px` | ~`108px` |
| Urdu lessons | nav 68 **+** lesson-nav 46 | `114px` | ~`154px` |

> Worked example (Urdu lesson): two fixed bars = 68 + 46 = **114** → `scroll-margin-top: 114px` and `tab-nav`/anchors offset 114; hero = 114 + 40 = **154**.

---

## 6. Logo + SVG fallback (in nav)

Every nav brand has:
```html
<img src="…/logo.png" class="nav-logo" alt="Islamic Front Logo"
     onerror="this.style.display='none';document.getElementById('UNIQUE_ID').style.display='block'">
<svg id="UNIQUE_ID" class="… -logo-svg" style="display:none" …>…crescent + ‘FRONT’…</svg>
```
- The SVG `id` **must be unique per page** (`nav-svg`, `nav-svg-ur-al`, `nav-svg-ar-gr`, …).
- Keep the `<img>` and its `<svg>` together when copying a nav.

---

## 7. Back-to-top

A floating button (`#sgtt` / `.btt`) appears after a scroll threshold (`scrollY > 480/600`) and smooth-scrolls to top. Present on long pages.

---

## 8. Gotchas

- **Changing nav height is never a one-line edit** — it cascades into §5. Recompute every dependent value, including mobile.
- **Don't confuse sticky vs fixed:** a *sticky* sub-nav is in normal flow (doesn't add to `scroll-margin-top`); a *fixed* bar does.
- **Z-index order:** nav `z-index:100`, overlay `200`, drawer `201` — keep drawer above overlay above content.
- **`data-spy` / `TRACKED_IDS` must match real section IDs** — a typo silently disables the highlight.

---

## 9. Related docs
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [MOBILE_FIRST.md](MOBILE_FIRST.md) · [ACCESSIBILITY.md](ACCESSIBILITY.md) · [LEARNING_PORTALS.md](LEARNING_PORTALS.md)
