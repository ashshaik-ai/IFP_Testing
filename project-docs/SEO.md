# SEO.md

> Current SEO state, the gaps, and how to close them consistently. Orientation: [../CLAUDE.md](../CLAUDE.md). **SEO meta is currently inconsistent across pages** — this doc is the plan of record to fix it.

---

## 1. Current state (audit)

| Page | `description` | `keywords` | `robots` | Open Graph | Twitter | canonical | JSON-LD |
|---|---|---|---|---|---|---|---|
| `index.html` | ✅ | — | — | partial (`og:` present, incomplete) | — | — | — |
| `islamic-knowledge.html` | ✅ | — | — | — | — | — | — |
| `student-guidance.html` | ✅ | ✅ | ✅ | ✅ (`og:title/description/type`) | — | — | — |
| `learn-arabic/index.html` | (varies) | ✅ | — | ✅ (`og:title/description/type`) | — | — | — |
| `learn-urdu/index.html` | — | — | — | — | — | — | — |
| lesson pages | some `description` | — | — | — | — | — | — |

**Takeaways:**
- `student-guidance.html` is the most complete and a good **reference template**.
- `islamic-knowledge.html` and `learn-urdu/index.html` are the weakest (little/no meta).
- **No page** has `canonical`, Twitter cards, `og:image`+`og:url` consistently, or JSON-LD structured data.

---

## 2. Target: a standard `<head>` SEO block for every page

Add (and localise titles/descriptions per page). Use `student-guidance.html` as the pattern:

```html
<title>…page-specific…</title>
<meta name="description" content="…1–2 sentence summary…">
<meta name="keywords" content="…relevant terms…">
<meta name="robots" content="index,follow">
<link rel="canonical" href="https://DOMAIN/PATH">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="…">
<meta property="og:description" content="…">
<meta property="og:image" content="https://DOMAIN/assets/logo.png">
<meta property="og:url" content="https://DOMAIN/PATH">
<meta property="og:locale" content="te_IN">
<meta property="og:locale:alternate" content="en_US">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="…">
<meta name="twitter:description" content="…">
<meta name="twitter:image" content="https://DOMAIN/assets/logo.png">
```

> Fill `DOMAIN` once the production host is known. Until then, keep relative `canonical` out (a wrong canonical is worse than none).

---

## 3. Structured data (JSON-LD) opportunities

| Page | Schema |
|---|---|
| `index.html` | `Organization` (name, foundingDate 2011-08-26, founder, address, areaServed Mangalagiri) |
| `islamic-knowledge.html` | `WebApplication`/`HowTo` (wudu, salah guides) |
| `student-guidance.html` | `FAQPage` / `ItemList` (career options), `EducationalOccupationalProgram` |
| portals | `Course` per lesson, `ItemList` for levels |

Add as `<script type="application/ld+json">` blocks. Keep facts identical to [COMMUNITY_SCHEMES.md](COMMUNITY_SCHEMES.md).

---

## 4. Bilingual SEO

- The site is Telugu-default with English toggle on the **same URL** (client-side swap), so there are **no separate `te`/`en` URLs** to `hreflang`. Reflect the dual language with `og:locale` + `og:locale:alternate` rather than `hreflang`.
- Titles/descriptions are currently authored in the default language; consider whether the crawled (initial) language should be Telugu or English per page and keep `<html lang>` consistent with it (note the portal `lang="en"` quirk — [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) §6).

---

## 5. Site-level additions to consider

- `robots.txt` and an XML `sitemap.xml` listing all 18 pages (none exist today).
- Favicon/app-icons set (verify presence).
- `og:image` asset sized 1200×630 for rich link previews (current logos are square).

---

## 6. Rules when editing SEO

- **Consistency over cleverness:** apply the same block shape to every page so future edits are mechanical.
- **No invented facts** in meta/JSON-LD — pull from [COMMUNITY_SCHEMES.md](COMMUNITY_SCHEMES.md).
- **Per-page uniqueness:** title and description must be unique and accurate per page (no copy-paste duplication of descriptions).
- Re-run the audit table in §1 after changes.

---

## 7. Related docs
- [../CLAUDE.md](../CLAUDE.md) · [PAGES.md](PAGES.md) · [COMMUNITY_SCHEMES.md](COMMUNITY_SCHEMES.md) · [DECISIONS.md](DECISIONS.md)
