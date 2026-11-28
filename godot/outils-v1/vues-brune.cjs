const sharp=require('sharp');
const fs=require('node:fs');
const path=require('node:path');

module.exports=async function vuesDuMonde(game){
  const panels=[];
  const regions=[
    ['2,6','Hameau de Brune',800,550],['0,6','Marais des Brumes',690,420],['4,3','Pic des Corbeaux',800,505],
    ['4,6','Plage des Naufrages',980,600],['0,1','Caldeira',800,512],['3,1','Ville du Roi',800,570]
  ];
  for(const [id,name,x,y] of regions){
    console.log('Photographie',id,name);
    await game.evaluate(({id,x,y})=>{
      const a=window.__aldoria,g=a.G;
      g.god=true;g.paused=false;g.over=false;g.dlg=null;
      const host=window.aldoriaHost;
      if(!host.vueObservee){
        host.vueObservee=true;
        const dessiner=host.dessinerSol;
        host.dessinerSol=function(ctx,zone){
          const ok=dessiner.call(this,ctx,zone);
          if(ok)this.derniereVue=zone.id;
          return ok;
        };
      }
      host.derniereVue=null;host.clockActive=true;
      a.enterZone(id,{x,y});g.raidCall=0;g.dlg=null;g.banner=null;
    },{id,x,y});
    try {
      await game.waitForFunction(id=>window.aldoriaHost.derniereVue===id,id,{timeout:25000});
    } catch(error){
      console.error('État du rendu',await game.evaluate(()=>({zone:__aldoria.G.zid,sol:aldoriaHost.sol?.id,largeur:aldoriaHost.sol?.image.naturalWidth,zoneT:__aldoria.G.zoneT,pause:__aldoria.G.paused,dialogue:!!__aldoria.G.dlg,fin:__aldoria.G.over,vue:aldoriaHost.derniereVue})));
      throw error;
    }
    const frame=await game.evaluate(()=>document.querySelector('#cv').toDataURL('image/png'));
    const pixels=Buffer.from(frame.split(',')[1],'base64');
    const picture=await sharp(pixels).resize(660,462,{fit:'contain',background:'#292723'}).webp({quality:88}).toBuffer();
    const title=Buffer.from('<svg width="660" height="36" xmlns="http://www.w3.org/2000/svg"><text x="12" y="25" font-family="sans-serif" font-size="19" fill="#efe1c8">'+name+'</text></svg>');
    const i=panels.length/2,left=(i%2)*660,top=Math.floor(i/2)*498;
    panels.push({input:picture,left,top},{input:title,left,top:top+462});
  }
  const target=path.join('essais','godot-v1','regions-brune.webp');
  await sharp({create:{width:1320,height:1494,channels:3,background:'#292723'}}).composite(panels).webp({quality:89}).toFile(target);
  console.log('Six vues de la partie',fs.statSync(target).size);
};
