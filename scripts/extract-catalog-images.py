#!/usr/bin/env python3
"""One-off helper: extracts the product/site photos embedded in the 2025 catalogue PDF
and writes web-ready WebP files named by slug.

Usage:  python3 scripts/extract-catalog-images.py [assets-origem/catalogo-art-terra-2025.pdf]
Needs:  poppler-utils (pdfimages) and Pillow.

Outputs:
  public/seed-images/produtos/<slug>.webp          product photo (4:3)
  public/seed-images/produtos/<slug>-aplicacao.webp  product applied on site (4:3)
  public/seed-images/categorias/<slug>.webp
  public/seed-images/galeria/<name>.webp
  src/assets/site/<name>.webp                      hero / about images bundled with the app
"""
import glob
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "assets-origem", "catalogo-art-terra-2025.pdf")
OUT = os.path.join(ROOT, "public", "seed-images")
SITE = os.path.join(ROOT, "src", "assets", "site")
W, H = 960, 720  # 4:3 canvas for product images


def load_images():
    """Returns {image_number: PIL.Image}, merging each picture with its soft mask (alpha)."""
    tmp = tempfile.mkdtemp(prefix="artterra-")
    subprocess.run(["pdfimages", "-all", PDF, os.path.join(tmp, "im")], check=True)
    rows = [l.split() for l in subprocess.run(["pdfimages", "-list", PDF], capture_output=True, text=True, check=True).stdout.splitlines()[2:]]
    files = {int(os.path.basename(f).split("-")[1].split(".")[0]): f for f in glob.glob(os.path.join(tmp, "im-*"))}
    images = {}
    for i, r in enumerate(rows):
        num, typ = int(r[1]), r[2]
        if typ != "image":
            continue
        im = Image.open(files[num]).convert("RGB")
        if i + 1 < len(rows) and rows[i + 1][2] == "smask":
            mask = Image.open(files[int(rows[i + 1][1])]).convert("L")
            if mask.size == im.size:
                im.putalpha(mask)
        images[num] = im
    return images


def sharpen(im, amount=60):
    return im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=amount, threshold=2))


def save(im, path, quality=82):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.convert("RGB").save(path, "WEBP", quality=quality, method=6)


def studio_background():
    """Brand-green studio backdrop with a soft spotlight, echoing the printed catalogue."""
    bg = Image.new("RGB", (W, H), (36, 64, 42))
    glow = Image.new("L", (W, H), 0)
    px = glow.load()
    cx, cy, rad = W / 2, H * 0.46, W * 0.62
    for y in range(0, H):
        for x in range(0, W):
            d = ((x - cx) ** 2 + ((y - cy) * 1.25) ** 2) ** 0.5 / rad
            px[x, y] = int(max(0.0, 1 - d) ** 1.6 * 255)
    light = Image.new("RGB", (W, H), (66, 104, 70))
    bg.paste(light, (0, 0), glow)
    return bg


_BG = None


def cutout(im, fill=0.66):
    """Places a transparent product cut-out on the studio backdrop with a soft shadow."""
    global _BG
    _BG = _BG or studio_background()
    canvas = _BG.copy()
    bbox = im.getchannel("A").getbbox()
    im = im.crop(bbox)
    scale = min(W * 0.72 / im.width, H * fill / im.height)
    size = (round(im.width * scale), round(im.height * scale))
    im = sharpen(im.resize(size, Image.LANCZOS), 45)
    x, y = (W - size[0]) // 2, (H - size[1]) // 2 - 6
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow.paste(Image.new("RGBA", size, (8, 20, 10, 150)), (x + 10, y + 22), im.getchannel("A"))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    canvas.paste(shadow, (0, 0), shadow)
    canvas.paste(im, (x, y), im)
    return canvas


def photo(im, box=None, y=0.5):
    """Crops a 4:3 window (explicit box, or full width at vertical position y) and resizes."""
    im = im.convert("RGB")
    if box:
        im = im.crop(box)
    else:
        w, h = im.size
        if w / h > 4 / 3:
            nw = round(h * 4 / 3)
            x0 = round((w - nw) * 0.5)
            im = im.crop((x0, 0, x0 + nw, h))
        else:
            nh = round(w * 3 / 4)
            y0 = round((h - nh) * y)
            im = im.crop((0, y0, w, y0 + nh))
    return sharpen(im.resize((W, H), Image.LANCZOS), 55)


