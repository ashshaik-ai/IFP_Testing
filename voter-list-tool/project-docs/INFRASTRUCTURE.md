# Infrastructure — Islamic Front (IFP) Platform

> **Single source of truth for the whole deployed system.** Written so any AI agent (Claude, Codex, GPT, Gemini) or new engineer can understand the infra in one read. Audited 2026-07-10. No secrets are stored here — only where they live and how to rotate them.

---

## 0. AI Onboarding — read this first

You are looking at a two-VM, two-Google-Cloud-account setup, both designed to run **indefinitely on Google Cloud Always Free** (e2-micro, 1 vCPU shared, 1 GB RAM, 30 GB standard disk, us-central1).

- **VM1 `voter-tool`** — the live voter-list web app (Telugu/English), used by the IFP team. Public at `https://ifp-desk.duckdns.org`. This is **production; real data lives here.**
- **VM2 `whatsapp-gateway`** — a self-hosted WhatsApp HTTP API (WAHA) that will send campaign messages. Public API behind `https://ifp-wa.duckdns.org`. **Testing only right now — bulk sending is NOT live.**

Two separate Google accounts is **intentional**: each account gets its own Always-Free e2-micro, so two free VMs instead of one.

**Golden rules:**
1. Never modify production voter data except through the app's API. The local `backend/data/` is a disconnected snapshot, NOT live (see `DEPLOYMENT.md`).
2. WhatsApp: until explicitly approved, messages go **only** to the owner's personal number. Bulk sending stays disabled. (Safeguard design in §7.)
3. Deploy to production only after testing locally first (see repo `feedback`/memory). Take + validate a backup before any prod change.
4. Keep everything inside Always-Free limits (§5). Watch snapshots, static IPs, egress, and the Ops Agent.

---

## 1. Cloud accounts & projects

| | VM1 — Voter Tool | VM2 — WhatsApp Gateway |
|---|---|---|
| Google account | `iamashrafshaik@gmail.com` | `ifp.api.02@gmail.com` |
| Project ID | `project-1b834666-3721-447f-87e` | `ifp-whatsapp` |
| Billing | enabled (trial credit) | enabled (trial credit) |
| Region / Zone | `us-central1-f` | `us-central1-a` |
| Purpose | live voter web app | WhatsApp send transport |
| Always-Free target | yes | yes |

**gcloud CLI access:** both accounts are authenticated locally. Switch with:
```bash
gcloud config set account iamashrafshaik@gmail.com && gcloud config set project project-1b834666-3721-447f-87e   # VM1
gcloud config set account ifp.api.02@gmail.com     && gcloud config set project ifp-whatsapp                        # VM2
```

---

## 2. Virtual machines

| Attribute | VM1 `voter-tool` | VM2 `whatsapp-gateway` |
|---|---|---|
| Machine type | e2-micro (2 vCPU shared, 1 GB) | e2-micro |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04.5 LTS |
| External IP | **ephemeral** `35.224.252.212` | **static** `34.132.108.165` |
| Disk | 30 GB pd-standard | 30 GB pd-standard |
| Swap | 2 GB file, swappiness 10 | 2 GB file, swappiness 10 |
| Domain | `ifp-desk.duckdns.org` | `ifp-wa.duckdns.org` |
| DNS kept current by | cron every 5 min (needed — IP is ephemeral) | not needed (static IP) |
| Scheduling | automaticRestart on, host-maintenance MIGRATE | same |
| SSH | key-only (`PasswordAuthentication no`) | key-only |
| Container runtime | Docker + Compose, enabled on boot | Docker + Compose, enabled on boot |
| Ops Agent | **active** (fluent-bit + otelopscol) | **active** |
| Backups | tar cron (daily+monthly) **and** disk snapshot schedule | none |

**SSH in:**
```bash
gcloud compute ssh voter-tool       --zone=us-central1-f   # VM1
gcloud compute ssh whatsapp-gateway --zone=us-central1-a   # VM2
```

---

## 3. Applications

### VM1 — Voter Tool (`/home/iamashrafshaik/ifp`)
- **Git:** remote `ashshaik-ai/IFP_Testing`, branch **`testing`** (never `main` — it diverged). Deploy = `git pull` on the VM + `docker compose up -d --build`.
- **Compose services:** `backend` (FastAPI, Python), `frontend` (Next.js), `caddy` (TLS + reverse proxy).
- **Named volumes:** `ifp_voter_data` (**the live data**, mounted `/app/data` in backend — persists across redeploys), `ifp_caddy_data`, `ifp_caddy_config` (TLS certs).
- **Repo layout** (source, in this repo): `voter-list-tool/backend/` (FastAPI: `app/api`, `app/services`, `app/schemas`), `voter-list-tool/frontend/` (Next.js `app/`, `lib/`), `voter-list-tool/project-docs/` (this doc + `DEPLOYMENT.md`).
- **Deploy runbook:** `project-docs/DEPLOYMENT.md` (backup-and-validate gate, rollback).

