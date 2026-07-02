from __future__ import annotations

import asyncio
import json
import math
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import fitz
import cv2

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


def _detect_grid(page: fitz.Page) -> list[fitz.Rect]:
    rect = page.rect
    left = rect.width * 0.054
    right = rect.width * 0.954
    top = rect.height * 0.118
    bottom = rect.height * 0.957
    card_width = (right - left) / 5
    card_height = (bottom - top) / 4
    cards: list[fitz.Rect] = []
    for row in range(4):
        for col in range(5):
            x0 = left + (col * card_width)
            x1 = left + ((col + 1) * card_width)
            y0 = top + (row * card_height)
            y1 = top + ((row + 1) * card_height)
            cards.append(fitz.Rect(x0, y0, x1, y1))
    return cards


def _photo_region(card: fitz.Rect) -> fitz.Rect:
    width = card.x1 - card.x0
    height = card.y1 - card.y0
    return fitz.Rect(
        card.x0 + (width * 0.62),
        card.y0 + (height * 0.08),
        card.x0 + (width * 0.97),
        card.y0 + (height * 0.63),
    )


def _trim_white_margins(image_path: Path, padding: int = 10) -> None:
    image = cv2.imread(str(image_path))
    if image is None:
        return
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = gray < 245
    coords = cv2.findNonZero(mask.astype("uint8"))
    if coords is None:
        return
    x, y, w, h = cv2.boundingRect(coords)
    if w <= 0 or h <= 0:
        return
    x0 = max(0, x - padding)
    y0 = max(0, y - padding)
    x1 = min(image.shape[1], x + w + padding)
    y1 = min(image.shape[0], y + h + padding)
    trimmed = image[y0:y1, x0:x1]
    if trimmed.size and (trimmed.shape[0] < image.shape[0] or trimmed.shape[1] < image.shape[1]):
        cv2.imwrite(str(image_path), trimmed)


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


def _is_incomplete(fields: dict[str, Any]) -> bool:
    critical = ("serial_no", "name_te", "relation_name_te", "age", "occupation_te", "house_no", "area_te")
    for key in critical:
        value = str(fields.get(key, "")).strip()
        if not value or value == "/":
            return True
    return False


def _merge_fields(primary: dict[str, Any], fallback: dict[str, Any]) -> dict[str, Any]:
    merged = dict(primary)
    for key, value in fallback.items():
        incoming = str(value or "").strip()
        current = str(merged.get(key, "") or "").strip()
        if key in {"raw_text", "notes"}:
            continue
        if (not current or current == "/") and incoming:
            merged[key] = value
    if fallback.get("raw_text"):
        merged["raw_text"] = "\n".join(part for part in [primary.get("raw_text", ""), fallback.get("raw_text", "")] if part)
    return merged


def _apply_serial_sequence(records: list[dict[str, Any]]) -> None:
    if not settings.auto_sequence_serials:
        return
    by_page: dict[int, list[dict[str, Any]]] = {}
    for record in records:
        by_page.setdefault(int(record.get("page_no") or 0), []).append(record)
    for page_records in by_page.values():
        page_records.sort(key=lambda item: (int(item.get("row_no") or 0), int(item.get("col_no") or 0)))
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
        local_ocr_limiter = asyncio.Semaphore(4)
        for page_index, page in enumerate(doc, start=1):
            page_fields: list[dict[str, Any]] = []
            if settings.gemini_api_keys and settings.ocr_provider != "local":
                page_image = job_dir(job_id) / f"page_{page_index:03d}.png"
                page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4)).save(page_image)
                try:
                    page_fields = await gemini_rotator.extract_page_cards(page_image)
                except Exception:
                    page_fields = []
            cards = _detect_grid(page)
            page_items: list[dict[str, Any]] = []
            for card_index, card in enumerate(cards):
                row = card_index // 5 + 1
                col = card_index % 5 + 1
                card_path = job_dir(job_id) / "cards" / f"p{page_index:03d}_c{card_index + 1:02d}.png"
                page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=card).save(card_path)
                _trim_white_margins(card_path)
                photo_rect = _photo_region(card)
                photo_path = job_dir(job_id) / "photos" / f"p{page_index:03d}_c{card_index + 1:02d}.png"
                page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=photo_rect).save(photo_path)
                photo_count += 1
                page_items.append(
                    {
                        "card_index": card_index,
                        "row": row,
                        "col": col,
                        "card_path": card_path,
                        "card_url": f"/api/files/{job_id}/cards/{card_path.name}",
                        "photo_url": f"/api/files/{job_id}/photos/{photo_path.name}",
                        "seeded_fields": _field_map(page_fields[card_index]) if card_index < len(page_fields) else {},
                    }
                )

            async def resolve_fields(item: dict[str, Any]) -> dict[str, Any]:
                seeded_fields = item["seeded_fields"]
                if seeded_fields and not _is_incomplete(seeded_fields):
                    return seeded_fields
                if settings.ocr_provider == "local":
                    try:
                        async with local_ocr_limiter:
                            local_fields = await asyncio.to_thread(extract_local_card, item["card_path"])
                        return _merge_fields(_field_map(local_fields), seeded_fields) if seeded_fields else _field_map(local_fields)
                    except Exception as exc:
                        demo = _demo_fields(voter_index, page_index)
                        demo["notes"] = f"Local OCR విఫలమైంది: {exc}"
                        return demo
                if settings.gemini_api_keys:
                    try:
                        return _field_map(await gemini_rotator.extract_card(item["card_path"]))
                    except Exception as exc:
                        demo = _demo_fields(voter_index, page_index)
                        demo["notes"] = f"Gemini విఫలమైంది: {exc}"
                        return demo
                return _field_map(_demo_fields(voter_index, page_index) if settings.demo_ocr else {})

            page_results = await asyncio.gather(*(resolve_fields(item) for item in page_items))

            for item, fields in zip(page_items, page_results):
                voter_index += 1
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
                    row_no=item["row"],
                    col_no=item["col"],
                    photo_url=item["photo_url"],
                    card_url=item["card_url"],
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
