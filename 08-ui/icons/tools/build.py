"""Recorta, quita fondos, normaliza tamaños y vectoriza la marca y la mascota de Coffer."""
import re
import numpy as np
import vtracer
import resvg_py
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

W = Path(__file__).parent
OUT = W / "out"
for d in ("brand", "mascot", "work"):
    (OUT / d).mkdir(parents=True, exist_ok=True)

CANVAS = 1024
LIGHT_BG = (250, 250, 249)  # background claro #FAFAF9
DARK_BG = (18, 17, 16)      # background oscuro #121110
MONO = (74, 51, 40)         # primary #4A3328

sheet = np.asarray(Image.open(W / "src-sheet.png").convert("RGB")).astype(np.float32)

SHEET = {
    "icon-light": (60, 40, 340, 285),
    "icon-dark": (420, 40, 680, 285),
    "icon-mono": (770, 40, 1010, 285),
    "logo-horizontal": (1020, 70, 1530, 285),
    "mascot-normal": (50, 330, 380, 630),
    "mascot-good": (420, 330, 760, 630),
    "mascot-goal": (790, 330, 1110, 630),
    "mascot-attentive": (1170, 330, 1510, 630),
    "old-preocupado": (50, 680, 380, 950),
    "old-deudas": (420, 680, 760, 950),
    "mascot-resting": (790, 700, 1110, 950),
    "mascot-welcome": (1170, 660, 1510, 950),
}


def key(rgb, bg, soft=(8, 22)):
    """Quita el fondo `bg` solo donde toca el borde (flood fill), con borde suave."""
    dist = np.max(np.abs(rgb - bg), axis=2)
    cand = (dist < soft[1]).astype(np.uint8) * 255
    m = Image.fromarray(cand).copy()
    h, w = cand.shape
    for x in range(0, w, 4):
        for y in (0, h - 1):
            if m.getpixel((x, y)) == 255:
                ImageDraw.floodfill(m, (x, y), 128)
    for y in range(0, h, 4):
        for x in (0, w - 1):
            if m.getpixel((x, y)) == 255:
                ImageDraw.floodfill(m, (x, y), 128)
    outside = np.asarray(m) == 128
    a = np.ones(dist.shape, np.float32)
    a[outside] = np.clip((dist[outside] - soft[0]) / (soft[1] - soft[0]), 0, 1)
    safe = np.maximum(a, 1e-3)[..., None]
    col = np.clip((rgb - (1 - a[..., None]) * bg) / safe, 0, 255)
    return np.dstack([col, a * 255]).astype(np.uint8)


def trim(rgba, pad=2):
    ys, xs = np.where(rgba[..., 3] > 100)
    return rgba[max(ys.min() - pad, 0): ys.max() + pad + 1, max(xs.min() - pad, 0): xs.max() + pad + 1]


def bg_of(rgb):
    return np.median(np.concatenate([rgb[:3].reshape(-1, 3), rgb[-3:].reshape(-1, 3)]), axis=0)


pieces = {}
for name, (x0, y0, x1, y1) in SHEET.items():
    crop = sheet[y0:y1, x0:x1].copy()
    if name == "logo-horizontal":
        crop[212 - y0:, 1172 - x0:] = bg_of(crop)  # sin lema
    if name == "icon-dark":
        # Dentro del cuadrado negro: tomar solo el glifo y quitar el negro.
        inner = crop[40:205, 55:215]
        pieces[name] = trim(key(inner, np.array([12, 11, 11], np.float32), soft=(18, 40)))
        continue
    pieces[name] = trim(key(crop, bg_of(crop)))

for name, src in (("mascot-debt", "src-a.jpg"), ("mascot-worried", "src-b.jpg")):
    rgb = np.asarray(Image.open(W / src).convert("RGB")).astype(np.float32)
    pieces[name] = trim(key(rgb, bg_of(rgb), soft=(10, 26)))

# Las dos correcciones vienen a otra escala: igualarlas a la altura de su versión en la hoja.
for new, old in (("mascot-debt", "old-deudas"), ("mascot-worried", "old-preocupado")):
    h_old = pieces[old].shape[0]
    im = Image.fromarray(pieces[new])
    f = h_old / im.height
    pieces[new] = np.asarray(im.resize((round(im.width * f), h_old), Image.LANCZOS))


