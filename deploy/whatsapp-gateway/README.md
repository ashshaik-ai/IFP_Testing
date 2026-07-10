# WhatsApp Gateway — Infrastructure as Code (VM2)

This folder **is** the free backup of the `whatsapp-gateway` VM. Everything the VM runs is reproducible from here + git history, so disk snapshots are not needed for recovery. See the platform-wide doc: `voter-list-tool/project-docs/INFRASTRUCTURE.md`.

- **GCP:** account `ifp.api.02@gmail.com`, project `ifp-whatsapp`, VM `whatsapp-gateway`, zone `us-central1-a`, e2-micro, static IP, domain `ifp-wa.duckdns.org`.
- **Stack:** WAHA (WhatsApp HTTP API, NOWEB engine) + Caddy (TLS + the `/monitor` dashboard), Docker Compose.
- **Secrets:** live only in the VM's `.env` (+ Caddyfile monitor hash) and your password manager — never in git.

## Files
| File | What |
|---|---|
| `docker-compose.yml` | WAHA + Caddy services (secrets via `.env`) |
| `Caddyfile` | TLS + reverse proxy + basic-auth `/monitor` (set `__MONITOR_HASH__`) |
| `.env.example` | template for `WAHA_API_KEY`, dashboard creds |
| `setup.sh` | provisions swap + Docker, brings the stack up |
| `crontab.example` | session backup (root) + monitor collector (user) |
| `monitor-collect.py`, `monitor/index.html` | the dashboard (cron writes JSON, static page renders) |

## Rebuild from scratch (disaster recovery)
1. Create an Ubuntu 22.04 **e2-micro** in `us-central1-a`; reserve/attach a static IP; open firewall 22/80/443 only.
2. Point `ifp-wa.duckdns.org` at the IP (duckdns.org).
3. Copy this folder to `/home/User/waha` on the VM.
4. `cp .env.example .env` and fill in (`openssl rand -hex 24` for the API key).
5. Set the monitor hash: `docker run --rm caddy:2-alpine caddy hash-password --plaintext '<monitor-pw>'` → paste into `Caddyfile` in place of `__MONITOR_HASH__`.
6. `./setup.sh` (may need one re-run after the Docker group step).
7. Install crons from `crontab.example`.
8. **Pair the SIM:** create the session, then scan the QR:
   ```bash
   K=$(docker exec waha-waha-1 printenv WAHA_API_KEY)
   curl -s -X POST http://127.0.0.1:3000/api/sessions -H "X-Api-Key: $K" \
     -H 'Content-Type: application/json' -d '{"name":"default","start":true}'
   # wait for status SCAN_QR_CODE, then fetch the QR:
   curl -s "http://127.0.0.1:3000/api/default/auth/qr?format=image" -H "X-Api-Key: $K" -o qr.png
   ```
   Scan `qr.png` from WhatsApp → Linked Devices within ~40s (it expires). A FAILED session restarts via `PUT /api/sessions/default {"start":true}`, not POST.
9. Verify: `https://ifp-wa.duckdns.org/monitor/` (basic auth) shows session `WORKING`.

## Notes
- Only the **data** that can't be rebuilt is the paired WhatsApp session (`sessions/`, ~5MB) — backed up weekly by the root cron. Restore it into `sessions/` to avoid re-pairing.
- The live VM currently holds its WAHA secrets inline in its own compose (pre-dating this .env split); this git copy is the canonical rebuild recipe and keeps secrets out of version control.
