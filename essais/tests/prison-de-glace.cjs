const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1300, height: 770 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const url = process.env.ATELIER_URL || 'http://127.0.0.1:8090/essais/sortileges.html';
  const output = process.env.RUNNER_TEMP || require('node:os').tmpdir();
  async function frames() {
    const elements = await page.locator('#studioScene iframe').elementHandles();
    assert.equal(elements.length, 2);
    return Promise.all(elements.map(element => element.contentFrame()));
  }
  async function sample(frame) {
    return frame.evaluate(() => {
      const g = window.__aldoria.G, zone = g.Z.find(z => z.spell === 'GL6');
      const target = g.scene.aim;
      return {
        cast: g.scene.cast, age: zone?.t || 0, done: !!zone?.done,
        enemies: g.E.map(e => [Math.hypot(e.x-target.x, e.y-target.y), e.freeze || 0]),
        calls: window.iceDraws.slice()
      };
    });
  }
  try {
    const query = new URL(url); query.searchParams.set('sort', 'GL6');
    await page.clock.install({ time: new Date('2026-01-05T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-05T12:00:02Z'));
    await page.goto(query.href);
    const pair = await frames();
    for (const frame of pair) await frame.evaluate(() => {
      window.iceDraws = [0, 0, 0];
      const wake = IceWake.draw, original = SpellArt.draw;
      IceWake.draw = function(ctx, zone, front) {
        window.iceDraws[front ? 1 : 0]++;
        return wake(ctx, zone, front);
      };
      SpellArt.draw = function(ctx, zone, ...args) {
        if(zone.spell === 'GL6') window.iceDraws[2]++;
        return original(ctx, zone, ...args);
      };
    });
    await page.clock.runFor(160);
    const start = await Promise.all(pair.map(sample));
    await page.clock.runFor(880);
    const outer = await Promise.all(pair.map(sample));
    await page.screenshot({path: output+'/prison-bord.png'});
    await page.clock.runFor(320);
    const middle = await Promise.all(pair.map(sample));
    await page.screenshot({path: output+'/prison-traversee.png'});
    const thumb=await page.locator('#studioScene').screenshot({type:'jpeg',quality:63});
    fs.writeFileSync(output+'/prison-comparaison.jpg',thumb);
    if(process.env.APERCU_GL6) console.log('APERCU_GL6 '+thumb.toString('base64'));
    await page.clock.runFor(540);
    const centre = await Promise.all(pair.map(sample));
    await page.screenshot({path: output+'/prison-centre.png'});
    assert.deepEqual(centre[0].calls.slice(0,2),[0,0]);
    assert.ok(centre[0].calls[2] > 0);
    assert.ok(centre[1].calls[0] > 0 && centre[1].calls[1] > 0);
    assert.equal(centre[1].calls[2],0);
    for (let n=0;n<2;n++) {
      assert.ok(outer[n].age>0 && outer[n].age<middle[n].age);
      assert.equal(middle[n].done,false);
      assert.equal(centre[n].done,true);
      assert.equal(centre[n].enemies.length,3);
      assert.ok(centre[n].enemies.every(([d,freeze],j)=> d+35<start[n].enemies[j][0] && freeze>1.3));
    }
    await page.clock.runFor(2300);
    const released = await Promise.all(pair.map(sample));
    assert.ok(released.every(s=>s.enemies.every(([,freeze])=>freeze<=0)));
    await page.getByRole('button',{name:'Rejouer'}).click();
    await page.waitForLoadState('load');
    const replay = await frames();
    for (const frame of replay) await frame.waitForLoadState('load');
    await page.clock.runFor(160);
    for(const frame of replay) assert.equal(await frame.evaluate(()=>__aldoria.G.scene.cast),false);
    await page.setViewportSize({width:390,height:840});
    const bounds = await page.locator('#studioScene iframe').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()));
    assert.ok(bounds[1].top >= bounds[0].bottom && bounds[1].right <= 390);
    await page.locator('#spellChoice').selectOption('AI8');
    assert.equal(await page.locator('#studioScene iframe').count(),1);
    assert.deepEqual(errors,[]);
    console.log('Trois gardes rabattus puis dégelés dans les deux scènes. Relecture et disposition mobile vérifiées.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
