from copy import copy
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED, ZIP_DEFLATED
import gzip, os, re, shutil, sys

base=Path('godot/aldoria')
tools=Path('godot/outils-v1')
public=Path('essais/godot-v1')
dest=public/'editeur'
dest.mkdir(parents=True,exist_ok=True)
editor_zip=Path(sys.argv[1])
desktop_zip=Path(sys.argv[2])
edition=os.environ.get('GITHUB_SHA','local')[:12]
files=[p for p in base.rglob('*') if p.is_file() and not any(x.startswith('.') for x in p.relative_to(base).parts) and not p.name.endswith(('.import','.uid')) and p.name!='v1-extraction.gd']
with ZipFile(public/'projet-web.zip','w',ZIP_STORED) as web, ZipFile(public/'Aldoria-Godot.zip','w',ZIP_DEFLATED,compresslevel=6) as desktop:
    for file in sorted(files):
        key=str(file.relative_to(base));web.write(file,key);desktop.write(file,'Aldoria/'+key)
    with ZipFile(desktop_zip) as wry:
        for entry in wry.infolist():
            name=entry.filename
            if 'addons/' in name and not entry.is_dir() and not name.startswith('__MACOSX/'):
                item = copy(entry)
                item.filename = 'Aldoria/' + name[name.index('addons/'):]
                if item.filename.endswith('/libgodot_wry') and (item.external_attr >> 28) != 10:
                    item.create_system = 3
                    item.external_attr = (0o100755 << 16)
                desktop.writestr(item, wry.read(entry))
        desktop.write(tools/'LICENSE-WRY.txt', 'Aldoria/addons/godot_wry/LICENSE.txt')
        assert any(k.endswith('.gdextension') for k in desktop.namelist()), 'Godot WRY absent'
with ZipFile(editor_zip) as z:
    for n in z.namelist():
        key=Path(n).name
        if not key or key.startswith('.') or n.endswith('/'): continue
        blob=z.read(n)
        if key.endswith('.html') and b'function startEditor(zip)' in blob:
            text=blob.decode()
            text=text.replace("editor.init('godot.editor').then(function () {","editor.init('godot.editor').then(async function () {")
            token="const args = ['--project-manager', '--single-window'];"
            assert text.count(token)==1, 'Entrée éditeur incompatible'
            text=text.replace(token,"const folder='/home/web_user/projects/Aldoria-"+edition+"';\nconst seed=await installerAldoria(editor,folder,'"+edition+"');\nconst args=['--editor','--single-window','--path',folder,folder+'/regions/2_6_hameau_de_brune.tscn'];")
            text=text.replace("setStatusMode('hidden');\n\t\t\t\tinitializing = false;", "setStatusMode('hidden');\n                if(seed)localStorage.setItem(seed,'1');\n                initializing = false;")
            text=text.replace('</body>', '<script src="precharger.js"></script><script>window.addEventListener("load",()=>{if(!crossOriginIsolated){location.replace("./");return;}closeWelcomeModal();startEditor();});</script></body>')
            (dest/'godot.html').write_text(text)
        elif key=='godot.editor.wasm':
            (dest/(key+'.gz')).write_bytes(gzip.compress(blob,compresslevel=6,mtime=0))
        elif key not in ['service.worker.js','demo.zip'] and not key.endswith('.wasm'):
            (dest/key).write_bytes(blob)
assert (dest/'godot.html').exists() and (dest/'godot.editor.wasm.gz').exists()
for src,to in [('editeur-sw.js','service.worker.js'),('ouvrir-editeur.html','index.html'),('precharger.js','precharger.js')]:
    shutil.copyfile(tools/src,dest/to)

shutil.copyfile(tools/'LICENSE-Godot.txt', dest/'LICENSE.txt')
