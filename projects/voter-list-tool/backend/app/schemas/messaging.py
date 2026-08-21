from __future__ import annotations

from pydantic import BaseModel, Field


class SegmentSpec(BaseModel):
    """Audience filter. Resolved against the voter store, then narrowed to
    members who are messageable (have a mobile, opted in, not opted out)."""

    area_te: str = ""
    source: str = ""            # "", "life", "general"
    tag: str = ""              # "", "ifp", "yt", "target", "mf", "flagged"


class SegmentCreate(BaseModel):
    name: str = Field(min_length=1)
    spec: SegmentSpec = SegmentSpec()


class NumberCreate(BaseModel):
    label: str = Field(min_length=1)
    phone: str = Field(min_length=6)   # the SIM's WhatsApp number, E.164
    daily_cap: int = 400
    warmup_start: int = 30


class NumberUpdate(BaseModel):
    status: str | None = None          # "active" | "paused"
    daily_cap: int | None = None


class CampaignCreate(BaseModel):
    name: str = Field(min_length=1)
    body: str = ""                     # caption; supports {name} / {area} tokens
    media_path: str = ""              # reference into existing file storage; "" = text-only
    media_kind: str = ""             # image | video | document | audio | ""
    segment: SegmentSpec = SegmentSpec()
    recipient_ids: list[str] = []     # explicit voter-id override; wins over segment when set
    schedule_at: str = ""             # ISO-8601 UTC; "" = send now


class GatewayEvent(BaseModel):
    """Inbound webhook from the gateway: delivery/read receipts and inbound
    messages (used to detect STOP opt-outs)."""

    event: str                        # delivered | read | failed | inbound
    provider_id: str = ""
    number_phone: str = ""
    from_phone: str = ""             # inbound only
    text: str = ""                   # inbound only
    error: str = ""
