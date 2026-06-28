from __future__ import annotations

import asyncio
import json
import math
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import fitz

from app.core.config import settings
from app.schemas.voters import VoterRecord
from app.services.area_rules import OTHER_AREA_TE, canonical_area_en, canonical_area_te
from app.services.gemini import gemini_rotator
from app.services.local_ocr import extract_local_card
from app.services.transliterate import transliterate_te
from app.services.storage import job_dir, job_meta_path, load_jobs, save_jobs, voters_path, write_json


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def infer_source_kind(filename: str) -> str:
    name = (filename or "").strip().lower()
    return "life" if "life" in name else "general"


def source_meta(filename: str) -> dict[str, str]:
    kind = infer_source_kind(filename)
    if kind == "life":
        return {
            "source_kind": "life",
            "source_badge": "L",
            "source_label_te": "లైఫ్",
            "source_label_en": "Life",
        }
    return {
        "source_kind": "general",
        "source_badge": "G",
        "source_label_te": "జనరల్",
        "source_label_en": "General",
    }


def create_job(filename: str) -> dict[str, Any]:
    job_id = uuid.uuid4().hex[:12]
    src = source_meta(filename)
    job = {
        "id": job_id,
        "filename": filename,
        "source_kind": src["source_kind"],
        "source_badge": src["source_badge"],
        "source_label_te": src["source_label_te"],
        "source_label_en": src["source_label_en"],
        "status": "queued",
        "message_te": "ప్రాసెసింగ్ కోసం వేచి ఉంది",
        "created_at": now_iso(),
        "page_count": 0,
        "voter_count": 0,
        "photo_count": 0,
        "review_count": 0,
    }
    jobs = load_jobs()
    jobs.insert(0, job)
    save_jobs(jobs)
    write_json(job_meta_path(job_id), job)
    return job


def update_job(job_id: str, **changes: Any) -> None:
    jobs = load_jobs()
    for item in jobs:
        if item["id"] == job_id:
            item.update(changes)
    save_jobs(jobs)
    meta = job_meta_path(job_id)
    current: dict[str, Any] = {}
    if meta.exists():
        current = json.loads(meta.read_text(encoding="utf-8"))
    current.update(changes)
    write_json(meta, current)


def _clusters(values: list[float], tolerance: float = 20) -> list[float]:
    result: list[list[float]] = []
    for value in sorted(values):
        if not result or abs(sum(result[-1]) / len(result[-1]) - value) > tolerance:
            result.append([value])
        else:
            result[-1].append(value)
    return [sum(group) / len(group) for group in result]


def _bounds_from_centers(centers: list[float], start: float, end: float) -> list[tuple[float, float]]:
    if not centers:
        return [(start, end)]
    cuts = [start]
    for a, b in zip(centers, centers[1:]):
        cuts.append((a + b) / 2)
    cuts.append(end)
    return [(cuts[i], cuts[i + 1]) for i in range(len(cuts) - 1)]


def _detect_grid(page: fitz.Page) -> tuple[list[fitz.Rect], list[fitz.Rect]]:
    image_rects: list[fitz.Rect] = []
    for block in page.get_text("dict").get("blocks", []):
        if block.get("type") == 1:
            image_rects.append(fitz.Rect(block["bbox"]))
    if len(image_rects) >= 4:
        photo_x0 = _clusters([rect.x0 for rect in image_rects])
        photo_y0 = _clusters([rect.y0 for rect in image_rects])
        x_step = min([b - a for a, b in zip(photo_x0, photo_x0[1:])] or [page.rect.width / 5])
        y_step = min([b - a for a, b in zip(photo_y0, photo_y0[1:])] or [(page.rect.height - 120) / 4])
        x_lefts = [max(0, x - (x_step * 0.62)) for x in photo_x0]
        y_tops = [max(0, y - (y_step * 0.06)) for y in photo_y0]
        x_bounds = [(left, min(page.rect.width, left + x_step * 0.98)) for left in x_lefts]
        y_bounds = [(top, min(page.rect.height, top + y_step * 0.98)) for top in y_tops]
    else:
        xs = [(i + 0.5) * page.rect.width / 5 for i in range(5)]
        ys = [110 + (i + 0.5) * (page.rect.height - 120) / 4 for i in range(4)]
        x_bounds = _bounds_from_centers(xs, 0, page.rect.width)
        y_bounds = _bounds_from_centers(ys, max(0, min(ys) - 65), page.rect.height)
    cards = [fitz.Rect(x0, y0, x1, y1) for x0, x1 in x_bounds for y0, y1 in y_bounds]
    return cards, image_rects


def _nearest_photo(card: fitz.Rect, photos: list[fitz.Rect]) -> fitz.Rect | None:
    if not photos:
        return None
    cx, cy = (card.x0 + card.x1) / 2, (card.y0 + card.y1) / 2
    inside = [photo for photo in photos if card.intersects(photo)]
    pool = inside or photos
    return min(pool, key=lambda photo: math.hypot(((photo.x0 + photo.x1) / 2) - cx, ((photo.y0 + photo.y1) / 2) - cy))


def _demo_fields(index: int, page_no: int) -> dict[str, Any]:
    serial = 2730 + index if page_no == 1 else ""
    return {
        "serial_no": str(serial) if serial else "",
        "card_no": "",
        "name_te": "సమీక్ష అవసరం",
        "name_en": "Review needed",
        "relation_label_te": "",
        "relation_name_te": "",
        "age": "",
        "occupation_te": "",
        "house_no": "",
        "area_te": OTHER_AREA_TE,
        "area_en": canonical_area_en(OTHER_AREA_TE),
        "raw_text": "",
        "confidence": 0.1,
        "needs_review": False,
    }


