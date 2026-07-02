from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.area_rules import canonical_area_en, canonical_area_te
from app.services.local_ocr import (
    TELUGU_RE,
    _clean_name,
    _clean_relation,
    _extract_serial,
    _prepare_parse_text,
    extract_fields_from_text,
    extract_local_card,
)
from app.services.transliterate import transliterate_person_name_te, transliterate_te


ROOT = BACKEND_ROOT / "data" / "jobs"
HOUSE_RE = re.compile(r"^[0-9A-Za-z\u0C00-\u0C7F]+(?:[-/][0-9A-Za-z\u0C00-\u0C7F]+)+$|^\d+$")
MANUAL_OVERRIDES: dict[tuple[str, str], dict[str, str]] = {
    ("0d8946d09b4d", "2182"): {
        "name_te": "యస్.కె. హుస్సేన్",
        "name_en": "S.K. Hussain",
        "relation_name_te": "ఎస్.కె. అబ్దుల్ ఖాదర్",
        "house_no": "1-432",
        "area_te": "కొత్తపేట",
    },
    ("0d8946d09b4d", "2199"): {
        "name_te": "షేక్ మాబు",
        "name_en": "Shaik Mabu",
        "relation_name_te": "షేక్ ఖాజా",
        "house_no": "7-1330",
        "area_te": "ఇస్లాంపేట",
    },
    ("0d8946d09b4d", "2239"): {
        "name_te": "సయ్యద్ అబ్దుల్ సిద్దిక్",
        "name_en": "Syed Abdul Siddiq",
        "relation_name_te": "సయ్యద్ మహమ్మద్",
        "house_no": "7-455",
        "area_te": "సీతారామాంజనేయ పేట",
    },
}


def quality(value: str, kind: str) -> int:
    text = str(value or "").strip()
    if not text or text == "/":
        return -999
    telugu_chars = sum(1 for ch in text if TELUGU_RE.match(ch))
    digits = sum(ch.isdigit() for ch in text)
    weird = sum(ch in "[]{}<>|`~!@#$%^&*_+=\\" for ch in text)
    punct = sum(ch in "/()\"'" for ch in text)
    score = telugu_chars * 2 - digits * 2 - weird * 4 - punct * 2
    if kind in {"name_te", "relation_name_te"} and "షేక్" in text:
        score += 8
    if kind in {"name_te", "relation_name_te"}:
        score -= max(0, len(text.split()) - 4) * 6
        if "..." in text:
            score -= 20
        if digits:
            score -= 16
        if "/" in text:
            score -= 12
    if kind == "age":
        return 10 if text.isdigit() and 0 < int(text) <= 120 else -50
    if kind == "house_no":
        return 12 if HOUSE_RE.match(text) else -20
    if kind == "occupation_te" and digits:
        score -= 10
    if kind == "area_te":
        score += 6 if canonical_area_te(text) != "ఇతర ప్రాంతం" else -3
    return score


def choose(old: str, new: str, kind: str) -> str:
    old_text = str(old or "").strip()
    new_text = str(new or "").strip()
    if not new_text:
        return old_text
    if not old_text or old_text == "/":
        return new_text
    if kind in {"name_te", "relation_name_te"}:
        if "..." in old_text or "/" in old_text or any(ch.isdigit() for ch in old_text) or len(old_text.split()) > 4:
            return new_text
    return new_text if quality(new_text, kind) > quality(old_text, kind) else old_text


def choose_serial(old: str, raw_text: str, card_serial: str = "") -> str:
    current = str(old or "").strip()
    raw_serial = _extract_serial(_prepare_parse_text(raw_text or "")) if raw_text else ""
    for candidate in (str(card_serial or "").strip(), raw_serial):
        if not candidate or not candidate.isdigit():
            continue
        if not current or not current.isdigit():
            return candidate
        if len(current) <= 3 and len(candidate) >= 4:
            return candidate
        if len(candidate) >= 4 and current != candidate:
            try:
                if abs(int(current) - int(candidate)) >= 50:
                    return candidate
            except ValueError:
                return candidate
    return current


