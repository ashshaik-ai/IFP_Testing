"""
repair_names.py — Fix Telugu Muslim name spellings in all voters.json files.

Applies (in order):
  1. Strip non-Telugu chars from suffix (!, ?, &, %, $, *, +, -, etc.)
  2. Exact phrase substitutions (most specific, handles heavily garbled names)
  3. Token-level Muslim name corrections (whole-word substitutions)
  4. Strip trailing OCR garbage suffixes (Telugu fragments from adjacent fields)
  5. Fix broken/truncated prefix ("ష్ " / "ఇక్ " → "షేక్ ")
  6. Regenerate name_en via transliterate_person_name_te

Run:  python scripts/repair_names.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.transliterate import transliterate_person_name_te

ROOT = BACKEND_ROOT / "data" / "jobs"
DRY_RUN = "--dry-run" in sys.argv

# ─── 0. Strip non-Telugu chars from suffix ─────────────────────────────────────
# Any token containing ASCII punctuation/digits is OCR garbage — strip it and
# everything that follows.  Exception: known abbreviation tokens (ఎస్.కె., పు. etc.)
# are allowed to keep their dots.
_NON_TE_IN_TOKEN = re.compile(r'[^ఀ-౿‌‍]')   # any char outside Telugu block
# A single Telugu word followed by exactly one dot is a valid abbreviation prefix
# (e.g. పు. పరు. పీరు. — common in voter data as deceased/elder markers)
_ABBREV_TOKEN = re.compile(r'^[ఀ-౿‌‍]+\.$')
_VALID_ABBREV_TOKENS: frozenset[str] = frozenset({
    'ఎస్.కె.', 'యస్.కె.',  # S.K. variants (multi-dot abbreviation)
    'యండి.', 'ఓరు.',        # other prefixes seen in data
})

def _strip_non_te_suffix(name: str) -> str:
    """Strip from the first token that contains non-Telugu characters.

    Keeps:
    - Any token matching <TeluguWord>. (single-dot abbreviation like పు. పరు.)
    - Explicitly whitelisted multi-dot tokens like ఎస్.కె.
    """
    tokens = name.split()
    clean: list[str] = []
    for tok in tokens:
        # single-dot abbreviation (పు. పరు. పీరు. etc.) → keep
        if _ABBREV_TOKEN.match(tok):
            clean.append(tok)
            continue
        # explicitly whitelisted multi-dot tokens
        if tok in _VALID_ABBREV_TOKENS:
            clean.append(tok)
            continue
        if _NON_TE_IN_TOKEN.search(tok):
            break  # garbage starts here — strip this and all following
        clean.append(tok)
    return ' '.join(clean).strip() if clean else name

# ─── 1. Exact phrase → corrected name ─────────────────────────────────────────
# Most specific: full garbled strings that can't be fixed by suffix/token rules.
PHRASE_FIXES: list[tuple[str, str]] = [
    # ── Targeted fixes for specific garbled multi-token OCR failures ────────────
    ("షేక్ అజ్మల్ బాషా కృ క్ష పః మ",        "షేక్ అజ్మల్ బాషా"),
    ("మహబూబ్ బాషా స్సు. తెక్",               "మహబూబ్ బాషా"),
    ("సయ్యద్ మహబూబ్ శ్స్కా న్నే సుభాని",    "సయ్యద్ మహబూబ్ సుభాని"),
    ("షేక్ ఫు ప్ర షేక్ ఫరీద్ అహమ్మద్",     "షేక్ ఫరీద్ అహమ్మద్"),
    ("మహమ్మద్ స్త ఇస్మాయిల్",               "మహమ్మద్ ఇస్మాయిల్"),
    ("పఠాన్ హయ్యర్ ఖాన్ త్త ఖర్జారు",       "పఠాన్ హయ్యర్ ఖాన్"),
    ("షేక్ సయీద్ అహమ్మద్ గో త ట్ట క్ర గ ఇ", "షేక్ సయీద్ అహమ్మద్"),
    ("మహమ్మద్ అల్ఫ్ ద్ ఖాన్ ఫ్యా",         "మహమ్మద్ అల్ఫ్ ఖాన్"),
    ("షేక్ అల్ల్హాఫ్ క్",                    "షేక్ అల్ల్హాఫ్"),
    # ── Previously known garbled entries ─────────────────────────────────────
    ("ఇక్ మహమూద్ షె హీ ల్లో",        "షేక్ మహమూద్"),
    ("ఇక్ జాని",                       "షేక్ జాని"),
    ("షర్ బాజి గ్రా",                  "షేక్ బాజి"),
    ("సయ్యద్ మహబూబ్ శ్ర బాష",         "సయ్యద్ మహబూబ్ బాషా"),
    ("మహమ్మద్ అర్హద్ లుం... ఎం... న్వష", "మహమ్మద్ అర్హద్"),
    ("షేక్ సుభాన్ బాష పం గ గ్రాం",    "షేక్ సుభాన్ బాషా"),
    ("షేక్ హజరత్ అలి శ్ర క్రై",       "షేక్ హజరత్ అలి"),
    ("షేక్ అహ్మద్ షరీఫ్ కరు",         "షేక్ అహ్మద్ షరీఫ్"),
    ("షేక్ మస్తాన్ వలి గ్గ",           "షేక్ మస్తాన్ వలి"),
    ("షేక్ నిజాముద్దీన్ సాగ",         "షేక్ నిజాముద్దీన్"),
    ("రహమతుల్లా షరీఫ్ స్సు",          "రహమతుల్లా షరీఫ్"),
    ("షేక్ అబ్దుల్లా స్సు",            "షేక్ అబ్దుల్లా"),
    ("షేక్ బాబులు స్సు",               "షేక్ బాబులు"),
    ("సయ్యద్ మహబూబ్ శ్ర బాష",         "సయ్యద్ మహబూబ్ బాషా"),
    ("షేక్ బాష",                       "షేక్ బాషా"),
    ("షేక్ చాన్ బాషా",                 "షేక్ చాంద్ బాషా"),
    ("మహమ్మద్ రఫి",                    "మహమ్మద్ రఫీ"),
    ("మహమ్మద్ సాధిక్",                 "మహమ్మద్ సాదిక్"),
]

# ─── 2. Token-level fixes (applied to individual space-separated tokens) ───────
TOKEN_FIXES: dict[str, str] = {
    # Ashraf — OCR reads ష as అప
    "అప్రాఫ్": "అష్రఫ్",
    "అప్రఫ్":  "అష్రఫ్",
    "అష్రాఫ్": "అష్రఫ్",
    # Arif — Telugu voter convention is అరీఫ్ not ఆరిఫ్
    "ఆరిఫ్": "అరీఫ్",
    # Mahmood — short ు → long ూ
    "మహముద్": "మహమూద్",
    # Sadiq — dh→d (సాధిక్ is phonetically wrong)
    "సాధిక్": "సాదిక్",
    # Ghanu — OCR appends spurious 'snu' to ఘను
    "ఘన్సు": "ఘను",
    # Chand — chandrabindu dropped by OCR (చాన్ → చాంద్)
    "చాన్": "చాంద్",
    # Basha — final ā dropped (బాష → బాషా)
    "బాష": "బాషా",
    # Rafi — standardise to long ī
    "రఫి": "రఫీ",
    # Siddiq — long ī
    "సిద్దిక్": "సిద్దీక్",
    "సిద్ది":   "సిద్దీ",
    # Nihal — long ī at start is wrong (نہال has short i)
    "నీహాల్": "నిహాల్",
    # Nihal alternate spelling
    "నిహాల్": "నిహాల్",   # already correct, no-op guard
    # Irfan — ఈ→ఇ correction not needed (ఇర్ఫాన్ is correct Telugu)
    # Asif — ఆసిఫ్ is accepted Telugu; English fixed via PERSON_TOKEN_FIXES
}

# ─── 3. Trailing OCR-garbage patterns ─────────────────────────────────────────
# These are fragments of other fields (age, occupation) that leaked into name_te.
# Applied to the name after phrase and token fixes.
# All patterns here are Telugu consonant clusters / field-bleed artifacts.
_GARBAGE = (
    # ── Previously known ──────────────────────────────────────────────────────
    r"స్సు",           # from వయస్సు (age label)
    r"స్స",
    r"గ్గ",
    r"కరు",
    r"ల్లో",
    r"శ్ర\s+క్రై",
    r"పం\s+గ\s+గ్రాం",
    r"గ్రాం",
    r"న్వష",
    r"వ్ర్",
    r"\.\.\.",          # ellipsis fragments
    r"జా\?",
    r"తె\d+",           # digit bleed
    r"బాష$",            # bare బాష at very end (belt+suspenders)
    # ── New: Telugu consonant clusters that produce English garbage ────────────
    # NOTE: Telugu has dental (త 0C24) vs retroflex (ట 0C1F) pairs that both
    # produce the same Roman letter. OCR generates both — list ALL variants.
    #
    # Kta / Kt — dental ka+virama+ta
    "క్త",       # క్త  ka+virama+ta_dental → Kta
    # Kta / Kt — retroflex ka+virama+TA
    "క్ట",       # క్ట  ka+virama+TA_retroflex → Kta
    # Ksha
    r"క్ష",                     # ka+virama+sha cluster → Ksha
    # Sto — retroflex
    "స్టో", # స్టో sa+virama+TA_retroflex+O → Sto
    # Sto — dental
    "స్తో", # స్తో sa+virama+ta_dental+O → Sto
    # Sta — dental
    "స్త",       # స్త  sa+virama+ta_dental → Sta
    # Sta — retroflex
    "స్ట",       # స్ట  sa+virama+TA_retroflex → Sta
    # Klon / Klo
    r"క్లోన్",                  # → Klon
    r"క్లో",                    # → Klo
    # Tta — retroflex doubled
    "ట్ట",       # ట్ట  TA+virama+TA_retroflex → Tta
    # Tta — dental doubled
    "త్త",       # త్త  ta+virama+ta_dental → Tta
    # Tte — dental
    "త్తే", # త్తే ta+virama+ta+E → Tte
    # Pra
    r"ప్ర",                     # → Pra
    # Shra
    r"శ్ర",                     # → Shra
    # Rya
    r"ర్య",                     # → Rya
    # Gra
    r"గ్ర",                     # → Gra
    # Tra — dental ta+virama+ra
    r"త్ర",                     # → Tra
    # Tra — retroflex TA+virama+ra
    "ట్ర",       # ట్ర  TA_retroflex+virama+ra → Tra
    # Shna
    r"ష్ణ",                     # → Shna
    # Nne
    r"న్నే",                    # → Nne
    # Sma
    r"స్మ",                     # → Sma
    # Kra
    r"క్ర",                     # → Kra
    # Lma
    r"ళ్మ",                     # → Lma
    # Phlo
    r"ఫ్లో",                    # → Phlo
    # Tya — retroflex
    "ట్య",       # ట్య TA+virama+ya → Tya
    # Kla
    r"క్ల",                     # → Kla
    # Shska / Ska
    r"శ్స్కా",                  # → Shska
    r"స్కా",                    # → Ska
    # Sva
    r"స్వ",                     # → Sva
    # Pram
    r"ప్రం",                    # → Pram
    # Shvaa
    r"శ్వా",                    # → Shvaa
    # Ke Staa / Ke Sta
    r"కే\s+స్తా",               # → Ke Staa
    r"కే\s+స్త",                # → Ke Sta
    # Short terminal garbage (2-char tokens that are clearly fragments)
    r"తం",                      # → Tam fragment
    # Additional patterns found in audit pass 3
    r"చ్లా",                    # → Chlaa (blocks గ్గ stripping)
    r"చ్ల",                     # → Chla
    r"యనా",                     # → Yanaa (after శ్వా)
    r"తిట్ల",                   # → Titla (OCR artifact)
    r"పః",                      # → Pah fragment (విసర్గ garbage)
    r"ఖర్జారు",                  # → Kharjaaru (specific artifact)
)
# Use \S* after each pattern so vowel matras extending the token are also stripped
# (e.g. 'స్మా' = 'స్మ' + ā matra → matched by 'స్మ\S*')
GARBAGE_SUFFIX_RE = re.compile(
    r"\s+(?:" + "|".join(_GARBAGE) + r")\S*\s*$"
)

# ─── 4. Broken prefix patterns ─────────────────────────────────────────────────
# IMPORTANT: Telugu matras (ే ా ి etc.) are Unicode category Mn (\W), so never
# use \b after a matra — it fires mid-word and corrupts names.
PREFIX_FIXES: list[tuple[re.Pattern, str]] = [
    # ష్ <space> ... → షేక్ ... (ష + virama + space: clear truncation)
    (re.compile(r"^ష్\s+"),          "షేక్ "),
    # ఇక్ <space> ... → షేక్ ... (OCR reads ష as ఇ)
    (re.compile(r"^ఇక్\s+"),         "షేక్ "),
    # షక్ alone or before space → షేక్ (missing middle ే)
    (re.compile(r"^షక్(?=\s|$)"),    "షేక్"),
    # క్ <space> ... → షేక్ ... (heavily truncated, e.g. K Khaja → Shaik Khaja)
    (re.compile(r"^క్\s+"),          "షేక్ "),
    # NOTE: '^షే\b' was REMOVED — \b fires between ష(\w) and ే(\W) inside "షేక్",
    # corrupting perfectly good names like "షేక్ జిలాని" → "షేక్క్ జిలాని".
]


def fix_name_te(raw: str) -> str:
    name = raw.strip()
    if not name:
        return name

    # 0. Strip non-Telugu chars from suffix (!, ?, &, %, -, $, *, etc.)
    name = _strip_non_te_suffix(name)
    if not name:
        return raw.strip()

    # 1. Exact phrase
    for wrong, right in PHRASE_FIXES:
        if name == wrong:
            return right.strip()

    # 2. Token-level
    tokens = name.split()
    tokens = [TOKEN_FIXES.get(t, t) for t in tokens]
    name = " ".join(tokens)

    # 3. Strip trailing garbage (repeat until stable)
    for _ in range(8):
        new = GARBAGE_SUFFIX_RE.sub("", name).strip()
        if new == name:
            break
        name = new

    # 4. Fix broken prefix
    for pattern, replacement in PREFIX_FIXES:
        if pattern.match(name):
            name = pattern.sub(replacement, name)
            break

    return name.strip()


def repair_job(voters_file: Path, dry_run: bool = False) -> list[dict]:
    voters = json.loads(voters_file.read_text(encoding="utf-8"))
    changes: list[dict] = []
    for voter in voters:
        old_te = str(voter.get("name_te") or "").strip()
        new_te = fix_name_te(old_te)
        if new_te == old_te:
            continue
        new_en = transliterate_person_name_te(new_te) if new_te else str(voter.get("name_en") or "")
        changes.append({
            "serial_no": voter.get("serial_no", ""),
            "old_te": old_te,
            "new_te": new_te,
            "old_en": voter.get("name_en", ""),
            "new_en": new_en,
        })
        if not dry_run:
            voter["name_te"] = new_te
            voter["name_en"] = new_en
    if not dry_run:
        voters_file.write_text(json.dumps(voters, ensure_ascii=False, indent=2), encoding="utf-8")
    return changes


def main() -> None:
    total_changes = 0
    for job_dir in sorted(ROOT.iterdir()):
        voters_file = job_dir / "voters.json"
        if not voters_file.exists():
            continue
        changes = repair_job(voters_file, dry_run=DRY_RUN)
        if changes:
            print(f"\n{'[DRY] ' if DRY_RUN else ''}Job: {job_dir.name} — {len(changes)} name(s) fixed")
            print(f"  {'#':<6}  {'Telugu (before)':45}  {'Telugu (after)':45}")
            print(f"  {'-'*6}  {'-'*45}  {'-'*45}")
            for c in changes:
                print(f"  {str(c['serial_no']):<6}  {c['old_te'][:45]:<45}  {c['new_te'][:45]:<45}")
                print(f"  {'':6}  EN: {c['old_en'][:43]:<43}  → {c['new_en'][:43]}")
        total_changes += len(changes)
    print(f"\nTotal names fixed: {total_changes}{' (dry run — no files written)' if DRY_RUN else ''}")


if __name__ == "__main__":
    main()
