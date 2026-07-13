from __future__ import annotations

import json
import random
import string
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse, RedirectResponse

from app.core.auth import create_token, require_auth
from app.core.config import settings
from app.schemas.voters import AreaMergeRequest, LoginRequest, VoterUpdate
from app.services.area_rules import all_area_options, canonical_area_en, canonical_area_te
from app.services.exporter import area_summaries, voters_to_csv
from app.services.flag_import import import_flags_from_xlsx
from app.services.pdf_processor import create_job, process_pdf, update_job
from app.services.phone_import import import_phones_from_xlsx
from app.services.storage import job_dir, job_meta_path, load_jobs, read_json, voters_path, write_json
from app.services.wa_status_import import import_whatsapp_status_from_xlsx
from app.services.transliterate import transliterate_person_name_te
from app.services.voter_query import all_voters, filter_voters


router = APIRouter(prefix="/api")

_SECURITY_LOG = Path("/app/data/login_log.json")
_BLOCKED_IPS  = Path("/app/data/blocked_ips.json")
_CODE_FILE    = Path("/app/data/access_code.txt")


def _get_codes() -> list[str]:
    if _CODE_FILE.exists():
        code = _CODE_FILE.read_text().strip()
        if code:
            return [code]
    return list(settings.access_codes)


def _generate_code() -> str:
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=8))
    return f"IFP-{suffix}"


def _real_ip(request: Request) -> str:
    return (
        request.headers.get("X-Real-IP")
        or request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        or (request.client.host if request.client else "unknown")
    )

def _log_attempt(ip: str, device: str, success: bool) -> None:
    try:
        log: list = json.loads(_SECURITY_LOG.read_text()) if _SECURITY_LOG.exists() else []
    except Exception:
        log = []
    log.insert(0, {
        "ts": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "ip": ip,
        "device": device[:150],
        "ok": success,
    })
    _SECURITY_LOG.write_text(json.dumps(log[:1000]))

def _blocked_ips() -> list[str]:
    try:
        return json.loads(_BLOCKED_IPS.read_text()) if _BLOCKED_IPS.exists() else []
    except Exception:
        return []


# Moved to app.services.voter_query so the messaging hub can reuse them
# without importing this module's OCR/PDF dependencies. Aliased here to keep
# the existing call sites (and their leading-underscore names) unchanged.
_all_voters = all_voters
_filter_voters = filter_voters


@router.post("/auth/login")
def login(payload: LoginRequest, request: Request) -> dict:
    ip = _real_ip(request)
    device = request.headers.get("User-Agent", "unknown")
    if ip in _blocked_ips():
        _log_attempt(ip, device, False)
        raise HTTPException(status_code=403, detail="Access denied")
    if payload.code not in _get_codes():
        _log_attempt(ip, device, False)
        raise HTTPException(status_code=401, detail="ప్రవేశ కోడ్ తప్పు")
    _log_attempt(ip, device, True)
    return {"token": create_token(payload.code)}