def page_offset(voter: dict, rows_per_page: int, cols_per_page: int, orientation: str) -> int:
    row = max(1, int(voter.get("row_no") or 1))
    col = max(1, int(voter.get("col_no") or 1))
    if orientation == "column":
        return (col - 1) * rows_per_page + (row - 1)
    return (row - 1) * cols_per_page + (col - 1)


def infer_layout_formula(voters: list[dict]) -> tuple[str | None, int | None, int | None, int | None, int]:
    if not voters:
        return None, None, None, None, 0
    rows_per_page = max(int(voter.get("row_no") or 0) for voter in voters) or 1
    cols_per_page = max(int(voter.get("col_no") or 0) for voter in voters) or 1
    per_page = rows_per_page * cols_per_page
    first_pages = sorted({int(voter.get("page_no") or 0) for voter in voters})[: min(6, len(voters))]
    best_orientation = None
    best_base = None
    best_score = 0

    for orientation in ("column", "row"):
        normalized_bases: list[int] = []
        for voter in voters:
            page_no = int(voter.get("page_no") or 0)
            if page_no not in first_pages:
                continue
            parsed = _extract_serial(_prepare_parse_text(str(voter.get("raw_text") or "")))
            if not parsed or not parsed.isdigit():
                continue
            parsed_value = int(parsed)
            if parsed_value <= 0:
                continue
            offset = page_offset(voter, rows_per_page, cols_per_page, orientation)
            normalized = parsed_value - offset - ((page_no - 1) * per_page)
            if normalized <= 0:
                continue
            normalized_bases.append(normalized)
        if not normalized_bases:
            continue
        counts = Counter(normalized_bases)
        base, score = counts.most_common(1)[0]
        if score > best_score:
            best_orientation = orientation
            best_base = base
            best_score = score

    if not best_orientation or best_base is None or best_score < 4:
        return None, None, None, None, 0
    return best_orientation, best_base, rows_per_page, cols_per_page, best_score


