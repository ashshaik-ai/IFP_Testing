# Prompt: SEO pass (page or whole site)

## Context to give Claude
> SEO meta is currently inconsistent across pages. `student-guidance.html` is the most complete reference. Read `project-docs/SEO.md` and `project-docs/COMMUNITY_SCHEMES.md` (facts of record). The site is Telugu-default with English toggled on the **same URL** (no separate locale URLs).

## Prompt template

```
Bring PAGE (or: all pages) up to the SEO standard in project-docs/SEO.md.

For each page add a consistent <head> block:
- unique <title> and <meta name="description"> (accurate, per-page, not duplicated)
- <meta name="keywords"> and <meta name="robots" content="index,follow">
- Open Graph: og:type, og:title, og:description, og:image (assets/logo.png),
  og:url, og:locale=te_IN, og:locale:alternate=en_US
- Twitter: summary_large_image card with title/description/image
- canonical ONLY if the production domain is known (a wrong canonical is worse than none)

Add JSON-LD where it fits:
- index.html: Organization (foundingDate 2011-08-26, founder "Shaik Akram",
  address Mangalagiri AP 522503) — facts EXACT from COMMUNITY_SCHEMES.md
- student-guidance.html: FAQPage / ItemList
- portals: Course / ItemList

Then update the audit table in project-docs/SEO.md §1 to reflect the new state.
Do NOT invent facts. List files changed.
```

## Optional site-level
```
Also add robots.txt and sitemap.xml listing all 18 pages, and confirm a favicon set exists.
```

## Pitfalls
- Duplicated descriptions across pages (must be unique).
- Inventing org facts — pull from COMMUNITY_SCHEMES.md.
- Adding `hreflang` (not applicable — one URL serves both languages client-side).
- Setting a canonical to a guessed domain.
