from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

import cv2
import pytesseract

from app.core.config import settings
from app.services.transliterate import transliterate_te


TELUGU_RE = re.compile(r"[\u0C00-\u0C7F]+")
DIGIT_MAP = str.maketrans("౦౧౨౩౪౫౬౭౮౯", "0123456789")
LABEL_NAME = "\u0c2a\u0c47\u0c30\u0c41"
LABEL_FATHER = "\u0c24\u0c02\u0c21\u0c4d\u0c30\u0c3f"
LABEL_HUSBAND = "\u0c2d\u0c30\u0c4d\u0c24"
LABEL_AGE = "\u0c35\u0c2f\u0c38\u0c4d\u0c38\u0c41"
LABEL_OCCUPATION = "\u0c35\u0c43\u0c24\u0c4d\u0c24\u0c3f"
LABEL_HOUSE = "\u0c07\u0c02.\u0c28\u0c46\u0c02"
LABEL_RESIDENCE = "\u0c28\u0c3f\u0c35\u0c3e\u0c38\u0c02"


def _configure_tesseract() -> None:
    if Path(settings.tesseract_cmd).exists():
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def _load_card(image_path: Path):
    image = cv2.imread(str(image_path))
    if image is None:
        raise RuntimeError("చిత్రం చదవలేకపోయింది")
    return image


def _normalize(text: str) -> str:
    value = (text or "").replace("\u200c", "").replace("\u200d", "")
    value = value.translate(DIGIT_MAP)
    value = value.replace("|", "").replace("[", "").replace("]", "")
    value = value.replace("`", "").replace("’", "").replace("‘", "")
    value = re.sub(r"\s+", " ", value)
    return value.strip(" .,:;=-")


def _crop(image, x0: float, y0: float, x1: float, y1: float):
    h, w = image.shape[:2]
    left = max(0, min(w - 1, int(w * x0)))
    top = max(0, min(h - 1, int(h * y0)))
    right = max(left + 1, min(w, int(w * x1)))
    bottom = max(top + 1, min(h, int(h * y1)))
    return image[top:bottom, left:right]


