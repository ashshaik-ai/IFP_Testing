from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, PlainTextResponse

from app.core.auth import create_token, require_auth
from app.core.config import settings
from app.schemas.voters import AreaMergeRequest, LoginRequest, VoterUpdate
from app.services.area_rules import all_area_options, canonical_area_en, canonical_area_te
from app.services.exporter import area_summaries, voters_to_csv
from app.services.pdf_processor import create_job, process_pdf, update_job
from app.services.storage import job_dir, job_meta_path, load_jobs, read_json, voters_path, write_json
from app.services.transliterate import transliterate_person_name_te


router = APIRouter(prefix="/api")


def _all_voters() -> list[dict]:
    voters: list[dict] = []
    for job in load_jobs():
        voters.extend(read_json(voters_path(job["id"]), []))
    return voters


def _filter_voters(
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
        )
        result = [voter for voter in result if any(query in str(voter.get(field, "")).lower() for field in fields)]
    return result


@router.post("/auth/login")
def login(payload: LoginRequest) -> dict:
    if payload.code not in settings.access_codes:
        raise HTTPException(status_code=401, detail="ప్రవేశ కోడ్ తప్పు")
    return {"token": create_token(payload.code)}


@router.get("/jobs", dependencies=[Depends(require_auth)])
def jobs() -> list[dict]:
    return load_jobs()


@router.get("/area-options", dependencies=[Depends(require_auth)])
def area_options() -> list[dict]:
    return all_area_options()


