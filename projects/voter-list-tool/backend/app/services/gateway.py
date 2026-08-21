from __future__ import annotations

import base64
import mimetypes
import os
import random
import uuid
from dataclasses import dataclass

import httpx

from app.services.storage import ensure_data_dir


@dataclass
class SendResult:
    ok: bool
    provider_id: str = ""
    error: str = ""


class GatewaySender:
    """Pluggable WhatsApp sender. The outbox worker only ever calls send();
    swapping the mock for a real Evolution API / WAHA client is a drop-in."""

    def send(self, number_phone: str, to_phone: str, caption: str,
             media_path: str = "", media_kind: str = "") -> SendResult:  # pragma: no cover - interface
        raise NotImplementedError


class MockGatewaySender(GatewaySender):
    """No live WhatsApp. Records every send and returns a fake provider id so
    the whole hub (queue, pacing, delivery log, retries) is testable now. Set
    OUTBOX_MOCK_FAIL_RATE (0..1) to exercise the retry/backoff path."""

    def __init__(self, fail_rate: float = 0.0) -> None:
        self.fail_rate = fail_rate
        self.sent: list[dict] = []

    def send(self, number_phone: str, to_phone: str, caption: str,
             media_path: str = "", media_kind: str = "") -> SendResult:
        if self.fail_rate and random.random() < self.fail_rate:
            return SendResult(ok=False, error="mock: simulated send failure")
        rec = {
            "number_phone": number_phone,
            "to_phone": to_phone,
            "caption": caption,
            "media_path": media_path,
            "media_kind": media_kind,
        }
        self.sent.append(rec)
        return SendResult(ok=True, provider_id=f"mock-{uuid.uuid4().hex[:16]}")


_MEDIA_ENDPOINTS = {
    "image": "sendImage",
    "video": "sendVideo",
    "audio": "sendVoice",
    "document": "sendFile",
}


def _normalize_number(phone: str) -> str:
    """Digits only; a bare 10-digit Indian mobile gets the 91 country code."""
    digits = "".join(ch for ch in phone if ch.isdigit())
    return "91" + digits if len(digits) == 10 else digits


class WahaGatewaySender(GatewaySender):
    """Sends over a self-hosted WAHA instance (NOWEB engine, one WhatsApp
    session per deployment for now — see project-docs for the paired SIM).
    India-only: a bare 10-digit voter mobile is assumed local and given the
    91 country code; anything already carrying a country code is left alone.

    SAFETY GATE: send_mode defaults to "allowlist" — anything other than the
    literal string "live" keeps the gate on. In gated mode only numbers in
    `allowlist` are ever contacted; every other recipient is dropped BEFORE any
    network call and reported as a failure, so no bulk send is possible until
    send_mode is explicitly set to "live". An empty allowlist in gated mode
    blocks everything (fail-closed)."""

    def __init__(self, base_url: str, api_key: str, session: str,
                 send_mode: str = "allowlist", allowlist: tuple[str, ...] = ()) -> None:
        self.session = session
        self.live = send_mode.strip().lower() == "live"
        self.allowlist = frozenset(_normalize_number(n) for n in allowlist if n.strip())
        self._client = httpx.Client(
            base_url=base_url.rstrip("/"),
            headers={"X-Api-Key": api_key},
            timeout=30.0,
        )

    def _blocked(self, to_phone: str) -> bool:
        return not self.live and _normalize_number(to_phone) not in self.allowlist

    @staticmethod
    def _chat_id(phone: str) -> str:
        return f"{_normalize_number(phone)}@c.us"

    def _media_file(self, media_path: str) -> dict:
        path = ensure_data_dir() / media_path
        data = path.read_bytes()
        mimetype = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        return {
            "mimetype": mimetype,
            "filename": path.name,
            "data": base64.b64encode(data).decode("ascii"),
        }

    def send(self, number_phone: str, to_phone: str, caption: str,
             media_path: str = "", media_kind: str = "") -> SendResult:
        if self._blocked(to_phone):
            return SendResult(ok=False, error="blocked: recipient not in WA_ALLOWLIST (safe mode)")
        chat_id = self._chat_id(to_phone)
        endpoint = _MEDIA_ENDPOINTS.get(media_kind, "") if media_path else ""
        try:
            if endpoint:
                body = {"session": self.session, "chatId": chat_id,
                        "file": self._media_file(media_path), "caption": caption}
                resp = self._client.post(f"/api/{endpoint}", json=body)
            else:
                resp = self._client.post("/api/sendText", json={
                    "session": self.session, "chatId": chat_id, "text": caption,
                })
            resp.raise_for_status()
            provider_id = resp.json().get("key", {}).get("id", "")
            return SendResult(ok=True, provider_id=provider_id)
        except FileNotFoundError:
            return SendResult(ok=False, error=f"waha: media file missing ({media_path})")
        except httpx.HTTPStatusError as e:
            return SendResult(ok=False, error=f"waha http {e.response.status_code}: {e.response.text[:200]}")
        except httpx.HTTPError as e:
            return SendResult(ok=False, error=f"waha request failed: {e}")


_SENDER: GatewaySender | None = None


def get_sender() -> GatewaySender:
    global _SENDER
    if _SENDER is None:
        if os.getenv("OUTBOX_GATEWAY", "").lower() == "waha":
            _SENDER = WahaGatewaySender(
                base_url=os.environ["WAHA_BASE_URL"],
                api_key=os.environ["WAHA_API_KEY"],
                session=os.getenv("WAHA_SESSION", "default"),
                send_mode=os.getenv("WA_SEND_MODE", "allowlist"),
                allowlist=tuple(os.getenv("WA_ALLOWLIST", "").split(",")),
            )
        else:
            fail_rate = float(os.getenv("OUTBOX_MOCK_FAIL_RATE", "0") or "0")
            _SENDER = MockGatewaySender(fail_rate=fail_rate)
    return _SENDER


def set_sender(sender: GatewaySender) -> None:
    """Test hook to inject a sender."""
    global _SENDER
    _SENDER = sender
