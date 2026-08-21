from __future__ import annotations

import os
import random
import threading
import time
from datetime import datetime, timezone

from app.services import messaging_store as store
from app.services.gateway import get_sender


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, "") or default)
    except ValueError:
        return default


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, "") or default)
    except ValueError:
        return default


class Outbox:
    """Drains the message queue at a safe, human-like pace, independently per
    number: warm-up ramp + daily cap + jittered delay between sends. Runs as a
    single daemon thread; claiming a message marks it 'sending' so a message is
    never sent twice."""

    def __init__(self) -> None:
        self.tick = _env_float("OUTBOX_TICK", 1.0)
        self.min_delay = _env_float("OUTBOX_MIN_DELAY", 8.0)
        self.max_delay = _env_float("OUTBOX_MAX_DELAY", 25.0)
        self.max_attempts = _env_int("OUTBOX_MAX_ATTEMPTS", 3)
        self.backoff = _env_int("OUTBOX_BACKOFF", 60)
        self.block_threshold = _env_float("BLOCK_PAUSE_THRESHOLD", 0.2)
        self.block_min_sample = _env_int("BLOCK_PAUSE_MIN_SAMPLE", 20)
        self._next_allowed: dict[str, float] = {}   # number_id -> monotonic time
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        store.init_db()
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, name="outbox", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                self.run_once()
            except Exception:  # never let the worker thread die
                pass
            self._stop.wait(self.tick)

    def run_once(self) -> int:
        """One pass over the active numbers. Returns how many messages were
        sent this pass (used by tests to drain synchronously)."""
        sent = 0
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        now_mono = time.monotonic()
        for number in store.list_numbers():
            if number["status"] != "active":
                continue
            if now_mono < self._next_allowed.get(number["id"], 0.0):
                continue
            effective_sent = number["sent_today"] if number["day_stamp"] == today else 0
            if effective_sent >= store.today_cap(number):
                continue
            msg = store.claim_next_message(number["id"], datetime.now(timezone.utc).isoformat())
            if not msg:
                continue
            result = get_sender().send(
                number_phone=number["phone"],
                to_phone=msg["to_phone"],
                caption=msg["caption"],
                media_path=msg["media_path"],
                media_kind=msg["media_kind"],
            )
            if result.ok:
                store.mark_sent(msg["id"], number["id"], result.provider_id)
                sent += 1
            else:
                store.mark_failed(msg["id"], result.error, self.max_attempts, self.backoff)
                store.auto_pause_if_risky(number["id"], self.block_threshold, self.block_min_sample)
            self._next_allowed[number["id"]] = now_mono + random.uniform(self.min_delay, self.max_delay)
        return sent


_OUTBOX: Outbox | None = None


def get_outbox() -> Outbox:
    global _OUTBOX
    if _OUTBOX is None:
        _OUTBOX = Outbox()
    return _OUTBOX


def start_worker() -> None:
    if os.getenv("OUTBOX_WORKER", "1").lower() in {"1", "true", "yes"}:
        get_outbox().start()
