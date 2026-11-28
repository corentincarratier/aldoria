const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
  try{for(const path of ['aldoria.html','essais/sortileges.html','essais/animations.html']){
    const main=path==='aldoria.html',page=await browser.newPage({viewport:{width:1100,height:760}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const common='roll,runAct,spawnE,walkingInput,draw,advanceRoll,cast';
    const scope=common+(main?',riverCurrent,riverBetween,bridgeNear,sees,footwork,enemyWalk,pushOut,walkingInput,walkHero,passages,tryPass,groundLayer,rockAt,goAct':'');
    const html=fs.readFileSync(path,'utf8').replace('window.__aldoria={','window.qa={'+scope+'};window.__aldoria={');
    await page.route('**/'+path,r=>r.fulfill({status:200,contentType:'text/html',body:html}));
    await page.route('https://fonts.googleapis.com/**',r=>r.abort());
    await page.goto('http://127.0.0.1:8080/'+path);
    const result=await page.evaluate(main=>{
      document.getElementById('hTest').click();
      const api=window.__aldoria,qa=window.qa,G=api.G,p=G.p;
      const reports=[];function expect(v,s){if(!v)throw Error(s);reports.push(s)}
      function go(id){api.enterZone(id,{x:800,y:500},true);G.paused=false;G.over=false;G.god=true;G.E=[]}
      go('2,6');p.x=840;p.y=700;
      const before=qa.walkingInput(p,G.st).spd;
      G.slots[0]='TE10';G.cds[0]=0;qa.cast(0,{x:p.x,y:p.y});
      const area=G.Z.find(z=>z.softGround);expect(area&&area.dur===5,'Sort lancé pour cinq secondes');
      expect(api.inMarsh(G.l,p)&&qa.walkingInput(p,G.st).spd<before,'Le sol du sort ralentit le héros');
      const wolf=qa.spawnE('loup',p.x+25,p.y);const ally={c:{r:12},x:p.x,y:p.y};
      expect(api.inMarsh(G.l,wolf)&&api.inMarsh(G.l,ally)&&!api.inMarsh(G.l,{x:p.x,y:p.y,d:{fly:true}}),'Ennemis et alliés au sol affectés');
      p.rollCd=0;p.roll=null;qa.roll();expect(!p.roll&&!p.rollCd,'Roulade refusée sans dépenser la recharge');
      wolf.act={m:main?'leap':'lunge',ph:'tell',t:0,T:.05,ang:0};qa.runAct(wolf,.1);expect(wolf.act.ph==='rec','Bond du loup interrompu');
      p.x=area.x-area.r-7;p.y=area.y;p.roll={a:0,t:.22};qa.advanceRoll(p,1/30);expect(!p.roll&&p.x<=area.x-area.r,'La roulade rencontre le bord des sables');
      area.t=area.dur;p.x=area.x;expect(!api.inMarsh(G.l,p),'Fin exacte du terrain temporaire');
      qa.roll();expect(!!p.roll,'Roulade rendue à expiration');p.roll=null;p.rollCd=0;
      go('0,5');const trail=G.l.trails[0][Math.floor(G.l.trails[0].length/2)];
      const patch=api.terrain(G.l).marsh[0];
      let mud=null;for(let x=180;!mud&&x<1450;x+=45)for(let y=150;y<900;y+=45)if(api.inMarsh(G.l,{x,y})){mud={x,y};break}
      expect(!!mud,'Boue naturelle présente');Object.assign(p,mud);qa.roll();expect(!p.roll,'Roulade refusée dans la boue');Object.assign(p,{x:trail[0],y:trail[1]});expect(!api.inMarsh(G.l,p),'Sentier naturel sec');qa.roll();expect(!!p.roll,'Roulade sur le sentier sec');p.roll=null;
      if(main){
        go('1,6');const T=api.terrain(G.l),river=T.rivers[0],bridge=T.bridges[0];const q=river.pts.reduce((a,v)=>Math.abs(v.y-285)<Math.abs(a.y-285)?v:a);
        expect(!qa.riverCurrent(G.l,bridge)&&!!qa.riverCurrent(G.l,q),'Courant en rivière et tablier de pont sec');
        Object.assign(p,{x:q.x,y:q.y});const x=p.x,y=p.y;const motion=qa.walkingInput(p,G.st);qa.walkHero(p,motion,.1);expect(Math.hypot(p.x-x,p.y-y)>6,'Le courant déplace le héros');Object.assign(p,{x:q.x-75,y:q.y});for(let i=0;i<75;i++)qa.walkHero(p,{mx:1,my:0,ml:1,spd:165,current:qa.riverCurrent(G.l,p)},1/60);expect(p.x>q.x+60,'Traversée à pied et à la nage');
        const dog=qa.spawnE('chien',q.x+60,q.y),bear=qa.spawnE('ours',q.x+60,q.y);p.x=q.x-60;p.y=q.y;expect(qa.riverBetween(dog,p)&&!qa.bridgeNear(dog,320)&&qa.sees(dog)===0,'Le chien perd la cible sans pont');
        for(let i=0;i<38;i++)qa.enemyWalk(G.l,bear,p,4);expect(bear.x<q.x-25,'L’ours nage vers la rive opposée');
        Object.assign(p,{x:bridge.x-85,y:bridge.y+35});Object.assign(dog,{x:bridge.x+90,y:bridge.y-65,foot:'in',footT:10,state:'hunt'});G.E=[dog];for(let i=0;i<150;i++){qa.footwork(dog,.02);qa.pushOut(G.l,dog);if(dog.x<bridge.x-10)break}expect(dog.x<bridge.x-10,'Le chien traverse par le pont');
        go('4,6');p.x=1450;p.y=p.r;expect(qa.tryPass('n')&&G.zid==='4,5','Passage côtier vers le mont');p.y=1100-p.r;expect(qa.tryPass('s')&&G.zid==='4,6','Retour du mont à la plage');qa.draw();
        for(const [id,z] of Object.entries(api.ZD)){const ter=api.terrain(z);expect(ter.rocks.every(o=>Number.isFinite(o.x+o.y+o.r)),'Terrain '+id)}
      }
      return reports;
    },main);
    assert.deepEqual(errors,[]);console.log(path+': '+result.join(' / '));await page.close();
  }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});