@router.get("/admin/security", response_class=HTMLResponse)
def security_dashboard(code: str = "") -> HTMLResponse:
    if code not in _get_codes():
        raise HTTPException(status_code=403, detail="Access denied")
    log: list = []
    try:
        log = json.loads(_SECURITY_LOG.read_text()) if _SECURITY_LOG.exists() else []
    except Exception:
        pass
    blocked = _blocked_ips()
    current_code = _get_codes()[0]
    rows = ""
    for e in log:
        status = "✅ Login" if e.get("ok") else "❌ Failed"
        ip = e.get("ip", "")
        is_blocked = ip in blocked
        row_style = ' style="background:#fee"' if is_blocked else ""
        if is_blocked:
            block_btn = f'<form method="post" action="/api/admin/unblock-ip" style="display:inline"><input type="hidden" name="ip" value="{ip}"><input type="hidden" name="code" value="{code}"><button style="color:green;border:none;background:none;cursor:pointer">Unblock</button></form>'
        else:
            block_btn = f'<form method="post" action="/api/admin/block-ip" style="display:inline"><input type="hidden" name="ip" value="{ip}"><input type="hidden" name="code" value="{code}"><button style="color:red;border:none;background:none;cursor:pointer">Block & Change Code</button></form>'
        ts = e.get("ts", "")
        device = e.get("device", "")
        rows += f'<tr{row_style}><td>{ts}</td><td>{status}</td><td>{ip}</td><td style="font-size:11px;max-width:300px;overflow:hidden">{device}</td><td>{block_btn}</td></tr>'
    blocked_list = "".join(f"<li>{ip} <form method='post' action='/api/admin/unblock-ip' style='display:inline'><input type='hidden' name='ip' value='{ip}'><input type='hidden' name='code' value='{code}'><button style='color:green;border:none;background:none;cursor:pointer'>Unblock</button></form></li>" for ip in blocked) or "<li>None</li>"
    html = f"""<!doctype html><html><head><meta charset='utf-8'><title>IFP Security Log</title>
    <style>body{{font-family:sans-serif;padding:20px}}table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #ddd;padding:8px;text-align:left}}th{{background:#333;color:#fff}}tr:hover{{background:#f5f5f5}}.code-box{{background:#1a1a2e;color:#00ff88;font-size:22px;font-family:monospace;padding:16px 24px;border-radius:8px;display:inline-block;letter-spacing:2px;margin:8px 0}}.warn{{background:#fff8dc;border:1px solid #e6c200;padding:12px 16px;border-radius:6px;margin:12px 0}}</style></head>
    <body><h2>IFP Security Dashboard</h2>
    <div class="warn"><strong>Current access code:</strong><br><span class="code-box">{current_code}</span><br><small>Save this. Share via WhatsApp with your team if changed.</small></div>
    <form method="post" action="/api/admin/generate-code" style="margin:8px 0"><input type="hidden" name="code" value="{code}"><button style="background:#c0392b;color:#fff;padding:8px 18px;border:none;border-radius:4px;cursor:pointer;font-size:14px">Generate New Code (use if someone saw your old code)</button></form>
    <h3>Blocked IPs</h3><ul>{blocked_list}</ul>
    <h3>Login Attempts (last {len(log)})</h3>
    <table><tr><th>Time</th><th>Result</th><th>IP Address</th><th>Device/Browser</th><th>Action</th></tr>{rows}</table>
    </body></html>"""
    return HTMLResponse(html)


@router.post("/admin/block-ip", response_class=HTMLResponse)
def block_ip(ip: str = Form(...), code: str = Form("")) -> HTMLResponse:
    if code not in _get_codes():
        raise HTTPException(status_code=403, detail="Access denied")
    ips = _blocked_ips()
    if ip not in ips:
        ips.append(ip)
        _BLOCKED_IPS.write_text(json.dumps(ips))
    new_code = _generate_code()
    _CODE_FILE.write_text(new_code)
    return HTMLResponse(f"""<!doctype html><html><head><meta charset='utf-8'><title>IP Blocked</title>
    <style>body{{font-family:sans-serif;padding:40px;text-align:center}}.code-box{{background:#1a1a2e;color:#00ff88;font-size:28px;font-family:monospace;padding:20px 36px;border-radius:8px;display:inline-block;letter-spacing:3px;margin:16px 0}}.warn{{background:#fff8dc;border:2px solid #e6c200;padding:16px 24px;border-radius:8px;max-width:500px;margin:0 auto}}</style></head>
    <body><h2>IP Blocked: {ip}</h2>
    <div class="warn"><p><strong>Access code has been changed automatically.</strong></p>
    <p>New code:</p><div class="code-box">{new_code}</div>
    <p>Screenshot this and share via WhatsApp with your team before closing this page.</p>
    <p><a href="/api/admin/security?code={new_code}">Open Security Dashboard with new code</a></p></div>
    </body></html>""")


@router.post("/admin/unblock-ip")
def unblock_ip(ip: str = Form(...), code: str = Form("")) -> RedirectResponse:
    if code not in _get_codes():
        raise HTTPException(status_code=403, detail="Access denied")
    ips = [x for x in _blocked_ips() if x != ip]
    _BLOCKED_IPS.write_text(json.dumps(ips))
    return RedirectResponse(f"/api/admin/security?code={code}", status_code=303)


