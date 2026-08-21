#!/usr/bin/env python3
"""Convert text-selectable PDFs in a folder to compact Markdown and RAG chunks."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import shutil
import subprocess
import sys
import unicodedata
from collections import Counter, deque
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

try:
    import fitz  # PyMuPDF
except ImportError as exc:  # pragma: no cover - exercised only on missing dependency
    raise SystemExit(
        "PyMuPDF is required. Install with: python -m pip install pymupdf"
    ) from exc


PAGE_NUMBER_RE = re.compile(
    r"^(?:page\s*)?(?:[-–—]?\s*)?(?:\d{1,5}|[ivxlcdm]{1,12})(?:\s*[-–—])?$",
    re.IGNORECASE,
)
SECTION_HEADING_RE = re.compile(
    r"^(?:(?:unit|chapter|module|lesson|part)\s+\d+|[A-Z]?\d+(?:\.\d+){1,4})\b",
    re.IGNORECASE,
)
LIST_RE = re.compile(r"^(?:[•*·-]|\d{1,3}[.)]|[a-zA-Z][.)])\s+")
TOC_DOTS_RE = re.compile(r"\s*\.{3,}\s*")
MULTISPACE_RE = re.compile(r"[ \t]+")
WORD_RE = re.compile(r"\S+")
IMAGE_PLACEHOLDER_RE = re.compile(
    r"^(?:image|photo|figure|fig\.|illustration|diagram)\s*\d*[.: -]*$",
    re.IGNORECASE,
)
DEFAULT_BOILERPLATE_RE = re.compile(
    r"\b(?:lovely professional university|edited by|copyright|all rights reserved)\b",
    re.IGNORECASE,
)
KNOWN_SECTION_HEADINGS = {
    "abstract",
    "answer for self assessment",
    "answers",
    "bibliography",
    "contents",
    "exercise",
    "further readings",
    "glossary",
    "introduction",
    "keywords",
    "keywords/glossary",
    "learning objectives",
    "objectives",
    "questions",
    "references",
    "self assessment",
    "summary",
}


@dataclass(frozen=True)
class PageExtract:
    number: int
    raw_text: str
    lines: list[str]


@dataclass(frozen=True)
class CleanBlock:
    text: str
    page: int
    kind: str
    level: int = 0


def normalize_line(line: str) -> str:
    line = unicodedata.normalize("NFKC", line)
    line = line.replace("\u00a0", " ").replace("\ufeff", "")
    line = MULTISPACE_RE.sub(" ", line)
    return line.strip()


def display_title(stem: str) -> str:
    clean = re.sub(r"[_\-]+", " ", stem).strip()
    clean = re.sub(r"\s+", " ", clean)
    return clean.title() if clean.isupper() else clean


def slugify(path: Path, used: set[str]) -> str:
    base = unicodedata.normalize("NFKD", path.stem)
    base = base.encode("ascii", "ignore").decode("ascii")
    base = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    if not base:
        base = "document"
    slug = base
    if slug in used:
        digest = hashlib.sha1(str(path).encode("utf-8")).hexdigest()[:8]
        slug = f"{base}-{digest}"
    used.add(slug)
    return slug


def line_fingerprint(line: str, *, loosen_numbers: bool = False) -> str:
    text = normalize_line(line).lower()
    if loosen_numbers:
        text = re.sub(r"\d+", "#", text)
    text = re.sub(r"[^\w#]+", " ", text, flags=re.UNICODE)
    return re.sub(r"\s+", " ", text).strip()


def extract_pages(pdf_path: Path) -> tuple[list[PageExtract], dict[str, object]]:
    doc = fitz.open(pdf_path)
    metadata = {k: v for k, v in doc.metadata.items() if v}
    pages: list[PageExtract] = []

    for index, page in enumerate(doc, start=1):
        raw_text = page.get_text("text", sort=True) or ""
        lines = [normalize_line(line) for line in raw_text.splitlines()]
        lines = [line for line in lines if line]
        pages.append(PageExtract(number=index, raw_text=raw_text, lines=lines))

    return pages, metadata


def repeated_line_sets(pages: list[PageExtract]) -> tuple[set[str], set[str], dict[str, int]]:
    text_pages = [page for page in pages if page.lines]
    page_count = max(1, len(text_pages))
    edge_threshold = max(3, math.ceil(page_count * 0.12))
    any_threshold = max(5, math.ceil(page_count * 0.22))

    edge_counts: Counter[str] = Counter()
    all_counts: Counter[str] = Counter()

    for page in text_pages:
        edge_lines = page.lines[:4] + page.lines[-4:]
        edge_counts.update(
            {
                line_fingerprint(line, loosen_numbers=True)
                for line in edge_lines
                if 2 <= len(line) <= 180
            }
        )
        all_counts.update(
            {
                line_fingerprint(line)
                for line in page.lines
                if 4 <= len(line) <= 140
            }
        )

    edge_repeats = {
        key for key, count in edge_counts.items() if key and count >= edge_threshold
    }
    any_repeats = {
        key for key, count in all_counts.items() if key and count >= any_threshold
    }
    repeated_counts = {
        key: count for key, count in (edge_counts | all_counts).items() if key in edge_repeats or key in any_repeats
    }
    return edge_repeats, any_repeats, repeated_counts


def is_page_number(line: str) -> bool:
    return bool(PAGE_NUMBER_RE.match(line))


def is_noise_line(line: str) -> bool:
    if len(line) <= 1:
        return True
    if is_page_number(line):
        return True
    if IMAGE_PLACEHOLDER_RE.match(line):
        return True
    if not re.search(r"[\w]", line, flags=re.UNICODE):
        return True
    return False


def is_global_toc_page(lines: list[str]) -> bool:
    lowered = [line.lower().strip(" :") for line in lines[:60]]
    has_contents = "content" in lowered or "contents" in lowered
    unit_refs = sum(
        1
        for line in lines[:80]
        if re.match(r"^(?:unit|chapter|module|lesson)\s+\d+[:.\s].*\s\d{1,4}$", line, re.IGNORECASE)
    )
    return has_contents and unit_refs >= 5


def tidy_toc_line(line: str) -> str:
    return TOC_DOTS_RE.sub(" ", line).strip()


def heading_level(line: str) -> int:
    stripped = line.strip(" :")
    lowered = stripped.lower()
    words = stripped.split()

    if lowered in KNOWN_SECTION_HEADINGS:
        return 3
    if re.match(r"^(?:unit|chapter|module|lesson|part)\s+\d+\b", stripped, re.IGNORECASE):
        return 2
    if SECTION_HEADING_RE.match(stripped):
        return 3
    if 1 <= len(words) <= 9 and stripped.isupper() and any(ch.isalpha() for ch in stripped):
        return 2
    return 0


def flush_paragraph(buffer: list[str], page: int, blocks: list[CleanBlock]) -> None:
    if not buffer:
        return

    paragraph = buffer[0]
    for line in buffer[1:]:
        if paragraph.endswith("-") and line[:1].islower():
            paragraph = paragraph[:-1] + line
        else:
            paragraph += " " + line

    paragraph = re.sub(r"\s+", " ", paragraph).strip()
    if paragraph:
        blocks.append(CleanBlock(text=paragraph, page=page, kind="paragraph"))
    buffer.clear()


def clean_pages(pages: list[PageExtract]) -> tuple[list[CleanBlock], dict[str, object]]:
    edge_repeats, any_repeats, repeated_counts = repeated_line_sets(pages)
    recent_pages: deque[set[str]] = deque(maxlen=8)
    blocks: list[CleanBlock] = []
    removed: Counter[str] = Counter()
    empty_pages: list[int] = []
    thin_pages: list[int] = []
    no_text_pages: list[int] = []
    dropped_toc_pages: list[int] = []

    for page in pages:
        if not page.raw_text.strip():
            no_text_pages.append(page.number)
        if not page.lines:
            empty_pages.append(page.number)
            recent_pages.append(set())
            continue
        if is_global_toc_page(page.lines):
            dropped_toc_pages.append(page.number)
            removed["global_toc_page"] += len(page.lines)
            recent_pages.append(set())
            continue

        page_fingerprints: set[str] = set()
        paragraph: list[str] = []
        kept_words = 0
        in_local_toc = False

        for raw_line in page.lines:
            line = tidy_toc_line(raw_line)
            exact_fp = line_fingerprint(line)
            loose_fp = line_fingerprint(line, loosen_numbers=True)

            if line.lower().strip(" :") in {"content", "contents"}:
                flush_paragraph(paragraph, page.number, blocks)
                in_local_toc = True
                removed["local_contents_block"] += 1
                continue
            if in_local_toc:
                if raw_line.rstrip().endswith(":") and line.lower().strip(" :") in {
                    "objectives",
                    "introduction",
                }:
                    in_local_toc = False
                else:
                    removed["local_contents_block"] += 1
                    continue

            if is_noise_line(line):
                removed["noise_or_page_number"] += 1
                continue
            if DEFAULT_BOILERPLATE_RE.search(line) and len(line) <= 180:
                removed["publisher_or_editor_boilerplate"] += 1
                continue
            if loose_fp in edge_repeats:
                removed["repeated_header_footer"] += 1
                continue
            if exact_fp in any_repeats:
                removed["repeated_boilerplate"] += 1
                continue
            if len(line) <= 160 and any(exact_fp in seen for seen in recent_pages):
                removed["near_duplicate_line"] += 1
                continue

            page_fingerprints.add(exact_fp)
            kept_words += len(WORD_RE.findall(line))
            level = heading_level(line)

            if level:
                flush_paragraph(paragraph, page.number, blocks)
                heading = re.sub(r"\s+", " ", line).strip(" :")
                blocks.append(CleanBlock(text=heading, page=page.number, kind="heading", level=level))
                continue

            if LIST_RE.match(line):
                flush_paragraph(paragraph, page.number, blocks)
                bullet = re.sub(r"^[•*·-]\s+", "- ", line)
                blocks.append(CleanBlock(text=bullet, page=page.number, kind="list"))
                continue

            paragraph.append(line)

        flush_paragraph(paragraph, page.number, blocks)
        if kept_words < 20:
            thin_pages.append(page.number)
        recent_pages.append(page_fingerprints)

    cleanup_report = {
        "removed_line_counts": dict(removed),
        "repeated_line_samples": sorted(
            repeated_counts.items(), key=lambda item: (-item[1], item[0])
        )[:30],
        "empty_pages": empty_pages,
        "thin_pages": thin_pages,
        "no_text_pages": no_text_pages,
        "dropped_toc_pages": dropped_toc_pages,
    }
    return blocks, cleanup_report


def blocks_to_markdown(title: str, blocks: list[CleanBlock]) -> str:
    out = [f"# {title}", ""]

    previous_kind = "heading"
    for block in blocks:
        if block.kind == "heading":
            text = block.text.lstrip("#").strip()
            out.extend(["", f"{'#' * block.level} {text}", ""])
        elif block.kind == "list":
            if previous_kind not in {"list", "heading"}:
                out.append("")
            out.append(block.text)
        else:
            out.extend(["", block.text, ""])
        previous_kind = block.kind

    markdown = "\n".join(out)
    markdown = re.sub(r"\n{3,}", "\n\n", markdown).strip() + "\n"
    return markdown


def word_count(text: str) -> int:
    return len(WORD_RE.findall(text))


def estimate_tokens(text: str) -> int:
    # Rough English-heavy estimate. Reports trend, not billing precision.
    return max(1, math.ceil(len(text) / 4))


def make_chunks(
    pdf_path: Path,
    slug: str,
    title: str,
    blocks: list[CleanBlock],
    *,
    target_words: int,
) -> list[dict[str, object]]:
    chunks: list[dict[str, object]] = []
    current_lines: list[str] = []
    current_pages: list[int] = []
    current_words = 0
    section = title

    def flush() -> None:
        nonlocal current_lines, current_pages, current_words
        text = "\n".join(current_lines).strip()
        if not text:
            return
        chunks.append(
            {
                "chunk_id": f"{slug}-{len(chunks) + 1:04d}",
                "source_pdf": pdf_path.name,
                "title": title,
                "section": section,
                "pages": [min(current_pages), max(current_pages)] if current_pages else [],
                "word_count": current_words,
                "text": text,
            }
        )
        current_lines = []
        current_pages = []
        current_words = 0

    for block in blocks:
        if block.kind == "heading":
            heading_text = block.text.lstrip("#").strip()
            if block.level <= 3:
                section = heading_text
            if current_words >= max(200, target_words // 2):
                flush()
            line = f"{'#' * block.level} {heading_text}"
        else:
            line = block.text

        line_words = word_count(line)
        if current_words and current_words + line_words > target_words * 1.2:
            flush()

        current_lines.append(line)
        current_pages.append(block.page)
        current_words += line_words

        if current_words >= target_words and block.kind != "heading":
            flush()

    flush()
    return chunks


def write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: Iterable[dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def compare_pdftotext(pdf_path: Path, max_chars: int = 2000) -> dict[str, object]:
    exe = shutil.which("pdftotext")
    if not exe:
        return {"available": False}

    try:
        proc = subprocess.run(
            [exe, "-layout", str(pdf_path), "-"],
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=60,
        )
    except Exception as exc:  # pragma: no cover - depends on local binary behavior
        return {"available": True, "error": str(exc)}

    return {
        "available": True,
        "returncode": proc.returncode,
        "sample_chars": len(proc.stdout[:max_chars]),
        "stderr": proc.stderr.strip()[:1000],
    }


def process_pdf(
    pdf_path: Path,
    output_dir: Path,
    slug: str,
    *,
    mode: str,
    target_words: int,
    debug_pdftotext: bool,
) -> dict[str, object]:
    pages, metadata = extract_pages(pdf_path)
    blocks, cleanup = clean_pages(pages)
    title = metadata.get("title") or display_title(pdf_path.stem)
    markdown = blocks_to_markdown(str(title), blocks)
    chunks = make_chunks(pdf_path, slug, str(title), blocks, target_words=target_words) if mode == "rag" else []

    raw_text = "\n".join(page.raw_text for page in pages)
    report: dict[str, object] = {
        "source_pdf": str(pdf_path),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "pages": len(pages),
        "text_pages": sum(1 for page in pages if page.raw_text.strip()),
        "raw_chars": len(raw_text),
        "clean_chars": len(markdown),
        "raw_token_estimate": estimate_tokens(raw_text),
        "clean_token_estimate": estimate_tokens(markdown),
        "token_reduction_percent": round(
            100 - (estimate_tokens(markdown) / max(1, estimate_tokens(raw_text)) * 100), 2
        ),
        "chunk_count": len(chunks),
        "metadata": metadata,
        **cleanup,
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    clean_path = output_dir / f"{slug}.clean.md"
    report_path = output_dir / f"{slug}.report.json"
    chunk_path = output_dir / f"{slug}.chunks.jsonl"

    clean_path.write_text(markdown, encoding="utf-8", newline="\n")
    if mode == "rag":
        write_jsonl(chunk_path, chunks)
    write_json(report_path, report)

    if debug_pdftotext:
        report["pdftotext_debug"] = compare_pdftotext(pdf_path)
        write_json(report_path, report)

    return {
        "source_pdf": str(pdf_path),
        "clean_md": str(clean_path),
        "chunks": str(chunk_path) if mode == "rag" else None,
        "report": str(report_path),
        "pages": len(pages),
        "text_pages": report["text_pages"],
        "raw_token_estimate": report["raw_token_estimate"],
        "clean_token_estimate": report["clean_token_estimate"],
        "token_reduction_percent": report["token_reduction_percent"],
        "warnings": {
            "no_text_pages": cleanup["no_text_pages"],
            "thin_pages": cleanup["thin_pages"][:20],
        },
    }


def find_pdfs(input_path: Path) -> list[Path]:
    if input_path.is_file() and input_path.suffix.lower() == ".pdf":
        return [input_path]
    if not input_path.exists():
        raise SystemExit(f"Input path does not exist: {input_path}")
    return sorted(path for path in input_path.rglob("*.pdf") if path.is_file())


def write_index(output_dir: Path, results: list[dict[str, object]]) -> None:
    lines = ["# PDF Markdown Index", ""]
    for item in results:
        clean_name = Path(str(item["clean_md"])).name
        report_name = Path(str(item["report"])).name
        lines.append(
            f"- [{Path(str(item['source_pdf'])).name}]({clean_name}) "
            f"({item['pages']} pages, {item['token_reduction_percent']}% token reduction, "
            f"[report]({report_name}))"
        )
    lines.append("")
    (output_dir / "_index.md").write_text("\n".join(lines), encoding="utf-8", newline="\n")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert already text-selectable PDFs into compact Markdown and RAG chunks."
    )
    parser.add_argument("--input", required=True, help="PDF file or folder containing PDFs.")
    parser.add_argument("--output", default="work/pdf-md", help="Output folder.")
    parser.add_argument("--mode", choices=["rag", "clean"], default="rag", help="Output mode.")
    parser.add_argument("--chunk-words", type=int, default=850, help="Target words per RAG chunk.")
    parser.add_argument("--dry-run", action="store_true", help="List PDFs and text-layer stats without writing output.")
    parser.add_argument(
        "--debug-pdftotext",
        action="store_true",
        help="Record Poppler pdftotext availability/result in each report.",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    input_path = Path(args.input).expanduser().resolve()
    output_dir = Path(args.output).expanduser().resolve()
    pdfs = find_pdfs(input_path)

    if not pdfs:
        print(f"No PDFs found under: {input_path}", file=sys.stderr)
        return 1

    if args.dry_run:
        for pdf in pdfs:
            pages, _ = extract_pages(pdf)
            raw_chars = sum(len(page.raw_text) for page in pages)
            text_pages = sum(1 for page in pages if page.raw_text.strip())
            print(f"{pdf}\tpages={len(pages)}\ttext_pages={text_pages}\traw_chars={raw_chars}")
        return 0

    used_slugs: set[str] = set()
    results: list[dict[str, object]] = []
    for pdf in pdfs:
        slug = slugify(pdf, used_slugs)
        result = process_pdf(
            pdf,
            output_dir,
            slug,
            mode=args.mode,
            target_words=args.chunk_words,
            debug_pdftotext=args.debug_pdftotext,
        )
        results.append(result)
        print(
            f"converted {pdf} -> {Path(str(result['clean_md'])).name} "
            f"({result['token_reduction_percent']}% token reduction)"
        )

    write_index(output_dir, results)
    write_json(output_dir / "_summary.report.json", results)
    print(f"wrote index: {output_dir / '_index.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
