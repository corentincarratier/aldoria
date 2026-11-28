"""Assemble la cour à partir des sources V1 et Brune de la même révision."""
import base64
import json
import shutil
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
base = Path(sys.argv[2]) if len(sys.argv) > 2 else here.parent / 'aldoria'
court = here.parent / 'brune'
dest = Path(sys.argv[1])
shutil.copytree(base, dest, ignore=shutil.ignore_patterns('.godot', '*.import', '*.uid'))
for item in court.iterdir():
    if item.is_file() and item.suffix in {'.tscn', '.gd'} and item.name != 'verification.gd':
        shutil.copy2(item, dest / item.name)
shutil.copytree(court / 'art', dest / 'art')
for name in ('lancement.gd','lancement.tscn','partie.gd','partie.tscn','cour-region.tscn'):
    shutil.copy2(here / name, dest / name)
project = (dest / 'project.godot').read_text()
project = project.replace('res://jeu.tscn','res://lancement.tscn').replace('aldoria-v1-godot','aldoria-brune-partie').replace('Aldoria V1 · Copie Godot','Aldoria · Cour de Brune')
(dest / 'project.godot').write_text(project.replace('run/main_scene=', 'run/max_fps=30\nrun/main_scene='))
regions = dest / 'regions/index.json'
index = json.loads(regions.read_text())
index['cour-brune'] = 'res://cour-region.tscn'
regions.write_text(json.dumps(index,ensure_ascii=False))
assets = {}
for key, name in [('cour','cour-textile'),('eau','source-vivante'),('pas','pas-brune'),('cristaux','prison-cristaux')]:
    assets[key] = 'data:image/webp;base64,' + base64.b64encode((court/'art'/f'{name}.webp').read_bytes()).decode('ascii')
scenario = (here/'scenario.js').read_text().replace('/*IMAGES_BRUNE*/{}',json.dumps(assets))
(dest/'v1/scenario.js').write_text(scenario)