def repair_job(voters_file: Path) -> tuple[int, int]:
    voters = json.loads(voters_file.read_text(encoding="utf-8"))
    cards_dir = voters_file.parent / "cards"
    serial_counts = Counter(str(voter.get("serial_no", "")).strip() for voter in voters if str(voter.get("serial_no", "")).strip())
    orientation, layout_base, rows_per_page, cols_per_page, layout_score = infer_layout_formula(voters)
    per_page = (rows_per_page or 1) * (cols_per_page or 1)
    changed = 0
    missing = 0
    cleaned: list[dict] = []
    for voter in voters:
        raw_text = str(voter.get("raw_text") or "").strip()
        if not raw_text and not any(str(voter.get(key, "")).strip() for key in ("name_te", "relation_name_te", "age", "occupation_te", "house_no")):
            continue
        if not raw_text:
            cleaned.append(voter)
            continue
        parsed = extract_fields_from_text(raw_text)
        current_name = _clean_name(str(voter.get("name_te", "") or ""))
        current_relation = _clean_relation(str(voter.get("relation_name_te", "") or ""))
        next_name = choose(current_name, parsed.get("name_te", ""), "name_te")
        next_relation = choose(current_relation, parsed.get("relation_name_te", ""), "relation_name_te")
        next_age = choose(voter.get("age", ""), parsed.get("age", ""), "age")
        next_occupation = choose(voter.get("occupation_te", ""), parsed.get("occupation_te", ""), "occupation_te")
        next_house = choose(voter.get("house_no", ""), parsed.get("house_no", ""), "house_no")
        next_area_te = canonical_area_te(choose(voter.get("area_te", ""), parsed.get("area_te", ""), "area_te"))

        updated = {
            "serial_no": choose_serial(voter.get("serial_no", ""), raw_text),
            "name_te": next_name,
            "name_en": transliterate_person_name_te(next_name) if next_name else str(voter.get("name_en") or ""),
            "relation_name_te": next_relation,
            "age": next_age,
            "occupation_te": next_occupation,
            "house_no": next_house,
            "area_te": next_area_te,
            "area_en": canonical_area_en(next_area_te),
            "needs_review": False,
        }

        if orientation and layout_base is not None and rows_per_page and cols_per_page:
            current_serial = str(updated["serial_no"] or "").strip()
            expected_serial = str(
                layout_base
                + ((int(voter.get("page_no") or 1) - 1) * per_page)
                + page_offset(voter, rows_per_page, cols_per_page, orientation)
            )
            parsed_serial = _extract_serial(_prepare_parse_text(raw_text))
            exact_match = parsed_serial == expected_serial
            suffix_match = bool(parsed_serial) and expected_serial.endswith(parsed_serial)
            duplicate_serial = serial_counts.get(current_serial, 0) > 1 if current_serial else False
            suspicious_serial = (
                not current_serial
                or not current_serial.isdigit()
                or len(current_serial) < len(expected_serial)
                or duplicate_serial
            )
            if layout_score >= 8 and current_serial != expected_serial:
                updated["serial_no"] = expected_serial
            elif exact_match or (suffix_match and suspicious_serial):
                updated["serial_no"] = expected_serial

        unresolved = any(
            not str((updated if key in updated else voter).get(key, "")).strip()
            or str((updated if key in updated else voter).get(key, "")).strip() == "/"
            for key in ("serial_no", "name_te", "relation_name_te", "age", "occupation_te", "house_no", "area_te")
        )
        weak_name = quality(updated["name_te"], "name_te") < 8
        weak_relation = quality(updated["relation_name_te"], "relation_name_te") < 8
        duplicated_identity = updated["name_te"] == updated["relation_name_te"] and bool(updated["name_te"])
        contaminated_name = any(token in updated["name_te"] for token in ("తండ్రి", "భర్త", "పేరు", "వయస్సు", "వృత్తి"))
        if unresolved or weak_name or weak_relation or duplicated_identity or contaminated_name:
            card_path = cards_dir / Path(str(voter.get("card_url") or "")).name
            if card_path.exists():
                try:
                    card_fields = extract_local_card(card_path)
                except Exception:
                    card_fields = {}
                if card_fields:
                    current_serial = str(updated["serial_no"] or "").strip()
                    card_serial = str(card_fields.get("serial_no", "") or "").strip()
                    if serial_counts.get(current_serial, 0) > 1 or len(current_serial) <= 3:
                        updated["serial_no"] = choose_serial(current_serial, raw_text, card_serial)
                    updated["name_te"] = choose(updated["name_te"], card_fields.get("name_te", ""), "name_te")
                    updated["name_en"] = transliterate_person_name_te(updated["name_te"]) if updated["name_te"] else updated["name_en"]
                    updated["relation_name_te"] = choose(updated["relation_name_te"], card_fields.get("relation_name_te", ""), "relation_name_te")
                    updated["age"] = choose(updated["age"], card_fields.get("age", ""), "age")
                    updated["occupation_te"] = choose(updated["occupation_te"], card_fields.get("occupation_te", ""), "occupation_te")
                    updated["house_no"] = choose(updated["house_no"], card_fields.get("house_no", ""), "house_no")
                    area_from_card = choose(updated["area_te"], card_fields.get("area_te", ""), "area_te")
                    updated["area_te"] = canonical_area_te(area_from_card)
                    updated["area_en"] = canonical_area_en(updated["area_te"])

        if any(updated[key] != voter.get(key) for key in updated):
            voter.update(updated)
            changed += 1

        override = MANUAL_OVERRIDES.get((voters_file.parent.name, str(voter.get("serial_no", "")).strip()))
        if override:
            for key, value in override.items():
                voter[key] = value
            if "area_te" in override:
                voter["area_en"] = canonical_area_en(voter["area_te"])
            changed += 1

        if any(not str(voter.get(key, "")).strip() or str(voter.get(key, "")).strip() == "/" for key in ("serial_no", "name_te", "relation_name_te", "age", "occupation_te", "house_no", "area_te")):
            missing += 1
        cleaned.append(voter)

    voters_file.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding="utf-8")
    return changed, missing


def main() -> None:
    for job_dir in sorted(ROOT.iterdir()):
        voters_file = job_dir / "voters.json"
        if not voters_file.exists():
            continue
        changed, missing = repair_job(voters_file)
        print(f"{job_dir.name}: changed={changed} missing={missing}")


if __name__ == "__main__":
    main()
