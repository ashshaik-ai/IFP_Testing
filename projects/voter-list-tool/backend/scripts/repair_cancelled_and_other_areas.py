from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import cv2
import pytesseract

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import settings
from app.services.area_rules import OTHER_AREA_TE, canonical_area_en


ROOT = BACKEND_ROOT / "data" / "jobs"
SPACE_RE = re.compile(r"\s+")

AREA_HINTS: list[tuple[str, tuple[str, ...]]] = [
    ("ఇస్లాంపేట", ("ఇస్రాంపేట", "ఇస్లాంపేట", "చినపంజా వీధి", "చిన్న పంజా వీధి", "తెనాలిరోడ్", "తెనాలి రోడ్", "మసీదు వీధి", "పెదకోనేరు వీధి", "కోనేరు వీధి", "బుడ్జయ్య గారి వీధి", "బుడ్డయ్య గారి వీధి", "గౌతమ బుద్దారోడ్", "పీర్లపంజా")),
    ("కొత్తపేట", ("కొత్త పేట", "కొత్తపేట", "కీ త్త పేట", "కో త్ర పేట", "గ్రేట్ ఇండియా రోడ్")),
    ("టిప్పర్ల బజార్", ("టిప్పర్ల బజార్", "టిప్పర్లబజార్", "టిప్పర్లబజారు", "టీప్పర్లబజార్", "సీతారామాంజనేయ పేట", "సీతారామాంజనేయపేట", "న్యూ బ్వాంక్ కాలనీ", "టి, బజారు", "టి.బజారు", "టిప్పర్ల బజార్, సీతారామాంజనేయ పేట")),
    ("మార్కండేయ కాలనీ", ("మార్కండేయ కాలనీ", "మార్కండేయకాలని", "మన్నెం వారి వీధి", "జెండా చెట్టు", "గోపాలకృష్ణ థియేటర్ ప్రక్క సందు", "సి.కె. గ్రౌండ్", "గోపాలకృష్ణ హాల్ దగ్గర", "గోపాలకృష్ణా థియేటర్ వెనుక", "మార్కండేయపేట", "చర్చిరోడ్", "కెఎఎం రెసిడెన్సీ, మార్కండేయ కాలనీ")),
    ("పాతమంగళగిరి", ("పాతమంగళగిరి", "ప్రాతమంగళగిరి", "సీతారామకోవెల", "పీర్లపంజా, పాతమంగళగిరి", "దిగుడు బావి సెంటర్", "దిగుడుబావి సెంటర్", "సీతారామ కోవెల సీట్", "తమ్మిశెట్టి రామకృష్ణ వీధి", "భద్రావతి నగర్")),
    ("పార్కురోడ్", ("పార్కురోడ్", "పార్క్ రోడ్", "పార్క్ రోడ్డు", "శ్రీనివాస మహల్", "పార్క్రో డ్ర్", "పాతబస్థాండు", "పాతబస్టాండు", "నాని స్వీట్స్ వీధి", "పాత బస్టాండ్, నాని స్వీట్స్ బజార్", "పార్ట్రోడ్")),
    ("నిడమర్రు రోడ్", ("పాత బ్వాంక్ కాలని", "బ్యాంక్ కాలని", "నిడమర్రు రోడ్", "నిడమర్ర రోడ్, నియర్ బిలాల్ మస్టీద్", "న్యూ బ్యాంక్ కాలని, నిడమర్రు రోడ్")),
    ("బాపనయ్యనగర్", ("బాపనయ్యనగర్", "బాపనయ్య నగర్", "అజయ్ నగర్", "రైలు కట్ట")),
    ("రాజీవ్ గృహకల్ప", ("రాజీవ్ గృహకల్ప", "ఆటోనగర్")),
    ("టిడ్కో హౌస్", ("టిడ్కో హౌస్", "24వ బ్లాక్, టిడ్కో", "ఎన్.ఆర్.ఐ. హాస్పిటల్ వెనుక")),
    ("రత్నాల చెబువు", ("రత్నాల చెబువు", "రత్నాల చెజువు", "శ్రామిక నగర్", "సూర్యనారాయణ నగర్")),
    ("భగత్సింగ్ నగర్", ("భగత్సింగ్ నగర్",)),
    ("కుప్పురావు కాలనీ", ("కుప్పురావు కాలనీ", "బాలాజీనగర్", "గాంధి నగర్")),
    ("లక్ష్మీనరసింహస్వామి కాలని", ("లక్ష్మీనరసింహస్వామి కాలని", "శ్రీలక్షీనరసింహస్వామి కాలని", "శ్రీలక్షీనరసింహస్వామి కాలనీ", "శ్రీలక్ష్మీనరసింహస్వామి కాలని")),
    ("డ్రైవర్ పేట", ("డ్రైవర్ పేట", "డ్రైవరుపేట")),
    ("మునగాల వారి వీధి", ("మునగాల వారి వీధి",)),
    ("గండాలయ పేట", ("గండాలయ పేట", "గండాలయపేట", "టిటిడి కళ్యాణమండపం", "టిటిడి కల్యాణ మండపం", "ద్వారకానగర్", "గవర్నమెంట్ హాస్పిటల్", "ఆంజనేయ కాలనీ")),
    ("పోలేరమ్మ వీధి", ("పోలేరమ్మ వీధి", "ఇందిరానగర్", "గోరీల బజార్", "గోరిల బజార్")),
    ("యలమందల వారి వీధి", ("యలమందల వారి వీధి", "ఎల్.బి. నగర్", "భార్గవ పేట", "వడ్లపూడి సెంటర్")),
    ("ఎపిఎస్పి క్యాంప్", ("ఎపిఎస్పి క్యాంప్", "యాదవపాలెం")),
]


