const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage({viewport: {width: 896, height: 560}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (/SCRIPT ERROR|Parse Error|Invalid (call|access)|Failed to load resource.*res:\/\//i.test(message.text())) errors.push(message.text());
    });
    const ready = page.waitForEvent('console', {predicate: message => message.text().includes('Cour de Brune prête.'), timeout: 60000});
    await page.goto('http://127.0.0.1:8090/essais/godot-brune/');
    await ready;
    const canvas = page.locator('canvas');
    await canvas.focus();
    await page.waitForTimeout(350);
    const save = name => canvas.screenshot({path: path.join(process.argv[2], 'brune-' + name + '.png')});
    await page.keyboard.press('Escape');
    await page.mouse.click(339,307); // Ralenti modérateur pour échantillonner les appuis.
    await page.mouse.click(448,409);
    await page.waitForTimeout(100);
    await save('repos');
    await page.keyboard.press('p');
    await page.keyboard.down('d');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('p');
      await page.waitForTimeout(170);
      await page.keyboard.press('p');
      await save('pas-' + i);
    }
    await page.keyboard.up('d');
    await page.keyboard.press('p');
    await page.mouse.move(545, 235);
    await page.mouse.down();
    await page.keyboard.down('s');
    await page.waitForTimeout(200);
    await page.keyboard.up('s');
    await page.waitForTimeout(1700);
    await save('visee');
    await page.mouse.up();
    await page.waitForTimeout(2600);
    await save('impact');
    await page.keyboard.press('Escape');
    await save('menu');
    await page.mouse.click(339,307);
    await page.mouse.click(554,307);
    await page.mouse.move(500,365);
    await page.keyboard.down('2');
    await page.waitForTimeout(180);
    await save('prison-visee');
    await page.keyboard.up('2');
    await page.waitForTimeout(800);
    await page.keyboard.press('p');
    await save('prison');
    await page.keyboard.press('p');
    await page.waitForTimeout(2900);
    await save('apres-gel');
    // Confirmer l’état de la scène avant de prendre la photo. Le clic sur
    // Replacer et la touche P doivent tous deux avoir atteint le jeu Web.
    async function confirmed(prefix, input) {
      const state = page.waitForEvent('console', {
        predicate: message => message.text().startsWith(prefix), timeout: 7000
      });
      await Promise.all([state, input()]);
      await page.waitForTimeout(120);
    }
    const openMenu = () => confirmed('Menu ouvert.', () => page.keyboard.press('Escape'));
    const reset = async () => {
      await openMenu();
      await confirmed('Cour replacée.', () => page.mouse.click(554,307));
      await canvas.focus();
      await page.mouse.move(540,341);
    };
    await openMenu();
    await page.mouse.click(339,307);
    await confirmed('Cour replacée.', () => page.mouse.click(554,307));
    async function capture(name, label, keys, ms) {
      await reset();
      for (const key of keys) await page.keyboard.down(key);
      await page.waitForTimeout(ms);
      await confirmed('Pose figée · '+label+' ·', () => page.keyboard.press('p'));
      for (const key of keys.slice().reverse()) await page.keyboard.up(key);
      await save(name);
      await confirmed('Animation reprise.', () => page.keyboard.press('p'));
    }
    await capture('marche','Marche',['Shift','d'],260);
    await capture('course','Course',['d'],200);
    await capture('rapide','Coup rapide',['j'],465);
    await capture('lourd','Coup lourd',['k'],1150);
    await capture('roulade','Roulade',['d','Space'],345);
    await reset();
    await page.mouse.move(100,341);
    await page.mouse.down();
    await page.keyboard.down('d');
    await page.waitForTimeout(850);
    await confirmed('Pose figée · Arc ·', () => page.keyboard.press('p'));
    await page.keyboard.up('d');
    await save('contresens');
    await confirmed('Animation reprise.', () => page.keyboard.press('p'));
    await page.mouse.up();
    assert.deepEqual(errors, []);
    console.log('BRUNE_WEB_OK');
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
