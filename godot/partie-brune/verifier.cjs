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
    // Exercer les vraies touches et comparer une cible dans l'aire à une cible éloignée.
    const avant=await game.evaluate(()=>{
      const g=__aldoria.G;g.god=true;
      for(const [i,e] of g.E.entries()){
        e.x=g.p.x+(i?400:85);e.y=g.p.y;e.freeze=12;e.stun=0;e.guard=0;e.shield=0;
      }
      return g.E.map(e=>e.hp);
    });
    await page.keyboard.down('3');await game.waitForFunction(()=>__aldoria.G.skillAim?.id==='TE8');
    assert.equal(await game.evaluate(()=>__aldoria.G.cds[2]),0);
    await page.keyboard.up('3');
    await game.waitForFunction(()=>__aldoria.G.p.chan?.i===2||__aldoria.G.F.some(f=>f.type==='seisme'));
    await game.waitForFunction(hp=>{
      const g=__aldoria.G;
      return g.cds[2]>0&&g.F.some(f=>f.type==='seisme'&&f.t>.18)&&g.E[0].stun>0&&g.E[0].hp<hp;
    },avant[0]);
    await snap('seisme');
    assert.equal(await game.evaluate(()=>__aldoria.G.E[1].hp),avant[1]);
    console.log('SEISME_PROCHE_ETOURDI_HORS_PORTEE_INTACT');
    // Le second garde se trouve plus loin que le rayon initial du vent.
    const cible=await game.evaluate(()=>{
      const g=__aldoria.G,e=g.E[1];e.x=g.p.x+205;e.y=g.p.y;e.freeze=12;
      return {hp:e.hp,x:g.p.x,point:{x:g.ox+e.x*g.sc,y:g.oy+e.y*g.sc}};
    });
    const cadre=await game.locator('#cv').boundingBox();
    await page.mouse.move(cadre.x+cible.point.x,cadre.y+cible.point.y);
    await page.keyboard.down('4');await game.waitForFunction(()=>__aldoria.G.skillAim?.id==='AI8');
    await page.keyboard.up('4');
    await game.waitForFunction(x=>__aldoria.G.Z.some(z=>z.tornado&&z.t>.35&&z.x>x+28),cible.x);
    await snap('tornade');
    await game.waitForFunction(hp=>{
      const e=__aldoria.G.E[1];
      return e.hp<hp&&e.slow.v===.6&&e.slow.t>0;
    },cible.hp);
    const premier=await game.evaluate(()=>__aldoria.G.E[1].hp);
    await game.waitForFunction(hp=>__aldoria.G.E[1].hp<hp,premier);
    await game.waitForFunction(()=>!__aldoria.G.Z.some(z=>z.tornado),null,{timeout:30000});
    console.log('TORNADE_AVANCE_RALENTIT_ET_TOUCHE_PLUSIEURS_FOIS');
    await game.evaluate(()=>{for(const e of __aldoria.G.E){e.hp=e.hpMax;e.freeze=0;e.stun=0}});
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
    // Viser sur le canevas en coordonnées de page, y compris quand la caméra suit le pointeur.
    const hpLancier=await game.evaluate(()=>{
      const g=__aldoria.G,lancier=g.E.find(e=>e.t==='garde_lance');
      for(const e of g.E)e.stun=15;
      lancier.x=g.p.x+100;lancier.y=g.p.y;lancier.guard=0;
      return lancier.hp;
    });
    const viserLancier=async()=>{
      const pt=await game.evaluate(()=>{
        const g=__aldoria.G,e=g.E.find(e=>e.t==='garde_lance');
        return {x:g.ox+e.x*g.sc,y:g.oy+e.y*g.sc};
      });
      const rect=await game.locator('#cv').boundingBox();
      await page.mouse.move(rect.x+pt.x,rect.y+pt.y);
    };
    await viserLancier();await page.mouse.down();
    await game.waitForFunction(()=>__aldoria.G.chg?.t>.78);
    await viserLancier();await page.mouse.up();
    await game.waitForFunction(hp=>(__aldoria.G.E.find(e=>e.t==='garde_lance')?.hp||0)<hp,hpLancier,{timeout:8000}).catch(async err=>{
      console.error('Tir',await game.evaluate(()=>{const g=__aldoria.G;return {pose:[g.p.x,g.p.y,g.p.face],cibles:g.E.map(e=>[e.t,e.x,e.y,e.hp]),charge:g.chg,champ:[g.ox,g.oy,g.sc]}}));throw err;
    });
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
    await require('./verifier-inclinaison.cjs')(page,url);
    assert.deepEqual(errors,[]);
    console.log('BRUNE_PARTIE_V1_OK');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
