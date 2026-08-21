from __future__ import annotations

import json
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.services.storage import ensure_data_dir

# ponytail: one process, one connection, one lock. At ~3k members and a
# low write rate a global lock is simpler and safe; revisit only if the
# outbox ever runs in multiple processes.
_LOCK = threading.Lock()
_CONN: sqlite3.Connection | None = None


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


def db_path() -> Path:
    return ensure_data_dir() / "messaging.db"


def _connect() -> sqlite3.Connection:
    global _CONN
    if _CONN is None:
        _CONN = sqlite3.connect(db_path(), check_same_thread=False)
        _CONN.row_factory = sqlite3.Row
        _CONN.execute("PRAGMA journal_mode=WAL")
        _CONN.execute("PRAGMA foreign_keys=ON")
        _init(_CONN)
    return _CONN


def _init(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS numbers (
            id TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            phone TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            daily_cap INTEGER NOT NULL DEFAULT 400,
            warmup_start INTEGER NOT NULL DEFAULT 30,
            first_active_date TEXT NOT NULL DEFAULT '',
            sent_today INTEGER NOT NULL DEFAULT 0,
            day_stamp TEXT NOT NULL DEFAULT '',
            last_send_ts TEXT NOT NULL DEFAULT '',
            paused_reason TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS media (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            kind TEXT NOT NULL DEFAULT '',
            rel_path TEXT NOT NULL,
            size INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS campaigns (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            body TEXT NOT NULL DEFAULT '',
            media_path TEXT NOT NULL DEFAULT '',
            media_kind TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft',
            total INTEGER NOT NULL DEFAULT 0,
            schedule_at TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            campaign_id TEXT NOT NULL,
            voter_id TEXT NOT NULL DEFAULT '',
            to_phone TEXT NOT NULL,
            number_id TEXT,
            status TEXT NOT NULL DEFAULT 'queued',
            provider_id TEXT NOT NULL DEFAULT '',
            attempts INTEGER NOT NULL DEFAULT 0,
            last_error TEXT NOT NULL DEFAULT '',
            caption TEXT NOT NULL DEFAULT '',
            media_path TEXT NOT NULL DEFAULT '',
            media_kind TEXT NOT NULL DEFAULT '',
            send_after TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_messages_campaign ON messages(campaign_id);
        CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
        CREATE INDEX IF NOT EXISTS idx_messages_provider ON messages(provider_id);
        CREATE INDEX IF NOT EXISTS idx_messages_voter ON messages(voter_id);
        CREATE INDEX IF NOT EXISTS idx_messages_number ON messages(number_id);

        CREATE TABLE IF NOT EXISTS segments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            spec_json TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL
        );
        """
    )
    # migrate legacy DBs that predate the paused_reason column
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(numbers)")}
    if "paused_reason" not in cols:
        conn.execute("ALTER TABLE numbers ADD COLUMN paused_reason TEXT NOT NULL DEFAULT ''")
    conn.commit()


def init_db() -> None:
    with _LOCK:
        _connect()


# ── numbers ──────────────────────────────────────────────────────────────

def create_number(label: str, phone: str, daily_cap: int, warmup_start: int) -> dict[str, Any]:
    with _LOCK:
        conn = _connect()
        row = {
            "id": _new_id(),
            "label": label,
            "phone": phone,
            "status": "active",
            "daily_cap": daily_cap,
            "warmup_start": warmup_start,
            "first_active_date": _today(),
            "sent_today": 0,
            "day_stamp": _today(),
            "last_send_ts": "",
            "paused_reason": "",
            "created_at": _now(),
        }
        conn.execute(
            """INSERT INTO numbers (id,label,phone,status,daily_cap,warmup_start,
                   first_active_date,sent_today,day_stamp,last_send_ts,paused_reason,created_at)
               VALUES (:id,:label,:phone,:status,:daily_cap,:warmup_start,
                   :first_active_date,:sent_today,:day_stamp,:last_send_ts,:paused_reason,:created_at)""",
            row,
        )
        conn.commit()
        return row


def list_numbers() -> list[dict[str, Any]]:
    with _LOCK:
        conn = _connect()
        return [dict(r) for r in conn.execute("SELECT * FROM numbers ORDER BY created_at")]


def update_number(number_id: str, status: str | None = None, daily_cap: int | None = None) -> dict[str, Any] | None:
    with _LOCK:
        conn = _connect()
        sets, params = [], []
        if status is not None:
            sets.append("status=?")
            params.append(status)
            if status == "active":   # manual re-activation clears any auto-pause note
                sets.append("paused_reason=?")
                params.append("")
        if daily_cap is not None:
            sets.append("daily_cap=?")
            params.append(daily_cap)
        if sets:
            params.append(number_id)
            conn.execute(f"UPDATE numbers SET {','.join(sets)} WHERE id=?", params)
            conn.commit()
        row = conn.execute("SELECT * FROM numbers WHERE id=?", (number_id,)).fetchone()
        return dict(row) if row else None


def number_for_provider(provider_id: str) -> str | None:
    with _LOCK:
        conn = _connect()
        row = conn.execute(
            "SELECT number_id FROM messages WHERE provider_id=? AND provider_id!='' LIMIT 1",
            (provider_id,),
        ).fetchone()
        return row["number_id"] if row and row["number_id"] else None


def number_health(number_id: str) -> dict[str, int]:
    """Resolved outcomes attributed to this number: how many landed vs how many
    were blocked/failed. Drives the auto-pause guard."""
    with _LOCK:
        conn = _connect()
        rows = conn.execute(
            "SELECT status, COUNT(*) AS n FROM messages WHERE number_id=? GROUP BY status",
            (number_id,),
        )
        by = {r["status"]: r["n"] for r in rows}
        landed = by.get("sent", 0) + by.get("delivered", 0) + by.get("read", 0)
        bad = by.get("blocked", 0) + by.get("failed", 0)
        return {"landed": landed, "bad": bad, "total": landed + bad,
                "blocked": by.get("blocked", 0), "failed": by.get("failed", 0)}


def auto_pause_if_risky(number_id: str, threshold: float, min_sample: int) -> bool:
    """Pause a number whose block/fail ratio crosses the threshold over a
    meaningful sample. Blocks are the #1 WhatsApp ban signal, so pulling a
    number early protects it (and the others) from a ban. Returns True if it
    just paused the number."""
    health = number_health(number_id)
    if health["total"] < min_sample:
        return False
    if health["bad"] / health["total"] < threshold:
        return False
    with _LOCK:
        conn = _connect()
        row = conn.execute("SELECT status FROM numbers WHERE id=?", (number_id,)).fetchone()
        if not row or row["status"] != "active":
            return False
        reason = f"auto: {health['blocked']} blocked / {health['failed']} failed of {health['total']}"
        conn.execute("UPDATE numbers SET status='paused', paused_reason=? WHERE id=?", (reason, number_id))
        conn.commit()
        return True


def today_cap(number: dict[str, Any]) -> int:
    """Warm-up ramp: start low, grow ~20%/day, clamp at daily_cap."""
    first = number.get("first_active_date") or _today()
    try:
        days = (datetime.strptime(_today(), "%Y-%m-%d") - datetime.strptime(first, "%Y-%m-%d")).days
    except ValueError:
        days = 0
    ramped = int(number["warmup_start"] * (1.2 ** max(days, 0)))
    return max(1, min(ramped, int(number["daily_cap"])))


# ── campaigns ────────────────────────────────────────────────────────────

def create_campaign(name: str, body: str, media_path: str, media_kind: str, schedule_at: str) -> dict[str, Any]:
    with _LOCK:
        conn = _connect()
        row = {
            "id": _new_id(),
            "name": name,
            "body": body,
            "media_path": media_path,
            "media_kind": media_kind,
            "status": "draft",
            "total": 0,
            "schedule_at": schedule_at,
            "created_at": _now(),
        }
        conn.execute(
            """INSERT INTO campaigns (id,name,body,media_path,media_kind,status,total,schedule_at,created_at)
               VALUES (:id,:name,:body,:media_path,:media_kind,:status,:total,:schedule_at,:created_at)""",
            row,
        )
        conn.commit()
        return row


def _campaign_stats(conn: sqlite3.Connection, campaign_id: str) -> dict[str, int]:
    rows = conn.execute(
        "SELECT status, COUNT(*) AS n FROM messages WHERE campaign_id=? GROUP BY status",
        (campaign_id,),
    )
    return {r["status"]: r["n"] for r in rows}


def list_campaigns() -> list[dict[str, Any]]:
    with _LOCK:
        conn = _connect()
        out = []
        for r in conn.execute("SELECT * FROM campaigns ORDER BY created_at DESC"):
            c = dict(r)
            c["stats"] = _campaign_stats(conn, c["id"])
            out.append(c)
        return out


def get_campaign(campaign_id: str) -> dict[str, Any] | None:
    with _LOCK:
        conn = _connect()
        r = conn.execute("SELECT * FROM campaigns WHERE id=?", (campaign_id,)).fetchone()
        if not r:
            return None
        c = dict(r)
        c["stats"] = _campaign_stats(conn, campaign_id)
        return c


def set_campaign_status(campaign_id: str, status: str, total: int | None = None) -> None:
    with _LOCK:
        conn = _connect()
        if total is None:
            conn.execute("UPDATE campaigns SET status=? WHERE id=?", (status, campaign_id))
        else:
            conn.execute("UPDATE campaigns SET status=?, total=? WHERE id=?", (status, total, campaign_id))
        conn.commit()


# ── messages / delivery log ──────────────────────────────────────────────

def enqueue_messages(campaign_id: str, recipients: list[dict[str, Any]], caption: str,
                     media_path: str, media_kind: str, number_ids: list[str], send_after: str) -> int:
    """Bulk-insert one queued message per recipient, round-robin across the
    active numbers. recipients: [{voter_id, to_phone, caption?}]."""
    with _LOCK:
        conn = _connect()
        now = _now()
        rows = []
        for i, rec in enumerate(recipients):
            assigned = number_ids[i % len(number_ids)] if number_ids else None
            rows.append({
                "id": _new_id(),
                "campaign_id": campaign_id,
                "voter_id": rec.get("voter_id", ""),
                "to_phone": rec["to_phone"],
                "number_id": assigned,
                "status": "queued",
                "provider_id": "",
                "attempts": 0,
                "last_error": "",
                "caption": rec.get("caption", caption),
                "media_path": media_path,
                "media_kind": media_kind,
                "send_after": send_after,
                "created_at": now,
                "updated_at": now,
            })
        conn.executemany(
            """INSERT INTO messages (id,campaign_id,voter_id,to_phone,number_id,status,provider_id,
                   attempts,last_error,caption,media_path,media_kind,send_after,created_at,updated_at)
               VALUES (:id,:campaign_id,:voter_id,:to_phone,:number_id,:status,:provider_id,
                   :attempts,:last_error,:caption,:media_path,:media_kind,:send_after,:created_at,:updated_at)""",
            rows,
        )
        conn.commit()
        return len(rows)


def list_messages(campaign_id: str, limit: int = 200, offset: int = 0) -> list[dict[str, Any]]:
    with _LOCK:
        conn = _connect()
        rows = conn.execute(
            "SELECT * FROM messages WHERE campaign_id=? ORDER BY created_at LIMIT ? OFFSET ?",
            (campaign_id, limit, offset),
        )
        return [dict(r) for r in rows]


def claim_next_message(number_id: str, now_iso: str) -> dict[str, Any] | None:
    """Atomically claim the next due queued message for this number (or an
    unassigned one), marking it 'sending' so no other tick re-sends it."""
    with _LOCK:
        conn = _connect()
        row = conn.execute(
            """SELECT * FROM messages
               WHERE status='queued' AND (number_id=? OR number_id IS NULL)
                 AND (send_after='' OR send_after<=?)
               ORDER BY created_at LIMIT 1""",
            (number_id, now_iso),
        ).fetchone()
        if not row:
            return None
        conn.execute(
            "UPDATE messages SET status='sending', number_id=?, updated_at=? WHERE id=?",
            (number_id, now_iso, row["id"]),
        )
        conn.commit()
        claimed = dict(row)
        claimed["status"] = "sending"
        claimed["number_id"] = number_id
        return claimed


def mark_sent(message_id: str, number_id: str, provider_id: str) -> None:
    with _LOCK:
        conn = _connect()
        now = _now()
        conn.execute(
            "UPDATE messages SET status='sent', provider_id=?, attempts=attempts+1, updated_at=? WHERE id=?",
            (provider_id, now, message_id),
        )
        # bump the number's daily counter, resetting it on a new day
        num = conn.execute("SELECT * FROM numbers WHERE id=?", (number_id,)).fetchone()
        if num:
            day = _today()
            sent = (num["sent_today"] + 1) if num["day_stamp"] == day else 1
            conn.execute(
                "UPDATE numbers SET sent_today=?, day_stamp=?, last_send_ts=? WHERE id=?",
                (sent, day, now, number_id),
            )
        conn.commit()


def mark_failed(message_id: str, error: str, max_attempts: int, backoff_seconds: int) -> None:
    """Requeue with a backoff send_after, or dead-letter after max_attempts."""
    from datetime import timedelta
    with _LOCK:
        conn = _connect()
        now = datetime.now(timezone.utc)
        row = conn.execute("SELECT attempts FROM messages WHERE id=?", (message_id,)).fetchone()
        attempts = (row["attempts"] if row else 0) + 1
        if attempts >= max_attempts:
            conn.execute(
                "UPDATE messages SET status='failed', attempts=?, last_error=?, updated_at=? WHERE id=?",
                (attempts, error, now.isoformat(), message_id),
            )
        else:
            retry_at = (now + timedelta(seconds=backoff_seconds * attempts)).isoformat()
            conn.execute(
                "UPDATE messages SET status='queued', attempts=?, last_error=?, send_after=?, updated_at=? WHERE id=?",
                (attempts, error, retry_at, now.isoformat(), message_id),
            )
        conn.commit()


def update_status_by_provider(provider_id: str, status: str) -> int:
    with _LOCK:
        conn = _connect()
        cur = conn.execute(
            "UPDATE messages SET status=?, updated_at=? WHERE provider_id=? AND provider_id!=''",
            (status, _now(), provider_id),
        )
        conn.commit()
        return cur.rowcount


def opt_out_voter(voter_id: str) -> int:
    """Suppress any still-queued messages for a voter who sent STOP."""
    with _LOCK:
        conn = _connect()
        cur = conn.execute(
            "UPDATE messages SET status='opted_out', updated_at=? WHERE voter_id=? AND status IN ('queued','sending')",
            (_now(), voter_id),
        )
        conn.commit()
        return cur.rowcount


# ── segments ─────────────────────────────────────────────────────────────

def create_segment(name: str, spec: dict[str, Any]) -> dict[str, Any]:
    with _LOCK:
        conn = _connect()
        row = {"id": _new_id(), "name": name, "spec_json": json.dumps(spec, ensure_ascii=False), "created_at": _now()}
        conn.execute(
            "INSERT INTO segments (id,name,spec_json,created_at) VALUES (:id,:name,:spec_json,:created_at)",
            row,
        )
        conn.commit()
        row["spec"] = spec
        return row


def list_segments() -> list[dict[str, Any]]:
    with _LOCK:
        conn = _connect()
        out = []
        for r in conn.execute("SELECT * FROM segments ORDER BY created_at DESC"):
            d = dict(r)
            d["spec"] = json.loads(d.pop("spec_json"))
            out.append(d)
        return out


# ── media library ────────────────────────────────────────────────────────

def create_media(filename: str, kind: str, rel_path: str, size: int, media_id: str | None = None) -> dict[str, Any]:
    with _LOCK:
        conn = _connect()
        row = {"id": media_id or _new_id(), "filename": filename, "kind": kind, "rel_path": rel_path,
               "size": size, "created_at": _now()}
        conn.execute(
            "INSERT INTO media (id,filename,kind,rel_path,size,created_at) VALUES (:id,:filename,:kind,:rel_path,:size,:created_at)",
            row,
        )
        conn.commit()
        return row


def list_media() -> list[dict[str, Any]]:
    with _LOCK:
        conn = _connect()
        return [dict(r) for r in conn.execute("SELECT * FROM media ORDER BY created_at DESC")]


def get_media(media_id: str) -> dict[str, Any] | None:
    with _LOCK:
        conn = _connect()
        row = conn.execute("SELECT * FROM media WHERE id=?", (media_id,)).fetchone()
        return dict(row) if row else None
