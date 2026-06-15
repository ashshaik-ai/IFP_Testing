# KNOWLEDGE_CENTER.md — `islamic-knowledge.html`

> The Islamic tools & resources hub. Uses **localization System B** (`data-te`/`data-en`). Orientation: [../CLAUDE.md](../CLAUDE.md).

---

## 1. Purpose

Practical, trustworthy Islamic utilities for every Muslim family in one page: Zakat calculation, daily Salah timings with a live countdown, step-by-step wudu and prayer guides, the Five Pillars, Quran & Hadith resources, manners (akhlaq), Islam & modern life, Quran & science, and FAQs. Also the entry point to the Arabic and Urdu learning portals.

---

## 2. Section map

`#learn-arabic`, `#learn-urdu` (portal entry cards) · `#basics` (Start Here) · `#pillars` (Five Pillars) · `#wudu` (ablution guide) · `#salah-guide` (how to pray) · `#salah` (prayer times + countdown) · `#zakat` (calculator) · `#quran` · `#hadith` · `#guides` · `#akhlaq` · `#modern-life` · `#quran-science` · `#faqs`.

Navigation: `.kc-jump` quick links in the hero + a sticky `.kc-sticky` sub-nav using `data-spy` for scroll-spy ([NAVIGATION.md](NAVIGATION.md)).

---

## 3. Tool: Prayer times (browser-computed)

- **Method:** University of Islamic Sciences, **Karachi** (Fajr 18°, Isha 18°). Asr supports Hanafi factor (shadow ×2).
- **Where:** computed entirely in-browser from **Mangalagiri coordinates** via astronomical math (`julian()`, `sunAngle()`), no API.
- **Output:** five rows (`data-prayer="fajr|dhuhr|asr|maghrib|isha"`) populated each day.
- **Disclaimer (shown + must stay):** times are approximate; the **local masjid announcement is authoritative**. Cites Quran An-Nisa 4:103.

> When touching this code, do not silently change angles or the method label — the on-page `.ref-note` documents them and users rely on it.

---

## 4. Tool: Next-prayer countdown

- `.countdown-card` shows time remaining to the next prayer, derived from the computed timings; ticks live. Label is bilingual (`తదుపరి నమాజ్‌కు` / "Time until next prayer").

---

## 5. Tool: Zakat calculator

- **Inputs:** cash (`#z-cash`), gold grams (`#z-goldg`), silver grams (`#z-silverg`), etc.; `oninput="calcZakat()"` recalculates instantly.
- **Prices:** gold/silver per-gram INR from **`rates.json`** (auto-updated daily — [AUTOMATION_RATES.md](AUTOMATION_RATES.md)).
- **Rule:** if wealth reaches **nisab**, Zakat = **2.5%**. The nisab card (`.lp-nisab`) shows the threshold.
- **Result panel** (`.zakat-result`) is sticky on desktop, static on mobile; print styles force black-on-white.

---

## 6. Guides: wudu & salah (step-through)

- Interactive step-by-step walkthroughs — each posture/step with Arabic recitation, transliteration, and meaning; "Next" advances at the user's pace.
- Arabic text uses `Amiri`, `lang="ar" dir="rtl"` ([RTL_SUPPORT.md](RTL_SUPPORT.md)).
- Includes sourced notes (e.g. men/women prayer sameness with Sahih al-Bukhari 631; covering ruling with Quran 24:31) — **citations are content of record; don't alter**.

---

## 7. Resources

- **Five Pillars** (`#pillars`) cards, **Quran** & **Hadith** resource links (external, `rel="noopener noreferrer"`), **Akhlaq**, **Islam & Modern Life**, **Quran & Science**, **FAQs** (understanding Islam).

---

## 8. Localization notes

- System B inline `data-te`/`data-en` on every string; many values contain HTML (use `&quot;`/`&amp;` correctly inside attributes).
- Arabic snippets inside Telugu/English content stay in `Amiri` RTL spans.
- `<html lang="te">` default; toggled by `.lang-btn`.

---

## 9. Gotchas

- **`rates.json` dependency:** the Zakat tool needs it; if it fails to load, ensure a sensible fallback and never hand-edit the file.
- **Don't break the print styles** for the zakat result / countdown (used for handouts).
- **Prayer math is exact-ish on purpose** — keep the disclaimer and method label truthful.
- **Sticky offsets** (`.zakat-result { top: 84px }`, sub-nav) assume the 68px nav — keep in sync ([NAVIGATION.md](NAVIGATION.md)).

---

## 10. Related docs
- [LEARNING_PORTALS.md](LEARNING_PORTALS.md) · [AUTOMATION_RATES.md](AUTOMATION_RATES.md) · [RTL_SUPPORT.md](RTL_SUPPORT.md) · [../LOCALIZATION_RULES.md](../LOCALIZATION_RULES.md) · [SEO.md](SEO.md)