def _prep_variants(image) -> list:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    scaled = cv2.resize(gray, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    binary = cv2.threshold(scaled, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    adaptive = cv2.adaptiveThreshold(scaled, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 11)
    return [binary, adaptive, scaled]


def _ocr_region(image, *, lang: str = "tel", psm: int = 6, whitelist: str = "") -> str:
    config = f"--psm {psm}"
    if whitelist:
        config += f' -c tessedit_char_whitelist="{whitelist}"'
    best = ""
    for variant in _prep_variants(image):
        try:
            text = _normalize(pytesseract.image_to_string(variant, lang=lang, config=config))
        except pytesseract.TesseractError:
            text = _normalize(pytesseract.image_to_string(variant, lang="tel", config=config))
        if len(text) > len(best):
            best = text
    return best


def _find_marker(text: str, markers: tuple[str, ...]) -> tuple[int, str]:
    hit = (-1, "")
    for marker in markers:
        idx = text.find(marker)
        if idx != -1 and (hit[0] == -1 or idx < hit[0]):
            hit = (idx, marker)
    return hit


def _slice_value(text: str, start_markers: tuple[str, ...], end_markers: tuple[str, ...]) -> str:
    start_idx, marker = _find_marker(text, start_markers)
    if start_idx == -1:
        return ""
    tail = text[start_idx + len(marker) :].strip(" :;,-")
    end_idx = len(tail)
    for end_marker in end_markers:
        idx = tail.find(end_marker)
        if idx != -1 and idx < end_idx:
            end_idx = idx
    return _normalize(tail[:end_idx])


def _prepare_parse_text(text: str) -> str:
    value = _normalize(text)
    substitutions = (
        (r"(?<!వ)రుస\s*నెం", "వరుస నెం"),
        (r"సనెం", "వరుస నెం"),
        (r"వరుసనెం", "వరుస నెం"),
        (r"న\s*మేరు", "పేరు"),
        (r"\bమేరు\b", "పేరు"),
        (r"\bపెరు\b", "పేరు"),
        (r"(?<![ఀ-౿])పేర(?=\s*[:.;])", "పేరు"),
        (r"తం.?డి|తం.?జి", "తండ్రి"),
        (r"తండి", "తండ్రి"),
        (r"తండ్రి\s*['\"“”]?\s*పేర[ుం]?", "తండ్రి పేరు"),
        (r"డి\s*పేరు", "తండ్రి పేరు"),
        (r"వయ\s*స్సు", "వయస్సు"),
        (r"వృతి", "వృత్తి"),
        (r"వార్తు|వార్టు|వార్లు|వారు", "వార్డు"),
        (r"0\.నెం", "ఇం.నెం"),
        (r"0\.నం|ఇం\.నం", "ఇం.నెం"),
        (r"నివాస\s*0", "నివాసం"),
        (r"నివాస\s*;", "నివాసం :"),
        (r"\s+", " "),
    )
    for pattern, replacement in substitutions:
        value = re.sub(pattern, replacement, value)
    return value.strip()


def _extract_digits(text: str) -> str:
    match = re.search(r"\d[\dA-Za-z/-]*", text or "")
    return match.group(0) if match else ""


def _extract_serial(text: str) -> str:
    clean = _prepare_parse_text(text)
    match = re.search(r"వరుస నెం\s*[:.]?\s*(\d{1,6})", clean)
    if match:
        return match.group(1)
    match = re.search(r"\b(\d{1,6})\b", clean)
    return match.group(1) if match else ""


def _clean_name(value: str) -> str:
    text = _normalize(value)
    for marker in (f"{LABEL_FATHER} {LABEL_NAME}", f"{LABEL_HUSBAND} {LABEL_NAME}", LABEL_AGE, LABEL_OCCUPATION, LABEL_HOUSE, LABEL_RESIDENCE):
        idx = text.find(marker)
        if idx > 0:
            text = text[:idx]
    if "/" in text:
        text = text.split("/", 1)[0]
    text = re.sub(r"^[^ఀ-౿A-Za-z]+", "", text)
    text = re.sub(r"\b\d+\b", "", text)
    text = re.sub(r"[\"'“”]+", "", text)
    text = re.sub(r"\s+", " ", text).strip(" .,:;|-")
    for marker in ("షేక్", "మహమ్మద్", "బేగ్", "సయ్యద్", "ఎస్.", "ఎస్ "):
        idx = text.find(marker)
        if idx > 0:
            text = text[idx:]
            break
    return _normalize(text)


def _clean_relation(value: str) -> str:
    text = _normalize(value)
    text = re.sub(r"^పేరు\s*[:.]?\s*", "", text)
    for marker in (LABEL_AGE, LABEL_OCCUPATION, LABEL_HOUSE, LABEL_RESIDENCE):
        idx = text.find(marker)
        if idx > 0:
            text = text[:idx]
    text = re.sub(r"\b\d+\b", "", text)
    text = re.sub(r"[\"'“”]+", "", text)
    text = re.sub(r"\s+", " ", text).strip(" .,:;|-")
    return _normalize(text)


def _extract_age_candidate(text: str) -> str:
    tokens = re.findall(r"\d{1,3}", text or "")
    candidates: list[str] = []
    for token in tokens:
        try:
            value = int(token)
        except ValueError:
            continue
        if 0 < value <= 120:
            candidates.append(str(value))
        if len(token) == 3:
            tail = int(token[-2:])
            head = int(token[:2])
            if 0 < tail <= 120:
                candidates.append(str(tail))
            if 0 < head <= 120:
                candidates.append(str(head))
    return candidates[-1] if candidates else ""


def _extract_occupation(text: str) -> str:
    value = _normalize(text)
    value = re.sub(r"^వృత్తి\s*[:.]?\s*", "", value)
    value = re.sub(r"^\d{1,3}\s*", "", value)
    return _normalize(value)


def _extract_house(text: str) -> str:
    source = _normalize(text)
    match = re.search(r"([0-9A-Za-z]+(?:[-/][0-9A-Za-z]+)+)", source)
    if match:
        return match.group(1)
    match = re.search(r"\b\d+\b", source)
    return match.group(0) if match else ""


def _extract_area(text: str) -> str:
    value = _normalize(text)
    value = re.sub(r"^(?:నివాసం|నివాసము|నివాస)\s*[:.;]?\s*", "", value).strip()
    value = value.replace("పార్క్ రో డ్", "పార్కురోడ్")
    value = value.replace("పార్క్ రోడ్", "పార్కురోడ్")
    value = value.replace("పార్క్రోడ్", "పార్కురోడ్")
    value = value.replace("టిప్పర్లబజార్", "టిప్పర్ల బజార్")
    value = value.replace("టిప్పర్ల బజారు", "టిప్పర్ల బజార్")
    value = value.replace("ఇస్తాంపేట", "ఇస్లాంపేట")
    value = value.replace("ఇస్రాంపేట", "ఇస్లాంపేట")
    value = value.replace("కొత్త పెట", "కొత్తపేట")
    value = value.replace("పాత్రమంగళగిరి", "పాతమంగళగిరి")
    value = value.replace("భగత్సింగ్ నగర్", "భగత్సింగ్ నగర్")
    return _normalize(value)


def _ocr_full_text(image) -> str:
    best = ""
    for psm in (11, 6):
        text = _ocr_region(image, lang="tel", psm=psm)
        if len(text) > len(best):
            best = text
    return best


def extract_fields_from_text(raw_text: str) -> dict[str, str]:
    parse_text = _prepare_parse_text(raw_text)
    if not parse_text:
        return {
            "name_te": "",
            "relation_name_te": "",
            "age": "",
            "occupation_te": "",
            "house_no": "",
            "area_te": "",
        }

    name_markers = (f"{LABEL_NAME} :", f"{LABEL_NAME}:", f"{LABEL_NAME} ")
    relation_markers = (
        f"{LABEL_FATHER} {LABEL_NAME} :",
        f"{LABEL_FATHER} {LABEL_NAME}:",
        f"{LABEL_FATHER} {LABEL_NAME} ",
        f"{LABEL_HUSBAND} {LABEL_NAME} :",
        f"{LABEL_HUSBAND} {LABEL_NAME}:",
        f"{LABEL_HUSBAND} {LABEL_NAME} ",
    )
    common_end_markers = (f"{LABEL_AGE}", f"{LABEL_OCCUPATION}", f"{LABEL_HOUSE}", f"{LABEL_RESIDENCE}")

    name_te = _clean_name(_slice_value(parse_text, name_markers, relation_markers + common_end_markers))
    relation_name_te = _clean_relation(_slice_value(parse_text, relation_markers, common_end_markers))
    age = _extract_age_candidate(
        _slice_value(
            parse_text,
            (f"{LABEL_AGE} :", f"{LABEL_AGE}:", f"{LABEL_AGE} "),
            (f"{LABEL_OCCUPATION}", f"{LABEL_HOUSE}", f"{LABEL_RESIDENCE}"),
        )
    )
    if not age:
        age = _extract_age_candidate(
            _slice_value(parse_text, relation_markers, (f"{LABEL_OCCUPATION}", f"{LABEL_HOUSE}", f"{LABEL_RESIDENCE}"))
        )
    occupation_te = _extract_occupation(
        _slice_value(
            parse_text,
            (f"{LABEL_OCCUPATION} :", f"{LABEL_OCCUPATION}:", f"{LABEL_OCCUPATION} "),
            (f"{LABEL_HOUSE}", f"{LABEL_RESIDENCE}"),
        )
    )
    house_no = _extract_house(
        _slice_value(
            parse_text,
            (
                f"{LABEL_HOUSE}./వార్డు :",
                f"{LABEL_HOUSE}./వార్డు:",
                f"{LABEL_HOUSE}./వార్డు ",
                f"{LABEL_HOUSE} :",
                f"{LABEL_HOUSE}:",
                f"{LABEL_HOUSE} ",
            ),
            (f"{LABEL_RESIDENCE}",),
        )
    )
    if (not house_no or len(house_no) < 3) and occupation_te:
        embedded_house = _extract_house(occupation_te)
        if embedded_house:
            house_no = embedded_house
            occupation_te = _extract_occupation(occupation_te.replace(embedded_house, "").strip())
    area_te = _extract_area(_slice_value(parse_text, (f"{LABEL_RESIDENCE} :", f"{LABEL_RESIDENCE}:", f"{LABEL_RESIDENCE} "), tuple()))

    return {
        "name_te": name_te,
        "relation_name_te": relation_name_te,
        "age": age,
        "occupation_te": occupation_te,
        "house_no": house_no,
        "area_te": area_te,
    }


def extract_local_card(image_path: Path) -> dict[str, Any]:
    _configure_tesseract()
    os.environ["TESSDATA_PREFIX"] = str(settings.tessdata_prefix)

    image = _load_card(image_path)
    serial_text = _ocr_region(_crop(image, 0.0, 0.0, 0.58, 0.12), lang="tel+eng", psm=7)
    card_no_text = _ocr_region(
        _crop(image, 0.40, 0.0, 0.60, 0.12),
        lang="tel",
        psm=7,
        whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    )
    name_text = _ocr_region(_crop(image, 0.0, 0.10, 0.62, 0.27), lang="tel+eng", psm=6)
    relation_text = _ocr_region(_crop(image, 0.0, 0.25, 0.62, 0.46), lang="tel+eng", psm=6)
    age_text = _ocr_region(_crop(image, 0.0, 0.46, 0.30, 0.60), lang="tel+eng", psm=7, whitelist="0123456789")
    occupation_text = _ocr_region(_crop(image, 0.45, 0.46, 0.82, 0.60), lang="tel+eng", psm=6)
    house_text = _ocr_region(_crop(image, 0.0, 0.59, 0.62, 0.78), lang="tel+eng", psm=6)
    area_text = _ocr_region(_crop(image, 0.0, 0.76, 0.98, 0.98), lang="tel+eng", psm=6)
    full_text = _ocr_full_text(image)
    parse_text = _prepare_parse_text(full_text)
    fallback_parse_text = _prepare_parse_text(
        " ".join(part for part in [name_text, relation_text, occupation_text, house_text, area_text] if part)
    )

    serial_no = _extract_serial(serial_text) or _extract_serial(parse_text)
    top_numbers = re.findall(r"\d{1,6}", _prepare_parse_text(serial_text))
    card_no = _extract_digits(card_no_text) or (top_numbers[-1] if len(top_numbers) >= 2 else "")

    text_fields = extract_fields_from_text(full_text)

    name_te = text_fields["name_te"] or _clean_name(fallback_parse_text or name_text)
    relation_name_te = text_fields["relation_name_te"] or _clean_relation(fallback_parse_text or relation_text)
    age = text_fields["age"] or _extract_age_candidate(age_text)
    occupation_te = text_fields["occupation_te"] or _extract_occupation(occupation_text)
    house_no = text_fields["house_no"] or _extract_house(house_text) or _extract_house(parse_text) or _extract_house(fallback_parse_text)
    area_te = text_fields["area_te"] or _extract_area(area_text)
    if house_no and occupation_te:
        occupation_te = _extract_occupation(occupation_te.replace(house_no, "").strip())

    return {
        "serial_no": serial_no,
        "card_no": card_no,
        "name_te": name_te,
        "name_en": transliterate_te(name_te),
        "relation_label_te": "తండ్రి/భర్త",
        "relation_name_te": relation_name_te,
        "age": age,
        "occupation_te": occupation_te,
        "house_no": house_no,
        "area_te": area_te,
        "area_en": transliterate_te(area_te, "Other Area"),
        "raw_text": full_text,
        "confidence": 0.9 if TELUGU_RE.search(full_text) else 0.2,
        "needs_review": False,
    }
