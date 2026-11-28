from pathlib import Path
from sys import argv
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont

folder = Path(argv[1])
names = ['repos', *(f'pas-{i}' for i in range(6)), 'visee']
frames = [Image.open(folder / f'brune-{name}.png').convert('RGB') for name in names]
# Le personnage parcourt cette bande. La médiane retrouve la couleur exacte des pavés à chaque pixel.
patch = (180, 292, 410, 421)
pixels = np.stack([np.asarray(frame.crop(patch), dtype=np.int16) for frame in frames])
ground = np.median(pixels, axis=0)
centres, samples = [], []
for name, frame, rgb in zip(names, frames, pixels):
    changed = np.abs(rgb - ground).max(axis=2) > 22
    red, green, blue = rgb.transpose(2,0,1)
    cloth = changed & (red - green > 35) & (red - blue > 20) & (blue > 31) & (red < 226)
    ys, xs = np.nonzero(cloth)
    if len(xs) < 18:
        raise ValueError(f'Cape non détectée dans {name} ({len(xs)} pixels)')
    x = patch[0] + int(np.median(xs))
    y = patch[1] + int(np.median(ys))
    centres.append((x,y))
    samples.append(frame.crop((x-43,y-37,x+43,y+37)))
    print(name, x, y, len(xs))
if centres[6][0]-centres[0][0] < 20 or any(x + 43 >= frames[0].width for x, _ in centres):
    raise ValueError('Le parcours ne montre pas la marche au centre de la cour.')
if max(abs(y-centres[0][1]) for _,y in centres[1:7]) > 15:
    raise ValueError('Le cadrage de la marche a quitté le personnage.')
impact = Image.open(folder / 'brune-impact.png').convert('RGB')
if ImageChops.difference(frames[0].crop((815,523,872,548)),impact.crop((815,523,872,548))).getbbox() is None:
    raise ValueError('Le compteur ne montre aucun impact après le tir.')
# Les faces bleues des anciens cristaux émergent puis dégagent la cour.
def ice_pixels(name):
    rgb = np.asarray(Image.open(folder / f'brune-{name}.png').convert('RGB').crop((401, 256, 599, 450)),dtype=np.int16)
    r,g,b = rgb.transpose(2,0,1)
    return int(((b-r>24) & (g-r>14) & (b>125)).sum())
if ice_pixels('prison') < ice_pixels('apres-gel') + 170:
    raise ValueError('La prison de glace doit se lire pendant le sort et disparaître après le gel.')
# Aperçu des gestes effectivement joués dans Chromium, au même grossissement.
gallery = [('Repos', 'repos'), ('Marche', 'marche'), ('Course', 'course'),
           ('Arc en recul', 'contresens'), ('Coup rapide', 'rapide'),
           ('Coup lourd', 'lourd'), ('Roulade', 'roulade')]
sheet = Image.new('RGB', (7*202, 171), '#202823')
pen = ImageDraw.Draw(sheet)
label_font = ImageFont.truetype('DejaVuSans.ttf', 16)
for i, (title, name) in enumerate(gallery):
    source = Image.open(folder / f'brune-{name}.png').convert('RGB')
    area = (228, 312, 386, 382)
    rgb = np.asarray(source.crop(area), dtype=np.int16)
    floor = ground[area[1]-patch[1]:area[3]-patch[1], area[0]-patch[0]:area[2]-patch[0]]
    r, g, b = rgb.transpose(2,0,1)
    cloth = (np.abs(rgb-floor).max(axis=2)>22) & (r-g>35) & (r-b>20) & (b>31) & (r<226)
    ys, xs = np.nonzero(cloth)
    if len(xs) < 12:
        raise ValueError(f'Personnage absent de la capture {name}')
    cx, cy = area[0]+int(np.median(xs)), area[1]+int(np.median(ys))
    if ImageChops.difference(source.crop((296,198,351,222)), frames[0].crop((296,198,351,222))).getbbox():
        raise ValueError(f'Le menu masque la capture {name}')
    thumb = source.crop((cx-50, cy-34, cx+51, cy+35)).resize((202,138), Image.Resampling.NEAREST)
    sheet.paste(thumb, (i*202,0))
    pen.text((i*202+101,154), title, font=label_font, anchor='mm', fill='#eee7d5')
sheet.save(argv[2], quality=94)
