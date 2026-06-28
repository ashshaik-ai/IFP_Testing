# TASK.md - Live Task Baton

> **Both agents (Claude Code and Codex) must read this file at the start of every session.**
> This file is the single source of truth for what is currently being worked on, how far it got, and what remains.
> **Never start a task that shows STATUS: IN_PROGRESS or BLOCKED without reading the full context below.**

---

## STATUS: DONE

```
AGENT        : codex
TASK         : Improve voter tool performance and fix left area list scrolling
STARTED      : 2026-06-28
COMPLETED    : 2026-06-28
LAST_UPDATED : 2026-06-28
```

STEPS_DONE:
  - Read TASK.md, PROJECT_RULES.md, LOCALIZATION_RULES.md
  - Inspected current voter tool sidebar, filtering, and image loading code
  - Confirmed left area list scroll issue is in sidebar sizing and overflow behavior
  - Fix sidebar height and scroll containment for area list
  - Reduce avoidable frontend rework in filtering and counts
  - Reduce repeated image refetch work where safe
  - Verify frontend build passes after the changes

LAST_FILE_CHANGED: voter-list-tool/frontend/components/SecureImage.tsx
NOTES: No OCR rerun or backend data changes. Frontend build passed after the UI/runtime fixes.

---

## How to use this file

### As the agent STARTING a task

Before beginning any multi-step task (more than ~3 edits or touching more than 1 file), write:

```
STATUS: IN_PROGRESS
AGENT        : claude-code   <- or: codex
TASK         : <one-line description>
STARTED      : <date>
LAST_UPDATED : <date>

STEPS_DONE:
  - (none yet)

STEPS_REMAINING:
  - step 1
  - step 2
  - step 3

LAST_FILE_CHANGED: -
NOTES: -
```

### As the agent HANDING OFF (token limit reached or switching)

Update this file BEFORE stopping. Change STATUS to BLOCKED and fill in exactly where you stopped:

```
STATUS: BLOCKED
AGENT        : claude-code -> codex   <- direction of handoff
TASK         : <same description>
STARTED      : <original date>
LAST_UPDATED : <today>

STEPS_DONE:
  - created knowledge-center/arabic/tajweed-basics.html
  - added entry to assets/data/site-catalog.js (id=arabic-tajweed-basics)

STEPS_REMAINING:
  - update IF_PORTAL.lessons[] in knowledge-center/learn-arabic/index.html
  - increment portal total in site-catalog.js
  - run catalog-sync verification

LAST_FILE_CHANGED: knowledge-center/learn-arabic/tajweed-basics.html
NOTES: IF_PORTAL.lessons[] is at line ~312 in learn-arabic/index.html. New entry:
  { id: 'tajweed-basics', en: 'Tajweed Basics', te: 'తజ్వీద్ ప్రాథమికాలు' }
```

### As the agent PICKING UP a BLOCKED task

1. Read this entire file.
2. Check `STEPS_DONE` - do NOT redo those steps.
3. Execute `STEPS_REMAINING` in order.
4. When done, update STATUS to DONE (see below).

### As the agent COMPLETING a task

```
STATUS: DONE
AGENT        : codex   <- whoever finished it
TASK         : <description>
STARTED      : <original date>
COMPLETED    : <today>
LAST_UPDATED : <today>

STEPS_DONE:
  - created knowledge-center/arabic/tajweed-basics.html
  - added entry to assets/data/site-catalog.js
  - updated IF_PORTAL.lessons[] in learn-arabic/index.html
  - incremented portal total to 7
  - catalog-sync: 0 errors

LAST_FILE_CHANGED: assets/data/site-catalog.js
NOTES: Lesson is fully wired. Content sections are placeholders - author must fill in.
```

### As the agent RESUMING after the other finished (DONE -> IDLE)

1. Read this file at session start.
2. See STATUS: DONE - confirm completion to the user what was completed.
3. Set STATUS: IDLE and clear the fields.
4. Do NOT restart the completed task.

---

## Handoff direction conventions

| Value | Meaning |
|---|---|
| `claude-code` | Claude Code is/was working on it |
| `codex` | Codex is/was working on it |
| `claude-code -> codex` | Claude Code handed off to Codex |
| `codex -> claude-code` | Codex handed off to Claude Code |
| `-` | IDLE, no active agent |

---

## Quick reference for both agents

**If STATUS is IDLE:** start new work normally.
**If STATUS is IN_PROGRESS (same agent):** you were interrupted - resume from STEPS_REMAINING.
**If STATUS is IN_PROGRESS (other agent):** that agent is still working - do NOT touch this task; ask the user.
**If STATUS is BLOCKED:** pick up where the other agent stopped - read STEPS_REMAINING and NOTES.
**If STATUS is DONE:** confirm completion to the user, then reset to IDLE.

---

## Task history (append, never delete)

| Date | Task | Started by | Finished by | Outcome |
|---|---|---|---|---|
| 2026-06-22 | Design and implement 5 Claude Skills | claude-code | claude-code | Done - catalog-sync, design-sync, portal-audit, translate-cards, lesson-scaffold created |
| 2026-06-27 | Install requested Claude Plugin Hub skill packs | codex | codex | Done, partial failures from invalid manifest, SSH-only sources, and unsupported marketplace source type |
| 2026-06-28 | Add Life/General filters, area move/merge polish, and refresh voter PDFs | codex | codex | Done - 3 final PDFs reprocessed, aggregated filters added, badges added, live backend/frontend rechecked |
