const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const project = path.resolve('godot/aldoria');
const read = name => fs.readFileSync(path.join(project,'v1',name),'utf8');
(async()=>{
  const regions = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const mapping = {CSS:'interface.css',HOST:'hote.js',SKILLS:'competences.js',ART:'personnages.js',GAME:'regles.js'};
  let html=read('interface.html');
  for(const [key,file] of Object.entries(mapping)){
    let value=read(file);
    if(key==='GAME') value=value.replace('window.__aldoria={', `window.exportSol = id=>{
      const zone=ZD[id], canvas=document.createElement('canvas');
      canvas.width=WW;canvas.height=WH;
      const ctx=canvas.getContext('2d');ctx.fillStyle=zone.theme[0];ctx.fillRect(0,0,WW,WH);
      decor(ctx,zone,1,0,0);
      const result=canvas.toDataURL('image/webp',0.91);
      delete zone._ground;return result;
    };window.__aldoria={`);
    html=html.replace('/*ALDORIA_'+key+'*/',()=>value);
  }
  html=html.replace('/*ALDORIA_SETTINGS*/',()=> 'window.aldoriaSettings='+JSON.stringify({regions,saves:{},moderator:false,paintGround:false})+';');
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage();await page.route(/^https?:/,r=>r.abort());
    await page.setContent(html,{waitUntil:'domcontentloaded'});
    const folder=path.join(project,'sols');fs.mkdirSync(folder,{recursive:true});
    for(const id of Object.keys(regions)){
      const file=path.join(folder,id.replace(',','_')+'.webp');
      if(fs.existsSync(file))continue;
      const data=await page.evaluate(k=>window.exportSol(k),id);
      fs.writeFileSync(file,Buffer.from(data.split(',')[1],'base64'));
    }
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
