# Private Bilingual Voter List Extraction Tool

Private tool for Telugu voter-list PDFs. It extracts voter-card crops and photos, runs Gemini OCR when keys are configured, groups voters area-wise, supports Telugu/English UI and search, and exports Unicode CSV.

**For architecture, data model, the frontend layout system, and the production deploy procedure, see [project-docs/](project-docs/README.md).**

## Run Locally

Backend:

```powershell
cd voter-list-tool/backend
python -m pip install -r requirements.txt
$env:VOTER_APP_CODES="ifp-private-2026,second-user-code"
$env:VOTER_APP_SECRET="change-this-long-random-secret"
$env:GEMINI_API_KEYS="key1,key2,key3"
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd voter-list-tool/frontend
npm install
$env:NEXT_PUBLIC_API_BASE="http://127.0.0.1:8000"
npm run dev
```

Open `http://localhost:3000` and log in with one of the access codes.

## Current Behavior

- Telugu is the default UI.
- English toggle changes UI labels and enables English transliteration search fields.
- Uploaded PDFs and extracted images are stored under `backend/data/`, which is git-ignored.
- `GEMINI_API_KEYS` accepts comma-separated keys and rotates on quota/rate errors.
- If no Gemini key is configured, demo OCR creates review-required placeholder rows so the visual workflow can be tested.

## Production Notes

- Replace local access-code auth with Supabase Auth before public hosting.
- Move `backend/data/` files to private Supabase Storage for production.
- Keep Gemini keys only on the backend host.
- For election use, review and verify OCR rows before exporting final data.
