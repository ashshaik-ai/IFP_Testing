from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pytesseract


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import settings
from app.services.area_rules import OTHER_AREA_TE, canonical_area_en
from app.services.local_ocr import _crop, _load_card, _ocr_region

if Path(settings.tesseract_cmd).exists():
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

ROOT = BACKEND_ROOT / "data" / "jobs"

AREA_HINTS: list[tuple[str, tuple[str, ...]]] = [
    ("ఇస్లాంపేట", ("ఇస్లాంపేట", "ఇసాంపేట", "ఇస్రాంపేట", "ఇస్లాం పేట", "ఇస్తాంపేట", "ఇస్తాం పేట", "13వ వార్డు")),
    ("కొత్తపేట", ("కొత్తపేట", "కొత్త పేట", "కోత్తపేట", "కోత్రపేట", "3వ లెను, కొత్తపేట", "3వ లైను, కొత్తపేట")),
    ("టిప్పర్ల బజార్", ("టిప్పర్ల బజార్", "టిప్పర్లబజార్", "టిప్పర్లబజారు", "టి.బజారు", "టి, బజారు", "సీతారామాంజనేయ పేట")),
    ("మార్కండేయ కాలనీ", ("మార్కండేయ కాలనీ", "మార్కండేయకాలని", "మార్కండేయపేట", "మన్నెం వారి వీధి", "గోపాలకృష్ణ థియేటర్ ప్రక్క సందు", "చర్చిరోడ్", "కెఎఎం రెసిడెన్సీ")),
    ("పాతమంగళగిరి", ("పాతమంగళగిరి", "ప్రాతమంగళగిరి", "దిగుడుబావి సెంటర్", "దిగుడు బావి సెంటర్", "పీర్లపంజా, పాతమంగళగిరి", "తమ్మిశెట్టి రామకృష్ణ వీధి")),
    ("పార్కురోడ్", ("పార్కురోడ్", "పార్క్ రోడ్", "పార్క్రోడ్", "పార్క్రో డ్ర్", "పార్ట్రోడ్", "పాతబస్టాండు", "పాతబస్థాండు", "నాని స్వీట్స్ వీధి", "5వ లైను", "5వ లెను")),
    ("నిడమర్రు రోడ్", ("నిడమర్రు రోడ్", "నిడమర్ర రోడ్", "బ్యాంక్ కాలని", "పాత బ్వాంక్ కాలని", "నియర్ బిలాల్ మస్టీద్")),
    ("బాపనయ్యనగర్", ("బాపనయ్యనగర్", "బాపనయ్య నగర్", "అజయ్ నగర్", "రైలు కట్ట")),
    ("రాజీవ్ గృహకల్ప", ("రాజీవ్ గృహకల్ప", "ఆటోనగర్")),
    ("టిడ్కో హౌస్", ("టిడ్కో హౌస్", "24వ బ్లాక్, టిడ్కో", "ఎన్.ఆర్.ఐ. హాస్పిటల్ వెనుక")),
    ("రత్నాల చెబువు", ("రత్నాల చెబువు", "రత్నాల చెజువు", "శ్రామిక నగర్", "సూర్యనారాయణ నగర్")),
    ("భగత్సింగ్ నగర్", ("భగత్సింగ్ నగర్",)),
    ("కుప్పురావు కాలనీ", ("కుప్పురావు కాలనీ", "బాలాజీనగర్", "గాంధి నగర్")),
    ("లక్ష్మీనరసింహస్వామి కాలని", ("లక్ష్మీనరసింహస్వామి కాలని", "శ్రీలక్షీనరసింహస్వామి కాలని", "శ్రీలక్షీనరసింహస్వామి కాలనీ", "శ్రీలక్ష్మీనరసింహస్వామి కాలని")),
    ("డ్రైవర్ పేట", ("డ్రైవర్ పేట", "డ్రైవరుపేట", "డైవరుపేట")),
    ("మునగాల వారి వీధి", ("మునగాల వారి వీధి",)),
    ("గండాలయ పేట", ("గండాలయ పేట", "గండాలయపేట", "టిటిడి కళ్యాణమండపం", "టిటిడి కల్యాణ మండపం", "ద్వారకానగర్", "గవర్నమెంట్ హాస్పిటల్", "ఆంజనేయ కాలనీ")),
    ("పోలేరమ్మ వీధి", ("పోలేరమ్మ వీధి", "ఇందిరానగర్", "గోరీల బజార్", "గోరిల బజార్")),
    ("యలమందల వారి వీధి", ("యలమందల వారి వీధి", "ఎల్.బి. నగర్", "భార్గవ పేట", "వడ్లపూడి సెంటర్")),
    ("ఎపిఎస్పి క్యాంప్", ("ఎపిఎస్పి క్యాంప్", "యాదవపాలెం")),
]


def _clean(text: str) -> str:
    value = str(text or "").replace("\r", " ").replace("\n", " ")
    value = value.replace("నివాసం :", " ").replace("నివాసం:", " ").replace("వాసం :", " ").replace("వాసం:", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def infer_area(text: str) -> str | None:
    hay = _clean(text)
    if not hay:
        return None
    best_target: str | None = None
    best_len = 0
    for target, hints in AREA_HINTS:
        for hint in hints:
            if hint in hay and len(hint) > best_len:
                best_target = target
                best_len = len(hint)
    return best_target


def read_area_text(card_path: Path) -> str:
    image = _load_card(card_path)
    region = _crop(image, 0.02, 0.82, 0.72, 0.995)
    text = _ocr_region(region, lang="tel", psm=6)
    return _clean(text)


def repair_job(voters_file: Path) -> tuple[int, int]:
    voters = json.loads(voters_file.read_text(encoding="utf-8"))
    cards_dir = voters_file.parent / "cards"
    changed = 0
    unresolved = 0

    for voter in voters:
        if str(voter.get("area_te") or "").strip() != OTHER_AREA_TE:
            continue
        if voter.get("is_cancelled") or voter.get("is_deceased") or voter.get("is_blocklisted"):
            continue

        card_name = Path(str(voter.get("card_url") or "")).name
        if not card_name:
            unresolved += 1
            continue

        card_path = cards_dir / card_name
        if not card_path.exists():
            unresolved += 1
            continue

        try:
            area_text = read_area_text(card_path)
        except Exception:
            unresolved += 1
            continue

        target = infer_area(area_text)

        if not target:
            unresolved += 1
            continue

        voter["area_te"] = target
        voter["area_en"] = canonical_area_en(target)
        voter["needs_review"] = False
        changed += 1

    voters_file.write_text(json.dumps(voters, ensure_ascii=False, indent=2), encoding="utf-8")
    return changed, unresolved


def main() -> None:
    changed_total = 0
    unresolved_total = 0
    for voters_file in sorted(ROOT.glob("*/voters.json")):
        changed, unresolved = repair_job(voters_file)
        changed_total += changed
        unresolved_total += unresolved
        print(f"{voters_file.parent.name}: moved={changed} unresolved={unresolved}")
    print(f"moved_total={changed_total}")
    print(f"unresolved_total={unresolved_total}")


if __name__ == "__main__":
    main()
