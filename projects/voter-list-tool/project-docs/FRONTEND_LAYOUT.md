# Frontend layout — the header/toolbar system

This is the part of the app that's been iterated on the most and has the least obvious reasoning baked into the CSS. Read this before touching `.topbar`, `.stickyZone`, `.summaryMetric*`, or anything with `order:` in `styles.css`.

## Two top-level views

- **`atlasMode = true`** — the homepage/home screen: area tiles grid (`.atlasGrid`), no `selectedTile`.
- **`atlasMode = false`** — drilled into one area (`selectedTile` set): the voter card grid for that area.

Both share the same `<header className="topbar">` markup (`page.tsx` ~line 1550+), styled very differently via a `.topbarAtlas` modifier class.

## The merged single-line toolbar (area/`!atlasMode` view)

On the area page, `.topbarRow { display: contents; }` makes `topbarRowTop` and `topbarRowBottom` transparent to layout — every control inside both (brand, stats, back button, view label, filter pills, search, export, account menu) becomes a flat sibling in **one** flexbox, ordered by explicit `order:` values (`styles.css`, search `.brandBlock { order: 1; }`):

```
1 brandBlock          5 filterCatGroup
2 summaryMetricsHeaderInline  6 filterBarDividerB
3 filterBarView        7 filterBarSearchWrap
4 filterBarDividerA     8 exportBtnGroup
                         9 actions (menu/lang/logout, margin-left:auto)
```

This only has room on **wide** screens. Below `1920px` effective CSS width, a media query flips `.topbarRow` back to a real 2-row `display:flex` (matching the atlas screen's always-2-row layout), so `topbarRowTop` (logo + stats + account controls) and `topbarRowBottom` (back/filters/search/export) become genuinely separate rows instead of one long wrapping line.

**Why 1920px and not something tighter**: this was raised twice during development. First from ~1024px because the header was overflowing at common laptop widths. Then again because **browser zoom changes the effective CSS viewport width** — zooming *out* to 90% *increases* the effective width (more content fits per physical pixel), so a window that looked fine as a clean 2-row layout at 100% zoom could cross the breakpoint into fragile single-line mode at 90%, and land in a gap too narrow for everything to actually fit — wrapping just the account controls onto their own ugly half-line. 1920px was chosen generously to make that gap not exist in practice for any realistic laptop/zoom combination. If you ever see the account controls (`...`/language/logout) wrapping alone onto a second line, this is the bug — the fix is to raise this threshold further, not to patch the wrap behavior.

Both breakpoint declarations must be kept in sync — there are two separate `@media (max-width: 1920px)` blocks in `styles.css` (one for `.topbarRow` display mode, one for the stats/search fill-space rules below). Search for `1920px` and update both if you ever change this number.

## Stats pinned into the header (area view only)

`summaryMetricsBlock` (the Total/Life/General/IFP/T/YT/MF stat cards, plus a Flagged card — see [DATA_MODEL.md](DATA_MODEL.md)) is a single JSX variable rendered in **two different places** depending on mode:

- **Atlas/home**: rendered below the header, inside `.stickyZone` but outside `.topbar` — full-size cards, roomy layout (this is the *original* design, and still what atlas mode uses).
- **Area view**: rendered *inside* `topbarRowTop`, right after the logo (`{!atlasMode && summaryMetricsBlock}`), with an extra `summaryMetricsHeaderInline` class that compresses it to fit — smaller font, smaller padding. This was moved here specifically so it stays pinned while scrolling the (long) voter list; it used to live below the header and scrolled away, which was the original complaint that led to this change.

In the ≤1920px 2-row breakpoint, both the stat cards (`.summaryMetricsHeaderInline .summaryMetricCard { flex: 1 1 0 }`) and the search bar (`.filterBarSearchWrapCompact { flex: 1 1 240px; max-width: none }`) are given `flex-grow` so they visibly fill the available row width instead of packing to the left with dead space before the next pinned control (`...` menu on row 1, CSV/PDF on row 2). Above 1920px (single merged line), these do **not** grow — growing them there would compete for space with everything else on the one long line and reintroduce overflow, so the fill-space rules are deliberately breakpoint-scoped.

`.topbar:not(.topbarAtlas) .heroCopy { display: none; }` hides the "Islamic Front / IFP Premium Desk" brand text on the area page (logo only) to make room for the stat row — the atlas/home header keeps the full brand text.

## The Flagged stat/toggle has two different presentations

- **Atlas/home**: a standalone pill (`.headerFlagBtn`) next to the `...` menu button, `atlasMode && areaBaseStats.flagged > 0`.
- **Area view**: merged into the stat-card row as `.metricFlagged` (`!atlasMode && areaBaseStats.flagged > 0`), styled like the other stat cards but with the flag icon instead of a text label (see [DATA_MODEL.md](DATA_MODEL.md) for why no label).

Both toggle the same `partyFilter === "flagged"` state and both only render when the count is `>0` — never a "0" placeholder.

## Atlas tile percentages

Each area tile shows a count and a `%`. The formula **must** be `(this party's count in this area) / (this area's true total) × 100` — i.e. the same meaning whether or not a filter is active:

- **Unfiltered**: `tile.ifp / tile.total` (both already the area's real numbers).
- **Filtered** (IFP/T/YT/MF stat card clicked): `areaTiles` is built from `sourceScopedVoters`, which is *already* narrowed to the active filter — so `tile.total` at that point **equals** the filtered count, not the area's real total. A separate memo, `areaTrueTotals` (built from `activeVoters`, source-filtered only, **never** party-filtered), tracks each area's real total so the % can still be computed correctly: `tile.total / areaTrueTotals.get(tile.key)`.

Do not compute this as "this area's share of the city-wide filtered total" — that was tried and explicitly rejected; the percentage must match what the unfiltered view would show for that same area/party combination, just recomputed for whichever filter is active.

## PDF export is a separate, self-contained document

`downloadPdf()` in `page.tsx` does **not** reuse `styles.css`. It builds a complete HTML string (own `<style>` block, own class names like `.badge`/`.tag`/`.flag`) and writes it into a blank `window.open()`'d tab, then calls `.print()`. Any visual feature that needs to appear in the exported/printed PDF (badges, tags, the flag marker) must be added **twice**: once in the live app's JSX/CSS, once in `voterRow()`'s template string and its embedded `<style>`. It's easy to update one and forget the other.

## Mobile is a different layout, not just a squeeze

Below 640px, `.stickyZone { position: static; }` — the header **scrolls away** on phones instead of staying pinned, because a permanently-fixed 400px+ block would bury tappable content underneath it. In its place, a separate always-in-DOM `<nav className="mobileBottomNav">` (hidden above 640px) provides the 4 most-used actions (Atlas/Search/Filters/Stats) as a fixed bottom bar. Don't try to make the sticky header work on mobile by adjusting z-index/position — that's the wrong fix; the bottom nav is the intended mobile solution.
