#!/usr/bin/env python3
"""Build unit-level exam notes from converted PDF Markdown files."""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path


SUBJECTS = [
    ("fundamentals-of-information-technology", "1.fundamentals-of-information-technology", "Fundamentals Of Information Technology", "1-fundamentals-of-information-technology.clean.md", "Understand how data becomes action through hardware, software, networks, storage, and platforms."),
    ("fundamentals-of-research", "2.fundamentals-of-research", "Fundamentals Of Research", "2-fundamentals-of-research.clean.md", "Turn doubt into disciplined knowledge through problem, method, evidence, ethics, and communication."),
    ("political-theory", "3.political-theory", "Political Theory", "3-political-theory.clean.md", "Use concepts and thinkers to judge power, liberty, equality, justice, rights, and democracy."),
    ("political-institutions-in-india", "4.political-institutions-in-india", "Political Institutions In India", "4-political-institutions-in-india.clean.md", "Understand how constitutional ideas become working power through institutions and accountability."),
    ("international-relations", "5.international-relations", "International Relations", "5-international-relations-theory-and-practice.clean.md", "Explain world politics through power, interest, identity, law, economy, security, and institutions."),
]

STOP_SECTION_RE = re.compile(r"^(?:summary|keywords|keywords/glossary|self assessment|answer for self assessment|answers|further readings|review questions|exercise)$", re.I)
UNIT_RE = re.compile(r"^##\s+Unit\s+0?(\d{1,2})\s*[:\-]?\s*(.*)$", re.I | re.M)
HEADING_RE = re.compile(r"^#{2,3}\s+(.+)$", re.M)
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")
HIGH_VALUE_RE = re.compile(
    r"\b(?:means|defined|definition|characteristics?|features?|functions?|types?|classification|importance|significance|objectives?|advantages?|limitations?|causes?|effects?|role|powers?|process|principles?)\b",
    re.I,
)
MOJIBAKE_MARKERS = ("\u00e2\u20ac", "\u00c3\u00a2", "\u00c2")
OCR_CORRECTIONS = {
    "Anallytics": "Analytics",
    "Anny": "Any",
    "Applicatioons": "Applications",
    "Bitcoinn": "Bitcoin",
    "Blockchaain": "Blockchain",
    "CComputer": "Computer",
    "Daata": "Data",
    "Hencce": "Hence",
    "Heence": "Hence",
    "Howwever": "However",
    "IInformation": "Information",
    "Legallly": "Legally",
    "Characcteristics": "Characteristics",
    "Characteriistics": "Characteristics",
    "Communicaation": "Communication",
    "Commmunication": "Communication",
    "Compputing": "Computing",
    "Computerr": "Computer",
    "Computter": "Computer",
    "Developpment": "Development",
    "Evolutionn": "Evolution",
    "Inpput": "Input",
    "MMemory": "Memory",
    "Meemory": "Memory",
    "Multimmedia": "Multimedia",
    "Netwworks": "Networks",
    "Nummber": "Number",
    "PProtocols": "Protocols",
    "Probblems": "Problems",
    "Representaation": "Representation",
    "SSystem": "System",
    "Sysstems": "Systems",
    "Theese": "These",
    "VVarious": "Various",
    "aa": "a",
    "aaccuracy": "accuracy",
    "annd": "and",
    "arithmetiic": "arithmetic",
    "becamme": "became",
    "caan": "can",
    "ccan": "can",
    "carriied": "carried",
    "ccomputer": "computer",
    "cconsistently": "consistently",
    "commputes": "computes",
    "compputer": "computer",
    "coomplementary": "complementary",
    "coover": "cover",
    "creatiing": "creating",
    "databasse": "database",
    "datta": "data",
    "deferent": "different",
    "deepends": "depends",
    "describbed": "described",
    "devicee": "device",
    "ddevice": "device",
    "disssipated": "dissipated",
    "empicial": "empirical",
    "enormouus": "enormous",
    "excercise": "exercise",
    "finnd": "find",
    "foollow": "follow",
    "foound": "found",
    "ffile": "file",
    "functiions": "functions",
    "faillures": "failures",
    "generaal": "general",
    "generatiion": "generation",
    "generrated": "generated",
    "hardwaredesignned": "hardware designed",
    "hundredsof": "hundreds of",
    "idelogy": "ideology",
    "iinspected": "inspected",
    "informatiion": "information",
    "inn": "in",
    "interveention": "intervention",
    "instructioons": "instructions",
    "joob": "job",
    "lletter": "letter",
    "leess": "less",
    "maay": "may",
    "millisecoonds": "milliseconds",
    "machinesthat": "machines that",
    "mmany": "many",
    "mmemorise": "memorise",
    "naame": "name",
    "nneed": "need",
    "nnot": "not",
    "netwoork": "network",
    "obbtained": "obtained",
    "oof": "of",
    "operatioons": "operations",
    "onee": "one",
    "performeed": "performed",
    "pperform": "perform",
    "perfforming": "performing",
    "perfforms": "performs",
    "piecce": "piece",
    "poopularity": "popularity",
    "ppform": "perform",
    "pprocess": "process",
    "predecessors": "predecessors",
    "prepaaring": "preparing",
    "proceessing": "processing",
    "reducedd": "reduced",
    "reduceed": "reduced",
    "required": "required",
    "rrequired": "required",
    "resuults": "results",
    "retaiining": "retaining",
    "sstart": "start",
    "savee": "save",
    "speeed": "speed",
    "storred": "stored",
    "subconsciouslyy": "subconsciously",
    "systemms": "systems",
    "techhnology": "technology",
    "Therre": "There",
    "technollogicalweaknesses": "technological weaknesses",
    "thhe": "the",
    "thee": "the",
    "twwo": "two",
    "typee": "type",
    "unimmportant": "unimportant",
    "uusually": "usually",
    "vaalue": "value",
    "wiith": "with",
    "wwhole": "whole",
    "wwe": "we",
    "yyear": "year",
    "affordablee": "affordable",
    "negligiblee": "negligible",
    "negliigible": "negligible",
    "reliablee": "reliable",
}
NOISE_LINE_RE = re.compile(r"\b(?:LOVELY|PRROFESSIONAL|PROFESSIONAL UNIVERSITY|UNIVERSITYUNIVERSITY)\b", re.I)


