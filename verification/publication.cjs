const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const url='https://corentincarratier.github.io/aldoria/';
  const paths=["aldoria.html","essais/sortileges.html","essais/animations.html","essais/combat-hud.html"];
  for(let tries=0;;tries++){
    const ok=await Promise.all(paths.map(async p=>{
      const r=await fetch(url+p+'?revision=51926db&check='+tries,{headers:{'cache-control':'no-cache'}});
      return r.ok&&Buffer.from(await r.arrayBuffer()).equals(fs.readFileSync(p));
    }));
    if(ok.every(Boolean))break;
    if(tries===35)throw Error('Pages ne sert pas encore ces fichiers : '+paths.filter((_,i)=>!ok[i]).join(', '));
    await new Promise(f=>setTimeout(f,5000));
  }
  const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
  try{
    const page=await browser.newPage();await page.goto(url+'aldoria.html?v=51926db',{waitUntil:'domcontentloaded'});
    await page.locator('#hTest').click();await page.waitForFunction(()=>window.__aldoria?.G?.p);
    const ok=await page.evaluate(()=>{
      const a=window.__aldoria,g=a.G,p=g.p;g.slots[0]='TE10';g.cds[0]=0;
      a.cast(0,{x:p.x,y:p.y});return g.Z.some(z=>z.softGround)&&a.inMarsh(g.l,p);
    });
    assert(ok);await page.keyboard.press('Space');assert(await page.evaluate(()=>!window.__aldoria.G.p.roll));
    await page.goto(url+'essais/combat-hud.html?v=51926db');await page.locator('#skill').click();
    await page.waitForFunction(()=>document.getElementById('hp').textContent==='194 / 240 PV');
    console.log('GitHub Pages : quatre fichiers identiques aux versions éprouvées, sort lancé en mode test, roulade bloquée et mannequin touché.');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});