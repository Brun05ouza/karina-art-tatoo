from PIL import Image, ImageDraw
from pathlib import Path
import math

pub = Path(r"c:\Users\bs902\Downloads\Projetos\karina-art-tatoo\frontend\public")
og_path = pub / "og" / "karina-sarte-og.jpg"

img = Image.open(og_path).convert("RGB")
target_w, target_h = 1200, 630
src_w, src_h = img.size
scale = max(target_w / src_w, target_h / src_h)
new_w, new_h = int(src_w * scale), int(src_h * scale)
img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
left = (new_w - target_w) // 2
top = (new_h - target_h) // 2
img = img.crop((left, top, left + target_w, top + target_h))
img.save(og_path, "JPEG", quality=82, optimize=True, progressive=True)
print("og", og_path.stat().st_size)


def make_icon(size: int, path: Path) -> None:
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    radius = int(size * 0.22)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=(46, 23, 58, 255))
    cx = cy = size / 2
    r_outer = size * 0.36
    r_inner = size * 0.14
    pts = []
    for i in range(8):
        ang = -math.pi / 2 + i * (math.pi / 4)
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r))
    draw.polygon(pts, fill=(219, 218, 219, 255))
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG", optimize=True)
    print(path.name, path.stat().st_size)


make_icon(180, pub / "apple-touch-icon.png")
make_icon(192, pub / "icons" / "icon-192.png")
make_icon(512, pub / "icons" / "icon-512.png")

ico = Image.open(pub / "icons" / "icon-192.png").resize((32, 32), Image.Resampling.LANCZOS)
ico.save(pub / "favicon.ico", format="ICO", sizes=[(32, 32)])
print("favicon.ico", (pub / "favicon.ico").stat().st_size)