def normalize_text(text: str) -> str:
    return SPACE_RE.sub(" ", str(text or "").replace("\r", " ").replace("\n", " ")).strip()


def detect_cancelled(card_path: Path) -> bool:
    image = cv2.imread(str(card_path))
    if image is None:
        return False
    h, w = image.shape[:2]
    crop = image[int(h * 0.16) : int(h * 0.76), int(w * 0.05) : int(w * 0.98)]
    if crop.size == 0:
        return False
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    scaled = cv2.resize(gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
    text = pytesseract.image_to_string(scaled, lang="eng", config="--psm 6").lower()
    return "cancel" in text


def find_area_from_raw(raw_text: str) -> str:
    text = normalize_text(raw_text)
    if not text:
        return OTHER_AREA_TE
    best_target = OTHER_AREA_TE
    best_len = 0
    for target, hints in AREA_HINTS:
        for hint in hints:
            if hint and hint in text and len(hint) > best_len:
                best_target = target
                best_len = len(hint)
    return best_target


def repair_job(voters_file: Path) -> tuple[int, int]:
    voters = json.loads(voters_file.read_text(encoding="utf-8"))
    cards_dir = voters_file.parent / "cards"
    changed = 0
    moved = 0
    for voter in voters:
        card_name = Path(str(voter.get("card_url") or "")).name
        if card_name and not voter.get("is_cancelled") and not voter.get("is_deceased") and not voter.get("is_blocklisted"):
            card_path = cards_dir / card_name
            if card_path.exists() and detect_cancelled(card_path):
                voter["is_cancelled"] = True
                voter["is_deceased"] = False
                voter["is_blocklisted"] = False
                changed += 1
                continue

        if voter.get("is_cancelled") or voter.get("is_deceased") or voter.get("is_blocklisted"):
            continue

        if str(voter.get("area_te") or "").strip() != OTHER_AREA_TE:
            continue

        area_from_raw = find_area_from_raw(str(voter.get("raw_text") or ""))
        if area_from_raw == OTHER_AREA_TE:
            continue

        voter["area_te"] = area_from_raw
        voter["area_en"] = canonical_area_en(area_from_raw)
        voter["needs_review"] = False
        changed += 1
        moved += 1

    voters_file.write_text(json.dumps(voters, ensure_ascii=False, indent=2), encoding="utf-8")
    return changed, moved


def main() -> None:
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
    moved_total = 0
    changed_total = 0
    for voters_file in sorted(ROOT.glob("*/voters.json")):
        changed, moved = repair_job(voters_file)
        changed_total += changed
        moved_total += moved
        print(f"{voters_file.parent.name}: changed={changed} moved={moved}")
    print(f"changed_total={changed_total}")
    print(f"moved_total={moved_total}")


if __name__ == "__main__":
    main()
