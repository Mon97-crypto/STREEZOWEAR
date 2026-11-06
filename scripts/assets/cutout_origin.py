"""Origin Collection: cut front/back/side views from the 5x3 grid, and crop art/detail panels from the board.

Usage: python cutout_origin.py <views-grid.webp> <board.webp> <out_dir>
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove
from scipy import ndimage as nd

grid_src, board_src, out = sys.argv[1:4]
NAMES = ["the-final-form", "the-last-hero", "tokyo-speed-demon", "the-dark-side", "main-character-energy"]
GRID_ROWS = [(0, 291), (295, 584), (587, 863), (867, 1147), (1151, 1443)]
BOARD_ROWS = [(104, 318), (321, 554), (557, 779), (782, 1008), (1011, 1246)]
VIEWS = ["front", "back", "side"]

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r

session = new_session("birefnet-general-lite")
grid = Image.open(grid_src).convert("RGB")
for name, (y0, y1) in zip(NAMES, GRID_ROWS):
    strip = grid.crop((4, y0, grid.width, y1 + 1))
    arr = np.asarray(strip).astype(float) / 255
    boosted = ImageOps.autocontrast(Image.fromarray((np.power(arr, 0.45) * 255).astype("uint8")), cutoff=1)
    m = np.asarray(remove(boosted, session=session, only_mask=True)) > 127
    m = nd.binary_opening(m, structure=disk(2))
    lab, n = nd.label(m)
    sizes = nd.sum(m, lab, range(1, n + 1))
    keep = sorted(np.argsort(sizes)[::-1][:3] + 1, key=lambda k: nd.center_of_mass(lab == k)[1])
    for view, k in zip(VIEWS, keep):
        g = lab == k
        g = nd.binary_closing(np.pad(g, 12), structure=disk(5))[12:-12, 12:-12]
        g = nd.binary_fill_holes(g)
        a = Image.fromarray((g * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.7))
        rgba = strip.convert("RGBA")
        rgba.putalpha(a)
        rgba = rgba.crop(rgba.getbbox())
        rgba.save(f"{out}/{name}-{view}.png")
        print(name, view, rgba.size)

board = Image.open(board_src).convert("RGB")
for name, (y0, y1) in zip(NAMES, BOARD_ROWS):
    board.crop((0, y0, 479, y1)).save(f"{out}/{name}-art.png")
    board.crop((1190, y0, board.width, y1)).save(f"{out}/{name}-detail.png")
