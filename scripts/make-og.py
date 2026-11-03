"""
Gera public/og.png (1200x630) para o preview de link (Open Graph).
Uso: python3 scripts/make-og.py <Fraunces.ttf> <Inter.ttf>
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

fr, it = sys.argv[1], sys.argv[2]
W, H = 1200, 630
img = Image.new("RGBA", (W, H), (246, 242, 233, 255))

# manchas suaves verde/âmbar
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g = ImageDraw.Draw(glow)
g.ellipse((-200, -260, 520, 420), fill=(125, 190, 60, 70))
g.ellipse((820, 300, 1420, 900), fill=(226, 163, 61, 70))
img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(90)))

d = ImageDraw.Draw(img)
def font(path, size, wght):
    f = ImageFont.truetype(path, size)
    try:
        f.set_variation_by_axes([wght] if "Inter" in path else [72, wght, 0, 0])
    except Exception:
        try: f.set_variation_by_name("SemiBold")
        except Exception: pass
    return f

mark = Image.open("public/logo-mark.png").convert("RGBA")
mark.thumbnail((360, 400), Image.LANCZOS)
card = Image.new("RGBA", (440, 470), (0, 0, 0, 0))
cd = ImageDraw.Draw(card)
cd.rounded_rectangle((0, 0, 439, 469), radius=48, fill=(255, 253, 248, 255), outline=(226, 217, 198, 255), width=2)
card.alpha_composite(mark, ((440 - mark.width) // 2, (470 - mark.height) // 2))
img.alpha_composite(card, (W - 440 - 80, (H - 470) // 2))

ink = (28, 43, 42, 255)
d.text((80, 120), "PLATAFORMA DE RECOLOCAÇÃO", font=font(it, 22, 600), fill=(63, 110, 31, 255))
title = font(fr, 76, 600)
d.text((80, 165), "Conectamos", font=title, fill=ink)
d.text((80, 250), "talentos às", font=title, fill=ink)
d.text((80, 335), "oportunidades", font=title, fill=(63, 110, 31, 255))
d.text((80, 420), "certas.", font=title, fill=ink)
d.text((80, 535), "YL Empregabilidade  ·  São Paulo, SP", font=font(it, 26, 500), fill=(74, 89, 87, 255))
img.convert("RGB").save("public/og.png", optimize=True)
print("ok")
