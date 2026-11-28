const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const project = path.resolve(process.argv[3] || 'godot/aldoria');
const read = name => fs.readFileSync(path.join(project,'v1',name),'utf8');
(async()=>{
  const regions = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const mapping = {CSS:'interface.css',HOST:'hote.js',SKILLS:'competences.js',ILLUSTRATIONS:'illustrations.js',ART:'personnages.js',GAME:'regles.js'};
  let html=read('interface.html').replace('/*ALDORIA_PLANCHES*/',()=> 'window.aldoriaPlanches='+read('planches.json')+';');
  for(const [key,file] of Object.entries(mapping)){
    let value=read(file);
    if(key==='GAME') value=value.replace('window.__aldoria={', `window.exportElement = ([id,field,index])=>{
      const zone=ZD[id], raw=index<0?zone[field]:zone[field][index];
      const house=field==='houses', size=house?256:96;
      const can=document.createElement('canvas');can.width=size;can.height=size;
      const ctx=can.getContext('2d');ctx.translate(size/2-raw.x,size/2-raw.y);
      if(house){
        const v=raw.v||HOUSEV[(hashS(id)+index*3)%HOUSEV.length];
        drawHouse(ctx,{x:raw.x,y:raw.y,v,r:HOUSER[v]||46},zone);
      }else{
        const smith=field==='smith', r=smith?15:(raw.small?11:14);
        shadow(ctx,raw.x,raw.y,r);
        ART.humanoid(ctx,raw.x,raw.y,r,Math.PI/2,{paintBody:paintedCostume(BRUNE.villager({...raw,smith})),col:raw.col,head:'hair',hair:raw.hair,walk:0,glow:0,lw:1.2,main:smith?'hammer':undefined});
      }
      return can.toDataURL('image/png');
    };window.exportSol = id=>{
      const zone=ZD[id], canvas=document.createElement('canvas');
      canvas.width=WW;canvas.height=WH;
      const ctx=canvas.getContext('2d');ctx.fillStyle=zone.theme[0];ctx.fillRect(0,0,WW,WH);
      decor(ctx,zone,1,0,0);
      const result=canvas.toDataURL('image/webp',0.77);
      delete zone._ground;return result;
    };window.__aldoria={`);
    html=html.replace('/*ALDORIA_'+key+'*/',()=>value);
  }
  html=html.replace('/*ALDORIA_SETTINGS*/',()=> 'window.aldoriaSettings='+JSON.stringify({regions,saves:{},moderator:false,paintGround:false})+';');
  const folder=path.join(project,'sols'), stamp=path.join(folder,'recette.txt');
  const digest=require('node:crypto').createHash('sha256')
    .update(JSON.stringify(regions)).update(read('illustrations.js')).update(read('regles.js'))
    .update(read('planches.json')).update(fs.readFileSync(__filename)).digest('hex');
  const current=fs.existsSync(stamp)&&fs.readFileSync(stamp,'utf8')===digest;
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage();await page.route(/^https?:/,r=>r.abort());
    await page.setContent(html,{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>window.aldoriaIllustrations.ready);
    fs.mkdirSync(folder,{recursive:true});
    const previews=path.join(project,'apercus');fs.mkdirSync(previews,{recursive:true});
    for(const [id,zone] of Object.entries(regions)){
      const elements=[...(zone.houses||[]).map((_,i)=>['houses',i]),...(zone.npcs||[]).map((_,i)=>['npcs',i])];
      if(zone.smith)elements.push(['smith',-1]);
      for(const [field,index] of elements){
        const png=await page.evaluate(arg=>window.exportElement(arg),[id,field,index]);
        fs.writeFileSync(path.join(previews,id.replace(',','_')+'_'+field+'_'+index+'.png'),Buffer.from(png.split(',')[1],'base64'));
      }
      const file=path.join(folder,id.replace(',','_')+'.webp');
      if(current&&fs.existsSync(file))continue;
      const data=await page.evaluate(k=>window.exportSol(k),id);
      fs.writeFileSync(file,Buffer.from(data.split(',')[1],'base64'));
    }
    fs.writeFileSync(stamp,digest);
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
