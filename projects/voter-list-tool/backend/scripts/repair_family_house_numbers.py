from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.local_ocr import _extract_house, _prepare_parse_text, extract_fields_from_text


ROOT = BACKEND_ROOT / "data" / "jobs"
ALLOWED_RE = re.compile(r"^[0-9A-Za-z\u0C00-\u0C7F/-]+$")
NORMALIZE_MAP = {
    "బీ": "బి",
    "సీ": "సి",
    "డీ": "డి",
    "జీ": "జి",
    "పీ": "పి",
    "పహెచ్": "హెచ్",
}
BAD_SUFFIX_TOKENS = ("రర", "ం0", "/ం", "ఓి", "ల0")


def extract_house_candidate(raw_text: str) -> str:
    parsed = extract_fields_from_text(raw_text).get("house_no") or ""
    if parsed:
        return str(parsed).strip()
    return _extract_house(_prepare_parse_text(raw_text))


def normalize_house_candidate(base: str, candidate: str) -> str:
    text = str(candidate or "").strip().replace(" ", "")
    for source, target in NORMALIZE_MAP.items():
        text = text.replace(source, target)
    if text.startswith(base):
        suffix = text[len(base) :]
        if suffix and suffix[0] not in "/-" and any(mark in suffix for mark in "/-"):
            text = f"{base}/{suffix}"
    return text


def house_score(base: str, candidate: str) -> tuple[int, str]:
    text = normalize_house_candidate(base, candidate)
    if not text or text == base or not text.startswith(base):
        return -999, text
    suffix = text[len(base) :]
    trimmed = suffix.lstrip("/-")
    if not trimmed or " " in text or not ALLOWED_RE.match(text):
        return -999, text

    score = 50 + min(len(trimmed), 18)
    if any(token in trimmed for token in BAD_SUFFIX_TOKENS):
        score -= 80
    if trimmed[0] == "ం":
        score -= 80
    if trimmed.isdigit():
        score -= 60
    if re.fullmatch(r"\d+(?:[/-]\d+)*", trimmed):
        score -= 40
    if "/" in suffix or "-" in suffix:
        score += 6
    if re.search(r"[A-Za-z\u0C00-\u0C7F]", trimmed):
        score += 8
    if re.search(r"([\u0C00-\u0C7F])\1", trimmed):
        score -= 30
    if trimmed.endswith("/0") or trimmed.endswith("-0") or trimmed == "0":
        score -= 40
    return score, text


def is_active(voter: dict) -> bool:
    return not voter.get("is_deceased") and not voter.get("is_blocklisted") and not voter.get("is_cancelled")


def load_rows() -> list[tuple[Path, dict]]:
    rows: list[tuple[Path, dict]] = []
    for voters_file in sorted(ROOT.glob("*/voters.json")):
        voters = json.loads(voters_file.read_text(encoding="utf-8"))
        for voter in voters:
            if is_active(voter):
                rows.append((voters_file, voter))
    return rows


def family_cluster_counts(rows: list[tuple[Path, dict]]) -> Counter[tuple[str, str]]:
    counts: Counter[tuple[str, str]] = Counter()
    for _, voter in rows:
        area = str(voter.get("area_te") or "").strip()
        house = str(voter.get("house_no") or "").strip()
        if area and house and any(ch in house for ch in "-/"):
            counts[(area, house)] += 1
    return counts


def repair() -> tuple[int, int, list[tuple[str, str, str, str, str]]]:
    rows = load_rows()
    counts = family_cluster_counts(rows)
    updated = 0
    considered = 0
    skipped: list[tuple[str, str, str, str, str]] = []

    cached_files: dict[Path, list[dict]] = {}
    for voters_file in sorted(ROOT.glob("*/voters.json")):
        cached_files[voters_file] = json.loads(voters_file.read_text(encoding="utf-8"))

    for voters_file, voters in cached_files.items():
        changed = False
        for voter in voters:
            if not is_active(voter):
                continue
            area = str(voter.get("area_te") or "").strip()
            house = str(voter.get("house_no") or "").strip()
            if counts[(area, house)] <= 1:
                continue
            raw_house = extract_house_candidate(str(voter.get("raw_text") or ""))
            if not raw_house or raw_house == house or not raw_house.startswith(house):
                continue

            considered += 1
            score, normalized = house_score(house, raw_house)
            if score < 40:
                skipped.append(
                    (
                        str(voter.get("serial_no") or "").strip(),
                        area,
                        house,
                        raw_house,
                        normalized,
                    )
                )
                continue

            if normalized != house:
                voter["house_no"] = normalized
                changed = True
                updated += 1

        if changed:
            voters_file.write_text(json.dumps(voters, ensure_ascii=False, indent=2), encoding="utf-8")

    return updated, considered, skipped


def main() -> None:
    updated, considered, skipped = repair()
    print(f"considered={considered}")
    print(f"updated={updated}")
    print(f"skipped={len(skipped)}")
    for serial_no, area, house, raw_house, normalized in skipped:
        print(f"skip serial={serial_no} area={area} current={house} raw={raw_house} normalized={normalized}")


if __name__ == "__main__":
    main()
