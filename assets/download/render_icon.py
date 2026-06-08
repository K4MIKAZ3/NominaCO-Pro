"""Render NominaApp launcher icon to PNG (one-off asset export)."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SIZE = 1024
S = SIZE / 108.0
ROOT = Path(__file__).resolve().parent

img = Image.new("RGBA", (SIZE, SIZE), "#0D0F14")
draw = ImageDraw.Draw(img)


def rr(x, y, w, h, r, fill):
    draw.rounded_rectangle(
        (int(x * S), int(y * S), int((x + w) * S), int((y + h) * S)),
        radius=int(r * S),
        fill=fill,
    )


def circle(cx, cy, r, fill, alpha=255):
    x0 = int((cx - r) * S)
    y0 = int((cy - r) * S)
    x1 = int((cx + r) * S)
    y1 = int((cy + r) * S)
    rgb = tuple(int(fill[i : i + 2], 16) for i in (1, 3, 5))
    if alpha < 255:
        layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.ellipse((x0, y0, x1, y1), fill=rgb + (alpha,))
        img.alpha_composite(layer)
    else:
        draw.ellipse((x0, y0, x1, y1), fill=rgb)


rr(24, 24, 60, 60, 12, "#1C2030")

font_candidates = [
    Path("C:/Windows/Fonts/segoeuib.ttf"),
    Path("C:/Windows/Fonts/arialbd.ttf"),
]
font = None
for candidate in font_candidates:
    if candidate.exists():
        font = ImageFont.truetype(str(candidate), int(36 * S))
        break
if font is None:
    font = ImageFont.load_default()

draw.text((int(41 * S), int(30 * S)), "N", fill="#4ADE80", font=font)

circle(62, 32, 3.5, "#22D3EE")
circle(57, 73, 7.5, "#B45309")
circle(57, 73, 6, "#FBBF24")
circle(67, 77, 6.5, "#92400E")
circle(67, 77, 5, "#F59E0B")
circle(74, 68, 5.5, "#78350F")
circle(74, 68, 4.5, "#FDE68A")
circle(72, 65, 1.5, "#FFFFFF", alpha=115)

out_1024 = ROOT / "nominaapp-icon-1024.png"
out_512 = ROOT / "nominaapp-icon-512.png"
img.save(out_1024, "PNG")
img.resize((512, 512), Image.Resampling.LANCZOS).save(out_512, "PNG")
print(f"Saved {out_1024.name} and {out_512.name}")
