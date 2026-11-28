from pathlib import Path
from sys import argv
from PIL import Image, ImageChops

folder = Path(argv[1])
base = Image.open(folder / 'brune-repos.png').convert('RGB')
# La zone est entièrement statique à part l’archer. Chaque pose reste à son échelle.
patch = (140, 215, 855, 430)
samples = []
centres = []
for filename in ['repos', *(f'pas-{i}' for i in range(6)), 'visee']:
    frame = Image.open(folder / f'brune-{filename}.png').convert('RGB')
    # Le rouge de la cape donne un point d'ancrage stable sur les pavés.
    region = frame.crop(patch)
    mask = Image.new('L', region.size)
    mask.putdata([255 if r > 1.7*g and r > 1.35*b and r-g > 43 and b > 39 else 0 for r,g,b in region.getdata()])
    # La cible du haut est exclue du repérage du tissu.
    y_min = 322 - patch[1]
    part = mask.crop((0,y_min, min(mask.width, 805-patch[0]), mask.height))
    box = part.getbbox()
    if not box:
        raise ValueError(f'Pas de cape sur les pavés dans {filename}')
    x = patch[0] + (box[0]+box[2])//2
    y = patch[1] + y_min + (box[1]+box[3])//2
    centres.append((x,y))
    samples.append(frame.crop((x-48,y-46,x+48,y+46)))
if max(x for x,_ in centres[1:7]) - centres[0][0] < 22:
    raise ValueError('Aucun déplacement visible dans le navigateur.')
# L’impact doit avoir modifié le compteur en jeu.
hit = Image.open(folder / 'brune-impact.png').convert('RGB')
if ImageChops.difference(base.crop((815,523,872,548)),hit.crop((815,523,872,548))).getbbox() is None:
    raise ValueError('Le compteur ne montre aucun impact après le tir.')
sheet = Image.new('RGB', (8*96,92))
for i, sample in enumerate(samples):
    sheet.paste(sample,(i*96,0))
sheet.resize((1536,184), Image.Resampling.NEAREST).save(argv[2], quality=91)
