from __future__ import annotations

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    code: str = Field(min_length=4)


class VoterRecord(BaseModel):
    id: str
    job_id: str
    source_filename: str = ""
    source_kind: str = ""
    source_badge: str = ""
    source_label_te: str = ""
    source_label_en: str = ""
    serial_no: str = ""
    card_no: str = ""
    name_te: str = ""
    name_en: str = ""
    relation_label_te: str = ""
    relation_name_te: str = ""
    age: str = ""
    occupation_te: str = ""
    house_no: str = ""
    area_te: str = ""
    area_en: str = ""
    page_no: int
    row_no: int
    col_no: int
    photo_url: str = ""
    card_url: str = ""
    confidence: float = 0
    needs_review: bool = False
    is_deceased: bool = False
    is_blocklisted: bool = False
    is_cancelled: bool = False
    is_ifp_voter: bool = False
    is_yt_voter: bool = False
    is_target: bool = False
    is_mf_voter: bool = False
    is_flagged: bool = False
    raw_text: str = ""
    notes: str = ""
    # Member contact + WhatsApp opt-in (broadcast hub). Independent of every
    # tag/archive flag above.
    mobile: str = ""
    mobile_verified: bool = False
    wa_optin: bool = False
    opted_out: bool = False
    consent_ts: str = ""
    consent_source: str = ""
    # None = not checked yet, True = confirmed on WhatsApp, False = confirmed
    # not on WhatsApp (bulk-verified externally, imported by serial_no).
    has_whatsapp: bool | None = None
    # Server-stamped (never client-set) whenever a desk operator manually
    # changes mobile/has_whatsapp via the single-voter PATCH route. Bulk
    # imports use their own dedicated endpoints, so any stamp here reflects a
    # real manual edit -- this is what the "updated contacts" export filters on.
    manual_update_ts: str = ""


class VoterUpdate(BaseModel):
    serial_no: str | None = None
    card_no: str | None = None
    name_te: str | None = None
    name_en: str | None = None
    relation_label_te: str | None = None
    relation_name_te: str | None = None
    age: str | None = None
    occupation_te: str | None = None
    house_no: str | None = None
    area_te: str | None = None
    area_en: str | None = None
    needs_review: bool | None = None
    is_deceased: bool | None = None
    is_blocklisted: bool | None = None
    is_cancelled: bool | None = None
    is_ifp_voter: bool | None = None
    is_yt_voter: bool | None = None
    is_target: bool | None = None
    is_mf_voter: bool | None = None
    is_flagged: bool | None = None
    notes: str | None = None
    mobile: str | None = None
    mobile_verified: bool | None = None
    wa_optin: bool | None = None
    opted_out: bool | None = None
    consent_ts: str | None = None
    consent_source: str | None = None
    has_whatsapp: bool | None = None


class AreaMergeRequest(BaseModel):
    from_area_te: str = Field(min_length=1)
    to_area_te: str = Field(min_length=1)


class AreaSummary(BaseModel):
    area_te: str
    area_en: str = ""
    count: int
    missing_count: int


class JobSummary(BaseModel):
    id: str
    filename: str
    status: str
    message_te: str
    created_at: str
    page_count: int = 0
    voter_count: int = 0
    photo_count: int = 0
    review_count: int = 0
