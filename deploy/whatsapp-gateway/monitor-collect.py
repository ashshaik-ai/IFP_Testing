#!/usr/bin/env python3
"""Lightweight monitor collector for the WhatsApp gateway VM.
Run by cron every minute. Writes status.json + logs.txt into MONITOR_DIR,
served statically by Caddy. No long-running process, ~0 idle RAM.
Secrets (WAHA API key) are read from the container env at runtime, never stored."""
import json
import os
import re
import subprocess
import time
from datetime import datetime, timezone

MONITOR_DIR = "/home/User/waha/monitor"
WAHA_CONTAINER = "waha-waha-1"
CADDY_CONTAINER = "waha-caddy-1"


def sh(cmd):
    try:
        return subprocess.run(cmd, shell=True, capture_output=True, text=True,
                              timeout=15).stdout.strip()
    except Exception:
        return ""


def whatsapp():
    key = sh(f"docker exec {WAHA_CONTAINER} printenv WAHA_API_KEY")
    out = sh(f'curl -s -m 10 http://127.0.0.1:3000/api/sessions/default -H "X-Api-Key: {key}"')
    d = {"status": "UNKNOWN", "engine": "", "device": "", "name": ""}
    try:
        j = json.loads(out)
        d["status"] = j.get("status", "UNKNOWN")
        d["engine"] = (j.get("engine") or {}).get("engine", "")
        me = j.get("me") or {}
        d["device"] = (me.get("id") or "").split("@")[0]
        d["name"] = me.get("pushName") or ""
    except Exception:
        pass
    return d


def infra():
    mem = sh("free -m | awk '/^Mem:/{print $2, $3}'").split()
    swap = sh("free -m | awk '/^Swap:/{print $3}'")
    total_mb, used_mb = (int(mem[0]), int(mem[1])) if len(mem) == 2 else (0, 0)
    disk = sh("df -h / | awk 'NR==2{print $2, $3, $5}'").split()
    load = sh("cat /proc/loadavg | awk '{print $1}'")
    up = sh("uptime -p | sed 's/^up //'")
    return {
        "cpu_load": load or "?",
        "mem_used_mb": used_mb, "mem_total_mb": total_mb,
        "mem_pct": round(used_mb / total_mb * 100) if total_mb else 0,
        "swap_used_mb": int(swap) if swap.isdigit() else 0,
        "disk_used": disk[1] if len(disk) == 3 else "?",
        "disk_total": disk[0] if len(disk) == 3 else "?",
        "disk_pct": int(disk[2].rstrip("%")) if len(disk) == 3 else 0,
        "uptime": up or "?",
    }


def services():
    out = sh('docker ps --format "{{.Names}}|{{.Status}}"')
    rows = []
    for line in out.splitlines():
        if "|" in line:
            name, status = line.split("|", 1)
            rows.append({"name": name, "status": status,
                         "up": status.lower().startswith("up")})
    return rows


def main():
    os.makedirs(MONITOR_DIR, exist_ok=True)
    status = {
        "ts": datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S %Z"),
        "whatsapp": whatsapp(),
        "infra": infra(),
        "services": services(),
    }
    tmp = os.path.join(MONITOR_DIR, "status.json.tmp")
    with open(tmp, "w") as f:
        json.dump(status, f)
    os.replace(tmp, os.path.join(MONITOR_DIR, "status.json"))

    logs = sh(f"docker logs --tail 120 {WAHA_CONTAINER} 2>&1")
    logs = re.sub(r"\x1b\[[0-9;]*m", "", logs)  # strip ANSI colour codes
    with open(os.path.join(MONITOR_DIR, "logs.txt"), "w") as f:
        f.write(logs)


if __name__ == "__main__":
    main()