def _text_or_default(value: Any, default: str = "") -> str:
    text = str(value or "").strip()
    return text or default


def _confidence_value(value: Any) -> float:
    if isinstance(value, (int, float)):
        return max(0.0, min(1.0, float(value)))
    text = str(value or "").strip().lower()
    if text in {"high", "good", "excellent", "ఎక్కువ"}:
        return 0.9
    if text in {"medium", "moderate", "మధ్యస్థం"}:
        return 0.6
    if text in {"low", "poor", "తక్కువ"}:
        return 0.3
    try:
        return max(0.0, min(1.0, float(text)))
    except ValueError:
        return 0.0


def _field_map(fields: Any) -> dict[str, Any]:
    if isinstance(fields, dict):
        return fields
    if isinstance(fields, list):
        for item in fields:
            if isinstance(item, dict):
                return item
    return {}


def _apply_serial_sequence(records: list[dict[str, Any]]) -> None:
    if not settings.auto_sequence_serials:
        return
    by_page: dict[int, list[dict[str, Any]]] = {}
    for record in records:
        by_page.setdefault(int(record.get("page_no") or 0), []).append(record)
    for page_records in by_page.values():
        page_records.sort(key=lambda item: (int(item.get("col_no") or 0), int(item.get("row_no") or 0)))
        first = str(page_records[0].get("serial_no", "")).strip() if page_records else ""
        if not first.isdigit():
            continue
        start = int(first)
        for index, record in enumerate(page_records):
            record["serial_no"] = str(start + index)


async def process_pdf(job_id: str, source_pdf: Path) -> None:
    update_job(job_id, status="processing", message_te="PDF నుండి కార్డులు, ఫోటోలు చదువుతోంది")
    records: list[dict[str, Any]] = []
    try:
        meta = json.loads(job_meta_path(job_id).read_text(encoding="utf-8")) if job_meta_path(job_id).exists() else {}
        source_name = str(meta.get("filename") or source_pdf.name)
        src = source_meta(source_name)
        doc = fitz.open(source_pdf)
        voter_index = 0
        photo_count = 0
        for page_index, page in enumerate(doc, start=1):
            cards, photos = _detect_grid(page)
            for card_index, card in enumerate(cards):
                voter_index += 1
                col = card_index // 4 + 1
                row = card_index % 4 + 1
                card_path = job_dir(job_id) / "cards" / f"p{page_index:03d}_c{card_index + 1:02d}.png"
                page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=card).save(card_path)
                photo_rect = _nearest_photo(card, photos)
                photo_url = ""
                if photo_rect:
                    photo_count += 1
                    photo_path = job_dir(job_id) / "photos" / f"p{page_index:03d}_c{card_index + 1:02d}.png"
                    page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=photo_rect).save(photo_path)
                    photo_url = f"/api/files/{job_id}/photos/{photo_path.name}"

                if settings.ocr_provider == "local":
                    try:
                        fields = _field_map(extract_local_card(card_path))
                    except Exception as exc:
                        fields = _demo_fields(voter_index - 1, page_index)
                        fields["notes"] = f"Local OCR విఫలమైంది: {exc}"
                elif settings.gemini_api_keys:
                    try:
                        fields = _field_map(await gemini_rotator.extract_card(card_path))
                    except Exception as exc:
                        fields = _demo_fields(voter_index - 1, page_index)
                        fields["notes"] = f"Gemini విఫలమైంది: {exc}"
                else:
                    fields = _field_map(_demo_fields(voter_index - 1, page_index) if settings.demo_ocr else {})

                name_te = _text_or_default(fields.get("name_te"))
                area_te = canonical_area_te(_text_or_default(fields.get("area_te")))
                record = VoterRecord(
                    id=uuid.uuid4().hex[:12],
                    job_id=job_id,
                    source_filename=source_name,
                    source_kind=src["source_kind"],
                    source_badge=src["source_badge"],
                    source_label_te=src["source_label_te"],
                    source_label_en=src["source_label_en"],
                    page_no=page_index,
                    row_no=row,
                    col_no=col,
                    photo_url=photo_url,
                    card_url=f"/api/files/{job_id}/cards/{card_path.name}",
                    serial_no=_text_or_default(fields.get("serial_no")),
                    card_no=_text_or_default(fields.get("card_no")),
                    name_te=name_te,
                    name_en=_text_or_default(fields.get("name_en"), transliterate_te(name_te)),
                    relation_label_te=_text_or_default(fields.get("relation_label_te")),
                    relation_name_te=_text_or_default(fields.get("relation_name_te")),
                    age=_text_or_default(fields.get("age")),
                    occupation_te=_text_or_default(fields.get("occupation_te")),
                    house_no=_text_or_default(fields.get("house_no")),
                    area_te=area_te,
                    area_en=canonical_area_en(area_te),
                    confidence=_confidence_value(fields.get("confidence")),
                    needs_review=False,
                    raw_text=_text_or_default(fields.get("raw_text")),
                    notes=_text_or_default(fields.get("notes")),
                )
                records.append(record.model_dump())
                if voter_index % 10 == 0:
                    update_job(
                        job_id,
                        voter_count=voter_index,
                        photo_count=photo_count,
                        message_te=f"{voter_index} ఓటర్ కార్డులు చదివింది",
                    )
                await asyncio.sleep(0)

        _apply_serial_sequence(records)
        write_json(voters_path(job_id), records)
        update_job(
            job_id,
            status="done",
            message_te="ప్రాసెసింగ్ పూర్తయింది",
            page_count=doc.page_count,
            voter_count=len(records),
            photo_count=photo_count,
            review_count=0,
        )
    except Exception as exc:
        update_job(job_id, status="failed", message_te=f"ప్రాసెసింగ్ విఫలమైంది: {exc}")
