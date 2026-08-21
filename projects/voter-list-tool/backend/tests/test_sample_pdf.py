from pathlib import Path
import sys

import fitz

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.pdf_processor import _detect_grid


def test_sample_pdf_detects_cards_and_photos():
    sample = Path(r"C:\Users\User\Documents\Voterlist\Sample_Voterlist.pdf")
    if not sample.exists():
        return
    doc = fitz.open(sample)
    assert doc.page_count == 1
    cards, photos = _detect_grid(doc[0])
    assert len(cards) == 20
    assert len(photos) == 20
