#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "docs" / "images"
SOURCES = [
    ("Desktop · 1440 × 900 viewport", "weatherworks-desktop.png", 1440, 900),
    ("Tablet · 834 × 1112 viewport", "weatherworks-tablet.png", 834, 1112),
    ("iPhone 15 · 393 × 852 CSS px · 3× DPR", "weatherworks-iphone-15.png", 1179, 2556),
]

panels = []
for label, filename, expected_width, minimum_height in SOURCES:
    path = IMAGE_DIR / filename
    if not path.exists():
        raise SystemExit(f"Missing screenshot: {path}")
    image = Image.open(path).convert("RGB")
    if image.width != expected_width or image.height < minimum_height:
        raise SystemExit(
            f"{filename}: expected width {expected_width} and height >= {minimum_height}, got {image.size}"
        )
    thumb = image.copy()
    thumb.thumbnail((720, 560), Image.Resampling.LANCZOS)
    panels.append((label, thumb))

padding, label_height, gap = 28, 46, 24
width = max(image.width for _, image in panels) + padding * 2
height = padding + sum(label_height + image.height for _, image in panels) + gap * (len(panels) - 1) + padding
sheet = Image.new("RGB", (width, height), "#17242b")
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default(size=22)
y = padding
for label, image in panels:
    draw.text((padding, y + 8), label, fill="#eef6f7", font=font)
    y += label_height
    sheet.paste(image, ((width - image.width) // 2, y))
    y += image.height + gap

output = IMAGE_DIR / "weatherworks-contact-sheet.png"
sheet.save(output, optimize=True)
print(f"Created {output} ({sheet.width} × {sheet.height})")
