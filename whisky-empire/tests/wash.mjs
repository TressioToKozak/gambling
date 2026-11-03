import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage();page.setDefaultTimeout(12000);
 await page.goto('http://127.0.0.1:5173');await page.locator('dialog').getByRole('button',{name:'Zaczynamy'}).click();
 const read=()=>page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('whisky-empire');r.onsuccess=()=>{const q=r.result.transaction('state').objectStore('state').get('game');q.onsuccess=()=>resolve(q.result);};}));
 async function scrub(){
  const before=(await read()).washed,box=await page.locator('#wash').boundingBox(),start=Date.now();let complete=false;
  await page.mouse.move(box.x+145*box.width/520,box.y+145*box.height/430);await page.mouse.down();
  for(let round=0;round<5&&!complete;round++)for(let row=0;row<6&&!complete;row++){
   for(let col=0;col<8;col++){const x=round%2===0?col:7-col;await page.mouse.move(box.x+(145+x*31)*box.width/520,box.y+(145+row*34)*box.height/430);await page.waitForTimeout(35);}
   complete=(await read()).washed>before;
  }
  await page.mouse.up();assert.equal((await read()).washed,before+1);return Date.now()-start;
 }
 await page.locator('nav [data-tab="Work"]').click();await page.evaluate(()=>{window.sinkRef=document.querySelector('#wash');window.headerRef=document.querySelector('.game-header');});const box=await page.locator('#wash').boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);assert.equal((await read()).washed,0,'Clicking alone cannot earn wages');
 const baseMs=await scrub();assert.equal(await page.evaluate(()=>window.sinkRef===document.querySelector('#wash')&&window.headerRef===document.querySelector('.game-header')),true);let s=await read();assert.equal(s.balance,1100);console.log('BASE WASH:',baseMs,'ms; +1 euro exactly once');
 await page.locator('#starter').click();s=await read();assert.equal(s.starterClaimed,true);assert.equal(s.items.filter(x=>x.source==='starter').length,1);
 await page.reload();assert.equal(await page.locator('#starter').count(),0);console.log('STARTER: one Red Label persisted');
 // Test-only funding of an isolated profile so all 15 upgrade purchases can be exercised.
 await page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('whisky-empire');r.onsuccess=()=>{const tx=r.result.transaction('state','readwrite'),store=tx.objectStore('state'),q=store.get('game');q.onsuccess=()=>{const s=q.result;s.balance=600000;store.put(s,'game');};tx.oncomplete=resolve;};}));
 await page.reload();await page.locator('nav [data-tab="Upgrades"]').click();
 for(let level=0;level<3;level++)for(const [group,ids] of [['bar',['sponge','soap','speed','tips']],['scratch',['loyalty','coin','quicksell','luck']]]){await page.locator(`[data-upgrade-group="${group}"]`).click();for(const id of ids){await page.locator(`[data-upgrade="${id}"][data-level="${level}"]`).click();await page.locator(`[data-upgrade="${id}"][data-level="${level+1}"]`).waitFor();}}

 s=await read();assert.equal(s.balance,253300);assert.ok(Object.values(s.upgrades).every(level=>level===3));
 await page.locator('nav [data-tab="Work"]').click();const maxMs=await scrub();s=await read();assert.equal(s.balance,253480);assert.equal(s.washed,2);console.log('MAX WASH:',maxMs,'ms; all 24 purchases persisted; payout +1.80 euro');
 assert.ok(maxMs<baseMs,'Fully upgraded cleaning should complete faster');
}finally{await browser.close();}