def contain(im):
    """Portrait subject shown whole, over a blurred copy of itself (no cropping of the piece)."""
    im = im.convert("RGB")
    back = im.resize((W, round(W * im.height / im.width)), Image.LANCZOS)
    top = (back.height - H) // 2
    back = back.crop((0, top, W, top + H)).filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * 0.62))
    scale = H / im.height
    front = sharpen(im.resize((round(im.width * scale), H), Image.LANCZOS), 55)
    back.paste(front, ((W - front.width) // 2, 0))
    return back


def enlarge(im, width):
    im = im.convert("RGB")
    if im.width < width:
        im = sharpen(im.resize((width, round(im.height * width / im.width)), Image.LANCZOS), 50)
    return im


def main():
    I = load_images()
    P = os.path.join(OUT, "produtos")

    # --- Linha Atérmica: cut-outs + pool photos -------------------------------------------
    for slug, num in {"borda-grega": 20, "borda-peito-de-pombo": 11, "borda-reta": 22, "grelha": 15, "piso-atermico": 13}.items():
        save(cutout(I[num], fill=0.6), f"{P}/{slug}.webp")
    pools = I[18].convert("RGB")
    save(photo(pools.crop((0, 0, 330, 328)), y=0.5), f"{P}/borda-grega-aplicacao.webp")
    save(photo(pools.crop((331, 0, 661, 328)), y=0.5), f"{P}/borda-reta-aplicacao.webp")
    save(photo(I[17]), f"{P}/grelha-aplicacao.webp")
    save(photo(I[10], y=0.62), f"{P}/piso-atermico-aplicacao.webp")
    save(photo(I[3], y=0.55), f"{P}/borda-peito-de-pombo-aplicacao.webp")

    # --- Cobogós: (piece cut-out, applied photo, vertical focus) ---------------------------
    cobogos = {
        "cobogo-arabe": (34, 33, 0.55), "cobogo-assimetrico": (36, 31, 0.55), "cobogo-boomerang": (38, 32, 0.5),
        "cobogo-circulo": (65, 52, 0.5), "cobogo-floral": (63, 53, 0.5), "cobogo-folha": (55, 54, 0.5),
        "cobogo-l": (86, 75, 0.35), "cobogo-labirinto": (84, 73, 0.6), "cobogo-quadriculado": (76, 74, 0.3),
        "cobogo-simetrico": (103, 94, 0.55), "cobogo-triangulo": (105, 95, 0.3), "cobogo-u": (107, 96, 0.35),
    }
    for slug, (piece, applied, y) in cobogos.items():
        save(cutout(I[piece]), f"{P}/{slug}.webp")
        save(photo(I[applied], y=y), f"{P}/{slug}-aplicacao.webp")

    # --- Pisos ----------------------------------------------------------------------------
    pisos = {
        "paver-intertravado-dormido": (110, None, 0.5),
        "piso-calcada-circulo": (111, None, 0.98), "piso-calcada-andorinha": (112, None, 0.98),
        "piso-calcada-estriado": (127, None, 0.98), "piso-calcada-quadriculado": (129, None, 0.98),
        "piso-calcada-copacabana": (128, (255, 95, 635, 380), 0.5),
        "piso-dormente": (145, None, 0.45), "piso-grama": (146, None, 0.5), "piso-drenante": (147, None, 0.75),
        "piso-tatil-alerta": (160, None, 0.5), "piso-tatil-direcional": (159, None, 0.72),
    }
    for slug, (num, box, y) in pisos.items():
        save(photo(I[num], box=box, y=y), f"{P}/{slug}.webp")

    # --- Artifícios -----------------------------------------------------------------------
    save(photo(I[172], y=0.42), f"{P}/banco-com-vaso.webp")
    save(photo(I[173], y=0.62), f"{P}/banco-curvo.webp")
    save(photo(I[174], y=0.5), f"{P}/banco-reto.webp")
    save(contain(I[175]), f"{P}/margarida.webp")
    save(contain(I[176]), f"{P}/pezao-pe-grande.webp")
    save(photo(I[177], y=0.6), f"{P}/pingadeira-chapeu.webp")
    save(photo(I[178], y=0.42), f"{P}/pingadeira-reta.webp")

    # --- Capas de categoria ---------------------------------------------------------------
    C = os.path.join(OUT, "categorias")
    save(photo(I[10], y=0.55), f"{C}/atermicos.webp")
    save(photo(I[24], y=0.45), f"{C}/cobogos.webp")
    save(photo(I[109], y=0.4), f"{C}/pisos.webp")
    save(photo(I[171], y=0.5), f"{C}/artificios.webp")

    # --- Galeria "Projetos realizados" ----------------------------------------------------
    G = os.path.join(OUT, "galeria")
    for name, num in {"galeria-piscina-1": 3, "galeria-piscina-2": 10, "galeria-caminho": 4, "galeria-varanda": 7,
                      "galeria-cobogos-muro": 24, "galeria-fachada": 179, "galeria-jardim-vertical": 96,
                      "galeria-cobogo-circulo": 52}.items():
        save(enlarge(I[num], 1200), f"{G}/{name}.webp", quality=80)

    # --- Imagens fixas do site ------------------------------------------------------------
    hero = I[0].convert("RGB").crop((0, 120, 736, 920))
    save(sharpen(hero.resize((1472, 1600), Image.LANCZOS), 50), f"{SITE}/hero-fachada.webp", quality=80)
    save(enlarge(I[32], 1400), f"{SITE}/interior-cobogo.webp", quality=80)
    save(enlarge(I[7], 1300), f"{SITE}/galeria-varanda.webp", quality=80)
    save(enlarge(I[4], 1200), f"{SITE}/caminho-jardim.webp", quality=80)
    print("done")


if __name__ == "__main__":
    main()
