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
    assert.deepEqual(errors, []);
    console.log('BRUNE_WEB_OK');
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
