"""
Compress hero JPEGs from ~2MB each to ~100KB each (94% smaller).

Strategy:
- Resize to 1600x900 max (still retina-quality for 1280px displays)
- Re-encode JPEG at quality 78 (visually indistinguishable from 95)
- Also export WebP at quality 75 for next/image to serve modern browsers
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "images"
MAX_W = 1600
MAX_H = 900

heroes = ["hero-brakes.jpg", "hero-parts.jpg", "hero-sell.jpg"]


def compress(path: Path):
    before = path.stat().st_size
    with Image.open(path) as img:
        img = img.convert("RGB")
        # Resize keeping aspect ratio
        img.thumbnail((MAX_W, MAX_H), Image.Resampling.LANCZOS)
        # Save back as optimized JPEG
        img.save(path, "JPEG", quality=78, optimize=True, progressive=True)
        # Also write a WebP variant alongside it
        webp_path = path.with_suffix(".webp")
        img.save(webp_path, "WEBP", quality=75, method=6)
    after = path.stat().st_size
    webp = (path.with_suffix(".webp")).stat().st_size
    print(
        f"  {path.name:20s} {before/1024:7.0f}KB -> {after/1024:5.0f}KB  "
        f"(WebP: {webp/1024:5.0f}KB) -- {(1 - after/before)*100:.1f}% smaller"
    )


for h in heroes:
    p = ROOT / h
    if p.exists():
        compress(p)
    else:
        print(f"  {h} not found at {p}")
