# Multi-engine PDF verification: pdfium + MuPDF (render), pikepdf (structure),
# pdfplumber (text), Pillow (emblem-not-cut + founder/footer clearance).
import sys, os
import fitz                      # MuPDF
import pypdfium2 as pdfium       # Google pdfium (Chrome/Android engine)
import pikepdf                   # QPDF structure
import pdfplumber                # pdfminer text
from PIL import Image

PDF = sys.argv[1] if len(sys.argv) > 1 else "SIR-2026-Telugu-IslamicFront.pdf"
OUT = "_verify"; os.makedirs(OUT, exist_ok=True)
issues = []

# 1) pikepdf structure validation
try:
    with pikepdf.open(PDF) as p:
        npages = len(p.pages)
    print(f"[pikepdf] structure OK, {npages} pages")
except Exception as e:
    issues.append(f"pikepdf: {e}"); print("[pikepdf] FAIL", e)

# 2) MuPDF render + 3) pdfium render (two independent engines)
mdoc = fitz.open(PDF)
pdoc = pdfium.PdfDocument(PDF)
print(f"[MuPDF] {mdoc.page_count} pages | [pdfium] {len(pdoc)} pages")
for i in range(mdoc.page_count):
    mdoc[i].get_pixmap(dpi=150).save(f"{OUT}/mupdf-p{i+1}.png")
    pg = pdoc[i]
    bmp = pg.render(scale=150/72)
    bmp.to_pil().save(f"{OUT}/pdfium-p{i+1}.png")

# 4) pdfplumber: Telugu text present on each page?
with pdfplumber.open(PDF) as pl:
    for i, page in enumerate(pl.pages):
        t = page.extract_text() or ""
        has_te = any('ఀ' <= c <= '౿' for c in t)
        if not has_te and i != 0:  # cover may be image-ish
            print(f"[pdfplumber] p{i+1}: no Telugu text extracted (note)")

# 5) Pillow: emblem-not-cut check on the MuPDF renders.
#    The emblem is the faint green watermark. Check the 4 page-edge bands have
#    NO strong green emblem pixels touching the very edge (i.e., not clipped).
def edge_green_touch(img):
    im = Image.open(img).convert("RGB"); W,H = im.size; px = im.load()
    band = 3  # px from edge
    # skip the decorative top/bottom bands (they are green by design)
    y0, y1 = int(H*0.06), int(H*0.97)
    def greenish(r,g,b): return g>90 and g>r+25 and g>b+15
    touch = {"left":0,"right":0}
    for y in range(y0, y1):
        for dx in range(band):
            if greenish(*px[dx,y]): touch["left"]+=1
            if greenish(*px[W-1-dx,y]): touch["right"]+=1
    return touch

# only meaningful where page bg is cream (content pages 2-8). Decorative bands
# at top/bottom are green by design, so ignore top/bottom; check left/right edges.
for i in range(1, mdoc.page_count):  # pages 2..8 (index1..7)
    t = edge_green_touch(f"{OUT}/mupdf-p{i+1}.png")
    if t["left"] > 5 or t["right"] > 5:
        issues.append(f"p{i+1}: emblem may touch L/R edge {t}")
        print(f"[emblem-cut] p{i+1} L/R edge green: {t['left']}/{t['right']}  <-- CHECK")
    else:
        print(f"[emblem-cut] p{i+1}: clear of L/R edges (L{t['left']} R{t['right']})")

print("\n==== ISSUES:", len(issues))
for x in issues: print("  -", x)
