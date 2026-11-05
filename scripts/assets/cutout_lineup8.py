"""Split the 8-tee lineup (4x2 grid) and remove the background.

The black tees sit on a near-black backdrop, so the image is brightened (gamma) before
segmentation; the mask is then applied to the ORIGINAL pixels. Post-process: keep the
largest component (drops neighbouring sleeves), close small gaps, fill interior holes.

Usage: python cutout_lineup8.py <lineup.webp> <out_dir> [model]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove
from scipy import ndimage as nd
from scipy.spatial import ConvexHull
from PIL import ImageDraw

# base fabric colour per tee: used to drop overlapping neighbour sleeves near the seams
FABRIC = ["dark", "white", "dark", "red", "white", "dark", "dark", "white"]
SEAM = 64  # px either side of a cell boundary where neighbours can overlap

def fabric_class(rgb):
    """per-pixel fabric class from a blurred image: 0 dark, 1 white, 2 red"""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lum = (r + g + b) / 3
    cls = np.zeros(lum.shape, np.uint8)
    cls[lum > 135] = 1
    cls[(r - g > 38) & (lum <= 135)] = 2
    return cls

NAMES = ["villain-era", "doomsday", "lucifer", "heaven-falls", "born-to-sin", "paradise-lost", "the-end-is-near", "no-saints-left"]
src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "birefnet-general-lite"
im = Image.open(src).convert("RGB")
W, H = im.size
session = new_session(model)
cw, ch = W / 4, H / 2

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r

for i, name in enumerate(NAMES):
    c, r = i % 4, i // 4
    PAD = 48
    box = (max(0, int(c * cw) - PAD), int(r * ch), min(W, int((c + 1) * cw) + PAD), int((r + 1) * ch))
    cell = im.crop(box)
    arr = np.asarray(cell).astype(float) / 255
    boosted = Image.fromarray((np.power(arr, 0.45) * 255).astype("uint8"))
    boosted = ImageOps.autocontrast(boosted, cutoff=1)
    m = np.asarray(remove(boosted, session=session, only_mask=True)).astype(float) / 255
    hard = m > 0.5
    # neighbour removal near seams
    blur = np.asarray(cell.filter(ImageFilter.GaussianBlur(6))).astype(int)
    cls = fabric_class(blur)
    own = {"dark": 0, "white": 1, "red": 2}[FABRIC[i]]
    gx = np.arange(box[0], box[2])
    for bnd, nb in ((int(c * cw), i - 1 if c > 0 else None), (int((c + 1) * cw), i + 1 if c < 3 else None)):
        if nb is None:
            continue
        zone = np.abs(gx - bnd) <= SEAM
        if FABRIC[nb] == FABRIC[i]:
            # same colour: split at the boundary itself
            outside = (gx < bnd) if bnd == int(c * cw) else (gx > bnd)
            hard[:, outside] = False
        else:
            lum = blur.mean(axis=2)
            ownside = ((gx >= int(c * cw)) & (gx <= int((c + 1) * cw)))[None, :]
            if own == 1:
                bad = cls != 1  # white tee: any non-white near a seam is the neighbour
            elif own == 0 and FABRIC[nb] == "white":
                bad = lum > 88  # shadowed white sleeves still read brighter than black cotton
            elif own == 0 and FABRIC[nb] == "red":
                bad = (blur[..., 0] - blur[..., 1]) > 14  # dark-red shadows of the red tee
            else:  # red tee next to dark: only drop dark beyond its own cell
                bad = (cls == 0) & ~ownside
            bad = bad & zone[None, :]
            hard &= ~bad
    hard = nd.binary_opening(hard, structure=disk(2))
    lab, n = nd.label(hard)
    if n:
        sizes = nd.sum(hard, lab, range(1, n + 1))
        hard = lab == (np.argmax(sizes) + 1)
    hard = nd.binary_closing(np.pad(hard, 20), structure=disk(9))[20:-20, 20:-20]
    hard = nd.binary_fill_holes(hard)
    # lower body of a boxy tee is ~rectangular: fill bites out of the hem with its convex hull
    ys, xs = np.nonzero(hard)
    top, bot = ys.min(), ys.max()
    cut = int(top + (bot - top) * 0.64)
    sel = ys >= cut
    pts = np.stack([xs[sel], ys[sel]], 1)
    if len(pts) > 10:
        hull = ConvexHull(pts)
        poly = Image.new("L", (hard.shape[1], hard.shape[0]), 0)
        ImageDraw.Draw(poly).polygon([tuple(map(int, pts[v])) for v in hull.vertices], fill=255)
        hard = hard | (np.asarray(poly) > 0)
    alpha = Image.fromarray((hard * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
    rgba = cell.convert("RGBA")
    rgba.putalpha(alpha)
    rgba = rgba.crop(rgba.getbbox())
    rgba.save(f"{out}/{name}.png")
    print(name, rgba.size)

# Manual trims where three tees overlap in the source photo (local px of the saved cutout).
# The hidden parts of these garments simply aren't in the photo.
TRIMS = {
    "paradise-lost": [(0, 0, 40, None)],                   # (x0, y0, x1, y1) regions to clear
    "lucifer": [(392, 0, None, None), (340, 0.58, None, None)],
}
for name, regions in TRIMS.items():
    img = Image.open(f"{out}/{name}.png")
    a = np.asarray(img.split()[-1]).copy()
    h, w = a.shape
    for x0, y0, x1, y1 in regions:
        y0 = int(y0 * h) if isinstance(y0, float) else y0
        a[y0 : (y1 or h), x0 : (x1 or w)] = 0
    img.putalpha(Image.fromarray(a))
    img = img.crop(img.getbbox())
    img.save(f"{out}/{name}.png")
    print("trimmed", name, img.size)

# Doomsday (white) still carries a band of Villain Era's black sleeve along its left edge
img = Image.open(f"{out}/doomsday.png")
px = np.asarray(img).copy()
lum = px[..., :3].astype(int).mean(axis=2)
band = np.zeros(lum.shape, bool)
band[:, :30] = True  # outer edge only; the crest starts further in
px[..., 3] = np.where(band & (lum < 90), 0, px[..., 3])
a = nd.binary_opening(px[..., 3] > 128, structure=disk(2))
lab, n = nd.label(a)
if n:
    sizes = nd.sum(a, lab, range(1, n + 1))
    a = lab == (np.argmax(sizes) + 1)
px[..., 3] = np.where(a, px[..., 3], 0)
img = Image.fromarray(px)
img = img.crop(img.getbbox())
img.save(f"{out}/doomsday.png")
print("cleaned doomsday", img.size)
