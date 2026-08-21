"""
regenerate_english_names.py — Regenerate name_en for ALL voters from their current name_te.

This fixes stale English values left over from Gemini OCR or older transliterate versions,
without touching name_te.  Run AFTER repair_names.py (which fixes Telugu spelling first).

Run:  python scripts/regenerate_english_names.py [--dry-run]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.transliterate import transliterate_person_name_te

ROOT = BACKEND_ROOT / "data" / "jobs"
DRY_RUN = "--dry-run" in sys.argv


def regenerate_job(voters_file: Path, dry_run: bool = False) -> list[dict]:
    voters = json.loads(voters_file.read_text(encoding="utf-8"))
    changes: list[dict] = []
    for voter in voters:
        te = str(voter.get("name_te") or "").strip()
        if not te:
            continue
        old_en = str(voter.get("name_en") or "").strip()
        new_en = transliterate_person_name_te(te)
        if new_en == old_en:
            continue
        changes.append({
            "serial_no": voter.get("serial_no", ""),
            "name_te": te,
            "old_en": old_en,
            "new_en": new_en,
        })
        if not dry_run:
            voter["name_en"] = new_en
    if not dry_run and changes:
        voters_file.write_text(json.dumps(voters, ensure_ascii=False, indent=2), encoding="utf-8")
    return changes


def main() -> None:
    total = 0
    for job_dir in sorted(ROOT.iterdir()):
        vf = job_dir / "voters.json"
        if not vf.exists():
            continue
        changes = regenerate_job(vf, dry_run=DRY_RUN)
        if changes:
            tag = "[DRY] " if DRY_RUN else ""
            print(f"\n{tag}Job: {job_dir.name} — {len(changes)} name_en updated")
            print(f"  {'#':<6}  {'Old English':48}  {'New English'}")
            print(f"  {'-'*6}  {'-'*48}  {'-'*40}")
            for c in changes:
                print(f"  {str(c['serial_no']):<6}  {c['old_en'][:48]:<48}  {c['new_en']}")
        total += len(changes)
    suffix = " (dry run — no files written)" if DRY_RUN else ""
    print(f"\nTotal name_en regenerated: {total}{suffix}")


if __name__ == "__main__":
    main()
