# Architecture

## Stack

- **Frontend**: Next.js (App Router) + TypeScript, single-page app feel — almost the entire UI lives in one client component, [app/page.tsx](../frontend/app/page.tsx) (~2,500 lines). No component library; hand-rolled CSS in [app/styles.css](../frontend/app/styles.css).
- **Backend**: FastAPI (Python), flat JSON-file storage per job — **not** a SQL database. `backend/app/api/routes.py` is the only router.
- **OCR**: Gemini API (`services/gemini.py`), with `services/local_ocr.py` as a demo/offline fallback that creates review-required placeholder rows when no Gemini key is configured.
- **Storage**: `backend/data/` (git-ignored locally; a named Docker volume in production — see [DEPLOYMENT.md](DEPLOYMENT.md)).
- **Auth**: flat access-code list (`VOTER_APP_CODES` env var), not per-user accounts. See `backend/app/core/auth.py`.

## Repo map

```
voter-list-tool/
  frontend/
    app/
      page.tsx        # the whole app UI — login, header/atlas/area views, voter grid, modal, PDF export
      layout.tsx       # Next.js root layout
      styles.css       # all styling, no CSS modules/Tailwind
    components/
      SecureImage.tsx  # <img> that fetches via authenticated API call (photos aren't public URLs)
    lib/
      api.ts           # API_BASE, Voter/Job/Area types, the `copy` i18n dictionary (te/en), `api()` fetch helper
      transliterate.ts # Telugu <-> English name/area transliteration helpers
  backend/
    app/
      main.py           # FastAPI app entry
      api/routes.py      # every endpoint (auth, jobs, voters, areas, export, admin/security)
      core/auth.py        # access-code check + JWT-ish session token
      core/config.py       # env var loading
      schemas/voters.py     # Pydantic models: VoterRecord (full), VoterUpdate (PATCH-partial)
      services/
        pdf_processor.py     # splits uploaded PDF into per-card crops + photos
        gemini.py             # OCR via Gemini, key rotation on quota errors
        local_ocr.py           # offline/demo OCR fallback
        area_rules.py           # area-name normalization/classification into tiles
        exporter.py               # CSV export (Unicode)
        storage.py                 # reads/writes backend/data/jobs/<job_id>/voters.json
    data/                # jobs/<job_id>/{voters.json, photos, cards} — git-ignored, NOT the live prod data (see below)
    scripts/             # one-off maintenance scripts (name repair, dedup, etc.) — see backend/scripts/
```

## Request flow (typical: upload → review → export)

1. User uploads a PDF (`POST /jobs`) → `pdf_processor.py` splits it into card crops + photos, writes `jobs/<id>/`.
2. OCR runs (`gemini.py` or `local_ocr.py`) → populates `voters.json` with `VoterRecord` rows, `needs_review=true` where OCR was low-confidence or unavailable.
3. Frontend loads everything via `GET /voters` (all jobs, all voters, raw `list[dict]` — no response-model filtering, so new fields added to the stored JSON show up automatically without a backend route change).
4. User edits/tags a voter → `PATCH /jobs/{job_id}/voters/{voter_id}` with a partial `VoterUpdate` payload (`model_dump(exclude_unset=True)`).
5. Export via `GET /export.csv` (all) or `GET /jobs/{job_id}/export.csv` (one job), or the frontend's own client-side `downloadPdf()` (see [FRONTEND_LAYOUT.md](FRONTEND_LAYOUT.md)).

## Critical gotcha: local `backend/data/` ≠ production data

The local `backend/data/jobs/` folder on a dev machine is a **disconnected snapshot**, not the live data. Production (`https://ifp-desk.duckdns.org/`) runs on a separate GCP VM with its own Docker named volume (`ifp_voter_data`). Local frontend dev (`npm run dev`) actually points `NEXT_PUBLIC_API_BASE` at the **live production backend** by default (check `frontend/.env.local`) — so testing locally can read/write real production data. Always verify env config before assuming "local" means "safe to break." Full deploy/rollback procedure: [DEPLOYMENT.md](DEPLOYMENT.md).