@dataclass(frozen=True)
class Unit:
    number: int
    title: str
    start: int
    end: int
    text: str


def repair_text(text: str) -> str:
    if any(marker in text for marker in MOJIBAKE_MARKERS):
        for _ in range(2):
            try:
                fixed = text.encode("cp1252").decode("utf-8")
            except UnicodeError:
                break
            old_bad = sum(text.count(marker) for marker in MOJIBAKE_MARKERS)
            new_bad = sum(fixed.count(marker) for marker in MOJIBAKE_MARKERS)
            if new_bad >= old_bad:
                break
            text = fixed

    for bad, good in {
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2013": "-",
        "\u2014": "-",
        "\u2026": "...",
        "\u2212": "-",
        "\u00a0": " ",
    }.items():
        text = text.replace(bad, good)
    for bad, good in OCR_CORRECTIONS.items():
        text = re.sub(rf"\b{re.escape(bad)}\b", good, text)
    regex_corrections = [
        (r"\bchara\s+cteristics\b", "characteristics"),
        (r"\bf\s+orm\b", "form"),
        (r"\bpr\s+ocessing\b", "processing"),
        (r"\bpr\s+o\b", "pro"),
        (r"\binstruct\s+ions\b", "instructions"),
        (r"\bassis\s+tance\b", "assistance"),
        (r"\bpre--processing\b", "pre-processing"),
        (r"\bUsingcancellation\b", "Using cancellation"),
        (r"\btouse\b", "to use"),
        (r"\bself-shieldingfor\b", "self-shielding for"),
        (r"\bLANcabling\b", "LAN cabling"),
        (r"\brel\s+iable\b", "reliable"),
        (r"\bArchiteecture\b", "Architecture"),
        (r"\btthe\b", "the"),
        (r"\bsmma?ll\b", "small"),
        (r"\bproneto\b", "prone to"),
        (r"\bbetweensignal\b", "between signal"),
        (r"\bOSI mode\b", "OSI model"),
        (r"\bapproximately(\d)", r"approximately \1"),
        (r"\):A\b", "): A"),
        (r"\binFigure\b", "in Figure"),
        (r"\bgeographicarea\b", "geographic area"),
        (r"\bnetworkingmethods\b", "networking methods"),
        (r"\bLAN andWAN\b", "LAN and WAN"),
        (r"\bmedia,including\b", "media, including"),
        (r"\.([A-Z])", r". \1"),
        (r",([A-Za-z])", r", \1"),
        (r"([a-z])([A-Z][a-z])", r"\1 \2"),
        (r"[ \t]{2,}", " "),
    ]
    for pattern, replacement in regex_corrections:
        text = re.sub(pattern, replacement, text)
    return text


