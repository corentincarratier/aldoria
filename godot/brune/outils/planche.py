from pathlib import Path
from sys import argv
import numpy as np
from PIL import Image, ImageChops

folder = Path(argv[1])
names = ['repos', *(f'pas-{i}' for i in range(6)), 'visee']
frames = [Image.open(folder / f'brune-{name}.png').convert('RGB') for name in names]
# Le personnage parcourt cette bande. La médiane retrouve la couleur exacte des pavés à chaque pixel.
patch = (180, 300, 888, 499)
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
if not 20 < centres[6][0]-centres[0][0] < 370:
    raise ValueError('Le parcours ne montre pas la marche au centre de la cour.')
if max(abs(y-centres[0][1]) for _,y in centres[1:7]) > 15:
    raise ValueError('Le cadrage de la marche a quitté le personnage.')
impact = Image.open(folder / 'brune-impact.png').convert('RGB')
if ImageChops.difference(frames[0].crop((815,523,872,548)),impact.crop((815,523,872,548))).getbbox() is None:
    raise ValueError('Le compteur ne montre aucun impact après le tir.')
sheet = Image.new('RGB', (8*86,74))
for i, sample in enumerate(samples):
    sheet.paste(sample,(i*86,0))
sheet.resize((1376,148), Image.Resampling.NEAREST).save(argv[2], quality=94)
