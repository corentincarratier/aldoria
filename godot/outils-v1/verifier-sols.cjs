// Vérifier la composition à l'écran, y compris les pixels entre les objets du jeu.
const {Builder, By} = require('selenium-webdriver');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const url = process.env.ALDORIA_URL || 'http://127.0.0.1:8090/essais/godot-v1/';
const ids = Object.keys(JSON.parse(fs.readFileSync('godot/aldoria/regions/index.json', 'utf8')));

async function verifier(navigateur) {
  const pilote = await new Builder().forBrowser(navigateur).build();
  try {
    await pilote.manage().setTimeouts({script:30000});
    await pilote.manage().window().setRect({width:1050,height:780});
    await pilote.get(url);
    await pilote.wait(() => pilote.executeScript(
      "return !!document.querySelector('#aldoria-interface')?.contentWindow?.__aldoria?.G?.t"
    ), 90000);
    const cadre = await pilote.findElement(By.id('aldoria-interface'));
    async function mesurer(id,avecPersonnages) {
      const rect = await pilote.executeScript(function(el){
        const r=el.getBoundingClientRect();
        return {x:r.x,y:r.y,w:window.innerWidth,h:window.innerHeight};
      },cadre);
      await pilote.switchTo().frame(cadre);
      await pilote.executeScript(function(id, avecPersonnages) {
        const a=window.__aldoria, g=a.G;
        g.paused=false;g.dlg=null;g.god=true;
        a.enterZone(id,{x:800,y:550});
        g.dlg=null;g.banner=null;g.over=false;
        let style=document.getElementById('controle-sol');
        if(!style){style=document.createElement('style');style.id='controle-sol';document.head.appendChild(style);}
        style.textContent=avecPersonnages?'':'#scr-game > * {visibility:hidden !important}';
      },id,avecPersonnages);
      await pilote.wait(()=>pilote.executeScript("return window.__aldoria.G.zoneT>0.09"),12000);
      const ech=await pilote.executeAsyncScript(function(id,avecPersonnages,fini){
        const g=window.__aldoria.G;g.paused=true;
        const img=new Image();
        img.onload=()=>{
          try{
            const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;
            const ctx=cv.getContext('2d');ctx.drawImage(img,0,0);
            const ref=ctx.getImageData(0,0,cv.width,cv.height).data;
            const jeu=document.getElementById('cv'), fg=avecPersonnages?jeu.getContext('2d').getImageData(0,0,jeu.width,jeu.height).data:null;
            const points=[];
            for(let y=160;y<g.vh-100;y+=29)for(let x=70;x<g.vw-70;x+=33){
              const wx=Math.floor((x-g.ox)/g.sc),wy=Math.floor((y-g.oy)/g.sc);
              if(wx<1||wy<1||wx>=cv.width-1||wy>=cv.height-1)continue;
              const i=4*(wy*cv.width+wx);
              if(fg){
                const k=4*(Math.floor(y*jeu.height/g.vh)*jeu.width+Math.floor(x*jeu.width/g.vw));
                if(fg[k+3]>12)continue;
              }
              points.push([x,y,ref[i],ref[i+1],ref[i+2]]);
            }
            cv.width=1;cv.height=1;fini({points});
          }catch(e){fini({erreur:String(e)})}
        };
        img.onerror=()=>fini({erreur:'Image de référence absente '+id});
        img.src=new URL('../../godot/aldoria/sols/'+id.replace(',','_')+'.webp',window.parent.location.href).href;
      },id,avecPersonnages);
      await pilote.switchTo().defaultContent();
      assert.ok(!ech.erreur,ech.erreur);
      assert.ok(ech.points.length>=20,'Trop peu de points visibles dans '+id);
      const png=await pilote.takeScreenshot();
      const score=await pilote.executeAsyncScript(function(png,rect,points,fini){
        const img=new Image();
        img.onload=()=>{
          const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;
          const ctx=cv.getContext('2d');ctx.drawImage(img,0,0);
          const pixels=ctx.getImageData(0,0,cv.width,cv.height).data;
          let correct=0;const exemples=[];
          for(const [x,y,r,g,b] of points){
            const px=Math.floor((x+rect.x)*cv.width/rect.w),py=Math.floor((y+rect.y)*cv.height/rect.h);
            const i=4*(py*cv.width+px);
            const delta=Math.max(Math.abs(pixels[i]-r),Math.abs(pixels[i+1]-g),Math.abs(pixels[i+2]-b));
            if(delta<=20)correct++;else if(exemples.length<2)exemples.push([[r,g,b],Array.from(pixels.slice(i,i+3))]);
          }
          cv.width=1;cv.height=1;fini({fraction:correct/points.length,exemples});
        };
        img.onerror=()=>fini({fraction:0,exemples:['capture illisible']});
        img.src='data:image/png;base64,'+png;
      },png,rect,ech.points);
      if(score.fraction < 0.73 || (id==='2,3'&&avecPersonnages)){
        fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','aldoria-sol-'+navigateur+'-'+id.replace(',','_')+'.png'),Buffer.from(png,'base64'));
      }
      return score;
    }
    // Un navigateur peut peindre un fond opaque quand le cadre parent et son document ont des thèmes différents.
    const scheme=await pilote.executeScript("return arguments[0].style.colorScheme",cadre);
    await pilote.executeScript("arguments[0].style.removeProperty('color-scheme')",cadre);
    const ancien=await mesurer('2,3',true);
    console.log(navigateur,'ancienne composition Plaine du Fleuve',JSON.stringify(ancien));
    await pilote.executeScript("arguments[0].style.colorScheme=arguments[1]",cadre,scheme);
    for(const id of ['2,3','2,2']){
      const mesure=await mesurer(id,true);
      console.log(navigateur,id,'en jeu',JSON.stringify(mesure));
      assert.ok(mesure.fraction>=0.73,'Sol invisible en jeu '+id);
    }
    for(const id of ids){
      const mesure=await mesurer(id,false);
      console.log(navigateur,id,Math.round(100*mesure.fraction)+' %');
      assert.ok(mesure.fraction>=0.8,'Texture en jeu différente du sol de '+id+': '+JSON.stringify(mesure));
    }
    console.log(navigateur,'SOLS_38_OK');
  }finally{await pilote.quit()}
}
verifier(process.argv[2]).catch(e=>{console.error(e);process.exitCode=1});
