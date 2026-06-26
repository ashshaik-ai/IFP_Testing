# Telugu PDF Brochure Pipeline

Reference for creating Islamic Front community brochures as copyable Telugu PDFs.
Claude Code: invoke `/brochure-telugu-pdf` for the full checklist.
Codex: follow the steps in this file directly.

---

## Source files (SIR 2026 brochure as template)

| File | Purpose |
|---|---|
| `sir-brochure-ap-2026.html` | 8-page A4 Telugu brochure |
| `sir-summary-ap-2026.html` | 2-page summary variant |
| `tests/overflow.js` | Puppeteer: verify no page overflows 1123px |
| `tests/sir-export.js` | Puppeteer: export 300-DPI PNG pages |
| `tests/extract-textpos.js` | Puppeteer: extract DOM word positions → JSON |
| `tests/make-copyable.py` | Build two-layer copyable PDF |
| `tests/verify-all.py` | 5-tool verification pipeline |
| `canva-export/` | PNG page exports (generated, gitignored) |
| `assets/if-logo-full.png` | Green logo on white — cover use only |
| `assets/if-emblem-trans.png` | Transparent emblem — watermark |
| `assets/fonts/NotoSansTelugu.ttf` | Telugu font (embedded, not system) |
| `assets/qr-voters.png` | QR → voters.eci.gov.in |
| `assets/qr-ceoap.png` | QR → ceoandhra.nic.in |
| `assets/founder/shaik-akram-2.jpg` | Founder photo (last page credit) |

---

## Design system

### Palette
```css
--green-deep: #0d3b1e
--green-mid:  #1a5c30
--green-light: #2e8b57
--gold:        #c8922a
--gold-light:  #e8b84b
--gold-pale:   #f5e6c0
--cream:       #faf6ee
--ink:         #1a1208
--ink-mid:     #3d3018
--muted:       #6f5f3e
--line:        rgba(200,146,42,0.28)
```

### Page structure
Every page except cover uses 3-zone flex column:
```html
<section class="page">
  <div class="wm"></div>          <!-- watermark (absolute, z:0) -->
  <div class="pbody">             <!-- grows + centers content -->
    ...content...
  </div>
  <div class="pfoot">             <!-- in-flow footer, never overlaps -->
    <span>Document title</span><span><b>ఇస్లామిక్ ఫ్రంట్</b> · పేజీ N</span>
  </div>
</section>
```

Cover: `class="page cover"` — no `.wm`, white background, own flex layout, no top green band (`.cover::before { display: none; }`). Cover-top padding is `5mm 15mm 11mm` so the logo is immediately visible when the PDF first opens.

### Top/bottom bands
```css
.page::before { height:7mm; background: linear-gradient(90deg,var(--green-deep),var(--green-mid) 60%,var(--gold)); }
.page::after  { height:4mm; background: linear-gradient(90deg,var(--gold),var(--gold-light)); }
```

### Watermark
```css
.wm { position:absolute; left:50%; top:50%; width:184mm; height:184mm;
      transform:translate(-50%,-50%);
      background:url('assets/if-emblem-trans.png') center/contain no-repeat;
      opacity:0.13; pointer-events:none; z-index:0; }
```
Cards on watermark pages: `background: rgba(255,255,255,0.72)`.

### Font
```css
@font-face {
  font-family: 'Noto Sans Telugu';
  font-weight: 100 900;
  src: url('assets/fonts/NotoSansTelugu.ttf') format('truetype');
}
body { font-family: 'Noto Sans Telugu', 'Nirmala UI', 'Gautami', sans-serif; }
```

---

## Translation standards

| English | Telugu (correct) | Common mistake |
|---|---|---|
| Special Intensive Revision | ప్రత్యేక సమగ్ర సవరణ | ~~ప్రత్యేక సాంద్ర సవరణ~~ |
| Claims & Objections | క్లెయింలు & అభ్యంతరాలు | ~~అభ్యంతరాలు & దరఖాస్తులు~~ (reversed) |
| Draft Roll | ముసాయిదా జాబితా | |
| Final Roll | తుది ఓటర్ల జాబితా | |
| Booth Level Officer | బూత్ స్థాయి అధికారి | |
| Enumeration Form | ఎన్యుమరేషన్ ఫారం | Standard AP transliteration |
| FAQ: Question / Answer | ప్ర / జ | Short for ప్రశ్న / జవాబు |

Factual accuracy: cite only ECI/CEO AP official sources. Never reference SC orders, NRC, or specific document requirements not in official ECI guidelines. Wrap all schedules in "తేదీలు మారవచ్చు" caveat.

