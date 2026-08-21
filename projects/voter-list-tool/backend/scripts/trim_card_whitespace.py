from __future__ import annotations

from pathlib import Path

import cv2


ROOT = Path(__file__).resolve().parents[1] / "data" / "jobs"


def trim_card(path: Path, padding: int = 10) -> bool:
    image = cv2.imread(str(path))
    if image is None:
        return False
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = gray < 245
    coords = cv2.findNonZero(mask.astype("uint8"))
    if coords is None:
        return False
    x, y, w, h = cv2.boundingRect(coords)
    x0 = max(0, x - padding)
    y0 = max(0, y - padding)
    x1 = min(image.shape[1], x + w + padding)
    y1 = min(image.shape[0], y + h + padding)
    trimmed = image[y0:y1, x0:x1]
    if trimmed.size and (trimmed.shape[0] < image.shape[0] or trimmed.shape[1] < image.shape[1]):
        cv2.imwrite(str(path), trimmed)
        return True
    return False


def main() -> None:
    changed = 0
    for path in sorted(ROOT.glob("*/cards/*.png")):
        changed += 1 if trim_card(path) else 0
    print(f"trimmed={changed}")


if __name__ == "__main__":
    main()
