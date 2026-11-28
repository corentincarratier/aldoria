"""Prépare des atlas WebP à seize cases, sans marge variable à l'affichage."""
from pathlib import Path
import base64, io, json
from PIL import Image

source = Path(__file__).parent / "sources"
destination = source.parents[1] / "aldoria" / "v1" / "planches.json"
planches = {}
for path in sorted(source.glob("*.png")):
    original = Image.open(path).convert("RGBA")
    material = path.stem == "matieres"
    size = 192
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
                tile = tile.crop((5,5,tile.width-5,tile.height-5)).resize((size,size),Image.Resampling.LANCZOS)
            else:
                box = tile.getchannel("A").point(lambda x: 255 if x>42 else 0).getbbox()
                if not box:
                    raise ValueError(f"{path.name}, case vide {row},{col}")
                tile = tile.crop(box)
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
    sheet.save(output,format="WEBP",quality=87,method=6)
    planches[path.stem] = "data:image/webp;base64," + base64.b64encode(output.getvalue()).decode("ascii")
if len(planches) != 7:
    raise ValueError("Sept planches attendues")
destination.write_text(json.dumps(planches,separators=(",",":")))
