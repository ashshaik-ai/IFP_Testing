from __future__ import annotations

from app.services.area_rules import canonical_area_te
from app.services.storage import load_jobs, read_json, voters_path


def all_voters() -> list[dict]:
    voters: list[dict] = []
    for job in load_jobs():
        voters.extend(read_json(voters_path(job["id"]), []))
    return voters


def filter_voters(
    voters: list[dict],
    q: str = "",
    area: str = "",
    source: str = "",
    include_deceased: bool = False,
    deceased_only: bool = False,
    include_blocklisted: bool = False,
    blocklisted_only: bool = False,
    include_cancelled: bool = False,
    cancelled_only: bool = False,
) -> list[dict]:
    result = list(voters)
    if deceased_only:
        result = [voter for voter in result if bool(voter.get("is_deceased"))]
    elif blocklisted_only:
        result = [voter for voter in result if bool(voter.get("is_blocklisted"))]
    elif cancelled_only:
        result = [voter for voter in result if bool(voter.get("is_cancelled"))]
    elif not include_deceased:
        result = [voter for voter in result if not bool(voter.get("is_deceased"))]
    if not blocklisted_only and not include_blocklisted:
        result = [voter for voter in result if not bool(voter.get("is_blocklisted"))]
    if not cancelled_only and not include_cancelled:
        result = [voter for voter in result if not bool(voter.get("is_cancelled"))]
    source_key = source.strip().lower()
    if area:
        area_match = canonical_area_te(area)
        result = [voter for voter in result if canonical_area_te(voter.get("area_te", "")) == area_match]
    if source_key in {"life", "general"}:
        result = [voter for voter in result if str(voter.get("source_kind", "")).lower() == source_key]
    query = q.strip().lower()
    if query:
        fields = (
            "serial_no",
            "card_no",
            "name_te",
            "name_en",
            "relation_name_te",
            "house_no",
            "area_te",
            "area_en",
            "source_filename",
            "mobile",
        )
        result = [voter for voter in result if any(query in str(voter.get(field, "")).lower() for field in fields)]
    return result
