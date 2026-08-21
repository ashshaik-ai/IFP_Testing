from __future__ import annotations

import os
import re
import uuid

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.core.auth import require_auth
from app.services.voter_query import all_voters as _all_voters, filter_voters as _filter_voters
from app.schemas.messaging import (
    CampaignCreate,
    GatewayEvent,
    NumberCreate,
    NumberUpdate,
    SegmentCreate,
    SegmentSpec,
)
from app.services import messaging_store as store
from app.services.storage import ensure_data_dir, load_jobs, media_dir, read_json, voters_path, write_json

router = APIRouter(prefix="/api")

_TAG_FIELD = {
    "ifp": "is_ifp_voter",
    "yt": "is_yt_voter",
    "target": "is_target",
    "mf": "is_mf_voter",
    "flagged": "is_flagged",
}
_STOP_WORDS = {"stop", "unsubscribe", "optout", "opt out", "stop promotions"}
_SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")


def _block_cfg() -> tuple[float, int]:
    try:
        thr = float(os.getenv("BLOCK_PAUSE_THRESHOLD", "0.2") or 0.2)
    except ValueError:
        thr = 0.2
    try:
        ms = int(os.getenv("BLOCK_PAUSE_MIN_SAMPLE", "20") or 20)
    except ValueError:
        ms = 20
    return thr, ms


def _safe_filename(name: str) -> str:
    cleaned = _SAFE_NAME.sub("_", (name or "media").rsplit("/", 1)[-1].rsplit("\\", 1)[-1]).strip("._")
    return cleaned or "media"


def _media_kind(content_type: str, filename: str) -> str:
    ct = (content_type or "").lower()
    if ct.startswith("image/"):
        return "image"
    if ct.startswith("video/"):
        return "video"
    if ct.startswith("audio/"):
        return "audio"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in {"jpg", "jpeg", "png", "gif", "webp"}:
        return "image"
    if ext in {"mp4", "mov", "webm", "3gp"}:
        return "video"
    if ext in {"mp3", "ogg", "m4a", "opus", "wav"}:
        return "audio"
    return "document"


def _media_out(row: dict) -> dict:
    return {**row, "url": f"/api/media/{row['id']}/file"}


def _norm_phone(value: str) -> str:
    return "".join(ch for ch in str(value) if ch.isdigit() or ch == "+").strip()


def _messageable(voter: dict) -> bool:
    return (
        bool(str(voter.get("mobile", "")).strip())
        and bool(voter.get("wa_optin"))
        and not bool(voter.get("opted_out"))
        # Campaign sends only go to WhatsApp-confirmed numbers -- unverified
        # (None) and confirmed-absent (False) are both excluded, not just False.
        and voter.get("has_whatsapp") is True
        # Archived voters are never campaign-eligible, even when passed in
        # explicitly via recipient_ids (the segment path already filters
        # these via _filter_voters, but recipient_ids bypasses that -- this
        # is the one funnel both paths go through, so enforce it here).
        and not bool(voter.get("is_deceased"))
        and not bool(voter.get("is_blocklisted"))
        and not bool(voter.get("is_cancelled"))
    )


def _personalize(body: str, voter: dict) -> str:
    name = (voter.get("name_te") or voter.get("name_en") or "").strip()
    area = (voter.get("area_te") or "").strip()
    return body.replace("{name}", name).replace("{area}", area)


def _resolve_recipients(spec: SegmentSpec, recipient_ids: list[str]) -> list[dict]:
    voters = _all_voters()
    if recipient_ids:
        wanted = set(recipient_ids)
        chosen = [v for v in voters if v["id"] in wanted]
    else:
        # _filter_voters already excludes deceased / blocklisted / cancelled.
        chosen = _filter_voters(voters, area=spec.area_te, source=spec.source)
        field = _TAG_FIELD.get(spec.tag)
        if field:
            chosen = [v for v in chosen if bool(v.get(field))]
    return [v for v in chosen if _messageable(v)]


def _optout_by_phone(phone: str) -> str:
    """Flag a voter (matched by mobile) as opted-out in the JSON store; return
    its id, or '' if no match."""
    target = _norm_phone(phone)
    for job in load_jobs():
        path = voters_path(job["id"])
        voters = read_json(path, [])
        changed = False
        vid = ""
        for voter in voters:
            if _norm_phone(voter.get("mobile", "")) == target and target:
                voter["opted_out"] = True
                changed = True
                vid = voter["id"]
        if changed:
            write_json(path, voters)
            return vid
    return ""


# ── numbers ──────────────────────────────────────────────────────────────

@router.get("/numbers", dependencies=[Depends(require_auth)])
def list_numbers() -> list[dict]:
    return store.list_numbers()


@router.post("/numbers", dependencies=[Depends(require_auth)])
def add_number(payload: NumberCreate) -> dict:
    return store.create_number(payload.label, _norm_phone(payload.phone), payload.daily_cap, payload.warmup_start)


