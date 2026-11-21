"""Export playable pieces from 游戏页1.psd (psd-tools[composite], Pillow)."""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter
from psd_tools import PSDImage


def export(psd_path: Path, output: Path) -> None:
    psd = PSDImage.open(psd_path)
    if psd.size != (1080, 2400) or len(psd) != 50 or psd[5].bbox != (17, 447, 272, 726):
        raise ValueError('Expected the 1080×2400 游戏页1 PSD with its original layer order')
    output.mkdir(parents=True, exist_ok=True)

    def composite(name, layers, bounds, opaque=False):
        image = Image.new('RGBA', (bounds[2] - bounds[0], bounds[3] - bounds[1]))
        for index in layers:
            layer = psd[index]
            # Give strokes room beyond the bounds of the Photoshop text glyphs.
            x0, y0, x1, y1 = layer.bbox
            pad = 5 if layer.has_effects() else 0
            part = layer.composite(viewport=(x0 - pad, y0 - pad, x1 + pad, y1 + pad)).convert('RGBA')
            image.alpha_composite(part, (x0 - pad - bounds[0], y0 - pad - bounds[1]))
        if opaque:
            image = image.convert('RGB')
        image.save(output / f'{name}.png', optimize=True)

    def layer(name, index):
        composite(name, [index], psd[index].bbox)

    composite('greenhouse', [0], psd.bbox, opaque=True)
    # The portrait artwork keeps its aspect ratio on wide displays. This
    # soft extension supplies the same palette in the area outside the board.
    with Image.open(output / 'greenhouse.png') as background:
        background.resize((180, 400), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(9)).save(
            output / 'ambient.png', optimize=True)
    layer('pool', 10)
    composite('basket-shadows', [1, 2, 3, 4], (32, 612, 1080, 732))
    basket = psd[5].topil().convert('RGBA')
    alpha = basket.getchannel('A')
    # Trace the inside of the front rim. The handle, bow and the front of
    # the basket stay in front; planted flowers can cover the inner lining.
    interior = Image.new('1', basket.size)
    ImageDraw.Draw(interior).polygon([
        (64, 130), (88, 123), (123, 121), (158, 122), (190, 125), (222, 130),
        (225, 137), (224, 147), (220, 152), (203, 155), (173, 158), (143, 160),
        (112, 158), (113, 149), (114, 143), (112, 137), (106, 133), (96, 131),
        (85, 132), (73, 136), (64, 140),
    ], fill=1)
    transparent = Image.new('L', basket.size)
    rear = basket.copy()
    rear.putalpha(Image.composite(alpha, transparent, interior))
    rear.save(output / 'basket-back.png', optimize=True)
    basket.putalpha(Image.composite(transparent, alpha, interior))
    basket.save(output / 'basket-front.png', optimize=True)

    for name, index in [('order-tag', 22), ('slot', 29), ('pause', 40), ('progress-fill-cap', 42),
                        ('progress-flower', 44)]:
        layer(name, index)
    composite('slot-locked', [34, 49, 48], psd[34].bbox)
    composite('timer', [37, 39], (225, 277, 443, 363))
    composite('stars', [38, 43], (526, 278, 751, 361))
    layer('progress-track', 41)
    layer('tool-base', 12)
    layer('compose-wand', 18)
    layer('clear-brush', 16)
    composite('tool-clear-in-use', [14, 21], psd[14].bbox)
    for name, base, icon, title in [('compose', 12, 18, 19), ('shuffle', 13, 17, 20), ('clear', 14, 16, 21)]:
        composite(f'tool-{name}', [base, icon, title], psd[base].bbox)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('psd', type=Path)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'assets/bundles/greenhouse-board/greenhouse')
    args = parser.parse_args()
    export(args.psd, args.output)
