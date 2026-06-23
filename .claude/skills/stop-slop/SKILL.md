---
name: stop-slop
description: Remove AI writing patterns from prose. Use when drafting, editing, or reviewing any human-facing text (site copy, docs, commit/PR messages, reports) to eliminate predictable AI tells.
metadata:
  trigger: Writing prose, editing drafts, reviewing content for AI patterns
  author: Hardik Pandya (https://hvpandya.com) — vendored from github.com/hardikpandya/stop-slop (MIT)
---

# Stop Slop

Eliminate predictable AI writing patterns from prose.

**Default for this project, alongside `/caveman`.** Caveman governs *chat replies* (terse, fragments OK). Stop-slop governs *prose written into the product or repo* — site copy, bilingual content, README/docs, commit bodies, PR descriptions, and analysis reports. When the two conflict (caveman allows fragments, stop-slop wants complete sentences), caveman wins for chat, stop-slop wins for shipped prose.

Stop with: "stop slop off". Resume with: "/stop-slop".

## Core Rules

1. **Cut filler phrases.** Remove throat-clearing openers, emphasis crutches, and all adverbs. See [Phrases](#phrases-to-remove).
2. **Break formulaic structures.** Avoid binary contrasts, negative listings, dramatic fragmentation, rhetorical setups, false agency. See [Structures](#structures-to-avoid).
3. **Use active voice.** Every sentence needs a human subject doing something. No passive constructions. No inanimate objects performing human actions ("the complaint becomes a fix").
4. **Be specific.** No vague declaratives ("The reasons are structural"). Name the specific thing. No lazy extremes ("every," "always," "never") doing vague work.
5. **Put the reader in the room.** No narrator-from-a-distance voice. "You" beats "People." Specifics beat abstractions.
6. **Vary rhythm.** Mix sentence lengths. Two items beat three. End paragraphs differently. No em dashes.
7. **Trust readers.** State facts directly. Skip softening, justification, hand-holding.
8. **Cut quotables.** If it sounds like a pull-quote, rewrite it.

## Quick Checks (before delivering prose)

- Any adverbs? Kill them.
- Any passive voice? Find the actor, make them the subject.
- Inanimate thing doing a human verb ("the decision emerges")? Name the person.
- Sentence starts with a Wh- word? Restructure it.
- Any "here's what/this/that" throat-clearing? Cut to the point.
- Any "not X, it's Y" contrasts? State Y directly.
- Three consecutive sentences match length? Break one.
- Paragraph ends with punchy one-liner? Vary it.
- Em-dash anywhere? Remove it.
- Vague declarative ("The implications are significant")? Name the specific implication.
- Narrator-from-a-distance ("Nobody designed this")? Put the reader in the scene.
- Meta-joiners ("The rest of this essay...")? Delete.

## Scoring

Rate 1-10 on each: Directness (statements vs announcements), Rhythm (varied vs metronomic), Trust (respects reader), Authenticity (sounds human), Density (anything cuttable). Below 35/50: revise.

---

## Phrases to Remove

**Throat-clearing openers** — state the content directly: "Here's the thing:", "Here's what/why/this/that [X]", "The uncomfortable truth is", "It turns out", "The real X is", "Let me be clear", "The truth is", "I'm going to be honest", "Can we talk about", "Here's what I find interesting", "Here's the problem though".

**Emphasis crutches** — delete: "Full stop." / "Period.", "Let that sink in.", "This matters because", "Make no mistake", "Here's why that matters".

**Business jargon → plain:** navigate→handle, unpack→explain, lean into→accept, landscape→situation, game-changer→significant, double down→commit, deep dive→analysis, take a step back→reconsider, moving forward→next, circle back→revisit, on the same page→aligned.

**Adverbs** — kill all -ly words and: really, just, literally, genuinely, honestly, simply, actually, deeply, truly, fundamentally, inherently, inevitably, interestingly, importantly, crucially. Also: "At its core", "In today's X", "It's worth noting", "At the end of the day", "When it comes to", "In a world where", "The reality is".

**Meta-commentary** — remove: "Hint:", "Plot twist:", "You already know this, but", "X is a feature, not a bug", "The rest of this essay...", "Let me walk you through...", "In this section, we'll...", "As we'll see...".

**Vague declaratives** — kill or replace with the specific thing: "The reasons are structural", "The implications are significant", "This is the deepest problem", "The stakes are high".

## Structures to Avoid

**Binary contrasts** (state Y directly, drop the negation): "Not because X. Because Y.", "X isn't the problem. Y is.", "The answer isn't X. It's Y.", "It feels like X. It's actually Y.", "not X, it's Y", "not just X but also Y", "stops being X and starts being Y".

**Negative listing** — state the thing, skip the runway: "Not a X... Not a Y... A Z.", "It wasn't X. It wasn't Y. It was Z."

**Dramatic fragmentation** — use complete sentences: "[Noun]. That's it. That's the [thing].", "X. And Y. And Z.", "This unlocks something. [Word]."

**Rhetorical setups** — make the point: "What if [reframe]?", "Here's what I mean:", "Think about it:", "And that's okay."

**False agency** — name the human actor: "a complaint becomes a fix" → someone fixed it; "the decision emerges" → someone decided; "the culture shifts" → people changed behavior; "the data tells us" → someone read it.

**Narrator-from-a-distance** — put the reader in the room: "Nobody designed this", "This happens because...", "People tend to...".

**Passive voice** — name the actor and front them: "X was created" → who created it; "Mistakes were made" → who made them.

**Sentence starters to avoid:** Wh- openers (What/When/Where/Which/Who/Why/How), paragraphs starting with "So", "Look,".

**Rhythm:** no three-item lists (use two or one), no em-dashes (use commas/periods), don't stack short punchy sentences, vary paragraph endings.

**Word patterns:** lazy extremes (every, always, never, everyone, nobody) assert false authority — use specifics.