@router.patch("/numbers/{number_id}", dependencies=[Depends(require_auth)])
def patch_number(number_id: str, payload: NumberUpdate) -> dict:
    row = store.update_number(number_id, status=payload.status, daily_cap=payload.daily_cap)
    if not row:
        raise HTTPException(status_code=404, detail="number not found")
    return row


# ── segments ─────────────────────────────────────────────────────────────

@router.get("/segments", dependencies=[Depends(require_auth)])
def list_segments() -> list[dict]:
    return store.list_segments()


@router.post("/segments", dependencies=[Depends(require_auth)])
def add_segment(payload: SegmentCreate) -> dict:
    return store.create_segment(payload.name, payload.spec.model_dump())


@router.get("/segments/preview", dependencies=[Depends(require_auth)])
def preview_segment(area_te: str = "", source: str = "", tag: str = "") -> dict:
    recips = _resolve_recipients(SegmentSpec(area_te=area_te, source=source, tag=tag), [])
    return {"messageable_count": len(recips)}


# ── media library ────────────────────────────────────────────────────────

@router.get("/media", dependencies=[Depends(require_auth)])
def list_media() -> list[dict]:
    return [_media_out(r) for r in store.list_media()]


@router.post("/media", dependencies=[Depends(require_auth)])
async def upload_media(file: UploadFile = File(...)) -> dict:
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="empty file")
    name = _safe_filename(file.filename or "media")
    kind = _media_kind(file.content_type or "", name)
    mid = uuid.uuid4().hex[:12]
    dest = media_dir() / mid
    dest.mkdir(parents=True, exist_ok=True)
    (dest / name).write_bytes(raw)
    row = store.create_media(name, kind, f"media/{mid}/{name}", len(raw), media_id=mid)
    return _media_out(row)


@router.get("/media/{media_id}/file", dependencies=[Depends(require_auth)])
def media_file(media_id: str) -> FileResponse:
    row = store.get_media(media_id)
    if not row:
        raise HTTPException(status_code=404, detail="media not found")
    path = ensure_data_dir() / row["rel_path"]
    if not path.exists():
        raise HTTPException(status_code=404, detail="media file missing")
    return FileResponse(path, filename=row["filename"])


# ── campaigns ────────────────────────────────────────────────────────────

@router.get("/campaigns", dependencies=[Depends(require_auth)])
def list_campaigns() -> list[dict]:
    return store.list_campaigns()


@router.post("/campaigns", dependencies=[Depends(require_auth)])
def create_campaign(payload: CampaignCreate) -> dict:
    camp = store.create_campaign(payload.name, payload.body, payload.media_path, payload.media_kind, payload.schedule_at)
    recipients = [
        {"voter_id": v["id"], "to_phone": _norm_phone(v["mobile"]), "caption": _personalize(payload.body, v)}
        for v in _resolve_recipients(payload.segment, payload.recipient_ids)
    ]
    # Enqueue unassigned; the worker assigns each message to whichever active
    # number is free, so pausing a number never strands its queue.
    n = store.enqueue_messages(
        camp["id"], recipients, payload.body, payload.media_path, payload.media_kind,
        number_ids=[], send_after=payload.schedule_at or "",
    )
    store.set_campaign_status(camp["id"], "scheduled" if payload.schedule_at else "sending", total=n)
    return store.get_campaign(camp["id"])  # type: ignore[return-value]


@router.get("/campaigns/{campaign_id}", dependencies=[Depends(require_auth)])
def get_campaign(campaign_id: str) -> dict:
    camp = store.get_campaign(campaign_id)
    if not camp:
        raise HTTPException(status_code=404, detail="campaign not found")
    return camp


@router.get("/campaigns/{campaign_id}/messages", dependencies=[Depends(require_auth)])
def campaign_messages(campaign_id: str, limit: int = 200, offset: int = 0) -> list[dict]:
    return store.list_messages(campaign_id, limit=limit, offset=offset)


# ── gateway webhook (status receipts + inbound STOP) ─────────────────────

@router.post("/webhooks/gateway")
def gateway_webhook(evt: GatewayEvent, x_gateway_secret: str = Header(default="")) -> dict:
    secret = os.getenv("GATEWAY_WEBHOOK_SECRET", "")
    if secret and x_gateway_secret != secret:
        raise HTTPException(status_code=401, detail="bad webhook secret")
    if evt.event in {"delivered", "read", "failed", "blocked"} and evt.provider_id:
        updated = store.update_status_by_provider(evt.provider_id, evt.event)
        paused = False
        if evt.event in {"blocked", "failed"}:
            nid = store.number_for_provider(evt.provider_id)
            if nid:
                thr, ms = _block_cfg()
                paused = store.auto_pause_if_risky(nid, thr, ms)
        return {"updated": updated, "auto_paused": paused}
    if evt.event == "inbound":
        if evt.text.strip().lower() in _STOP_WORDS:
            vid = _optout_by_phone(evt.from_phone)
            return {"opted_out": bool(vid), "suppressed": store.opt_out_voter(vid) if vid else 0}
        return {"ok": True}
    return {"ok": True}
