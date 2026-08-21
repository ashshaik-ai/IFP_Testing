# Premium / World-Class Audit — design craft, restraint, trust
**Date:** 2026-06 · Evaluated for elegance, clarity, restraint — *not* feature-richness. Companion to the interactive `Islamic Front Design Audit.html` (72/100 baseline). Engineering/learning/SEO recs from that audit are already implemented; this focuses only on what still keeps the platform from *feeling* premium.

---

## Priority 1 — Premium design system (implementation status)
- ✅ **Emoji → thin-line SVG icon set** in the highest-leverage place: the lesson section labels (Timeline, Mind Map, Key People, Did You Know, Lessons Learned, Reflection, Quick Check, Summary, Further Reading, References, Apply It, Common Mistakes, FAQ, Revision) across **all 46 lessons**, plus the search FAB + modal. Icons stroke `currentColor` in **restrained ink-green, not gold**.
- ◐ **Remaining emoji:** the 4 visual modules' section headers (🗺️🕰️⚔️✨ …, ~17) and the lesson **section-header titles** baked into the data (📖🧩🛡️ …, ~26), and Kids/dashboard glyphs. Next icon pass — bounded but spans data files.
- ◐ **Gold restraint:** lesson icons are now green (a real reduction). A broader gold audit is still needed (rendering-dependent): the **gold gradient scrollbar**, gold borders on *every* card, gold section eyebrows everywhere. Recommendation: reserve gold for **CTAs, achievements/XP, and active states only**; make default card borders neutral (`rgba(0,0,0,.08)`), default eyebrows muted ink, and drop the gold scrollbar. Hierarchy improves the moment gold becomes rare.

## Priority 2 — Homepage simplification (the 5-second test)
Current homepage = **15 sections** (`home, victory, achievements, manifesto, scheme, infra, about, contact, stories, gallery, events, volunteer, community-contact, learning, knowledge`). A first-time visitor cannot parse that in 5 seconds. Recommended structure (≈7 blocks):
1. **Hero** — one human-centered promise + one primary CTA. Drop the badge/stat/manifesto/photo competition; lead with a single line (e.g., *"Serving Mangalagiri's Muslim community since 2011"*) + 1 CTA.
2. **Proof** — merge `victory` + `achievements` into one "What we've done" band (named wins, real numbers).
3. **What we do** — merge `scheme` + `infra` + `about` into one concise "Our work" section.
4. **Social proof** — merge `stories` + `gallery` into one (real photos only; drop placeholders).
5. **Events** — keep, condensed.
6. **Knowledge Center promo** — keep (the learning gateway).
7. **Contact** — dedupe the two contact sections (`contact` + `community-contact`) into one; fold `volunteer` into it as a CTA.
- **Move deeper / cut:** full `manifesto` → a dedicated page or accordion; `gallery` → merge; `volunteer` → CTA. Net: 15 → ~7, one idea per view, a clear emotional narrative.

## Priority 3 — Performance (recommendations; not changed blind)
- **Fonts (6 families, unsubsetted):** self-host or subset to the needed ranges only — Latin + `Noto Sans Telugu` + Amiri/`Noto Nastaliq Urdu` (RTL) — and **preload the 1–2 critical faces**; drop unused weights (e.g., Playfair 400/600/700/900 → keep 700/900). Keep `display=swap` (already present). *(Not done blind: changing the Google-Fonts URL risks dropping Telugu/Arabic glyphs or a FOUT flash I can't verify without rendering.)*
- **Skeletons:** add lightweight skeleton blocks for JS-rendered lists (lesson list, search results, surah list) so there's no empty flash on slow mobile.
- **Code/content split:** `index.html` (~3.8k lines) and `islamic-knowledge.html` (~2.6k) are large single files; split inline `<style>`/sections for maintainability and faster first paint.
- **Perceived speed:** lazy-reveal below-fold sections (IntersectionObserver already used for some), defer non-critical inline CSS.

## Priority 4 — Trust & authority (the real launch blocker)
- **Every religious lesson is AI-drafted.** For a faith platform this is the single biggest credibility risk. Citations to Quran.com/Sunnah.com exist, but there is **no scholar attribution**.
- **Scalable review workflow (recommended):**
  1. Add a `CONTENT_REVIEW.md` register — one row per lesson: topic · risk tier · status · reviewer · date.
  2. **Risk-tier the queue:** Tier 1 (fiqh rulings — wudu/ghusl/salah validity, Zakat thresholds, Tafseer, Hadith gradings) reviewed first; Tier 2 (Seerah/History narrative); Tier 3 (language, kids).
  3. Add an optional `reviewed:{by,date}` field to the lesson schema; when present, `if-lesson` renders a small **"Reviewed by [scholar], [date]"** badge — visible trust signal, and an honest absence until then.
  4. Per-claim source attribution in fiqh lessons (link the specific ayah/hadith).
  5. Gate go-live on Tier 1 sign-off.

---

## The ruthless review — "What would Apple / Stripe / Linear / Airbnb reject before launch?"

**Visual polish** — Reject: **emoji as UI** (still in visual modules, section headers, Kids); **gold on every surface** (scrollbar, every card border) flattens hierarchy; **schematic SVG diagrams** read as "educational aid," not crafted illustration; **"Coming soon" media slots** shipped on a launch site.

**Content density** — Reject: a **15-section homepage**; lessons that expand into a very long single accordion (intro→mindmap→timeline→sections→people→DYK→takeaways→apply→mistakes→reflect→faqs→quiz→summary→revision→reading→refs is *a lot* in one open panel — progressive disclosure / tabs needed).

**Information hierarchy** — Reject: near-uniform weight — everything is a bordered card with a gold eyebrow, so nothing is the hero. No clear focal point per screen.

**Interaction quality** — Reject: animations are basic fades (no considered easing/spring); **three floating widgets** (search FAB + XP HUD + back-to-top) crowd the viewport — a single, quiet bottom bar would be more elegant.

**Trust signals** — Reject (hard): **AI-authored religious content with no scholar sign-off**; placeholder galleries instead of real photography; no press/credentials.

**Mobile experience** — Reject until verified: no real-device pass at 320–430px; the 3 floating elements + dense cards are unproven on small screens.

**Brand perception** — Reject: **two visual languages** coexist — the polished shared-component system vs. the older bespoke pages — plus a now-mixed icon/emoji vocabulary. Consistency is the tell of a premium product.

### The short list they'd block launch on
1. AI religious content without scholar review. 2. "Coming soon"/placeholder media on a live site. 3. Emoji-as-UI + gold overuse. 4. 15-section homepage. 5. Unverified mobile. 6. Two inconsistent visual languages.

**Verdict:** the platform is *feature-complete and well-engineered* but not yet *restrained*. Premium here means **subtraction** — fewer sections, rarer gold, one icon language, real photos, scholar-verified text — not more features.
