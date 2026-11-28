const {chromium}=require('playwright');
const sharp=require('sharp');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const out='essais/godot-v1';
async function planche(items,name,cols,w,h){
  const panels=[],row=h+48;
  for(const [i,item] of items.entries()){
    const left=i%cols*w,top=Math.floor(i/cols)*row;
    const pic=await sharp(Buffer.from(item.image.split(',')[1],'base64')).resize(w,h,{fit:'contain',background:'#38382f'}).png().toBuffer();
    const words=item.label.split(' '),lines=[''];
    for(const word of words){
      const last=lines.length-1,candidate=lines[last]?lines[last]+' '+word:word;
      if(candidate.length>w/7.2&&lines[last])lines.push(word);else lines[last]=candidate;
    }
    const labels=lines.map((line,i)=>'<text x="6" y="'+(18+i*16)+'" fill="#f0dfc3" font-family="sans-serif" font-size="13">'+line.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</text>').join('');
    const title=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="48">'+labels+'</svg>');
    panels.push({input:pic,left,top},{input:title,left,top:top+h});
  }
  await sharp({create:{width:w*cols,height:row*Math.ceil(items.length/cols),channels:3,background:'#292820'}}).composite(panels).webp({quality:88}).toFile(path.join(out,name+'.webp'));
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:700}});
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
  await page.addInitScript(()=>{
    if(window!==window.top)return;
    let api;
    Object.defineProperty(window,'AldoriaGodot',{configurable:true,get(){return api},set(value){
      const mount=value.mount;
      value.mount=function(html,save){
        const token='window.__aldoria={get G()';
        if(!html.includes(token)||!html.includes("window.aldoriaPrison={")||!html.includes('function hand(c,x,y,r,skin,angle=0)'))throw Error('Export inattendu');
        const test='window.__revue={draw,camera,enemyIcon,spawnE,startAct,runAct,abil,moveLabel,nom:id=>B[id].name};';
        return mount.call(this,html.replace(token,test+token),save);
      };api=value;
    }});
  });
  await page.goto('http://127.0.0.1:8090/essais/godot-v1/');
  await page.waitForFunction(()=>document.querySelector('#aldoria-interface')?.contentWindow?.__aldoria?.G?.t>0,null,{timeout:100000});
  const game=await (await page.locator('#aldoria-interface').elementHandle()).contentFrame();
  await game.evaluate(()=>{const a=__aldoria; a.enterZone('2,6',{x:620,y:755});a.G.dlg=null;a.G.paused=false;a.G.god=true;});
  await game.waitForFunction(()=>aldoriaHost.archerReady&&aldoriaHost.sol?.id==='2,6'&&aldoriaHost.sol.image.naturalWidth>0);
  const ids=JSON.parse(fs.readFileSync('godot/outils-v1/capacites.json','utf8'));
  const result=await game.evaluate(async ids=>{
    await aldoriaIllustrations.ready;
    const a=__aldoria,v=__revue,g=a.G,p=g.p;
    const base={x:620,y:755},cv=document.querySelector('#cv');
    function cadre(x,y){
      const tile=document.createElement('canvas');tile.width=240;tile.height=170;
      const ctx=tile.getContext('2d'),factor=cv.width/g.vw,fw=350*g.sc*factor,fh=fw*170/240;
      ctx.drawImage(cv,(g.ox+x*g.sc)*factor-fw/2,(g.oy+y*g.sc)*factor-fh/2,fw,fh,0,0,240,170);
      return tile.toDataURL('image/webp',.86);
    }
    function vide(){
      for(const key of ['E','A','P','Z','TG','F','W','tmp','bub','fires'])g[key]=[];
      Object.assign(p,base,{blind:0,root:0,stun:0,inv:0,roll:null,rollT:0,recoil:null,chan:null,buffs:{},inForest:false,inMarsh:false});
      Object.assign(g,{fogT:0,raidCall:0,hitstop:0,finishSlow:0,paused:false,god:true,dlg:null,over:false,banner:null,chg:null});
      v.camera(true);
    }
    const ennemis=[],actions=[],sorts=[],coups=[];
    for(const [type,d] of Object.entries(a.ET)){
      const tile=document.createElement('canvas');tile.width=140;tile.height=100;
      const c=tile.getContext('2d');c.fillStyle='#454636';c.fillRect(0,0,140,100);
      v.enemyIcon(c,type,64,50,23);
      ennemis.push({label:d.n,image:tile.toDataURL('image/webp',.90)});
      for(const m of Object.keys(d.mv)){
        try{
          vide();const e=v.spawnE(type,base.x+105,base.y);e.state='hunt';e.sleeping=false;
          v.startAct(e,m);if(e.act.ph!=='tell')throw Error('annonce absente');e.act.feintAt=0;
          const phases=new Set(['tell']);let n=0;
          while(e.act&&n++<500){
            g.t+=.04;v.runAct(e,.04);
            if(e.act){phases.add(e.act.ph);e.act.feintAt=0;}
            if(!Number.isFinite(e.x+e.y))throw Error('position invalide');
            if(n===4&&coups.length<16&&(!coups.some(x=>x.type===type))&&(d.boss||['loup','archere','garde_lance','scorpion','sorcier','brute'].includes(type))){
              v.draw();coups.push({type,label:d.n+' · '+(({curve:'tir courbe',icewall:'mur de glace',thrust:'estoc',spikes:'pics de roche',clones:'doubles de brume'})[m]||v.moveLabel(m)),image:cadre(base.x+52,base.y-4)});
            }
          }
          if(e.act)throw Error('action bloquée');
          actions.push([type,m,[...phases]]);
        }catch(error){throw Error(type+' / '+m+' : '+error.message+' '+error.stack);}
      }
    }
    for(const id of ids){
      vide();g.slots[0]=id;g.cds[0]=0;
      const e=v.spawnE('garde_lance',base.x+70,base.y);e.hp=e.hpMax=5000;e.root=4;
      a.cast(0,{x:e.x,y:e.y});
      if(!g.F.some(f=>f.type==='skillMotion'&&f.id===id)||!(g.cds[0]>0))throw Error('Sort inactif '+id);
      for(let j=0;j<(id==='GL6'?26:5);j++)a.update(.035);
      v.draw();sorts.push({label:v.nom(id),image:cadre((e.x+p.x)/2,(e.y+p.y)/2-4)});
    }
    return {ennemis,actions,sorts,coups};
  },ids);
  assert.equal(result.ennemis.length,49);assert.equal(result.sorts.length,35);assert.deepEqual(errors,[]);
  await planche(result.ennemis,'revue-bestiaire',7,155,106);
  await planche(result.sorts,'revue-competences',5,240,170);
  await planche(result.coups,'revue-combats',4,240,170);
  fs.writeFileSync(path.join(out,'revue-actions.json'),JSON.stringify({ennemis:result.ennemis.length,competences:result.sorts.map(s=>s.label),actions:result.actions},null,2)+'\n');
  console.log('REVUE_JOUEE',result.ennemis.length,'entrées du bestiaire,',result.actions.length,'couples adversaire/mouvement,',result.sorts.length,'sorts,',result.coups.length,'vues de combat');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