@router.post("/admin/generate-code", response_class=HTMLResponse)
def generate_code(code: str = Form("")) -> HTMLResponse:
    if code not in _get_codes():
        raise HTTPException(status_code=403, detail="Access denied")
    new_code = _generate_code()
    _CODE_FILE.write_text(new_code)
    return HTMLResponse(f"""<!doctype html><html><head><meta charset='utf-8'><title>New Code Generated</title>
    <style>body{{font-family:sans-serif;padding:40px;text-align:center}}.code-box{{background:#1a1a2e;color:#00ff88;font-size:28px;font-family:monospace;padding:20px 36px;border-radius:8px;display:inline-block;letter-spacing:3px;margin:16px 0}}.warn{{background:#fff8dc;border:2px solid #e6c200;padding:16px 24px;border-radius:8px;max-width:500px;margin:0 auto}}</style></head>
    <body><h2>New Access Code Generated</h2>
    <div class="warn"><p>New code:</p><div class="code-box">{new_code}</div>
    <p>Screenshot this and share via WhatsApp with your team before closing this page.</p>
    <p><a href="/api/admin/security?code={new_code}">Open Security Dashboard with new code</a></p></div>
    </body></html>""")


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


@router.post("/voters/import-phones", dependencies=[Depends(require_auth)])
async def import_phones(file: UploadFile = File(...)) -> dict:
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Excel (.xlsx) ఫైల్ మాత్రమే అప్లోడ్ చేయండి")
    try:
        return import_phones_from_xlsx(await file.read())
    except Exception:
        raise HTTPException(status_code=400, detail="ఫైల్ చదవడంలో లోపం — Serial/Phone నిలువు వరుసలు ఉన్నాయో చూడండి")


@router.post("/voters/import-flags", dependencies=[Depends(require_auth)])
async def import_flags(file: UploadFile = File(...)) -> dict:
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Excel (.xlsx) ఫైల్ మాత్రమే అప్లోడ్ చేయండి")
    try:
        return import_flags_from_xlsx(await file.read())
    except Exception:
        raise HTTPException(status_code=400, detail="ఫైల్ చదవడంలో లోపం — Serial నిలువు వరుస ఉందో చూడండి")


@router.post("/voters/import-whatsapp-status", dependencies=[Depends(require_auth)])
async def import_whatsapp_status(file: UploadFile = File(...)) -> dict:
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Excel (.xlsx) ఫైల్ మాత్రమే అప్లోడ్ చేయండి")
    try:
        return import_whatsapp_status_from_xlsx(await file.read())
    except Exception:
        raise HTTPException(status_code=400, detail="ఫైల్ చదవడంలో లోపం — Serial/WhatsApp నిలువు వరుసలు ఉన్నాయో చూడండి")


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
    if "mobile" in updates:
        digits = "".join(ch for ch in str(updates["mobile"] or "") if ch.isdigit())
        if digits and len(digits) != 10:
            raise HTTPException(status_code=400, detail="మొబైల్ నంబర్ 10 అంకెలు ఉండాలి")
        updates["mobile"] = digits
    for voter in voters:
        if voter["id"] != voter_id:
            continue
        # Stamp manual-edit audit trail only when mobile/has_whatsapp actually
        # change value -- not on every save of an unrelated field -- so the
        # "updated contacts" export reflects real phone/WhatsApp edits only.
        contact_changed = any(
            field in updates and updates[field] != voter.get(field)
            for field in ("mobile", "has_whatsapp")
        )
        if contact_changed:
            updates["manual_update_ts"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        # Default opt-in rule, reapplied whenever has_whatsapp is (re)confirmed
        # via this route (e.g. the desk UI's "mark as has WhatsApp" action):
        # a mobile number + confirmed WhatsApp together imply opt-in, anything
        # else does not. Overrides any wa_optin the caller also sent in this
        # same request -- consistent with the bulk-import path's behavior.
        if "has_whatsapp" in updates and updates["has_whatsapp"] != voter.get("has_whatsapp"):
            final_mobile = str(updates.get("mobile", voter.get("mobile", "")) or "").strip()
            updates["wa_optin"] = bool(final_mobile) and updates["has_whatsapp"] is True
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
        # IFP/Target/YT/MF are mutually-exclusive primary-category tags — a
        # voter belongs to at most one. The frontend's mark-as-X buttons
        # already send the other three as false in the same request, but
        # enforce it server-side too so no caller (scripts, future UI, direct
        # API use) can ever leave a voter multi-tagged. Whichever flag this
        # request just turned on wins over any that were already set.
        party_flags = ("is_ifp_voter", "is_target", "is_yt_voter", "is_mf_voter")
        newly_set = [f for f in party_flags if updates.get(f) is True]
        if newly_set:
            winner = newly_set[-1]
            for flag in party_flags:
                if flag != winner:
                    voter[flag] = False
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
