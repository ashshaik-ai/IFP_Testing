# Deployment — production infra + safe deploy procedure

`https://ifp-desk.duckdns.org/` is **not** hosted from this repo checkout and is **not** backed by this machine's local `backend/data/` folder (that's a disconnected local snapshot). It's a GCP Compute Engine VM running the real stack via Docker Compose.

## Quick facts

| Thing | Value |
|---|---|
| VM name | `voter-tool`, zone `us-central1-f` |
| External IP | `35.224.252.212` (DNS: `ifp-desk.duckdns.org`) |
| GCP project | `project-1b834666-3721-447f-87e`, account `iamashrafshaik@gmail.com` |
| SSH | `gcloud compute ssh voter-tool --zone=us-central1-f --command="..."` — `gcloud` CLI already authenticated, no key setup needed |
| SSH login user | `User` (OS-login) — needs `sudo` for docker and for the deploy dir |
| Deploy dir | `/home/iamashrafshaik/ifp` (owner `iamashrafshaik`, different from the SSH login user) — matches git remote `ashshaik-ai/IFP_Testing`, branch `testing` |
| Decoy file | `/home/iamashrafshaik/docker-compose.yml` also exists but is **not** active — the real one is inside `ifp/` |
| Compose project | `ifp` → containers `ifp-frontend-1`, `ifp-backend-1`, `ifp-caddy-1` |
| Data volume | `ifp_voter_data` (named Docker volume, mounted `/app/data` in backend) — **persists across restarts/redeploys by design** |
| Other volumes | `ifp_caddy_data`, `ifp_caddy_config` (TLS certs — untouched by app deploys) |
| Deploy branch | **`testing` only.** `main` diverged onto an unrelated commit history in this monorepo — never push/pull it for this app |

## Hard rule: never skip backup validation

Never proceed past the rebuild step without validating the backup first. Taking a backup isn't enough — a silently-corrupt or empty backup is worse than no backup, because it gives false confidence right before an irreversible step.

## Safe deploy procedure

**0. Preconditions** — confirm the diff is frontend-only (or otherwise low-risk):
```bash
git diff --stat -- voter-list-tool/backend/ docker-compose.yml Caddyfile
```
Zero output means nothing touching data handling or infra config changed.

**1. Commit + push locally (never touch `main`)**:
```bash
git add <only the files you actually changed>
git commit -m "..."
git push origin testing
```

**2. Verify the VM and check current container state (read-only)**:
```bash
gcloud compute instances list
gcloud compute ssh voter-tool --zone=us-central1-f --command="sudo docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
```

**3. Take a backup, then validate it — do not skip validation.** Pre-pull `alpine` separately first; combining pull+backup in one call can time out on this small e2-micro instance:
```bash
gcloud compute ssh voter-tool --zone=us-central1-f --command="sudo docker pull alpine:latest"
gcloud compute ssh voter-tool --zone=us-central1-f --command="sudo docker run --rm -v ifp_voter_data:/data -v /home/iamashrafshaik:/backup alpine sh -c 'tar czf /backup/voter_data_backup_\$(date +%Y%m%d_%H%M%S).tar.gz -C /data . && ls -la /backup/*.tar.gz'"
```
**3b. Validate (mandatory gate)**:
```bash
gcloud compute ssh voter-tool --zone=us-central1-f --command="sudo tar tzf /home/iamashrafshaik/voter_data_backup_<TIMESTAMP>.tar.gz | wc -l && sudo tar tzf /home/iamashrafshaik/voter_data_backup_<TIMESTAMP>.tar.gz | head -5"
```
Confirm: the archive lists cleanly, the entry count is plausible for the real data, and expected top-level files/dirs (`jobs/`, `access_code.txt`) actually appear. If anything looks wrong — stop, re-take the backup, and re-validate. Never trust exit code `0` alone.

**4. Pull latest code on the server**:
```bash
gcloud compute ssh voter-tool --zone=us-central1-f --command="sudo bash -c 'cd /home/iamashrafshaik/ifp && git pull origin testing && git log --oneline -3'"
```

