"""Prépare des atlas WebP à seize cases, sans marge variable à l'affichage."""
from pathlib import Path
import base64, io, json, random
from PIL import Image, ImageEnhance, ImageFilter

def surface(tile, index, size):
    """Raccorder des prélèvements orientés dans le sens de la matière."""
    source_rgb = tile.convert("RGB").crop((5,5,tile.width-5,tile.height-5))
    source_rgb = ImageEnhance.Color(source_rgb).enhance(0.86)
    source_rgb = Image.blend(source_rgb, source_rgb.filter(ImageFilter.GaussianBlur(1.25)), .24)
    stride, overlap = size//4, 14
    width = stride + 2*overlap
    count = size//stride
    mask = Image.new("L",(width,width))
    mask.putdata([round(255*min(1,min(x+1,y+1,width-x,width-y)/(2*overlap))) for y in range(width) for x in range(width)])
    rng = random.Random(1709 + index)
    samples = []
    for _ in range(count*count):
        x = rng.randrange(source_rgb.width-width+1)
        y = rng.randrange(source_rgb.height-width+1)
        samples.append(source_rgb.crop((x,y,x+width,y+width)))
    result = Image.new("RGB",(size,size))
    # Poser les cœurs opaques puis fondre les bords. Les prélèvements aux
    # deux extrémités d'une boucle sont identiques, sans aucune réflexion.
    for y in range(count):
        for x in range(count):
            core = samples[y*count+x].crop((overlap,overlap,overlap+stride,overlap+stride))
            result.paste(core,(x*stride,y*stride))
    for y in range(-1,count+1):
        for x in range(-1,count+1):
            sample=samples[(y%count)*count+x%count]
            result.paste(sample,(x*stride-overlap,y*stride-overlap),mask)
    return result.convert("RGBA")


def pigments(tile, family):
    # Garder le contour de l'objet et réunir le grain sous le seuil d'un
    # pixel de jeu. La laine, la terre cuite et les feuillages restent mats.
    alpha = tile.getchannel("A")
    rgb = tile.convert("RGB")
    rgb = Image.blend(rgb, rgb.filter(ImageFilter.MedianFilter(3)), .34)
    rgb = ImageEnhance.Color(rgb).enhance(.86 if family in ("architecture","paysage","objets") else .91)
    rgb.putalpha(alpha.point(lambda a: 0 if a < 5 else a))
    return rgb


source = Path(__file__).parent / "sources"
destination = source.parents[1] / "aldoria" / "v1" / "planches.json"
planches = {}
for path in sorted(source.glob("*.png")):
    original = Image.open(path).convert("RGBA")
    material = path.stem == "matieres"
    size = 384 if material else 192
    sheet = Image.new("RGBA", (4*size, 4*size))
    alpha = original.getchannel("A")
    def boundaries(axis):
        dimension = original.size[axis]
        result = [0]
        for i in range(1,4):
            center = round(dimension*i/4)
            if not material:
                def score(t):
                    line = alpha.crop((t,0,t+1,original.height) if axis == 0 else (0,t,original.width,t+1))
                    return sum(line.histogram()[96:]) + abs(t-center)*0.3
                margin = round(dimension/55)
                center = min(range(center-margin,center+margin+1), key=score)
            result.append(center)
        return result + [dimension]
    xs, ys = boundaries(0), boundaries(1)
    for row in range(4):
        for col in range(4):
            tile = original.crop((xs[col],ys[row],xs[col+1],ys[row+1]))
            if material:
                tile = surface(tile,row*4+col,size)
            else:
                box = tile.getchannel("A").point(lambda x: 255 if x>42 else 0).getbbox()
                if not box:
                    raise ValueError(f"{path.name}, case vide {row},{col}")
                tile = pigments(tile.crop(box),path.stem)
                if path.stem == "legendes":
                    tile = tile.transpose(Image.Transpose.ROTATE_90 if row*4+col == 10 else Image.Transpose.ROTATE_270)
                if path.stem == "paysage" and row*4+col == 14:
                    # Le tablier utilise toute la case. Sa largeur et sa longueur
                    # seront celles du passage enregistré dans la région.
                    tile = tile.resize((size,size),Image.Resampling.LANCZOS)
                else:
                    tile.thumbnail((size-6,size-6), Image.Resampling.LANCZOS)
            sheet.alpha_composite(tile,(col*size+(size-tile.width)//2,row*size+(size-tile.height)//2))
    if material:
        sheet = sheet.convert("RGB")
    output = io.BytesIO()
    sheet.save(output,format="WEBP",quality=82 if material else 86,method=6)
    planches[path.stem] = "data:image/webp;base64," + base64.b64encode(output.getvalue()).decode("ascii")
if len(planches) != 7:
    raise ValueError("Sept planches attendues")
destination.write_text(json.dumps(planches,separators=(",",":")))
