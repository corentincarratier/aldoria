const {chromium} = require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const url=process.env.ALDORIA_URL || 'http://127.0.0.1:8090/essais/godot-v1/';
(async()=>{
  const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  try{
    const page=await browser.newPage({viewport:{width:1000,height:700}});
    const errors=[];
    page.on('pageerror', e=>{errors.push(e.message);console.error(e.message)});
    page.on('console', m=>{if(/SCRIPT ERROR|Parse Error|Invalid call|Invalid get index|ERROR:/.test(m.text())){console.error(m.text());errors.push(m.text())}});
    await page.goto(url);
    const getGame=async()=>{
      await page.waitForFunction(()=>document.getElementById('aldoria-interface')?.contentWindow?.__aldoria?.G?.t>0,{},{timeout:90000});
      const frame=await (await page.locator('#aldoria-interface').elementHandle()).contentFrame();
      return frame;
    };
    let game=await getGame();
    assert.equal(await game.evaluate(()=>__aldoria.S.test), true);
    const art=await game.evaluate(async()=>{
      const b=window.aldoriaIllustrations;
      await b.ready;
      const absent=Object.keys(__aldoria.ET).filter(id=>!b.creatures[id]);
      const models=new Set(Object.keys(__aldoria.ET).map(id=>b.creatures[id]?.join('/')));
      return {absent,types:Object.keys(__aldoria.ET).length,modeles:models.size,planches:b.sheets.size};
    });
    assert.equal(art.planches,7);
    assert.deepEqual(art.absent,[],'dessin du bestiaire');
    console.log('Illustrations en jeu',art);
    // Comparer directement avec le jeu principal livré dans la même révision.
    const original=fs.readFileSync('aldoria.html','utf8'),rules=fs.readFileSync('godot/aldoria/v1/regles.js','utf8');
    for(const name of ['pickMove','startAct','runAct','goAct','meleeHit','hitE','drawSkillMotion','drawSkillAim','heroStats','drawSkillTree']){
      const start=rules.indexOf('function '+name+'(');
      const section=rules.slice(start,rules.indexOf('\nfunction ',start+8)).split('\n/*')[0].trim();
      assert.ok(start>=0&&original.includes(section),name+' diffère dans le jeu de référence');
    }
    assert.ok(original.includes(fs.readFileSync('godot/aldoria/v1/competences.js','utf8').trim()),'compétences de référence');
    await game.locator('#cv').click({position:{x:400,y:360}});
    const startX=await game.evaluate(()=>__aldoria.G.p.x);
    await page.keyboard.down('ArrowRight');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');
    assert.ok((await game.evaluate(()=>__aldoria.G.p.x))>startX+2,'marche');
    await page.keyboard.press('m');await game.waitForFunction(()=>__aldoria.G.mapOpen);
    await page.keyboard.press('m');await page.keyboard.press('e');
    await game.waitForFunction(()=>__aldoria.G.journal==='Profil');
    await page.keyboard.press('Escape');
    await page.screenshot({path:process.env.RUNNER_TEMP+'/aldoria-monde.png'});
    await require('./vues-brune.cjs')(game);
    const catalogue=await game.evaluate(()=>Object.keys(__aldoria.ZD));
    assert.equal(catalogue.length,38);
    for(const id of catalogue){
      await game.evaluate(id=>{const a=__aldoria;a.G.dlg=null;a.G.paused=false;a.enterZone(id,{x:800,y:600});},id);
      await game.waitForFunction(id=>__aldoria.G.zid===id&&__aldoria.G.zoneT>0,id);
    }
    const ids=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
    const casts=await game.evaluate(ids=>{
      const a=__aldoria;
      a.enterZone('1,6',{x:795,y:600});a.G.god=true;a.G.paused=false;a.G.dlg=null;
      const done=[];
      for(const id of ids){
        const g=a.G;g.p.stun=0;g.p.root=0;g.p.inMarsh=false;g.p.inForest=false;g.p.chan=null;
        g.slots[0]=id;g.cds[0]=0;g.p.x=795;g.p.y=600;
        const target=g.E.find(e=>e.hp>0);
        if(target){target.x=820;target.y=600;}
        a.cast(0,{x:820,y:600});done.push(id);
      }
      a.G.slots=[null,null,null,null];a.G.cds=[0,0,0,0];
      return done;
    },ids);
    assert.deepEqual(casts,ids);
    // Former le dernier état de rencontre, puis faire résoudre le coup fatal par le combat V1.
    const final=await game.evaluate(()=>{
      const a=__aldoria;const z=Object.values(a.ZD).find(z=>z.final);
      a.enterZone(z.id,{x:800,y:730});a.G.dlg=null;a.G.paused=false;a.G.god=true;
      for(const foe of a.G.E){foe.hp=1;foe.dot=[{t:1,dps:5000,el:'feu'}];}
      a.update(0.04);
      return {zone:z.id,done:a.S.done};
    });
    await game.waitForFunction(()=>__aldoria.S.done,{}, {timeout:10000});
    console.log('Régions parcourues', catalogue.length, 'capacités exercées',casts.length,'fin',final);
    await game.evaluate(()=>{const a=__aldoria;a.G.dlg=null;a.G.paused=false;a.G.over=false;a.enterZone('g11',{x:740,y:500});});
    await game.waitForFunction(()=>__aldoria.S.zone==='g11'&&JSON.parse(window.aldoriaHost.storage.getItem('aldoria-test')).zone==='g11');
    await page.reload();game=await getGame();
    assert.equal(await game.evaluate(()=>__aldoria.S.zone),'g11','reprise de la copie');
    assert.equal(await page.evaluate(()=>localStorage.getItem('aldoria-v2')),null,'sauvegarde principale');
    assert.equal(await page.evaluate(()=>localStorage.getItem('aldoria-test')),null,'sauvegarde modérateur HTML');
    await game.locator('#pauseBtn').click();
    await game.locator('[data-m=home]').click();
    await game.locator('#hNew').click();
    await game.locator('[data-m=new-difficile]').click();
    await game.waitForFunction(()=>document.querySelector('[data-m=tuto-skip]'));
    await game.locator('[data-m=tuto-skip]').click();
    assert.equal(await game.evaluate(()=>__aldoria.S.test),false);
    assert.equal(await game.evaluate(()=>__aldoria.S.mode),'difficile');
    assert.deepEqual(errors,[]);
    console.log('V1_JOUABLE');
    await page.close();

    const editorErrors=[];
    const editor=await browser.newPage({viewport:{width:1280,height:800}});
    editor.on('console',m=>{if(/ERROR|Godot Engine|editor|Aldoria/.test(m.text()))console.log('Editeur:',m.text().slice(0,240))});
    editor.on('pageerror',e=>editorErrors.push(e.message));
    editor.on('console',m=>{if(/SCRIPT ERROR|Failed to load script|Failed to load resource/.test(m.text()))editorErrors.push(m.text())});
    await editor.goto(url+'editeur/');
    await editor.waitForURL('**/godot.html',{timeout:60000});
    await editor.waitForFunction(()=>crossOriginIsolated&&document.querySelector('#tab-editor')?.style.display!=='none'&&document.querySelector('#tab-editor')?.offsetWidth>0,{},{timeout:150000});
    await editor.locator('#editor-canvas').click({position:{x:550,y:180}});
    // F5 n’est disponible qu’après l’import des ressources et l’initialisation de l’éditeur.
    let playing=false;
    for(let i=0;i<18&&!playing;i++){
      await editor.waitForTimeout(3500);await editor.keyboard.press('F5');
      playing=await editor.evaluate(()=>!!document.querySelector('#aldoria-interface')?.contentWindow?.__aldoria?.G);
    }
    if(!playing){
      await editor.screenshot({path:process.env.RUNNER_TEMP+'/aldoria-editeur-erreur.png'});
      throw Error('L’éditeur préchargé n’a pas lancé Aldoria avec F5.');
    }
    const editorGame=await (await editor.locator('#aldoria-interface').elementHandle()).contentFrame();
    await editorGame.evaluate(()=>{const a=__aldoria;a.S.owned.add('R1');a.S.weapon='R';a.G.prof=a.heroProfile();a.G.dlg=null;a.G.paused=false;});
    await editorGame.waitForFunction(()=>{
      if(!window.aldoriaHost.archerReady)return false;
      const data=aldoriaHost.archer.getContext('2d').getImageData(0,0,96,96).data;
      return data.some((alpha,i)=>i%4===3 && alpha>200);
    },{},{timeout:40000});
    assert.deepEqual(editorErrors,[]);
    console.log('EDITEUR_F5_OK · archer Godot visible');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
