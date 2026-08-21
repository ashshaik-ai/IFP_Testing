"""
Copyable PDF — correctly-positioned Telugu glyphs + ActualText.

Root cause of all previous failures:
  PX2PT was hardcoded as 595.28/794 = 0.75 (A4 in points / viewport px).
  But HQ PDFs are 1861 pt wide (300-DPI PNGs converted by PyMuPDF at 96-DPI
  assumption = 3.125x A4). Every word landed at ~32% of its correct position.

Fix: read the actual PDF page width from the MediaBox and derive px2pt from it.
  px2pt = actual_page_width_pt / 794   (794 = viewport width used in DOM extract)

Strategy:
  Step 1 (PyMuPDF) — insert NotoSansTelugu glyphs at CORRECT positions,
    render_mode=3 (invisible). Glyphs have proper advance widths → mobile
    PDF viewers can hit-test them for long-press selection.
  Step 2 (pikepdf) — wrap each word with ActualText marked content so that
    paste always returns correct Unicode, bypassing ToUnicode CMap entirely.
"""
import json, fitz, pikepdf, re
from pathlib import Path

VIEWPORT_W = 794.0
HAS_TE = lambda s: any('ఀ' <= c <= '౿' for c in s)

# ── Step 1: PyMuPDF — place shaped Telugu glyphs at correct positions ──────

def insert_glyphs(json_path: str, img_path: str, tmp_path: str):
    words_data = json.load(open(json_path, encoding='utf-8'))
    doc = fitz.open(img_path)

    for i, words in enumerate(words_data):
        if i >= len(doc): break
        page = doc[i]
        page_w = page.rect.width          # actual PDF pt width (e.g. 1861 pt)
        px2pt  = page_w / VIEWPORT_W      # correct scale factor

        page.insert_font(fontname='NotoTe', fontfile='assets/fonts/NotoSansTelugu.ttf')

        for w in words:
            text = w['t'] + ' '
            x    = w['x'] * px2pt
            y    = (w['y'] + w['h'] * 0.82) * px2pt   # fitz: y from top
            fs   = max(4.0, w['h'] * 0.92 * px2pt)
            fn   = 'NotoTe' if HAS_TE(text) else 'helv'
            try:
                page.insert_text((x, y), text, fontname=fn, fontsize=fs, render_mode=3)
            except Exception:
                try:
                    page.insert_text((x, y), text, fontname='helv', fontsize=fs, render_mode=3)
                except Exception:
                    pass

    try:
        doc.subset_fonts()
    except Exception:
        pass
    doc.save(tmp_path, deflate=True, garbage=4)
    doc.close()

# ── Step 2: pikepdf — wrap words with ActualText for correct paste ──────────

def to_hex(text: str) -> str:
    return '<FEFF' + text.encode('utf-16-be').hex().upper() + '>'

def get_page_dims(page):
    if '/MediaBox' in page:
        mb = [float(x) for x in page['/MediaBox']]
        return mb[0], mb[1], mb[2] - mb[0], mb[3] - mb[1]
    return 0.0, 0.0, 595.28, 841.89

def add_actualtext(json_path: str, tmp_path: str, out_path: str):
    words_data = json.load(open(json_path, encoding='utf-8'))
    pdf = pikepdf.open(tmp_path)
    pdf.Root['/MarkInfo'] = pikepdf.Dictionary(Marked=True)

    for pi, words in enumerate(words_data):
        if pi >= len(pdf.pages): break
        page = pdf.pages[pi]
        ox, oy, page_w, page_h = get_page_dims(page)
        px2pt = page_w / VIEWPORT_W

        # Helvetica placeholder font (for ActualText spans; real glyphs are in step 1)
        if '/Resources' not in page:
            page['/Resources'] = pikepdf.Dictionary()
        res = page['/Resources']
        if '/Font' not in res:
            res['/Font'] = pikepdf.Dictionary()
        if '/HIF' not in res['/Font']:
            fd = pikepdf.Dictionary()
            fd['/Type']     = pikepdf.Name('/Font')
            fd['/Subtype']  = pikepdf.Name('/Type1')
            fd['/BaseFont'] = pikepdf.Name('/Helvetica')
            res['/Font']['/HIF'] = fd

        # Thin invisible ActualText spans — just mark content, no extra glyphs
        parts = ['q\n']
        for w in words:
            text     = w['t'] + ' '
            x        = ox + w['x'] * px2pt
            baseline = oy + page_h - (w['y'] + w['h'] * 0.82) * px2pt
            fs       = max(1.0, w['h'] * 0.92 * px2pt)
            parts.append(
                f'/Span << /ActualText {to_hex(text)} >> BDC\n'
                f'BT /HIF {fs:.2f} Tf 3 Tr '
                f'1 0 0 1 {x:.2f} {baseline:.2f} Tm () Tj ET\n'
                f'EMC\n'
            )
        parts.append('Q\n')
        overlay = ''.join(parts).encode('latin-1')

        try:
            existing = page['/Contents']
            if isinstance(existing, pikepdf.Array):
                base = b''.join(bytes(s.read_bytes()) for s in existing)
            else:
                base = bytes(existing.read_bytes())
            page['/Contents'] = pikepdf.Stream(pdf, base + b'\n' + overlay)
        except Exception:
            page['/Contents'] = pikepdf.Stream(pdf, overlay)

    pdf.save(out_path)

# ── Build both PDFs ──────────────────────────────────────────────────────────

def build(json_path, img_path, out_path):
    tmp = out_path.replace('.pdf', '_glyph_tmp.pdf')
    insert_glyphs(json_path, img_path, tmp)

    # Quick sanity: how many words does fitz find?
    doc = fitz.open(tmp)
    n_words = len(doc[0].get_text('words'))
    pg_w    = doc[0].rect.width
    doc.close()

    add_actualtext(json_path, tmp, out_path)
    Path(tmp).unlink(missing_ok=True)

    sz = Path(out_path).stat().st_size / 1e6
    print(f'{Path(out_path).name}: page={pg_w:.0f}pt  fitz_words_p1={n_words}  {sz:.1f}MB')

build('_pos_brochure.json',
      'SIR-2026-Telugu-IslamicFront-HQ.pdf',
      'SIR-2026-Telugu-IslamicFront-Copyable.pdf')

build('_pos_summary.json',
      'SIR-2026-Telugu-Summary-HQ.pdf',
      'SIR-2026-Telugu-Summary-Copyable.pdf')

build('_pos_brochure-en.json',
      'SIR-2026-English-IslamicFront-HQ.pdf',
      'SIR-2026-English-IslamicFront-Copyable.pdf')
