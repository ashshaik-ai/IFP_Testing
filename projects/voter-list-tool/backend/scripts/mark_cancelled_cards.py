from __future__ import annotations

import json
from pathlib import Path

import cv2
import pytesseract

from app.core.config import settings


def detect_cancelled(card_path: Path) -> bool:
    image = cv2.imread(str(card_path))
    if image is None:
        return False
    h, w = image.shape[:2]
    crop = image[int(h * 0.18) : int(h * 0.75), int(w * 0.08) : int(w * 0.98)]
    if crop.size == 0:
        return False
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    scaled = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    text = pytesseract.image_to_string(scaled, lang="eng", config="--psm 6").lower()
    return "cancel" in text


def suspicious(voter: dict) -> bool:
    name = str(voter.get("name_te", "") or "").strip()
    return (
        voter.get("area_en") == "Other Area"
        and (len(name) <= 2 or name in {"", "షేక్", "బేగ్", "క", "గ", "ఇ", "్"})
    )


def main() -> None:
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
    jobs_dir = settings.data_dir / "jobs"
    marked: list[tuple[str, str]] = []
    for voter_file in jobs_dir.glob("*/voters.json"):
        voters = json.loads(voter_file.read_text(encoding="utf-8"))
        changed = False
        for voter in voters:
            if not suspicious(voter):
                continue
            card_name = Path(voter.get("card_url", "")).name
            if not card_name:
                continue
            card_path = voter_file.parent / "cards" / card_name
            if not card_path.exists():
                continue
            if not detect_cancelled(card_path):
                continue
            voter["is_cancelled"] = True
            voter["is_deceased"] = False
            voter["is_blocklisted"] = False
            changed = True
            marked.append((voter.get("job_id", ""), voter.get("serial_no", "")))
        if changed:
            voter_file.write_text(json.dumps(voters, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"marked={len(marked)}")
    for job_id, serial_no in marked:
        print(f"{job_id}:{serial_no}")


if __name__ == "__main__":
    main()