### VM2 — WhatsApp Gateway (`/home/User/waha`)
- **Not from a git repo** — hand-written `docker-compose.yml` + `Caddyfile` on the VM.
- **Compose services:** `waha` (`devlikeapro/waha`, NOWEB engine, bound to `127.0.0.1:3000`), `caddy` (TLS on `ifp-wa.duckdns.org` → `waha:3000`).
- **WAHA engine:** NOWEB (WebSocket, no Chromium) — chosen for low RAM (~340 MB vs ~1 GB for the browser engine).
- **Session storage:** bind mount `./sessions` → `/app/.sessions` (persists on disk). Session `default` is paired to the test number **+91 9703832812** ("Islamic Front Party").
- **Send API (used by the voter backend's `WahaGatewaySender`):** `POST /api/sendText`, `/api/sendImage`, `/api/sendVideo`, `/api/sendVoice`, `/api/sendFile`. Auth header `X-Api-Key`.

### WhatsApp campaign system (source in `voter-list-tool/backend/app/`)
> **Status: built + single-send tested, but UNCOMMITTED and NOT deployed to VM1 prod.** Runs only on the local dev backend today.

- `services/gateway.py` — `GatewaySender` interface; `MockGatewaySender` (records only) and `WahaGatewaySender` (real, over httpx). Selected by env `OUTBOX_GATEWAY` (`waha` | else mock).
- `services/outbox.py` — daemon thread; drains the queue per number at human pace (jittered 8–25 s), per-number daily cap + warm-up ramp, auto-pause on high failure rate, retry with backoff.
- `services/messaging_store.py` — SQLite: `numbers`, `campaigns`, `messages`, `segments`, `media`.
- `api/messaging_routes.py` — REST behind auth: `/numbers`, `/segments`, `/campaigns`, `/media`, `/webhooks/gateway` (inbound receipts + STOP opt-out).

---

## 4. Secrets — where they live, how to rotate (never commit these)

| Secret | Lives in | Rotate by |
|---|---|---|
| WAHA API key | VM2 `~/waha/docker-compose.yml` env + local `backend/.env` (`WAHA_API_KEY`) | change in both, `docker compose up -d` on VM2, restart local backend |
| WAHA dashboard password | VM2 compose env | change env, recreate container |
| DuckDNS token (ifp-desk) | VM1 crontab | regenerate at duckdns.org, update the cron line |
| DuckDNS token (ifp-wa) | used during setup | regenerate at duckdns.org if exposed |
| Voter app access code | VM1 `ifp_voter_data:/access_code.txt` + `VOTER_APP_CODES` env | app admin / env |
| Voter app token secret | VM1 backend `VOTER_APP_SECRET` env | env, redeploy |

> **Action item from audit:** both DuckDNS tokens were pasted in chat during setup and appear in VM1's cron listing — rotate them at duckdns.org.

---

## 5. Always-Free eligibility & cost audit (2026-07-10)

Always-Free per account allows: 1× e2-micro (us-central1/us-west1/us-east1), 30 GB standard persistent disk, 1 GB egress/month from North America (excl. China/Australia). Both VMs fit the compute + disk allowance.

| Cost vector | VM1 | VM2 | Verdict |
|---|---|---|---|
| Machine type e2-micro | ✅ | ✅ | free |
| 30 GB **pd-standard** disk | ✅ | ✅ | free (SSD would NOT be) |
| Static external IP | none (ephemeral) ✅ | 1, **in-use** ✅ | free **only while attached**; billed if VM stops |
| **Disk snapshots** | **deleted 2026-07-10** ✅ | **schedule removed before it fired** ✅ | was the only non-free item; now $0 (see §10) |
| Cloud Ops Agent (logging/monitoring) | active ⚠️ | active ⚠️ | metrics free; log ingest free < 50 GB/mo but uses ~40–80 MB RAM |
| Egress | low | low (API calls out) | within 1 GB free if traffic stays small |
| Load balancer / snapshots-off-region / extra IPs | none | none | ✅ |

**Biggest Always-Free risk:** the `default-schedule-1` snapshot policy on VM1. It duplicates the tar-backup cron (which already covers the actual data), so it is optional. Removing it drops the only real recurring charge and keeps a redundant-but-sufficient backup story (tar backups + reproducible-from-git infra).

---

## 6. Storage audit — reclaimable space

| VM | Disk used | Reclaimable | Source |
|---|---|---|---|
| VM1 | 19 GB / 30 GB (65%) | **~3 GB** | Docker build cache 3.73 GB (3.0 GB reclaimable via `docker builder prune`) + 13 MB dangling images |
| VM1 | | (2.6 GB is legit) | `/home/iamashrafshaik/backups` — keep (real backups) |
| VM2 | 9.4 GB / 30 GB (33%) | minimal | WAHA image 4 GB is the app; nothing to reclaim |

`docker builder prune -f` on VM1 is the one safe, high-value cleanup (frees ~3 GB, only affects cached build layers, never data/images in use).

---

## 7. WhatsApp session reliability audit

| Property | State | Note |
|---|---|---|
| Session persists to disk | ✅ | bind mount `./sessions/noweb` |
| Survives container restart | ✅ | `restart: unless-stopped` |
| Survives VM reboot (container) | ✅ | Docker enabled on boot |
| **Session auto-resumes after reboot** | ❌ | `WHATSAPP_RESTART_ALL_SESSIONS=False` → stays STOPPED until started |
| DNS correct after reboot | ✅ | static IP (no drift) |
| Session backup exists | ❌ | `./sessions` (~5 MB) is not backed up; disk loss = re-pair |
| Auto-reconnect on network blip | ✅ | NOWEB engine reconnects |

**Reliability fixes to consider (§9 plan):** flip `WHATSAPP_RESTART_ALL_SESSIONS=True` (safe with one NOWEB session, low RAM), and add the tiny `./sessions` dir to a periodic backup.

**Why a device disconnects (WhatsApp-side, unavoidable):** logging out from the phone; WhatsApp ToS enforcement on a bridged (non-official) session — the reason bulk stays disabled and only a dedicated SIM is used; phone offline > 14 days; too many linked devices.

### Production messaging safeguards (BUILT + tested 2026-07-10)
Hard allowlist gate in `WahaGatewaySender` (`services/gateway.py`):
- Env `WA_SEND_MODE = allowlist | live` — **anything except the literal `live` keeps the gate on**; default `allowlist`.
- Env `WA_ALLOWLIST` = comma-separated numbers (currently the owner's personal number only).
- In gated mode, any recipient not on the list is dropped **before any network call** and returned as a failure — bulk is impossible even if a campaign is created by mistake. Empty allowlist in gated mode = fail-closed (blocks everything).
- Verified: non-allowlisted number blocked (no send), allowlisted number delivered, number-format normalization matches (10-digit ↔ +91).
- Flip to `live` only on explicit approval.

---

## 8. Architecture, deployment & folder diagrams

### System architecture
```
                          ┌───────────────────────── Internet ─────────────────────────┐
                          │                                                             │
  IFP team ──HTTPS──▶ ifp-desk.duckdns.org                       ifp-wa.duckdns.org ◀──HTTPS── (voter backend)
                          │                                                             │
        ┌─────────────── VM1  voter-tool ───────────────┐        ┌──── VM2  whatsapp-gateway ────┐
        │  Account: iamashrafshaik  · us-central1-f      │        │  Account: ifp.api.02 · -a      │
        │  Caddy(443) ─▶ frontend(Next.js) ─▶ backend    │        │  Caddy(443) ─▶ WAHA(:3000 loc) │
        │                              │  FastAPI        │        │        NOWEB engine            │
        │                    volume: ifp_voter_data      │        │  session ./sessions (bind)     │
        │  cron: tar backup ×2, duckdns ×5min            │        │  paired SIM +91 9703832812     │
        │  snapshot schedule (billing ⚠)                 │        │  restart=unless-stopped        │
        └────────────────────────────────────────────────┘        └────────────────────────────────┘

  Campaign send path (once deployed):  backend WahaGatewaySender ──HTTPS X-Api-Key──▶ WAHA /api/sendText
```

### Deployment flow (VM1)
```
edit code ▶ git push origin testing ▶ SSH VM1 ▶ [backup ifp_voter_data + VALIDATE]
        ▶ git pull origin testing ▶ docker compose up -d --build ▶ verify routes + data checksums
```

### Folder structure (repo)
```
voter-list-tool/
├── backend/app/
│   ├── api/         routes.py, messaging_routes.py
│   ├── services/    gateway.py, outbox.py, messaging_store.py, storage.py, voter_query.py, flag_import.py …
│   └── schemas/     voters.py, messaging.py
├── frontend/app/    page.tsx, styles.css   · frontend/lib/api.ts
└── project-docs/    INFRASTRUCTURE.md (this), DEPLOYMENT.md
```

---

## 8b. Monitoring dashboard (VM2)

Lightweight status page at **`https://ifp-wa.duckdns.org/monitor/`** (basic-auth, user `ifp`; password stored in your password manager, not here). Shows WhatsApp session status + connected device, VM2 CPU/RAM/disk/swap/uptime, container status, and a searchable/downloadable WAHA log tail. Auto-refreshes every 30 s.

**Design (zero idle RAM, free):** a cron on VM2 (`* * * * * python3 /home/User/waha/monitor-collect.py`) writes `monitor/status.json` + `monitor/logs.txt`; a static `monitor/index.html` fetches them client-side. Served by the existing Caddy (`handle_path /monitor*` → `/srv/monitor`, mounted read-only). No new container, no long-running process. Rotate the password: `docker exec waha-caddy-1 caddy hash-password --plaintext '<new>'`, put the hash in `~/waha/Caddyfile`, `docker compose up -d caddy`.

**Not shown yet:** campaign queue / processed / failed counts — those live in the messaging backend (local only; will appear once that backend is deployed to VM1). VM1 system metrics can be added later with a matching collector.

## 9. Maintenance checklist & disaster recovery

**Monthly:** `docker builder prune -f` on VM1; confirm backups are recent (`ls -t ~/…/backups`); check billing dashboards (both accounts); confirm WhatsApp session status = WORKING.

**On VM reboot:** VM1 self-heals (containers auto-start, DNS cron re-points). VM2: containers auto-start, but **verify the WhatsApp session came back** (`GET /api/sessions/default`), re-pair only if needed.

**Disaster recovery:**
- **VM1 data loss:** restore newest `voters-*.tar.gz` into `ifp_voter_data`, or restore a disk snapshot; redeploy code from git.
- **VM1 total loss:** new e2-micro → install Docker → clone `ifp` repo → restore `ifp_voter_data` from backup → `docker compose up -d --build` → point duckdns.
- **VM2 total loss / session corruption:** recreate VM → Docker → copy `~/waha` compose+Caddyfile → `docker compose up -d` → re-scan QR with the SIM.

---

## 10. Action items — status (2026-07-10)
Done this session (Tier A + B1):
- ✅ **Docker build cache pruned on VM1** — freed 3.0 GB (67% → 58%).
- ✅ **`WHATSAPP_RESTART_ALL_SESSIONS=True`** — session auto-resumes after reboot (verified WORKING, no re-pair).
- ✅ **WhatsApp session backup** — weekly root cron on VM2 → `/home/User/waha-session-backups` (keeps 4).
- ✅ **Firewalls tightened** — deleted dead `allow-whatsapp-gateway:3000` + `default-allow-rdp` on both accounts; SSH/web intact.
- ✅ **Production messaging safeguard** (§7) — allowlist gate built + tested.

Also done:
- ✅ **DuckDNS token (ifp-desk) rotated** — validated + updated in VM1 **root** crontab (the 3 real crons live in root crontab, not user). Site verified up.
- ✅ **Monitoring dashboard** — live at `/monitor/` on VM2 (§8b).
- ✅ **VM1 external IP made static** (`35.224.252.212`) — promoted the existing ephemeral IP in place, zero downtime, zero IP change. Removes the ~5-min DNS-drift window on reboot.
- ✅ **VM1 IAM scope updated** — added `devstorage.read_write` to the default compute service account (required one brief planned stop/start; verified all 3 containers + all 3 root crons + site intact after).
- ✅ **Off-disk voter-data backup, fully free** — GCS bucket `gs://ifp-voter-backups-87e` (us-central1, Always-Free 5 GB tier), 7-day object lifecycle (steady-state ~2.7 GB, comfortably under the 5 GB limit). Daily backup cron now also pushes to this bucket after the local tar. **Verified end-to-end**: a real 367 MiB backup pushed and confirmed in the bucket, running as root exactly as the cron will. (Note: the dedicated `voter-backup` service account + key approach was blocked by an org policy, `iam.disableServiceAccountKeyCreation` — solved instead via VM-scope + bucket IAM binding on the VM's own default service account, no key file needed.)
- ✅ **Snapshot schedules deleted on BOTH accounts** — `default-schedule-1` detached + deleted on VM1 and VM2. **All 8 existing VM1 snapshots deleted** (17.3 GB reclaimed). VM2 had 0 snapshots (schedule hadn't fired yet) — its schedule is gone too, before it could.

**Result: both accounts verified at zero chargeable GCP resources** (0 snapshots, 0 schedules, 0 custom images, both disks standard 30GB, IP billing identical for static/ephemeral while running). Recovery story is now: git IaC (this repo) for infra + GCS bucket for data — no paid backups anywhere.

Open (your decision / manual):
- ⏳ **Ops Agent on both VMs** — optional disable for ~40–80 MB RAM; kept for now.
- ⏳ **Messaging system still uncommitted** — commit to `testing` before any VM1 prod deploy; keep the safety gate on (`WA_SEND_MODE`≠`live`) until bulk is explicitly approved.
- ⏳ **VM1 metrics on the dashboard** — add a matching collector later if wanted.
