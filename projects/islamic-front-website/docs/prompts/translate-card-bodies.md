# Prompt: Finish Telugu translation of student-guidance card bodies

## Context to give Claude
> This is the active in-progress task (DECISIONS.md A1). In `student-guidance.html`, the 81 expandable card **headers** are already translated via the `CH[]` array, but the card **bodies** (`.gx-body-in`) are English-only. Read `LOCALIZATION_RULES.md` §4 and `project-docs/DECISIONS.md` A1.

## Scope (81 cards, indexed by DOM order — same as CH[])

| Section | Indices | Body fields |
|---|---|---|
| After 10th (§2) | 0–11 | Duration, Leads to, Pros/Cons (`.gx-pc`), Misconception (`.gx-myth`) |
| After MPC (§3) | 12–23 | Duration, Entrance, Cost, Difficulty, Jobs, Growth |
| After BiPC (§4) | 24–36 | Duration, Entrance, Fees, Competition, Careers |
| Commerce (§5) | 37–46 | Work, Difficulty, Cost, Growth, Salary path |
| Arts (§6) | 47–56 | Path, Difficulty, Careers, Growth |
| Entrance Exams (§7) | 57–65 | Eligibility, Difficulty, Applicants, Seats, Backup |
| Govt Jobs (§8) | 66–74 | Role, Competition, Prep time, Realistic view |
| Scholarships (§11) | 75–80 | Eligibility, Benefit, Apply at, Deadline, Documents (+ `.gx-myth` on 75) |

## Prompt template

```
Finish the Telugu localization of the 81 card bodies in student-guidance.html.

1. Add a CB_TE[0..80] JS array right after the CH[] array. Each entry is a complete
   Telugu HTML string replacing that card's .gx-body-in innerHTML, index-aligned to
   card DOM order.
   - Preserve EXACT structure: .gx-field/.gx-field-k/.gx-field-v rows, .gx-pc >
     .gx-pros/.gx-cons, .gx-myth, and difficulty pills
     <span class="lvl lvl-low|lvl-med|lvl-high|lvl-vhigh">…</span>.
   - Translate field keys (Duration→వ్యవధి, Entrance→ప్రవేశం, Cost→ఖర్చు,
     Difficulty→కష్టం, Jobs→ఉద్యోగాలు, Growth→వృద్ధి, Pros→అనుకూలతలు, Cons→ప్రతికూలతలు,
     Misconception→అపోహ, Eligibility→అర్హత, Benefit→ప్రయోజనం, Deadline→గడువు,
     Documents→పత్రాలు, …).
   - Pill labels: తక్కువ / మధ్యస్థం / ఎక్కువ / చాలా ఎక్కువ / అత్యంత.
   - Keep proper nouns, exam/course names, URLs, ₹ amounts in Latin script.
   - Use single-quoted JS strings; escape any embedded apostrophes.

2. In applyLang(), after the existing card-head (CH[]) swap, add:

   cards.forEach(function (c, i) {
     if (!CB_TE[i]) return;
     var bodyIn = c.querySelector('.gx-body-in');
     if (!bodyIn) return;
     if (!bodyIn.hasAttribute('data-en-body'))
       bodyIn.setAttribute('data-en-body', bodyIn.innerHTML);
     bodyIn.innerHTML = l === 'te' ? CB_TE[i] : bodyIn.getAttribute('data-en-body');
   });

Verify: default Telugu shows translated bodies with intact pills/structure; toggle to
English restores originals exactly (via data-en-body); toggle back works; search "NEET"
in Telugu still matches & opens cards; no console errors.
```

## Pitfalls
- Misaligning `CB_TE` indices with DOM/`CH[]` order.
- Dropping a `.lvl` pill `<span>` or `.gx-myth` block.
- Breaking JS strings with unescaped quotes.
- Translating proper nouns / ₹ figures that should stay Latin.
