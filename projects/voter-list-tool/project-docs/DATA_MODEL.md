# Data model

## `Voter` (backend/app/schemas/voters.py, frontend/lib/api.ts)

Flat record per voter card, one JSON file per job (`backend/data/jobs/<job_id>/voters.json`), no relational DB. Key fields beyond the obvious (name/relation/age/house/area/photo):

| Field | Meaning |
|---|---|
| `source_kind` / `source_badge` | `"life"` (L) or `"general"` (G) — which PDF list the card came from |
| `needs_review` / `confidence` | OCR flagged this row as uncertain |
| `is_deceased` / `is_blocklisted` / `is_cancelled` | archive-state flags — mutually exclusive with each other (see below) |
| `is_ifp_voter` / `is_yt_voter` / `is_target` / `is_mf_voter` | the 4-way tag radio-group (see below) |
| `is_flagged` | independent, privacy-sensitive marker — see "The flag feature" below |
| `raw_text` | full OCR text blob, kept for debugging bad extractions |

## Tag mutual-exclusivity groups

Two **separate** groups, each a radio-button (setting one clears the others in its own group). These groups don't affect each other.

**Archive-state group** (`is_deceased`, `is_blocklisted`, `is_cancelled`, plus implicit "active" = none set): moving a voter to one state clears the others. Enforced in the PATCH handler in `backend/app/api/routes.py` (`update_voter()`).

**Party-tag group** (`is_ifp_voter`, `is_yt_voter`, `is_target`, `is_mf_voter`): setting one clears the other three. Enforced **client-side** in `page.tsx` (`toggleIfpVoter`/`toggleYtVoter`/`toggleTargetVoter`/`toggleMfVoter` each build a patch object that explicitly zeroes the other three before sending). If you add a 5th party tag, follow this exact pattern — don't add it to the backend's archive-state exclusivity logic, they're unrelated.

## The flag feature (`is_flagged`)

Added for a specific, deliberately low-visibility use case: marking which voters received something (e.g. cash) last election cycle, without it being obvious to a casual viewer of the screen ("no one should understand it" was the explicit design brief).

Design rules that came out of that requirement — **keep these if you touch this feature**:

- **No descriptive text anywhere**, including `aria-label`s and screen-reader announcements. Labels say "Mark"/"Unmark" (or గుర్తు పెట్టండి/తీసివేయండి), never anything about money/assistance.
- **Blank by default**: the toggle button (`.flagBadge` on voter cards, next to the L/G source badge) renders no icon at all when `is_flagged` is false — not even an outline. Only shows a small black flag glyph (`FlagIcon`) when true.
- **Fully independent** of the party-tag radio-group — toggling it never touches `is_ifp_voter` etc.
- Included in the client-side PDF export (`downloadPdf()` → `voterRow()`) the same way — icon only, no label, positioned next to the badge in the print template's own embedded `<style>`.
- Aggregated counts (header stat pill, atlas — see [FRONTEND_LAYOUT.md](FRONTEND_LAYOUT.md)) only render when the count is `> 0`, so an area/list with zero flags shows nothing at all rather than a "0" that invites the question "0 what?"

## Area tiles (the "atlas")

`AREA_TILE_DEFS` → `AREA_TILES` (page.tsx) is a hand-maintained list of area-name aliases (Telugu spelling variants, English names) that `getAreaTile(voter)` matches a voter's raw `area_te`/`area_en` against, bucketing voters into ~20 named tiles (wards, colonies, etc.) for the homepage atlas grid. `area_rules.py` on the backend does a related but separate normalization pass at ingestion time. If a voter's area string doesn't match any tile alias, it's excluded from atlas tile counts (but still shows up in the flat "All voters" list) — that mismatch is what the "Manage Areas" admin panel (`showAreaMgr`) is for.