**5. Rebuild + restart, detached server-side.** A Next.js build on this e2-micro instance takes 5–10+ minutes — this is the step that goes wrong if launched carelessly (see Gotchas):
```bash
gcloud compute ssh voter-tool --zone=us-central1-f --command="sudo bash -c 'cd /home/iamashrafshaik/ifp && nohup docker compose up -d --build > /tmp/deploy.log 2>&1 & disown; sleep 2; echo LAUNCHED'"
```

**6. Poll via fresh, short-lived SSH calls** (don't hold one connection open and wait):
```bash
gcloud compute ssh voter-tool --zone=us-central1-f --command="tail -10 /tmp/deploy.log; echo ---; sudo docker ps --format '{{.Names}} {{.Status}}'"
```
Done when both `ifp-frontend-1` and `ifp-backend-1` show "Up N seconds" (fresh restart). `ifp-caddy-1` should stay untouched ("Up N days").

**7. Never run** `docker compose down -v` or `docker volume rm ifp_voter_data` — `-v` is the only thing in this whole flow that actually deletes data.

## Verification checklist (after every deploy)

1. New UI actually live (a feature only in the new build).
2. **Data integrity** — from a local dev console:
   ```js
   const res = await fetch("https://ifp-desk.duckdns.org/api/voters?include_deceased=1&include_blocklisted=1&include_cancelled=1", { headers: { Authorization: `Bearer ${token}` } });
   const voters = await res.json();
   console.log(voters.length); // compare against the pre-deploy count
   ```
   Spot-check one specific known record still has the expected value.
3. Core flows: login → atlas → drill into an area → open a voter modal → Escape closes it. Zero console errors.
4. Container logs:
   ```bash
   gcloud compute ssh voter-tool --zone=us-central1-f --command="sudo docker logs ifp-frontend-1 --tail 20 && sudo docker logs ifp-backend-1 --tail 20"
   ```

## Rollback

Restore the volume from the pre-deploy backup:
```bash
gcloud compute ssh voter-tool --zone=us-central1-f --command="sudo docker run --rm -v ifp_voter_data:/data -v /home/iamashrafshaik:/backup alpine sh -c 'rm -rf /data/* && tar xzf /backup/voter_data_backup_<TIMESTAMP>.tar.gz -C /data'"
```
Roll back code with `git reset --hard <previous-commit>` in `/home/iamashrafshaik/ifp` (only if the new code is the problem, not the data), then repeat step 5.

## Gotchas / lessons learned

- **`main` vs `testing`**: `main` diverged onto a completely unrelated history (automated rates-update commits from a different part of this monorepo). Only `testing` matters for this app. Confirm with `git rev-list --left-right --count main...testing` if unsure — a huge divergence count is the signal.
- **Client-side vs server-side backgrounding**: launching the rebuild as `ssh ... "docker compose up -d --build" &` (backgrounding on the *local* side) is unsafe — if the SSH session drops, the remote command dies with it (no `nohup`/`disown`). Always launch with `nohup ... & disown` **inside** the remote command string itself, then poll via separate fresh SSH calls.
- **Timeouts**: individual `gcloud compute ssh` calls on this e2-micro instance can take 10–30s just to connect. Give read-only status checks 30–60s; the long-running build itself only needs a few seconds to return "LAUNCHED" since it's already detached server-side.
- **`docker ps` needs sudo**, but plain `ssh ... "cd /home/iamashrafshaik/ifp"` fails with Permission denied for the `User` login account — wrap in `sudo bash -c '...'` when you need both filesystem access to the deploy dir and shell features (`&&`, `cd`) together.
- **Don't `git add -A`/`git add .` for a deploy commit** — this monorepo has other in-progress work (from other tools/sessions) sitting uncommitted at the repo root. Stage only the exact files you intend to ship.
- **Local dev talks to production**: `frontend/.env.local` sets `NEXT_PUBLIC_API_BASE` to the live production backend URL, not localhost. Testing features locally (`npm run dev`) can read/write real production data unless you deliberately point it elsewhere.