@router.get("/voters", dependencies=[Depends(require_auth)])
def list_all_voters(
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
    return _filter_voters(
        _all_voters(),
        q=q,
        area=area,
        source=source,
        include_deceased=include_deceased,
        deceased_only=deceased_only,
        include_blocklisted=include_blocklisted,
        blocklisted_only=blocklisted_only,
        include_cancelled=include_cancelled,
        cancelled_only=cancelled_only,
    )


@router.get("/areas", dependencies=[Depends(require_auth)])
def list_all_areas(
    source: str = "",
    include_deceased: bool = False,
    deceased_only: bool = False,
    include_blocklisted: bool = False,
    blocklisted_only: bool = False,
    include_cancelled: bool = False,
    cancelled_only: bool = False,
) -> list[dict]:
    return area_summaries(
        _filter_voters(
            _all_voters(),
            source=source,
            include_deceased=include_deceased,
            deceased_only=deceased_only,
            include_blocklisted=include_blocklisted,
            blocklisted_only=blocklisted_only,
            include_cancelled=include_cancelled,
            cancelled_only=cancelled_only,
        )
    )


@router.post("/areas/merge", dependencies=[Depends(require_auth)])
def merge_all_areas(payload: AreaMergeRequest) -> dict:
    """Merge an area string across every job in one call."""
    from_area = payload.from_area_te.strip()
    to_area = canonical_area_te(payload.to_area_te)
    total_moved = 0
    for job in load_jobs():
        voters = read_json(voters_path(job["id"]), [])
        moved = 0
        for voter in voters:
            if str(voter.get("area_te", "")).strip() != from_area:
                continue
            voter["area_te"] = to_area
            voter["area_en"] = canonical_area_en(to_area)
            voter["needs_review"] = False
            moved += 1
        if moved:
            write_json(voters_path(job["id"]), voters)
            update_job(job["id"], review_count=0)
        total_moved += moved
    return {"from_area_te": from_area, "to_area_te": to_area, "moved_count": total_moved}


@router.get("/export.csv", dependencies=[Depends(require_auth)])
def export_all_csv(
    area: str = "",
    source: str = "",
    include_deceased: bool = False,
    deceased_only: bool = False,
    include_blocklisted: bool = False,
    blocklisted_only: bool = False,
    include_cancelled: bool = False,
    cancelled_only: bool = False,
) -> PlainTextResponse:
    filtered = _filter_voters(
        _all_voters(),
        area=area,
        source=source,
        include_deceased=include_deceased,
        deceased_only=deceased_only,
        include_blocklisted=include_blocklisted,
        blocklisted_only=blocklisted_only,
        include_cancelled=include_cancelled,
        cancelled_only=cancelled_only,
    )
    csv_text = voters_to_csv(filtered, None)
    filename = "filtered-voters.csv" if area or source else "all-voters.csv"
    return PlainTextResponse(
        csv_text,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/jobs", dependencies=[Depends(require_auth)])
async def upload_pdf(background: BackgroundTasks, file: UploadFile = File(...)) -> dict:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF ఫైల్ మాత్రమే అప్లోడ్ చేయండి")
    job = create_job(file.filename)
    target = job_dir(job["id"]) / "source.pdf"
    target.write_bytes(await file.read())
    update_job(job["id"], status="queued", message_te="PDF అప్లోడ్ అయింది")
    background.add_task(process_pdf, job["id"], target)
    return job


@router.post("/jobs/{job_id}/reprocess", dependencies=[Depends(require_auth)])
def reprocess_job(job_id: str, background: BackgroundTasks) -> dict:
    source = job_dir(job_id) / "source.pdf"
    if not source.exists():
        raise HTTPException(status_code=404, detail="మూల PDF కనిపించలేదు")
    update_job(job_id, status="queued", message_te="OCR మళ్లీ ప్రారంభమైంది")
    background.add_task(process_pdf, job_id, source)
    return read_json(job_meta_path(job_id), {})


@router.get("/jobs/{job_id}", dependencies=[Depends(require_auth)])
def job_detail(job_id: str) -> dict:
    meta = read_json(job_meta_path(job_id), None)
    if not meta:
        raise HTTPException(status_code=404, detail="జాబ్ కనిపించలేదు")
    return meta


@router.get("/jobs/{job_id}/voters", dependencies=[Depends(require_auth)])
def list_voters(
    job_id: str,
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
    return _filter_voters(
        read_json(voters_path(job_id), []),
        q=q,
        area=area,
        source=source,
        include_deceased=include_deceased,
        deceased_only=deceased_only,
        include_blocklisted=include_blocklisted,
        blocklisted_only=blocklisted_only,
        include_cancelled=include_cancelled,
        cancelled_only=cancelled_only,
    )


@router.get("/jobs/{job_id}/areas", dependencies=[Depends(require_auth)])
def list_areas(
    job_id: str,
    source: str = "",
    include_deceased: bool = False,
    deceased_only: bool = False,
    include_blocklisted: bool = False,
    blocklisted_only: bool = False,
    include_cancelled: bool = False,
    cancelled_only: bool = False,
) -> list[dict]:
    return area_summaries(
        _filter_voters(
            read_json(voters_path(job_id), []),
            source=source,
            include_deceased=include_deceased,
            deceased_only=deceased_only,
            include_blocklisted=include_blocklisted,
            blocklisted_only=blocklisted_only,
            include_cancelled=include_cancelled,
            cancelled_only=cancelled_only,
        )
    )


@router.patch("/jobs/{job_id}/voters/{voter_id}", dependencies=[Depends(require_auth)])
def update_voter(job_id: str, voter_id: str, payload: VoterUpdate) -> dict:
    voters = read_json(voters_path(job_id), [])
    updates = payload.model_dump(exclude_unset=True)
    for voter in voters:
        if voter["id"] != voter_id:
            continue
        for key, value in updates.items():
            voter[key] = value
        if "name_te" in updates and "name_en" not in updates:
            voter["name_en"] = transliterate_person_name_te(str(voter.get("name_te", "")).strip(), str(voter.get("name_en", "")).strip())
        if voter.get("is_deceased"):
            voter["is_blocklisted"] = False
            voter["is_cancelled"] = False
            voter["is_ifp_voter"] = False
        if voter.get("is_blocklisted"):
            voter["is_deceased"] = False
            voter["is_cancelled"] = False
            voter["is_ifp_voter"] = False
        if voter.get("is_cancelled"):
            voter["is_deceased"] = False
            voter["is_blocklisted"] = False
            voter["is_ifp_voter"] = False
        if voter.get("is_ifp_voter"):
            voter["is_deceased"] = False
            voter["is_blocklisted"] = False
            voter["is_cancelled"] = False
        if "area_te" in updates:
            voter["area_te"] = canonical_area_te(voter.get("area_te", ""))
            voter["area_en"] = canonical_area_en(voter["area_te"])
        voter["needs_review"] = False
        write_json(voters_path(job_id), voters)
        update_job(job_id, review_count=0)
        return voter
    raise HTTPException(status_code=404, detail="ఓటర్ కనిపించలేదు")


@router.post("/jobs/{job_id}/areas/merge", dependencies=[Depends(require_auth)])
def merge_area(job_id: str, payload: AreaMergeRequest) -> dict:
    voters = read_json(voters_path(job_id), [])
    from_area = payload.from_area_te.strip()
    to_area = canonical_area_te(payload.to_area_te)
    moved = 0
    for voter in voters:
        if str(voter.get("area_te", "")).strip() != from_area:
            continue
        voter["area_te"] = to_area
        voter["area_en"] = canonical_area_en(to_area)
        voter["needs_review"] = False
        moved += 1
    if moved:
        write_json(voters_path(job_id), voters)
        update_job(job_id, review_count=0)
    return {
        "from_area_te": from_area,
        "to_area_te": to_area,
        "moved_count": moved,
        "areas": area_summaries(voters),
    }


@router.get("/jobs/{job_id}/export.csv", dependencies=[Depends(require_auth)])
def export_csv(
    job_id: str,
    area: str = "",
    source: str = "",
    include_deceased: bool = False,
    deceased_only: bool = False,
    include_blocklisted: bool = False,
    blocklisted_only: bool = False,
    include_cancelled: bool = False,
    cancelled_only: bool = False,
) -> PlainTextResponse:
    filtered = _filter_voters(
        read_json(voters_path(job_id), []),
        area=area,
        source=source,
        include_deceased=include_deceased,
        deceased_only=deceased_only,
        include_blocklisted=include_blocklisted,
        blocklisted_only=blocklisted_only,
        include_cancelled=include_cancelled,
        cancelled_only=cancelled_only,
    )
    csv_text = voters_to_csv(filtered, None)
    filename = "area-voters.csv" if area else "job-voters.csv"
    return PlainTextResponse(
        csv_text,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/files/{job_id}/{kind}/{filename}", dependencies=[Depends(require_auth)])
def private_file(job_id: str, kind: str, filename: str) -> FileResponse:
    if kind not in {"cards", "photos"}:
        raise HTTPException(status_code=404, detail="ఫైల్ కనిపించలేదు")
    path = (job_dir(job_id) / kind / Path(filename).name).resolve()
    if not path.exists() or not path.is_relative_to(settings.data_dir):
        raise HTTPException(status_code=404, detail="ఫైల్ కనిపించలేదు")
    return FileResponse(path)
