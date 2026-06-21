# LATEST_STATIC_AUDIT.md
Generated: 2026-06-21T19:34:39.653Z

Catalog records: 34 - Student Guidance indexed cards: 79 - HTML pages scanned: 27 - Issues: 0

Severity counts: high 0 - medium 0 - low 0

## Findings
- No issues found by static guardrails.

## Agent Notes
- Start future audit/fix work from this report before scanning large HTML files.
- The catalog is `assets/data/site-catalog.js`; update it when adding pages, portals, tools, lessons, aliases, or share metadata.
- The Student Guidance authoring index is `assets/data/student-guidance-index.js`; regenerate it with `node scripts/extract-student-guidance-index.mjs` after card edits.
- This report is static-only; run Playwright for rendered mobile overflow and language-toggle checks.
