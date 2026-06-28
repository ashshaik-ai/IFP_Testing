from __future__ import annotations

import difflib
import re
from pathlib import Path

from app.core.config import BACKEND_ROOT
from app.services.transliterate import transliterate_te


OTHER_AREA_TE = "ఇతర ప్రాంతం"
OTHER_AREA_EN = "Other Area"
_AREA_FILE = BACKEND_ROOT / "data" / "area_canonical.txt"
_PUNCT_RE = re.compile(r"[\s,./\\|:;()\-\u0964]+")

DIRECT_REPLACEMENTS = {
    "శ్రీనివాసమహల్": "శ్రీనివాస మహల్",
    "శ్రీనివాసమహల": "శ్రీనివాస మహల్",
    "శ్రీనివాసమహల్ సందు": "శ్రీనివాస మహల్",
    "శ్రీనివాస మహల్ సందు": "శ్రీనివాస మహల్",
    "శ్రీనివాస మహల్ వెనుక": "శ్రీనివాస మహల్",
    "శ్రీనివాస మహల్ దగ్గర": "శ్రీనివాస మహల్",
    "శ్రీనివాస మహల్ ప్రక్కన": "శ్రీనివాస మహల్",
    "శ్రీనివాసమహల్ వెనుక": "శ్రీనివాస మహల్",
    "శ్రీనివాసమహల్ దగ్గర": "శ్రీనివాస మహల్",
    "శ్రీనివాసమహల్ ప్రక్కన": "శ్రీనివాస మహల్",
    "టిప్పర్లబజార్": "టిప్పర్ల బజార్",
    "టిప్పర్ల బజారు": "టిప్పర్ల బజార్",
    "టిప్పర్లబజారు": "టిప్పర్ల బజార్",
    "టిప్పర్ల బజార్": "టిప్పర్ల బజార్",
    "ఇస్లాం పేట": "ఇస్లాంపేట",
    "ఇస్తాం పేట": "ఇస్లాంపేట",
    "ఇస్రాంపేట": "ఇస్లాంపేట",
    "ఇసాంపేట": "ఇస్లాంపేట",
    "కొత్త పేట": "కొత్తపేట",
    "పార్క్ రోడ్డు": "పార్కురోడ్",
    "పార్క్ రోడ్": "పార్కురోడ్",
    "పార్కురోడ్": "పార్కురోడ్",
    "పార్క్ రోడ్లు": "పార్కురోడ్",
    "టి బజారు": "టి.బజారు",
    "టి. బజారు": "టి.బజారు",
    "టి, బజారు": "టి.బజారు",
    "టి,.బజారు": "టి.బజారు",
    "డ్రైవరుపేట": "డ్రైవరు పేట",
    "డైవరుపేట": "డ్రైవరు పేట",
    "దిగుడు బావి సెంటర్": "దిగుడుబావి సెంటర్",
    "దిగుడు బావి": "దిగుడుబావి సెంటర్",
}


def _load_canonical_areas() -> list[str]:
    if not _AREA_FILE.exists():
        return [OTHER_AREA_TE]
    values: list[str] = []
    for raw in _AREA_FILE.read_text(encoding="utf-8").splitlines():
        text = raw.strip()
        if not text:
            continue
        values.append(text)
    merged = []
    seen = set()
    for value in ["శ్రీనివాస మహల్", *values, OTHER_AREA_TE]:
        if value not in seen:
            seen.add(value)
            merged.append(value)
    return merged


CANONICAL_AREAS_TE = _load_canonical_areas()


def _normalize(text: str) -> str:
    value = (text or "").strip()
    value = value.replace("్రొ", "్రో")
    value = value.replace("పార్క్రోడ్", "పార్కురోడ్")
    value = value.replace("పార్క్ రోడ్", "పార్కురోడ్")
    value = value.replace("పార్క్ రోడ్డు", "పార్కురోడ్")
    value = value.replace("టి. బజారు", "టి.బజారు")
    value = value.replace("టి, బజారు", "టి.బజారు")
    value = value.replace("టి,.బజారు", "టి.బజారు")
    value = value.replace("ఇస్లాం పేట", "ఇస్లాంపేట")
    value = value.replace("ఇస్తాంపేట", "ఇస్లాంపేట")
    value = value.replace("ఇస్తాం పేట", "ఇస్లాంపేట")
    value = value.replace("ఇస్రాంపేట", "ఇస్లాంపేట")
    value = value.replace("కొత్త పేట", "కొత్తపేట")
    value = value.replace("టిప్పర్లబజారు", "టిప్పర్ల బజార్")
    value = value.replace("టిప్పర్లబజార్", "టిప్పర్ల బజార్")
    value = value.replace("టిప్పర్ల బజారు", "టిప్పర్ల బజార్")
    value = _PUNCT_RE.sub("", value)
    return value


_CANONICAL_MAP = {_normalize(area): area for area in CANONICAL_AREAS_TE}


def canonical_area_te(text: str) -> str:
    source = (text or "").strip()
    if not source:
        return OTHER_AREA_TE
    direct = DIRECT_REPLACEMENTS.get(source)
    if direct:
        return direct
    normalized = _normalize(source)
    if not normalized:
        return OTHER_AREA_TE
    if normalized in DIRECT_REPLACEMENTS:
        return DIRECT_REPLACEMENTS[normalized]
    exact = _CANONICAL_MAP.get(normalized)
    if exact:
        return exact
    match = difflib.get_close_matches(normalized, _CANONICAL_MAP.keys(), n=1, cutoff=0.72)
    if match:
        return _CANONICAL_MAP[match[0]]
    return OTHER_AREA_TE


def canonical_area_en(text: str) -> str:
    area_te = canonical_area_te(text)
    if area_te == OTHER_AREA_TE:
        return OTHER_AREA_EN
    return transliterate_te(area_te, OTHER_AREA_EN)


def all_area_options() -> list[dict[str, str]]:
    return [
        {
            "area_te": area,
            "area_en": canonical_area_en(area),
        }
        for area in CANONICAL_AREAS_TE
    ]
