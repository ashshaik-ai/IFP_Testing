# IFP Premium Desk — project docs

Voter-list management app for Islamic Front, Mangalagiri. Extracts voter cards from PDF voter lists (OCR), organizes them by area, and lets volunteers tag/classify/export them.

Read in this order for a cold start:

1. [ARCHITECTURE.md](ARCHITECTURE.md) — stack, repo map, request flow, data storage
2. [DATA_MODEL.md](DATA_MODEL.md) — the `Voter` shape, tag system, area-tile grouping
3. [FRONTEND_LAYOUT.md](FRONTEND_LAYOUT.md) — the header/toolbar responsive design (non-obvious, iterated on heavily), atlas vs area views, PDF export
4. [DEPLOYMENT.md](DEPLOYMENT.md) — the live GCP deployment, safe-deploy procedure, rollback

Root `README.md` (one level up) has the local dev setup (env vars, `npm run dev`, `uvicorn`).
