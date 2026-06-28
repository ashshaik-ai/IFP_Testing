from __future__ import annotations

import re
import os
from pathlib import Path
from typing import Any

import cv2
import pytesseract

from app.core.config import settings
from app.services.transliterate import transliterate_te


TELUGU_RE = re.compile(r"[\u0C00-\u0C7F]+")
AREA_FIXES = {
    "టీప్పరబజార్": "టిప్పరబజార్",
    "టీప్పర బజార్": "టిప్పర బజార్",
    "దిగుమబావి": "దిగువబావి",
    "పౌరురోడ్": "పార్కురోడ్",
    "పార్కురోడ్": "పార్కురోడ్",
    "లెను": "లైన్",
}


def _configure_tesseract() -> None:
    if Path(settings.tesseract_cmd).exists():
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def _preprocess(image_path: Path):
    image = cv2.imread(str(image_path))
    if image is None:
        raise RuntimeError("చిత్రం చదవలేకపోయింది")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    scaled = cv2.resize(gray, None, fx=2.2, fy=2.2, interpolation=cv2.INTER_CUBIC)
    return cv2.threshold(scaled, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]


def _clean(text: str) -> str:
    text = (text or "").replace("\u200c", "").replace("\u200d", "")
    text = re.sub(r"\s+", " ", text).strip()
    return text.strip(" .,:;|=-")


def _clean_area(text: str) -> str:
    area = _clean(text)
    area = area.replace(" 4వ లెను", " 4వ లైన్").replace("4వ లెను", "4వ లైన్")
    for wrong, right in AREA_FIXES.items():
        area = area.replace(wrong, right)
    return _clean(area)


def _is_uncertain_area(area: str) -> bool:
    if not area or "నిర్ధారించాలి" in area:
        return True
    if len(area) < 3:
        return True
    return not bool(TELUGU_RE.search(area))


def _line_after(lines: list[str], labels: tuple[str, ...]) -> str:
    for line in lines:
        if any(label in line for label in labels):
            value = line.split(":", 1)[-1] if ":" in line else line
            for label in labels:
                value = value.replace(label, "")
            return _clean(value)
    return ""


def _regex_value(text: str, patterns: tuple[str, ...]) -> str:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.MULTILINE)
        if match:
            return _clean(match.group(1))
    return ""


def _first_number_after(lines: list[str], labels: tuple[str, ...]) -> str:
    text = _line_after(lines, labels)
    match = re.search(r"\d[\d\-\/A-Za-z()]*", text)
    return match.group(0) if match else ""


def _house_no(text: str) -> str:
    value = _regex_value(
        text,
        (
            r"(?:ఇం\.?\s*నెం|ఇంటి|నెం\.?\s*/\s*వార్డు|నెం\./వార్డు)\s*[:.]?\s*([0-9A-Za-z\-/()ఎ]+)",
        ),
    )
    if value and not value.startswith("27"):
        return value
    return ""


def _age(text: str) -> str:
    value = _regex_value(text, (r"(?:వయసు|వయస్సు|స్సు)\s*[:.]?\s*(\d{1,3})",))
    return value


def _occupation(text: str, lines: list[str]) -> str:
    value = _line_after(lines, ("వృత్తి",))
    if "వృత్తి" in value:
        value = value.split("వృత్తి", 1)[-1]
    value = value.lstrip(" :.")
    return _clean(value)


def _serial(text: str) -> str:
    match = re.search(r"(?:వరుస|వరు|వ\.?)\s*(?:నం|సంఖ్య)?\s*[:\-]?\s*(\d{3,6})", text)
    if match:
        return match.group(1)
    match = re.search(r"\b(27\d{2})\b", text)
    return match.group(1) if match else ""


def extract_local_card(image_path: Path) -> dict[str, Any]:
    _configure_tesseract()
    os.environ["TESSDATA_PREFIX"] = str(settings.tessdata_prefix)
    image = _preprocess(image_path)
    config = "--psm 6"
    text = pytesseract.image_to_string(image, lang="tel", config=config)
    lines = [_clean(line) for line in text.splitlines() if _clean(line)]
    name = _line_after(lines, ("పేరు",))
    relation = _line_after(lines, ("తండ్రి", "భర్త", "డ్రి పేరు", "తండి పేరు"))
    area = _clean_area(_line_after(lines, ("నివాసం", "సం")))
    if not relation:
        relation = _regex_value(text, (r"(?:డ్రి|తండి|తండ్రి|భర్త)\s*పేరు\.?\s*[:.]?\s*([^\n]+)",))
    if not area:
        area = _clean_area(_regex_value(text, (r"(?:నివాసం|సం)\s*[:.]?\s*([^\n]+)$",)))
    result = {
        "serial_no": _serial(text),
        "card_no": _first_number_after(lines, ("B", "బి")),
        "name_te": name,
        "name_en": transliterate_te(name),
        "relation_label_te": "తండ్రి/భర్త",
        "relation_name_te": relation,
        "age": _age(text),
        "occupation_te": _occupation(text, lines),
        "house_no": _house_no(text),
        "area_te": area,
        "area_en": transliterate_te(area, "Needs area review"),
        "raw_text": text,
        "confidence": 0.55 if TELUGU_RE.search(text) else 0.1,
        "needs_review": not name or _is_uncertain_area(area),
    }
    return result