def place(rgba, scale, canvas=CANVAS, bottom=None):
    im = Image.fromarray(rgba)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    c = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    x = (canvas - im.width) // 2
    y = (canvas - im.height) // 2 if bottom is None else canvas - bottom - im.height
    c.alpha_composite(im, (x, y))
    return c


KEY = (255, 0, 255)  # color clave que no aparece en las ilustraciones


def _paths(svg_text):
    return re.findall(r"<path [^>]*/>", svg_text)


UP = 2        # se traza a doble resolución para curvas más suaves
COLORS = 12   # paleta plana: elimina los píxeles intermedios del antialias, que generan bordes de serrucho


def vectorize(png: Path, svg: Path, precision=8, mono=None, erode=0):
    """Colores en modo 'stacked' (sin costuras) recortados con la silueta exacta (traza binaria).

    Antes de trazar: se duplica la resolución, se reduce a una paleta plana y se aplica un filtro
    de moda para que cada zona de color tenga un borde limpio. `erode` encoge la silueta para
    dejar fuera el halo del fondo original."""
    src = Image.open(png).convert("RGBA")
    w, h = src.size
    im = src.resize((w * UP, h * UP), Image.LANCZOS)
    a = np.asarray(im)[..., 3]
    if erode:
        a = np.asarray(Image.fromarray(a).filter(ImageFilter.MinFilter(erode * UP - (UP - 1))))
    a = np.asarray(Image.fromarray(a).filter(ImageFilter.GaussianBlur(1.5 * UP)))
    tmp = OUT / "work"
    # 1) silueta
    sil = Image.fromarray(np.where(a >= 128, 0, 255).astype(np.uint8)).convert("RGB")
    sil.save(tmp / "_sil.png")
    vtracer.convert_image_to_svg_py(
        str(tmp / "_sil.png"), str(tmp / "_sil.svg"), colormode="binary", mode="spline",
        filter_speckle=8 * UP, corner_threshold=80, length_threshold=6.0, splice_threshold=45, path_precision=2,
    )
    sil_paths = _paths((tmp / "_sil.svg").read_text())
    head = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w * UP} {h * UP}">\n')
    if mono is not None:
        fill = "#%02X%02X%02X" % mono
        body = "".join(re.sub(r'fill="[^"]*"', f'fill="{fill}"', p) + "\n" for p in sil_paths)
        svg.write_text(head + body + "</svg>\n")
        return
    # 2) colores sobre color clave
    flat = Image.new("RGB", im.size, KEY)
    # Se pinta con la silueta sin erosionar para que el color llegue hasta el borde del recorte.
    full = np.asarray(im)[..., 3]
    flat.paste(im.convert("RGB"), mask=Image.fromarray(np.where(full >= 128, 255, 0).astype(np.uint8)))
    flat = flat.quantize(colors=COLORS, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert("RGB")
    flat = flat.filter(ImageFilter.ModeFilter(4 * UP + 1))
    flat.save(tmp / "_col.png")
    vtracer.convert_image_to_svg_py(
        str(tmp / "_col.png"), str(tmp / "_col.svg"), colormode="color", hierarchical="stacked", mode="spline",
        filter_speckle=10 * UP, color_precision=precision, layer_difference=4,
        corner_threshold=80, length_threshold=6.0, splice_threshold=45, path_precision=2,
    )
    col = []
    for p in _paths((tmp / "_col.svg").read_text()):
        m = re.search(r'fill="#([0-9A-Fa-f]{6})"', p)
        r, g, b = (int(m.group(1)[i:i + 2], 16) for i in (0, 2, 4))
        if r > 200 and b > 200 and g < 80:  # fondo clave
            continue
        col.append(p)
    clip = "".join(re.sub(r' fill="[^"]*"', "", p) + "\n" for p in sil_paths)
    svg.write_text(
        head + f'<defs><clipPath id="s">\n{clip}</clipPath></defs>\n<g clip-path="url(#s)">\n'
        + "\n".join(col) + "\n</g>\n</svg>\n"
    )


def render(svg: Path, png: Path, size):
    data = resvg_py.svg_to_bytes(svg_path=str(svg), width=size, height=size)
    png.write_bytes(bytes(data))


def refine(img: Image.Image, erode=0) -> Image.Image:
    """Afina un recorte ampliado: borde de alfa más definido y nitidez en el color."""
    r, g, b, a = img.split()
    if erode:
        a = a.filter(ImageFilter.MinFilter(erode))
    # Curva de contraste sobre el alfa: el borde pasa de ~4 px difusos a ~1-2 px, sin escalones.
    a = a.filter(ImageFilter.GaussianBlur(0.8)).point(lambda v: max(0, min(255, round((v - 60) * 255 / 135))))
    rgb = Image.merge("RGB", (r, g, b)).filter(ImageFilter.UnsharpMask(radius=2.5, percent=90, threshold=2))
    return Image.merge("RGBA", (*rgb.split(), a))


def export(img: Image.Image, base: Path, erode=0):
    refine(img, erode).save(base.with_suffix(".png"), optimize=True)


# ---------- Mascota: misma escala para todas, apoyadas en la misma línea de suelo ----------
mascots = ["normal", "good", "goal", "attentive", "worried", "debt", "resting", "welcome"]
biggest = max(max(pieces[f"mascot-{m}"].shape[:2]) for m in mascots)
s = 900 / biggest
for m in mascots:
    export(place(pieces[f"mascot-{m}"], s, bottom=62), OUT / "mascot" / f"mascot-{m}")
    print("mascot", m)

# ---------- Marca ----------
mark = pieces["icon-mono"]  # glifo a color sin fondo (el "monocromo" de la hoja trae color)
mark_dark = pieces["icon-dark"]
s_mark = 860 / max(mark.shape[:2])
export(place(mark, s_mark), OUT / "brand" / "coffer-mark", erode=5)
export(place(mark_dark, 860 / max(mark_dark.shape[:2])), OUT / "brand" / "coffer-mark-dark", erode=9)

# Monocromo real (un solo color, para el ícono temático de Android 13+): silueta vectorial.
place(mark, s_mark).save(OUT / "work" / "coffer-mark-mono.png")
vectorize(OUT / "work" / "coffer-mark-mono.png", OUT / "brand" / "coffer-mark-mono.svg", mono=MONO)
(OUT / "brand" / "coffer-mark-mono.png").write_bytes(bytes(resvg_py.svg_to_bytes(
    svg_path=str(OUT / "brand" / "coffer-mark-mono.svg"), width=CANVAS, height=CANVAS)))

# Logotipo horizontal sin lema, en lienzo apaisado; variante oscura con la palabra en #F5F5F4.
logo = Image.fromarray(pieces["logo-horizontal"])
f = 1800 / logo.width
logo = logo.resize((1800, round(logo.height * f)), Image.LANCZOS)
lc = Image.new("RGBA", (1920, logo.height + 120), (0, 0, 0, 0))
lc.alpha_composite(logo, (60, 60))
lc = refine(lc, erode=3)
lc.save(OUT / "brand" / "coffer-logo-horizontal.png", optimize=True)
arr = np.asarray(lc).copy()
rgb = arr[..., :3].astype(int)
text = (rgb.max(axis=2) < 90) & (rgb.max(axis=2) - rgb.min(axis=2) < 30)
text[:, : int(lc.width * 0.27)] = False  # solo la palabra, no el zorro
arr[text, :3] = (245, 245, 244)
Image.fromarray(arr).save(OUT / "brand" / "coffer-logo-horizontal-dark.png", optimize=True)

# Íconos de app (Play Store y vista previa): glifo sobre fondo claro u oscuro.
for variant, bg, glyph in (("light", LIGHT_BG, "coffer-mark"), ("dark", DARK_BG, "coffer-mark-dark")):
    g = Image.open(OUT / "brand" / f"{glyph}.png").convert("RGBA")
    g = g.resize((660, 660), Image.LANCZOS)  # zona segura del ícono adaptativo (~66 %)
    tile = Image.new("RGBA", (1024, 1024), bg + (255,))
    tile.alpha_composite(g, (182, 182))
    tile.convert("RGB").save(OUT / "brand" / f"app-icon-{variant}.png")
    tile.convert("RGB").resize((512, 512), Image.LANCZOS).save(OUT / "brand" / f"app-icon-{variant}-512.png")
print("listo")