def normalize_text(text: str) -> str:
    text = repair_text(text.replace("\r\n", "\n"))
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def clean_title(title: str) -> str:
    title = repair_text(title)
    title = re.sub(r"\bnotes\b", "", title, flags=re.I)
    title = re.sub(r"\s+", " ", title).strip(" :-")
    return title or "Core Unit"


def slugify(text: str) -> str:
    text = repair_text(text)
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return text[:70].strip("-") or "unit"


def candidate_score(full_text: str, start: int) -> int:
    window = full_text[start : start + 7000]
    subheads = len(re.findall(r"^###\s+", window, re.M))
    paragraphs = len([p for p in window.split("\n\n") if len(p.split()) > 20])
    nearby_units = len(re.findall(r"^##\s+Unit\s+\d{1,2}\b", window[:1800], re.I | re.M))
    return subheads * 20 + paragraphs * 2 - nearby_units * 8


def extract_units(text: str) -> list[Unit]:
    text = repair_text(text)
    matches = list(UNIT_RE.finditer(text))
    front_matter_has_toc = len([m for m in matches if m.start() < 2200]) >= 6
    selected: dict[int, re.Match[str]] = {}
    fallback: dict[int, re.Match[str]] = {}

    for match in matches:
        number = int(match.group(1))
        title = clean_title(match.group(2))
        if not title or title.lower() == "core unit":
            continue
        if front_matter_has_toc and match.start() < 2200:
            continue
        score = candidate_score(text, match.start())
        if number not in fallback or score > candidate_score(text, fallback[number].start()):
            fallback[number] = match
        if score >= 12 and number not in selected:
            selected[number] = match

    for number, match in fallback.items():
        selected.setdefault(number, match)

    ordered = sorted(selected.items())
    units: list[Unit] = []
    for index, (number, match) in enumerate(ordered):
        start = match.start()
        end = ordered[index + 1][1].start() if index + 1 < len(ordered) else len(text)
        segment = normalize_text(text[start:end])
        if len(segment.split()) >= 120:
            units.append(Unit(number, clean_title(match.group(2)), start, end, segment))
    return units


def remove_exam_noise(text: str) -> str:
    lines: list[str] = []
    skip = False
    for line in text.splitlines():
        stripped = line.strip()
        heading = re.match(r"^#{2,3}\s+(.+)$", stripped)
        if heading and STOP_SECTION_RE.match(heading.group(1).strip(" :")):
            skip = True
            continue
        if skip and heading:
            label = heading.group(1).strip(" :")
            skip = bool(STOP_SECTION_RE.match(label))
            if skip:
                continue
        if skip:
            continue
        if NOISE_LINE_RE.search(stripped):
            continue
        if re.match(r"^##\s+(?:[A-D]\.|[0-9]+\.)\s*", stripped):
            continue
        lines.append(line)
    return normalize_text("\n".join(lines))


def split_sentences(text: str) -> list[str]:
    flat = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)
    flat = re.sub(r"\s+", " ", flat).strip()
    return [s.strip() for s in SENTENCE_RE.split(flat) if 10 <= len(s.split()) <= 45]


