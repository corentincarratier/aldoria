const assert = require('node:assert/strict');

module.exports = async function verifierInclinaison(page,url) {
  const entree = new URL(url);
  entree.searchParams.set('vue','inclinee');
  // Observer l'alpha réellement utilisé par le canevas de jeu, après le tri des plans.
  await page.addInitScript(() => {
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    const alpha = window.alphaPremierPlan = {};
    CanvasRenderingContext2D.prototype.drawImage = function(image,x,y,w,h,...rest) {
      if(this.canvas.id==='cv' && rest.length===0 && image instanceof HTMLCanvasElement){
        if(w===184 && h===126) alpha.mur=this.globalAlpha;
        if(w===170 && h===177) alpha.arbre=this.globalAlpha;
        if(x>1100 && w>400 && h>350) alpha.toit=this.globalAlpha;
      }
      return draw.apply(this,arguments);
    };
  });
  await page.goto(entree.href);
  const partie = async () => {
    await page.waitForFunction(()=>document.querySelector('#aldoria-interface')?.contentWindow?.__aldoria?.G?.t>0,null,{timeout:85000});
    return (await page.locator('#aldoria-interface').elementHandle()).contentFrame();
  };
  let jeu = await partie();
  assert.deepEqual(await jeu.evaluate(()=>[__aldoria.S.test,__aldoria.S.weapon,__aldoria.G.slots,__aldoria.G.zid]),
    [true,'R',['AI8','GL6','TE8'],'cour-brune']);
  await jeu.waitForFunction(()=>window.alphaPremierPlan.mur>0);
  await jeu.locator('#cv').focus();
  await jeu.evaluate(()=>{
    const g=__aldoria.G;g.god=true;
    for(const e of g.E){e.x=700;e.y=400;e.freeze=100;e.guard=0;e.shield=0}
    g.p.x=841;g.p.y=728;
  });
  // Entrer derrière le mur en marchant, puis le quitter par le même côté.
  await page.keyboard.down('ArrowRight');
  await jeu.waitForFunction(()=>window.alphaPremierPlan.mur<.65);
  await page.keyboard.up('ArrowRight');
  await jeu.waitForFunction(()=>window.alphaPremierPlan.mur<.44);
  await page.screenshot({path:process.env.RUNNER_TEMP+'/brune-inclinee-muret.png'});
  await page.keyboard.down('ArrowLeft');
  await jeu.waitForFunction(()=>__aldoria.G.p.x<800);
  await page.keyboard.up('ArrowLeft');
  await jeu.waitForFunction(()=>window.alphaPremierPlan.mur>.97);

  // Un loup seul, puis le héros et le loup ensemble derrière les mêmes tuiles.
  await jeu.evaluate(()=>{
    const loup=__aldoria.G.E.find(e=>e.t==='loup');
    loup.x=1164;loup.y=540;
  });
  await jeu.waitForFunction(()=>window.alphaPremierPlan.arbre<.44 && window.alphaPremierPlan.mur>.97);
  await jeu.evaluate(()=>{
    const g=__aldoria.G,loup=g.E.find(e=>e.t==='loup');
    g.p.x=1450;g.p.y=830;loup.x=1460;loup.y=826;
  });
  await jeu.waitForFunction(()=>window.alphaPremierPlan.toit<.44 && window.alphaPremierPlan.arbre>.95);
  await page.screenshot({path:process.env.RUNNER_TEMP+'/brune-inclinee-toit.png'});
  await jeu.evaluate(()=>{__aldoria.G.p.x=1070;__aldoria.G.p.y=695});
  await jeu.waitForTimeout(800);
  assert.ok(await jeu.evaluate(()=>window.alphaPremierPlan.toit<.44));
  await jeu.evaluate(()=>{
    const g=__aldoria.G;
    for(const [i,e] of g.E.entries()){e.x=g.p.x+96+i*10;e.y=g.p.y-88;e.guard=0;e.freeze=100;e.shield=0;e.hp=e.hpMax}
  });
  await jeu.waitForFunction(()=>window.alphaPremierPlan.toit>.97);
  assert.equal(await jeu.evaluate(()=>Number((__aldoria.G.sy/__aldoria.G.sc).toFixed(2))),.95);
  const vise = async () => {
    const pt=await jeu.evaluate(()=>{const g=__aldoria.G,e=g.E[0];return {x:g.ox+e.x*g.sc,y:g.oy+e.y*g.sy}});
    const r=await jeu.locator('#cv').boundingBox();
    await page.mouse.move(r.x+pt.x,r.y+pt.y);
  };
  const lancer = async (key,id) => {
    await vise(); await page.keyboard.down(key);
    await jeu.waitForFunction(id=>__aldoria.G.skillAim?.id===id,id);
    await vise(); await page.keyboard.up(key);
  };
  await lancer('1','AI8');
  await jeu.waitForFunction(()=>__aldoria.G.Z.some(z=>z.tornado&&z.y<__aldoria.G.p.y-20));
  await jeu.waitForFunction(()=>__aldoria.G.E.some(e=>e.hp<e.hpMax&&e.slow.t>0));
  await jeu.waitForFunction(()=>!__aldoria.G.Z.some(z=>z.tornado),null,{timeout:30000});
  await jeu.evaluate(()=>{
    const g=__aldoria.G;
    g.p.x=1300;g.p.y=780;
    for(const [i,e] of g.E.entries()){
      e.hp=e.hpMax;e.freeze=0;e.stun=12;e.x=1450+i*10;e.y=830;
    }
  });
  await jeu.waitForFunction(()=>window.alphaPremierPlan.toit<.44);
  await lancer('2','GL6');
  await jeu.waitForFunction(()=>window.alphaPremierPlan.toit<.44 &&
    __aldoria.G.E.some(e=>e.freeze>0&&e.hp<e.hpMax));
  await jeu.evaluate(()=>{for(const e of __aldoria.G.E){e.hp=e.hpMax;e.stun=0}});
  await lancer('3','TE8');
  await jeu.waitForFunction(()=>__aldoria.G.F.some(f=>f.type==='seisme')&&__aldoria.G.E.some(e=>e.stun>0&&e.hp<e.hpMax));
  await page.screenshot({path:process.env.RUNNER_TEMP+'/brune-inclinee-combat.png'});
  await page.keyboard.press('m');await jeu.waitForFunction(()=>__aldoria.G.mapOpen);
  await page.keyboard.press('m');await jeu.waitForFunction(()=>!__aldoria.G.mapOpen);
  await page.keyboard.press('Escape');await jeu.waitForFunction(()=>__aldoria.G.pauseMenu);
  await page.reload();jeu=await partie();
  assert.deepEqual(await jeu.evaluate(()=>__aldoria.G.slots),['AI8','GL6','TE8']);
  console.log('BRUNE_INCLINEE_OK : trois sorts, mouvement, muret, chêne, toit, loup et sauvegarde');
};
