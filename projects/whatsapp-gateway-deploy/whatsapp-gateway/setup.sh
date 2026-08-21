#!/usr/bin/env bash
# One-shot provisioning for a fresh Ubuntu 22.04 e2-micro to run the WhatsApp gateway.
# Idempotent-ish; safe to re-run. Run as the login user (needs sudo).
set -euo pipefail

# 1. Swap (2GB) — required on a 1GB VM
if ! sudo swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
  sudo sysctl vm.swappiness=10
fi

# 2. Docker + Compose
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$(whoami)"
  sudo systemctl enable --now docker
  echo "Log out/in (or newgrp docker) so group membership applies, then re-run."
  exit 0
fi

# 3. App dir + secrets
cd "$(dirname "$0")"
[ -f .env ] || { echo "Create .env from .env.example first."; exit 1; }
mkdir -p sessions media monitor
grep -q __MONITOR_HASH__ Caddyfile && { echo "Set the monitor hash in Caddyfile first (see README)."; exit 1; }

# 4. Bring up
docker compose up -d
echo "Up. Pair the WhatsApp SIM via QR (see README §Pairing), then install crons (crontab.example)."
