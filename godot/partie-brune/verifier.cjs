const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const url = process.env.ALDORIA_BRUNE_URL || 'http://127.0.0.1:8090/essais/godot-brune/';
(async()=>{
  const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  try{
    const page=await browser.newPage({viewport:{width:1000,height:700}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(/SCRIPT ERROR|Parse Error|Invalid (call|access)|ERROR:/.test(m.text())){errors.push(m.text());console.error(m.text())}});
    const gameFrame=async()=>{
      await page.waitForFunction(()=>document.querySelector('#aldoria-interface')?.contentWindow?.__aldoria?.G?.t>0,null,{timeout:85000});
      return (await page.locator('#aldoria-interface').elementHandle()).contentFrame();
    };
    await page.goto(url);
    let game=await gameFrame();
    const snap=async n=>page.screenshot({path:process.env.RUNNER_TEMP+'/brune-partie-'+n+'.png'});
    const pressed=key=>page.keyboard.press(key);
    const state=await game.evaluate(()=>({zone:__aldoria.G.zid,slots:__aldoria.G.slots,weapon:__aldoria.S.weapon,
      moderator:__aldoria.S.test,foes:__aldoria.G.E.map(e=>e.t),regions:Object.keys(__aldoria.ZD).length}));
    assert.deepEqual(state,{zone:'cour-brune',slots:['R2','GL6','TE8','AI8'],weapon:'R',moderator:true,foes:['garde','garde_lance'],regions:39});
    await game.locator('#cv').focus();
    await game.waitForFunction(()=>aldoriaHost.archerReady);
    const x=await game.evaluate(()=>__aldoria.G.p.x);
    await page.keyboard.down('ArrowRight');
    await game.waitForFunction(x=>__aldoria.G.p.x>x+15,x);
    await page.keyboard.up('ArrowRight');
    await pressed('Space');await game.waitForFunction(()=>__aldoria.G.p.rollCd>0);
    await pressed('m');await game.waitForFunction(()=>__aldoria.G.mapOpen);await pressed('m');
    await pressed('e');await game.waitForFunction(()=>__aldoria.G.journal==='Profil');await pressed('Escape');
    await game.evaluate(()=>{
      const {G:g}=__aldoria;g.god=true;
      for(const [i,e] of g.E.entries()){e.x=805+i*46;e.y=625;e.stun=7}
    });
    const spot=await game.evaluate(()=>{const g=__aldoria.G;return {x:g.ox+830*g.sc,y:g.oy+625*g.sc}});
    await page.mouse.move(spot.x,spot.y);
    await page.keyboard.down('2');await game.waitForFunction(()=>__aldoria.G.skillAim?.id==='GL6');
    assert.equal(await game.evaluate(()=>__aldoria.G.cds[1]),0);
    await page.keyboard.up('2');await game.waitForFunction(()=>__aldoria.G.p.chan||__aldoria.G.Z.some(z=>z.prison));
    await game.waitForFunction(()=>__aldoria.G.E.every(e=>e.freeze>0&&e.hp<e.hpMax));
    await snap('gel');
    const cible=await game.evaluate(()=>{
      const g=__aldoria.G,e=g.E[0];
      for(const foe of g.E)foe.stun=5;
      e.x=g.p.x+175;e.y=g.p.y;e.guard=0;
      return {x:g.ox+e.x*g.sc,y:g.oy+e.y*g.sc,hp:e.hp};
    });
    await page.mouse.move(cible.x,cible.y);await page.mouse.down();
    await game.waitForFunction(()=>__aldoria.G.chg?.t>.78);
    await page.mouse.up();
    await game.waitForFunction(hp=>__aldoria.G.E.length<2||__aldoria.G.E[0].hp<hp,cible.hp,{timeout:8000});
    await game.evaluate(()=>{const g=__aldoria.G;g.p.x=g.l.fountain.x;g.p.y=g.l.fountain.y+25});
    await pressed('t');await game.locator('#scr-tree.on').waitFor();await game.locator('#backGame').click();
    const passage=async dest=>{
      await game.evaluate(dest=>{const g=__aldoria.G,door=g.l.portals.find(p=>p.to===dest);g.p.x=door.x;g.p.y=door.y;},dest);
      await pressed('f');await game.waitForFunction(dest=>__aldoria.G.zid===dest,dest,{timeout:8000});
    };
    await passage('2,6');await snap('hameau');await passage('cour-brune');
    await game.evaluate(()=>{
      const a=__aldoria;const e=a.G.E[0];e.hp=1;e.dot=[{t:1,dps:5000,el:'feu'}];a.update(.04);
    });
    assert.ok(await game.evaluate(()=>__aldoria.S.xp>0 || __aldoria.S.lvl>1),'XP du combat de la V1');
    await passage('2,6');
    await pressed('Escape');await game.waitForFunction(()=>__aldoria.G.pauseMenu);
    await page.waitForTimeout(1100);await page.reload();game=await gameFrame();
    assert.equal(await game.evaluate(()=>__aldoria.G.zid),'2,6');
    assert.deepEqual(await game.evaluate(()=>__aldoria.G.slots),state.slots);
    assert.equal(await page.evaluate(()=>localStorage.getItem('aldoria-test')),null);
    assert.deepEqual(errors,[]);
    console.log('BRUNE_PARTIE_V1_OK');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
