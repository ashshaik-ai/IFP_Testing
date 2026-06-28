from __future__ import annotations

import json
import re
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.area_rules import canonical_area_en, canonical_area_te
from app.services.local_ocr import TELUGU_RE, extract_fields_from_text, extract_local_card
from app.services.transliterate import transliterate_te


ROOT = BACKEND_ROOT / "data" / "jobs"
HOUSE_RE = re.compile(r"^[0-9A-Za-z]+(?:[-/][0-9A-Za-z]+)+$|^\d+$")


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


def repair_job(voters_file: Path) -> tuple[int, int]:
    voters = json.loads(voters_file.read_text(encoding="utf-8"))
    cards_dir = voters_file.parent / "cards"
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
        next_name = choose(voter.get("name_te", ""), parsed.get("name_te", ""), "name_te")
        next_relation = choose(voter.get("relation_name_te", ""), parsed.get("relation_name_te", ""), "relation_name_te")
        next_age = choose(voter.get("age", ""), parsed.get("age", ""), "age")
        next_occupation = choose(voter.get("occupation_te", ""), parsed.get("occupation_te", ""), "occupation_te")
        next_house = choose(voter.get("house_no", ""), parsed.get("house_no", ""), "house_no")
        next_area_te = canonical_area_te(choose(voter.get("area_te", ""), parsed.get("area_te", ""), "area_te"))

        updated = {
            "name_te": next_name,
            "name_en": transliterate_te(next_name) if next_name else str(voter.get("name_en") or ""),
            "relation_name_te": next_relation,
            "age": next_age,
            "occupation_te": next_occupation,
            "house_no": next_house,
            "area_te": next_area_te,
            "area_en": canonical_area_en(next_area_te),
            "needs_review": False,
        }

        unresolved = any(
            not str((updated if key in updated else voter).get(key, "")).strip()
            or str((updated if key in updated else voter).get(key, "")).strip() == "/"
            for key in ("serial_no", "name_te", "relation_name_te", "age", "occupation_te", "house_no", "area_te")
        )
        if unresolved:
            card_path = cards_dir / Path(str(voter.get("card_url") or "")).name
            if card_path.exists():
                try:
                    card_fields = extract_local_card(card_path)
                except Exception:
                    card_fields = {}
                if card_fields:
                    updated["name_te"] = choose(updated["name_te"], card_fields.get("name_te", ""), "name_te")
                    updated["name_en"] = transliterate_te(updated["name_te"]) if updated["name_te"] else updated["name_en"]
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
