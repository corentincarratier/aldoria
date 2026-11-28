// Vérifier la composition à l'écran, y compris les pixels entre les objets du jeu.
const {Builder, By} = require('selenium-webdriver');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const chrome = require('selenium-webdriver/chrome');
const fs = require('node:fs');
const path = require('node:path');

const url = process.env.ALDORIA_URL || 'http://127.0.0.1:8090/essais/godot-v1/';
const ids = Object.keys(JSON.parse(fs.readFileSync('godot/aldoria/regions/index.json', 'utf8')));

// Safari sur le Mac virtuel demande une autorisation native pour lire un canevas.
// Observer son drawImage effectif et comparer les pixels de la texture qu'il vient d'afficher.
async function verifierTexturesSafari(pilote){
  const http=require('node:http');
  const textures=new Map();
  const serveur=http.createServer((req,res)=>{
    res.setHeader('Access-Control-Allow-Origin',new URL(url).origin);
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    if(req.method==='OPTIONS'){res.writeHead(204);res.end();return}
    const id=req.url.slice(1);
    if(req.method!=='POST'||!ids.includes(id)||req.headers.origin!==new URL(url).origin){
      res.writeHead(400);res.end();return;
    }
    const chunks=[];let total=0;
    req.on('data',b=>{total+=b.length;if(total>16*1024*1024)req.destroy();else chunks.push(b)});
    req.on('end',()=>{textures.set(id,Buffer.concat(chunks));res.writeHead(204);res.end()});
  });
  await new Promise((resolve,reject)=>{serveur.once('error',reject);serveur.listen(0,'127.0.0.1',resolve)});
  const endpoint='http://127.0.0.1:'+serveur.address().port+'/';
  try{
    for(const id of ids){
      console.log('Safari · visite',id);
      await pilote.executeScript(function(id,endpoint){
        const w=document.getElementById('aldoria-interface').contentWindow,a=w.__aldoria,host=w.aldoriaHost;
        if(!host.observerTexture){
          host.observerTexture=true;
          const origine=host.dessinerSol;
          host.dessinerSol=function(c,zone){
            const ok=origine.call(this,c,zone),sonde=this.sonde;
            if(ok&&sonde?.id===zone.id&&!sonde.envoi&&c.canvas===w.document.getElementById('cv')){
              sonde.envoi=true;
              w.fetch(this.sol.image.src).then(r=>r.arrayBuffer()).then(body=>w.fetch(sonde.url,{method:'POST',body})).then(r=>{if(!r.ok)throw Error(String(r.status))}).catch(e=>{sonde.erreur=String(e)});
            }
            return ok;
          };
        }
        host.sonde={id,url:endpoint+id};
        a.G.paused=false;a.G.god=true;a.G.dlg=null;a.enterZone(id,{x:800,y:550});a.G.dlg=null;a.G.over=false;
      },id,endpoint);
      const deadline=Date.now()+24000;
      while(!textures.has(id)&&Date.now()<deadline)await new Promise(r=>setTimeout(r,120));
      if(!textures.has(id)){
        const diagnostic=await pilote.executeScript("const w=document.getElementById('aldoria-interface').contentWindow;return [w.__aldoria.G.zid,w.__aldoria.G.paused,w.aldoriaHost.sol?.id,w.aldoriaHost.sonde]");
        throw Error('Texture Safari '+id+' '+JSON.stringify(diagnostic));
      }
      const lecture=x=>sharp(x).removeAlpha().toColourspace('srgb').resize(100,69,{fit:'fill'}).raw().toBuffer();
      const [vu,reference]=await Promise.all([lecture(textures.get(id)),lecture(path.join('godot/aldoria/sols',id.replace(',','_')+'.webp'))]);
      textures.delete(id);let identiques=0;
      for(let k=0;k<vu.length;k+=3)if(Math.max(Math.abs(vu[k]-reference[k]),Math.abs(vu[k+1]-reference[k+1]),Math.abs(vu[k+2]-reference[k+2]))<=15)identiques++;
      const score=identiques/(vu.length/3);console.log('Safari · texture dessinée',id,Math.round(score*100)+' %');assert.ok(score>.94,'Sol incorrect dans Safari : '+id);
    }
    console.log('safari SOLS_38_TEXTURES_DESSINEES_OK');
  }finally{serveur.closeAllConnections();await new Promise(r=>serveur.close(r))}
}