---

## Build steps

### 1 — Check for overflow
```bash
node tests/overflow.js
# All pages must be ≤ 1123px. Fix HTML before exporting.
```

### 2 — Export pages at 300 DPI
```bash
node tests/sir-export.js
# Produces canva-export/brochure-p1..p8.png + summary-p1..p2.png
```

### 3 — Build HQ image PDF
```python
import fitz
from pathlib import Path

def build_hq(glob, out):
    doc = fitz.open()
    for p in sorted(Path("canva-export").glob(glob)):
        img = fitz.open(str(p))
        doc.insert_pdf(fitz.open("pdf", img.convert_to_pdf()))
    doc.save(out, deflate=True, garbage=4)
    print(f"{out}: {len(doc)}p {Path(out).stat().st_size/1e6:.1f}MB")

build_hq("brochure-p*.png", "SIR-2026-Telugu-IslamicFront-HQ.pdf")
build_hq("summary-p*.png",  "SIR-2026-Telugu-Summary-HQ.pdf")
```

### 4 — Extract DOM word positions
```bash
node tests/extract-textpos.js "../sir-brochure-ap-2026.html" "../_pos_brochure.json"
node tests/extract-textpos.js "../sir-summary-ap-2026.html"  "../_pos_summary.json"
# Output: pages:8 nodes:1213  (brochure) / pages:2 nodes:261  (summary)
```

### 5 — Build copyable PDF
```bash
python tests/make-copyable.py
# Must print: fitz_words_p1=86 (brochure) or fitz_words_p1=132 (summary)
# If fitz_words_p1=0 → coordinate mapping is wrong (see critical rule below)
```

### 6 — Verify
```bash
python tests/verify-all.py
# Must end with: ISSUES: 0
```

---

## CRITICAL coordinate mapping rule

**PNGs are at 300 DPI (deviceScaleFactor 3.125). PyMuPDF converts them assuming 96 DPI → pages are 1861 × 2631 pt, not A4.**

`PX2PT = 595.28 / 794.0` (A4) is **WRONG** for these PDFs.

Always read page dimensions from the PDF:

```python
# PyMuPDF
px2pt  = page.rect.width / 794.0     # page.rect.width ≈ 1861

# pikepdf
mb     = [float(x) for x in page['/MediaBox']]
page_w = mb[2] - mb[0]               # ≈ 1861
page_h = mb[3] - mb[1]               # ≈ 2631
px2pt  = page_w / 794.0
```

Symptom of wrong scale: `fitz_words_p1 = 0`. Text lands at ~32% of correct position — untappable on mobile.

---

## Copyable PDF — two-layer approach

`tests/make-copyable.py` builds the final PDF in two passes:

**Pass 1 — PyMuPDF:** Insert NotoSansTelugu glyphs at correct positions, `render_mode=3` (invisible). Shaped glyphs have correct advance widths → PDF viewers can hit-test them for long-press text selection on mobile.

**Pass 2 — pikepdf:** Wrap each word with `/Span << /ActualText <hex> >> BDC ... EMC`. ActualText is a UTF-16-BE hex string of the DOM-extracted word. PDF viewers use ActualText directly on copy → bypasses ToUnicode CMap → guaranteed correct Telugu Unicode, no doubled matras.

Also requires `pdf.Root['/MarkInfo'] = pikepdf.Dictionary(Marked=True)` for ActualText to be recognised.

---

## Mobile testing

- **Open in: Adobe Acrobat Mobile or Google Drive** — these process ActualText.
- **Do NOT test in WhatsApp's built-in PDF viewer** — it doesn't support text selection.
- Long-press on text → selection handles appear → drag → copy → paste in any app.

---

## ADB push

```bash
export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'
"C:/Users/User/AppData/Local/Android/platform-tools/adb.exe" push \
  "SIR-2026-Telugu-IslamicFront-Copyable.pdf" \
  "/sdcard/Download/SIR-2026-Telugu-IslamicFront.pdf"
```
ADB: `C:\Users\User\AppData\Local\Android\platform-tools\adb.exe` · CDP: 9223

---

## Deliverables

| File | Size | Use |
|---|---|---|
| `SIR-2026-Telugu-IslamicFront-Copyable.pdf` | ~6 MB | **Primary** — share this |
| `SIR-2026-Telugu-Summary-Copyable.pdf` | ~1 MB | **Summary** — 2-page WhatsApp version |
| `SIR-2026-Telugu-IslamicFront-HQ.pdf` | ~6 MB | Image only (no text layer) — archive |
| `canva-export/` | ~30 MB | PNG pages — archive |
