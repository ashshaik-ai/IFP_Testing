"""One-off repair: apply the wa_optin default rule (mobile present AND
has_whatsapp confirmed True -> opt-in Yes, else No) retroactively to voters
whose WhatsApp status was bulk-imported before that rule existed in
wa_status_import.py / routes.py. Local test dataset only (backend/data/jobs).
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data" / "jobs"


def main() -> None:
    touched_files = 0
    flipped_yes = 0
    flipped_no = 0
    for path in sorted(ROOT.glob("*/voters.json")):
        voters = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for voter in voters:
            desired = bool(str(voter.get("mobile", "")).strip()) and voter.get("has_whatsapp") is True
            current = bool(voter.get("wa_optin"))
            if current != desired:
                voter["wa_optin"] = desired
                changed = True
                if desired:
                    flipped_yes += 1
                else:
                    flipped_no += 1
        if changed:
            path.write_text(json.dumps(voters, ensure_ascii=False, indent=2), encoding="utf-8")
            touched_files += 1
    print(f"files_touched={touched_files} flipped_to_yes={flipped_yes} flipped_to_no={flipped_no}")


if __name__ == "__main__":
    main()
