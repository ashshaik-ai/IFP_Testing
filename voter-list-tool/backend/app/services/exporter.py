from __future__ import annotations

import csv
import io
from collections import defaultdict


HEADERS_TE = [
    "ప్రాంతం",
    "క్రమ సంఖ్య",
    "కార్డ్ సంఖ్య",
    "పేరు",
    "English పేరు",
    "తండ్రి/భర్త",
    "తండ్రి/భర్త పేరు",
    "వయస్సు",
    "వృత్తి",
    "ఇంటి నంబర్",
]


def voters_to_csv(voters: list[dict], area: str | None = None) -> str:
    selected = [v for v in voters if not area or v.get("area_te") == area]
    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow(HEADERS_TE)
    for v in selected:
        writer.writerow(
            [
                v.get("area_te", ""),
                v.get("serial_no", ""),
                v.get("card_no", ""),
                v.get("name_te", ""),
                v.get("name_en", ""),
                v.get("relation_label_te", ""),
                v.get("relation_name_te", ""),
                v.get("age", ""),
                v.get("occupation_te", ""),
                v.get("house_no", ""),
            ]
        )
    return output.getvalue()


def area_summaries(voters: list[dict]) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for voter in voters:
        groups[voter.get("area_te") or "ప్రాంతం నిర్ధారించాలి"].append(voter)
    rows = []
    for area, items in sorted(groups.items()):
        rows.append(
            {
                "area_te": area,
                "area_en": next((i.get("area_en", "") for i in items if i.get("area_en")), ""),
                "count": len(items),
                "missing_count": sum(
                    1
                    for i in items
                    if not i.get("name_te") or not i.get("house_no") or not i.get("photo_url")
                ),
            }
        )
    return rows
