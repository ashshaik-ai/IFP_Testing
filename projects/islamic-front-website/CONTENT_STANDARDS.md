# CONTENT_STANDARDS.md — Mandatory content standards

These rules apply to **all** content across the platform: portals, lessons, quizzes, flashcards, tooltips, cards, visual-learning modules, timelines, FAQs, "Apply It" tasks, Common Mistakes/Revision blocks, search index entries, and any generated content (EN and TE).

---

## 1. Respectful references to Prophet Muhammad ﷺ (MANDATORY)

- **Never** refer to Prophet Muhammad ﷺ by name alone. Every reference must carry the honorific **ﷺ** (ṣallā Allāhu ʿalayhi wa-sallam).
- **Always** use one of:
  - **Prophet Muhammad ﷺ**
  - **The Prophet ﷺ**
  - **Messenger of Allah ﷺ**
- **Avoid** bare forms when directly referring to the Prophet ﷺ:
  - Not just `Muhammad`
  - Not bare `He` / `His` / `Him` — rewrite to `the Prophet ﷺ`, `the Prophet's`, etc.
- **Telugu:** use **ప్రవక్త ﷺ** / **ప్రవక్త ముహమ్మద్ ﷺ** / **అల్లాహ్ యొక్క దైవప్రవక్త ﷺ**. The ﷺ glyph is kept in both languages.
- **Other prophets:** use **(AS)** / **(అ.స)** — e.g., Musa (AS), Ibrahim (AS).
- **Companions:** use **(RA)** / **(ర/అ)** — e.g., Abu Bakr (RA), Khadijah (RA).
- **Different people who share the name "Muhammad"** (e.g., *Muhammad Al-Fatih* / Sultan Mehmed II, *Muhammad ibn Musa al-Khwarizmi*) do **not** take ﷺ — ﷺ is only for the Prophet ﷺ.

### Quick check before publishing
- Search content for `Muhammad` and confirm each is either followed by `ﷺ` or is a clearly different historical person.
- Read any sentence that uses `He/His/Him` about the Prophet ﷺ and rewrite to name him respectfully.

> Current status (2026-06): all in-app references audited — every reference to the Prophet ﷺ carries the honorific (57+ usages); the only bare "Muhammad" is *Muhammad Al-Fatih* (Sultan Mehmed II), which is correct.

---

## 2. Bilingual isolation (MANDATORY)

- Every user-visible string must exist in **both** EN and TE and switch with the page language. No language leakage in either mode.
- **Injected components** (quizzes, flashcards, lessons, dashboards, visual learning) must re-translate **both** their shell (label/title/subtitle) **and** their body when `<html lang>` changes — not only on first paint. Use a `paintShell()` + body re-render on the lang `MutationObserver`.
- Detect language from `document.documentElement.lang` (set by each portal's `applyLang`) via `IFCore.getLang()`. Never hardcode a single-language string into shared UI chrome.

---

## 3. Authenticity

- Religious content is drafted and **must be verified by a qualified scholar before go-live**.
- Qur'an recitation uses human reciters only (never synthetic voice). Cite trusted sources (Quran.com, Sunnah.com, etc.).

---

## 4. Portal order (canonical, everywhere)

Kids Islam → Learn Quran → Learn Salah → Seerah → Islamic History → Learn Arabic → Learn Urdu → (Student Guidance). Enforced in markup grids at runtime by `assets/js/if-order.js` and in the dynamic widgets (profile roadmap, resume, search).