def first_good_paragraphs(text: str, limit_words: int = 420) -> str:
    words = 0
    chosen: list[str] = []
    for para in text.split("\n\n"):
        clean = re.sub(r"^#{2,3}\s+", "", para.strip())
        if len(clean.split()) < 18:
            continue
        if STOP_SECTION_RE.match(clean.strip(" :")):
            continue
        chosen.append(clean)
        words += len(clean.split())
        if words >= limit_words:
            break
    return "\n\n".join(chosen)


def extract_subtopics(text: str) -> list[str]:
    subtopics: list[str] = []
    for match in HEADING_RE.finditer(text):
        title = clean_title(match.group(1))
        if STOP_SECTION_RE.match(title.strip(" :")):
            continue
        if NOISE_LINE_RE.search(title):
            continue
        if re.match(r"^(?:[A-D]\.|[0-9]+\.?\s*[A-D]?$)", title):
            continue
        if re.search(r"\b(?:Figure|Table)\s+\d+\b", title, re.I):
            continue
        if title.endswith("."):
            continue
        if len(title.split()) > 14:
            continue
        if title not in subtopics:
            subtopics.append(title)
    return subtopics[:14]


def extract_high_value_points(text: str, limit: int = 16) -> list[str]:
    scored = []
    for index, sentence in enumerate(split_sentences(text)):
        score = 0
        if HIGH_VALUE_RE.search(sentence):
            score += 5
        if re.search(r"\b(first|second|third|finally|therefore|however|because|thus|hence)\b", sentence, re.I):
            score += 2
        if re.search(r"\b\d{4}\b|\bArticle\s+\d+|\b[A-Z]{2,}\b", sentence):
            score += 1
        score += max(0, 4 - index // 20)
        if score:
            scored.append((score, index, sentence))
    scored.sort(key=lambda item: (-item[0], item[1]))

    chosen: list[str] = []
    seen: set[str] = set()
    for _, _, sentence in scored:
        key = re.sub(r"\W+", " ", sentence.lower())[:90]
        if key in seen:
            continue
        seen.add(key)
        chosen.append(sentence)
        if len(chosen) >= limit:
            break
    return chosen


def make_concept_map(subtopics: list[str]) -> str:
    if not subtopics:
        return "Start with the main definition, then connect causes, features, functions, limits, and current relevance."
    return "Read this unit as a chain: " + " -> ".join(subtopics[:8]) + "."


def make_exam_questions(unit: Unit, subtopics: list[str]) -> list[str]:
    questions = [
        f"Explain {unit.title} and show why it matters.",
        f"Discuss the main features of {unit.title}.",
        f"Critically examine the role and limitations of {unit.title}.",
    ]
    for topic in subtopics[:5]:
        if topic.lower() != unit.title.lower():
            questions.append(f"Write a short note on {topic}.")
    return questions[:8]


def subject_interlink(subject_slug: str, unit_title: str) -> str:
    title = unit_title.lower()
    links: list[str] = []
    if subject_slug != "political-theory":
        links.append("Political Theory gives the value lens: liberty, equality, justice, rights, power, and legitimacy.")
    if subject_slug != "fundamentals-of-research":
        links.append("Research methods help test claims about this topic with evidence instead of opinion.")
    if subject_slug != "political-institutions-in-india":
        links.append("Political Institutions show how ideas become law, offices, procedures, and accountability.")
    if subject_slug != "international-relations":
        links.append("International Relations shows how this topic changes when states, markets, and global institutions enter.")
    if subject_slug != "fundamentals-of-information-technology" and re.search(r"data|digital|network|security|technology|database|communication", title):
        links.append("Information Technology explains the data systems behind this topic.")
    return "\n".join(f"- {link}" for link in links[:4])


def render_unit(subject_slug: str, subject_core: str, unit: Unit, prev_unit: Unit | None, next_unit: Unit | None) -> str:
    clean = remove_exam_noise(unit.text)
    subtopics = extract_subtopics(clean)
    core = first_good_paragraphs(clean)
    points = extract_high_value_points(clean)
    previous_line = f"Previous unit: Unit {prev_unit.number}, {prev_unit.title}" if prev_unit else "Previous unit: none, this starts the subject."
    next_line = f"Next unit: Unit {next_unit.number}, {next_unit.title}" if next_unit else "Next unit: none, this closes the subject."

    parts = [
        f"# Unit {unit.number:02d} - {unit.title}",
        "",
        "## Why This Unit Matters",
        "",
        f"This unit contributes to the subject's core aim: {subject_core} If you understand this unit, you can explain one important part of that larger aim.",
        "",
        "## Start, Cycle, Next",
        "",
        f"- {previous_line}",
        f"- This unit: {unit.title}",
        f"- {next_line}",
        "",
        "## Concept Map",
        "",
        make_concept_map(subtopics),
        "",
        "## Subtopics To Master",
        "",
        *(f"- {topic}" for topic in subtopics[:12]),
        "",
        "## Core Theory",
        "",
        core or "Read this unit through its definition, features, process, and limits. Connect each subtopic to the subject's main problem.",
        "",
        "## High-Value Exam Points",
        "",
        *(f"- {point}" for point in points),
        "",
        "## Interlinking",
        "",
        subject_interlink(subject_slug, unit.title),
        "",
        "## How To Write This In Exam",
        "",
        "Use this structure: define the topic, explain its background, present 4-6 major points, add one criticism or limitation, connect it to the larger subject, then end with a balanced conclusion.",
        "",
        "## Likely Exam Questions",
        "",
        *(f"{index}. {question}" for index, question in enumerate(make_exam_questions(unit, subtopics), 1)),
        "",
        "## One-Minute Revision",
        "",
        f"Say this aloud: Unit {unit.number}, {unit.title}, is about how this part of the subject works, why it matters, what concepts support it, and what limitations or future issues it creates.",
        "",
    ]
    return repair_text("\n".join(parts))


def render_subject_readme(title: str, core: str, units: list[Unit]) -> str:
    lines = [
        f"# {title} - Exam Ready Notes",
        "",
        core,
        "",
        "## How To Study",
        "",
        "Read one unit file at a time. After reading, answer the likely exam questions without looking. Use the original `.clean.md` only when you need more detail.",
        "",
        "## Unit Files",
        "",
    ]
    for unit in units:
        filename = f"unit-{unit.number:02d}-{slugify(unit.title)}.md"
        lines.append(f"- [Unit {unit.number:02d} - {unit.title}]({filename})")
    lines.append("")
    return repair_text("\n".join(lines))


def build(input_dir: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    master = [
        "# Exam Ready Notes",
        "",
        "These notes are generated from the cleaned PDF Markdown files. They are designed as your main study material when you do not want to read the full PDFs.",
        "",
        "## Subjects",
        "",
    ]

    for subject_key, folder_name, title, source_name, core in SUBJECTS:
        source = input_dir / source_name
        if not source.exists():
            raise SystemExit(f"Missing source: {source}")
        units = extract_units(source.read_text(encoding="utf-8", errors="replace"))
        if not units:
            raise SystemExit(f"No units found in {source}")

        subject_dir = output_dir / folder_name
        if subject_dir.exists():
            shutil.rmtree(subject_dir)
        subject_dir.mkdir(parents=True, exist_ok=True)
        (subject_dir / "README.md").write_text(render_subject_readme(title, core, units), encoding="utf-8", newline="\n")

        for index, unit in enumerate(units):
            prev_unit = units[index - 1] if index else None
            next_unit = units[index + 1] if index + 1 < len(units) else None
            filename = f"unit-{unit.number:02d}-{slugify(unit.title)}.md"
            (subject_dir / filename).write_text(
                render_unit(subject_key, core, unit, prev_unit, next_unit),
                encoding="utf-8",
                newline="\n",
            )
        master.append(f"- [{title}]({folder_name}/README.md), {len(units)} unit files")

    master.append("")
    (output_dir / "README.md").write_text(repair_text("\n".join(master)), encoding="utf-8", newline="\n")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build unit-level exam notes from converted PDF Markdown.")
    parser.add_argument("--input", default="work/pdf-md", help="Folder containing *.clean.md files.")
    parser.add_argument("--output", default="work/pdf-md/exam-ready-notes", help="Output notes folder.")
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    build(Path(args.input), Path(args.output))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
