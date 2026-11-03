"""
Processa o logo original (print com faixas pretas e fundo branco) e gera:
  public/logo.png        -> logo completo, fundo transparente
  public/logo-mark.png   -> só o "YL" com a semente/broto (sem a palavra)
  app/icon.png, app/apple-icon.png -> favicons gerados a partir do "YL"

OBS: o ideal é pedir ao cliente o logo original em vetor (SVG).
Uso: python3 scripts/process-logo.py caminho/do/logo-original.png
"""
import sys
from PIL import Image

src = Image.open(sys.argv[1]).convert("RGB")
W, H = src.size

# 1) recorta as faixas pretas de cima/baixo (linhas quase totalmente pretas)
def row_dark(y):
    px = [src.getpixel((x, y)) for x in range(0, W, 7)]
    return sum(1 for p in px if max(p) < 40) / len(px) > 0.9
top = 0
while top < H and row_dark(top): top += 1
bot = H - 1
while bot > 0 and row_dark(bot): bot -= 1
img = src.crop((0, top + 4, W, bot - 3))

# 2) fundo branco -> transparente (alpha suave, "unmultiply" do branco)
rgba = Image.new("RGBA", img.size)
out = []
for (r, g, b) in img.get_flattened_data():
    m = min(r, g, b)
    a = 255 - m
    a = max(0, min(255, int((a - 8) * 255 / 200)))  # limiar + realce
    if a == 0:
        out.append((0, 0, 0, 0)); continue
    af = a / 255
    def un(c): return max(0, min(255, int(round((c - 255 * (1 - af)) / af))))
    out.append((un(r), un(g), un(b), a))
rgba.putdata(out)
full = rgba.crop(rgba.getbbox())

def save_scaled(im, path, maxw):
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(path, optimize=True)
    return im

save_scaled(full, "public/logo.png", 640)

# 3) marca sem a palavra "EMPREGABILIDADE": corta acima da linha de texto
# procura, de baixo pra cima, a faixa vazia entre o texto e o desenho
alpha = full.split()[3]
fw, fh = full.size
def row_empty(y):
    return max(alpha.crop((0, y, fw, y + 1)).get_flattened_data()) < 20
y = fh - 1
while y > 0 and row_empty(y): y -= 1       # ignora resíduo claro no rodapé
while y > 0 and not row_empty(y): y -= 1   # sobe pelo texto
while y > 0 and row_empty(y): y -= 1       # atravessa o vão
mark = full.crop((0, 0, fw, y + 2))
mark = mark.crop(mark.getbbox())
save_scaled(mark, "public/logo-mark.png", 360)

# 4) favicons: marca centralizada em quadrado creme
def icon(size, path, pad=0.1, bg=(246, 242, 233, 255), radius=None):
    canvas = Image.new("RGBA", (size, size), bg)
    inner = int(size * (1 - 2 * pad))
    m = mark.copy()
    m.thumbnail((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    # paleta reduzida = arquivo bem menor (favicon é baixado em toda visita)
    canvas.convert("RGB").quantize(colors=128, method=Image.Quantize.MEDIANCUT).save(path, optimize=True)

icon(192, "app/icon.png", pad=0.06)
icon(180, "app/apple-icon.png", pad=0.1)
print("ok", full.size, mark.size)

# 5) versões leves (WebP) para uso na página
def webp(im, path, h):
    im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    im.save(path, "WEBP", quality=88, method=6)
    return im.size
print("mark-sm", webp(mark, "public/logo-mark-sm.webp", 112))
print("mark-md", webp(mark, "public/logo-mark-md.webp", 240))
print("full-md", webp(full, "public/logo-md.webp", 360))
