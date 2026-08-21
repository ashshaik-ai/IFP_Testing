# LATEST_STATIC_AUDIT.md
Generated: 2026-08-21T14:08:07.721Z

Catalog records: 76 - Student Guidance indexed cards: 79 - HTML pages scanned: 30 - Issues: 12

Severity counts: high 0 - medium 3 - low 9

## Findings
- **low** - pwa-manifest-missing - `sir-brochure-ap-2026-en.html` - No manifest link
- **low** - og-title-missing - `sir-brochure-ap-2026-en.html` - No og:title
- **low** - jsonld-missing - `sir-brochure-ap-2026-en.html` - No static or shared JSON-LD
- **low** - pwa-manifest-missing - `sir-brochure-ap-2026.html` - No manifest link
- **low** - og-title-missing - `sir-brochure-ap-2026.html` - No og:title
- **low** - jsonld-missing - `sir-brochure-ap-2026.html` - No static or shared JSON-LD
- **low** - pwa-manifest-missing - `sir-summary-ap-2026.html` - No manifest link
- **low** - og-title-missing - `sir-summary-ap-2026.html` - No og:title
- **low** - jsonld-missing - `sir-summary-ap-2026.html` - No static or shared JSON-LD
- **medium** - html-not-in-catalog - `sir-brochure-ap-2026-en.html` - HTML page is not represented in site catalog
- **medium** - html-not-in-catalog - `sir-brochure-ap-2026.html` - HTML page is not represented in site catalog
- **medium** - html-not-in-catalog - `sir-summary-ap-2026.html` - HTML page is not represented in site catalog

## Agent Notes
- Start future audit/fix work from this report before scanning large HTML files.
- The catalog is `assets/data/site-catalog.js`; update it when adding pages, portals, tools, lessons, aliases, or share metadata.
- The Student Guidance authoring index is `assets/data/student-guidance-index.js`; regenerate it with `node scripts/extract-student-guidance-index.mjs` after card edits.
- This report is static-only; run Playwright for rendered mobile overflow and language-toggle checks.