async function verifier(navigateur) {
  let builder = new Builder().forBrowser(navigateur);
  if(navigateur==='chrome' && process.platform==='linux'){
    const options=new chrome.Options().addArguments('--headless=new','--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage');
    builder=builder.setChromeOptions(options);
  }
  const pilote=await builder.build();
  try {
    await pilote.manage().setTimeouts({script:30000});
    await pilote.manage().window().setRect({width:1050,height:780});
    await pilote.get(url);
    await pilote.wait(() => pilote.executeScript(
      "return !!document.querySelector('#aldoria-interface')?.contentWindow?.__aldoria?.G?.t"
    ), 90000);
    if(navigateur==='safari'){await verifierTexturesSafari(pilote);return}
    const cadre = await pilote.findElement(By.id('aldoria-interface'));
    await pilote.switchTo().frame(cadre);
    const lecturePixels=await pilote.executeScript(function(){
      const essai=document.createElement('canvas');essai.width=8;essai.height=8;
      const ctx=essai.getContext('2d');ctx.fillStyle='#ff0000';ctx.fillRect(0,0,8,8);
      try{return ctx.getImageData(0,0,1,1).data[0]===255 && essai.toDataURL().length>22}
      catch(e){return false}
    });
    await pilote.switchTo().defaultContent();
    if(!lecturePixels && navigateur!=='safari')throw Error('Le navigateur de contrôle ne fournit aucun pixel, même pour un témoin rouge.');
    console.log(navigateur,lecturePixels?'lecture des pixels de la partie':'lecture des canevas indisponible sur ce Mac virtuel, vérification du dessin et de la texture');
    async function mesurer(id,avecPersonnages) {
      await pilote.switchTo().frame(cadre);
      await pilote.executeScript(function(id,lecturePixels){
        const a=window.__aldoria,g=a.G;
        window.controleSol={id,capture:null};
        if(!window.surfaceObservee){
          window.surfaceObservee=true;
          const host=window.aldoriaHost, dessiner=host.dessinerSol;
          host.dessinerSol=function(ctx,zone){
            const ok=dessiner.call(this,ctx,zone), sonde=window.controleSol;
            if(ok && sonde && !sonde.capture && sonde.id===zone.id && ctx.canvas===document.getElementById('cv')) {
              sonde.capture={image:lecturePixels?ctx.canvas.toDataURL('image/png'):this.sol.image.src,x:g.ox,y:g.oy,k:g.sc,w:g.vw,h:g.vh};
            }
            return ok;
          };
        }
        g.paused=false;g.dlg=null;g.god=true;a.enterZone(id,{x:800,y:550});
        g.dlg=null;g.banner=null;g.over=false;
      },id,lecturePixels);
      await pilote.wait(()=>pilote.executeScript("return !!window.controleSol.capture && window.__aldoria.G.zoneT>0.09"),20000);
      const camera=await pilote.executeScript(function(avecPersonnages){
        const g=window.__aldoria.G;g.paused=true;
        if(!avecPersonnages)return window.controleSol.capture;
        const cv=document.getElementById('cv');
        return {image:cv.toDataURL('image/png'),x:g.ox,y:g.oy,k:g.sc,w:g.vw,h:g.vh};
      },avecPersonnages && lecturePixels);
      await pilote.switchTo().defaultContent();
      const png=Buffer.from(camera.image.split(',')[1],'base64');
      delete camera.image;
      const image=await sharp(png).toColourspace('srgb').removeAlpha().raw().toBuffer({resolveWithObject:true});
      const sol=await sharp(path.join('godot/aldoria/sols',id.replace(',','_')+'.webp')).toColourspace('srgb').removeAlpha().raw().toBuffer({resolveWithObject:true});
      let total=0, correct=0;
      const exemples=[];
      for(let y=160;y<camera.h-95;y+=27)for(let x=75;x<camera.w-75;x+=31){
        const wx=Math.floor((x-camera.x)/camera.k),wy=Math.floor((y-camera.y)/camera.k);
        const px=lecturePixels?Math.floor(x*image.info.width/camera.w):wx,py=lecturePixels?Math.floor(y*image.info.height/camera.h):wy;
        if(wx<1||wy<1||wx>=sol.info.width-1||wy>=sol.info.height-1||px<0||py<0||px>=image.info.width||py>=image.info.height)continue;
        const ref=(wy*sol.info.width+wx)*sol.info.channels,actual=(py*image.info.width+px)*image.info.channels;
        const attendu=sol.data.subarray(ref,ref+3),vu=image.data.subarray(actual,actual+3);
        const ecart=Math.max(...Array.from(attendu,(couleur,k)=>Math.abs(couleur-vu[k])));
        total++;
        if(ecart<=20)correct++;
        else if(exemples.length<2)exemples.push([Array.from(attendu),Array.from(vu)]);
      }
      const score={fraction:correct/total,exemples,total,camera};
      if(lecturePixels && (score.fraction<0.80 || (id==='2,3'&&avecPersonnages))){
        fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','aldoria-sol-'+navigateur+'-'+id.replace(',','_')+'.png'),png);
      }
      assert.ok(total>=30,'Dimensions de rendu '+id+' '+JSON.stringify(score));
      return score;
    }
    for(const id of ['2,3','2,2']){
      const mesure=await mesurer(id,true);
      console.log(navigateur,id,lecturePixels?'en jeu':'texture dessinée',JSON.stringify(mesure));
      assert.ok(mesure.fraction>=0.55,'Sol invisible en jeu '+id);
    }
    for(const id of ids){
      const mesure=await mesurer(id,false);
      console.log(navigateur,id,Math.round(100*mesure.fraction)+' %');
      assert.ok(mesure.fraction>=0.9,'Texture en jeu différente du sol de '+id+': '+JSON.stringify(mesure));
    }
    console.log(navigateur,lecturePixels?'SOLS_38_PIXELS_OK':'SOLS_38_TEXTURES_DESSINEES_OK');
  }catch(error){
    if(error.name==='UnexpectedAlertOpenError'){
      try{console.error('Message natif du navigateur',await pilote.switchTo().alert().getText())}catch{}
    }
    throw error;
  }finally{await pilote.quit()}
}
verifier(process.argv[2]).catch(e=>{console.error(e);process.exitCode=1});
