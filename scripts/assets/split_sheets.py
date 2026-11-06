"""Split product sheets into individual views.

Views sit side by side and may touch, so each sheet is cut at the column of least
garment coverage inside a window around each expected boundary, then the largest
component of each slice is kept.
Transparent sheets use their own alpha. Opaque sheets on black are segmented with
rembg (BiRefNet-lite) on a gamma-lifted copy first.

Usage: python split_sheets.py <out_dir> <sheet>:<slug>:<views comma list>[:<rembg model>] ...
Giving a model segments the sheet as-is (no gamma lift). Sheet 16 (shot over a red moon) needs
"isnet-general-use": the default lift makes the haze read as fabric.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage as nd

out = sys.argv[1]
session = None

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r

for spec in sys.argv[2:]:
    parts = spec.split(":")
    path, slug, views = parts[:3]
    model = parts[3] if len(parts) > 3 else None
    views = views.split(",")
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im)[..., 3]
    if (a == 0).mean() < 0.05:
        from rembg import new_session, remove
        rgb = im.convert("RGB")
        if model:
            m = np.asarray(remove(rgb, session=new_session(model), only_mask=True)) > 127
        else:
            if session is None:
                session = new_session("birefnet-general-lite")
            arr = np.asarray(rgb).astype(float) / 255
            boosted = ImageOps.autocontrast(Image.fromarray((np.power(arr, 0.45) * 255).astype("uint8")), cutoff=1)
            m = np.asarray(remove(boosted, session=session, only_mask=True)) > 127
        m = nd.binary_fill_holes(nd.binary_closing(nd.binary_opening(m, structure=disk(2)), structure=disk(4)))
        im = rgb.convert("RGBA")
        im.putalpha(Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.7)))
        a = np.asarray(im)[..., 3]
    W = a.shape[1]
    cov = (a > 24).sum(0)
    # 4-view sheets: front | back | side | folded label (side is narrow). 2-view: halves.
    guesses = [0.325, 0.6, 0.725] if len(views) == 4 else [i / len(views) for i in range(1, len(views))]
    cuts = [0]
    for g in guesses:
        c = int(g * W); w = int(0.06 * W)
        cuts.append(c - w + int(np.argmin(cov[c - w : c + w])))
    cuts.append(W)
    for v, x0, x1 in zip(views, cuts, cuts[1:]):
        sl = np.asarray(im)[:, x0:x1].copy()
        solid = sl[..., 3] > 24
        lab, n = nd.label(solid)
        if n == 0:
            continue
        sizes = nd.sum(solid, lab, range(1, n + 1))
        mask = lab == (np.argmax(sizes) + 1)
        mask = nd.binary_dilation(mask, iterations=2) & (sl[..., 3] > 0)
        sl[..., 3] = np.where(mask, sl[..., 3], 0)
        piece = Image.fromarray(sl)
        piece = piece.crop(piece.getbbox())
        piece.save(f"{out}/{slug}-{v}.png")
        print(slug, v, piece.size)


# Redline back: the hem ends ~y=785; a thin red streak from the black-background segmentation hangs below it.
import os
rb = f"{out}/redline-back.png"
if os.path.exists(rb):
    img = Image.open(rb); px = np.asarray(img).copy()
    cov = (px[..., 3] > 40).sum(1)
    hem = int(np.nonzero(cov > 0.5 * cov.max())[0].max())  # last row that is still mostly garment
    px[hem + 6 :, :, 3] = 0
    img = Image.fromarray(px); img = img.crop(img.getbbox()); img.save(rb)
    print("redline back trimmed below hem", hem, img.size)

