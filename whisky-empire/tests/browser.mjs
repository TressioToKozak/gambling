import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 const read=()=>page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('whisky-empire');r.onsuccess=()=>{const q=r.result.transaction('state').objectStore('state').get('game');q.onsuccess=()=>resolve(q.result);};}));
 const go=tab=>page.locator(`nav [data-tab="${tab}"]`).click();
 await page.goto('http://127.0.0.1:5173');await page.locator('dialog').getByRole('button',{name:'Zaczynamy'}).click();
 await page.addStyleTag({content:'*{animation:none!important;transition:none!important}'});await page.waitForTimeout(250);await page.screenshot({path:'/tmp/whisky-dashboard.png',fullPage:true});
 for(const tab of ['Work','Upgrades','Scratch Cards','Inventory','Marketplace','Auctions','Market Charts','Statistics']){await go(tab);await page.waitForTimeout(80);assert.equal(await page.locator('h1').count(),1);console.log('TAB',tab,'OK');}
 // Test-only grant in an isolated browser profile; there is no application grant action.
 await page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('whisky-empire');r.onsuccess=()=>{const tx=r.result.transaction('state','readwrite'),store=tx.objectStore('state'),q=store.get('game');q.onsuccess=()=>{const s=q.result;s.balance=200000;store.put(s,'game');};tx.oncomplete=resolve;};}));
 await page.reload();await go('Upgrades');
 for(const id of ['sponge','soap','speed','tips','loyalty']){await page.locator(`[data-upgrade="${id}"][data-level="0"]`).click();await page.locator(`[data-upgrade="${id}"][data-level="1"]`).waitFor();}
 const bought=await read();assert.deepEqual(bought.upgrades,{sponge:1,soap:1,speed:1,tips:1,loyalty:1});assert.equal(bought.balance,188000);
 await page.screenshot({path:'/tmp/whisky-upgrades.png',fullPage:true});await go('Work');await page.screenshot({path:'/tmp/whisky-crystal.png',fullPage:true});
 await go('Scratch Cards');await page.waitForFunction(()=>[...document.querySelectorAll('.pack-art img')].every(img=>img.classList.contains('cutout-ready')&&img.complete));await page.screenshot({path:'/tmp/whisky-packs.png',fullPage:true});
 const tile=page.locator('[data-pack-tile="labels"]');await tile.scrollIntoViewIfNeeded();const before=await tile.boundingBox();await page.locator('[data-odds="labels"]').click();
 assert.equal(await page.locator('.odds-row').count(),151);assert.equal(await page.locator('.odds-dialog[open]').count(),1);
 const during=await tile.boundingBox();assert.ok(Math.abs(before.y-during.y)<1&&Math.abs(before.x-during.x)<1,'Odds must not move pack cards');
 await page.locator('.odds-search input').fill('black label');assert.equal(await page.locator('.odds-row:visible').count(),35);await page.screenshot({path:'/tmp/whisky-odds.png',fullPage:true});
 await page.locator('.odds-dialog [data-close]').click();const after=await tile.boundingBox();assert.ok(Math.abs(before.y-after.y)<1);console.log('ODDS: 151 entries, search, fixed card geometry');
 await page.locator('[data-card="0"]').click();await page.locator('#scratch').waitFor();const pending=(await read()).pending;assert.equal(pending.cost,1568);assert.equal(pending.packId,'basic');
 await page.reload();await go('Scratch Cards');assert.equal((await read()).pending.bottle,pending.bottle);
 const box=await page.locator('#scratch').boundingBox();await page.mouse.move(box.x+10,box.y+10);await page.mouse.down();
 for(let y=10;y<box.height;y+=23){await page.mouse.move(box.x+10,box.y+y);await page.mouse.move(box.x+box.width-10,box.y+y,{steps:16});}
 await page.mouse.up();await page.locator('#keep').waitFor();await page.locator('#keep').click();await go('Inventory');assert.equal(await page.locator('.product').count(),1);console.log('SCRATCH: discounted price, fixed persisted reward, single item');
 await go('Marketplace');await page.locator('[data-buy="jw-001"]').click();await go('Inventory');
 const bottle=page.locator('.product').filter({has:page.getByRole('heading',{name:'Black Label 12',exact:true})}).last();await bottle.locator('[data-auction]').click();await page.locator('input[name=start]').fill('1');await page.getByRole('button',{name:'Rozpocznij aukcję',exact:true}).click();
 await page.locator('.auction-card.active').waitFor();await page.waitForFunction(()=>document.querySelector('.auction-product img')?.classList.contains('cutout-ready'));await page.screenshot({path:'/tmp/whisky-auctions.png',fullPage:true});
 await page.locator('[data-auction-log]').click();assert.equal(await page.locator('.auction-log-dialog[open]').count(),1);await page.locator('.auction-log-dialog [data-close]').click();
 await page.clock.install();await page.clock.fastForward(75000);await page.reload();await go('Auctions');assert.ok(['sold','unsold'].includes((await read()).auctions[0].status));await page.clock.resume();console.log('AUCTION: visual card, history dialog, settlement after reload');
 await page.setViewportSize({width:390,height:844});
 for(const tab of ['Dashboard','Work','Upgrades','Scratch Cards','Auctions']){await go(tab);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${tab} must fit mobile`);await page.screenshot({path:`/tmp/whisky-mobile-${tab.replaceAll(' ','-')}.png`,fullPage:true});if(tab==='Scratch Cards'){const target=page.locator('[data-pack-tile="basic"]');await target.scrollIntoViewIfNeeded();const before=await target.boundingBox();await page.locator('[data-odds="basic"]').click();assert.equal(await page.locator('.odds-row').count(),3);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('.odds-dialog [data-close]').click();assert.ok(Math.abs(before.y-(await target.boundingBox()).y)<1);}}
 assert.deepEqual(errors,[]);console.log('MOBILE: all new screens fit; no browser errors');
}finally{await browser.close();}
