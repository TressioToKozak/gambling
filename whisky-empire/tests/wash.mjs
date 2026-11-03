import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage();page.setDefaultTimeout(10000);
 await page.goto('http://127.0.0.1:5173');await page.locator('dialog').getByRole('button',{name:'Zaczynamy'}).click();
 await page.locator('nav [data-tab="Work"]').click();
 const read=()=>page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('whisky-empire');r.onsuccess=()=>{const q=r.result.transaction('state').objectStore('state').get('game');q.onsuccess=()=>resolve(q.result);};}));
 const box=await page.locator('#wash').boundingBox();
 await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
 assert.equal((await read()).washed,0,'Clicking alone cannot earn wages');
 const start=Date.now();let complete=false;
 await page.mouse.move(box.x+145*box.width/520,box.y+145*box.height/430);await page.mouse.down();
 for(let round=0;round<5&&!complete;round++){
  for(let row=0;row<6&&!complete;row++){
   for(let col=0;col<8;col++){
    const x=round%2===0?col:7-col;
    await page.mouse.move(box.x+(145+x*31)*box.width/520,box.y+(145+row*34)*box.height/430);
    await page.waitForTimeout(35);
   }
   complete=(await read()).washed>=1;
  }
 }
 await page.mouse.up();let s=await read();
 assert.equal(s.washed,1);assert.equal(s.balance,1100);
 console.log('WASH: actual pointer cleaning completed in',Date.now()-start,'ms; +1 euro exactly once');
 await page.locator('#starter').click();s=await read();
 assert.equal(s.starterClaimed,true);assert.equal(s.items.filter(x=>x.source==='starter').length,1);
 assert.equal(s.items.find(x=>x.source==='starter').bottle,'jw-004');
 await page.reload();assert.equal(await page.locator('#starter').count(),0);
 assert.equal((await read()).items.filter(x=>x.source==='starter').length,1);
 console.log('STARTER: Red Label granted once, persisted after reload');
}finally{await browser.close();}
