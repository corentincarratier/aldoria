const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async()=>{
  const browser = await chromium.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8080/essais/combat-hud.html');
  const hp=page.locator('#hp');
  const checkHP=n=>page.waitForFunction(n=>document.getElementById('hp').textContent===n+' / 240 PV',n);
  await checkHP(240);
  const aim=await page.locator('#arena').evaluate(svg=>{const p=new DOMPoint(424,169).matrixTransform(svg.getScreenCTM());return {x:p.x,y:p.y}});
  await page.mouse.click(aim.x,aim.y);await checkHP(211);
  await page.locator('#skill').click();await checkHP(165);assert(await page.locator('#skill').isDisabled());
  await page.locator('#dodge').click();assert(await page.locator('#dodge').isDisabled());
  await page.locator('#reset').click();await checkHP(240);
  for(const [weapon,hit] of [['Arc',38],['Bâton',58]]){
    await page.locator('#weapon').selectOption({label:weapon});
    await page.mouse.move(aim.x,aim.y);await page.mouse.down();
    await page.waitForFunction(()=>document.getElementById('charge').textContent==='Charge maximale');
    await page.mouse.up();await checkHP(240-hit);await page.locator('#reset').click();await checkHP(240);
  }
  await page.locator('#audioBtn').click();await page.reload();assert.equal(await page.locator('#audioBtn').textContent(),'Son coupé');
  assert.equal(await page.locator('#weapon').inputValue(),'Bâton');
  assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),['aldoria-essai-combat-hud-v1']);assert.deepEqual(errors,[]);
  console.log('OK trois armes, visée et charge, dégâts, esquive, recharge, remise à zéro, réglages isolés');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});