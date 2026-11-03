import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const read=()=>page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('whisky-empire');r.onsuccess=()=>{const q=r.result.transaction('state').objectStore('state').get('game');q.onsuccess=()=>resolve(q.result);};}));
 await page.goto('http://127.0.0.1:5173');await page.locator('dialog').getByRole('button',{name:'Zaczynamy'}).click();await page.locator('nav [data-tab="Quests"]').click();assert.equal(await page.locator('[data-quest]').count(),24);assert.equal(await page.locator('[data-claim-quest]').count(),0);
 // Isolated legacy-progress fixture: proves migration and UI reward validation without resetting a save.
 await page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('whisky-empire');r.onsuccess=()=>{const tx=r.result.transaction('state','readwrite'),store=tx.objectStore('state'),q=store.get('game');q.onsuccess=()=>{const s=q.result;s.washed=100;s.workId=100;s.items=Array.from({length:10},(_,i)=>({uid:++s.seq,bottle:['jw-004','jw-2e092d2b628a','jw-001'][i%3],status:'collection',source:'scratch',cost:1350,time:s.last}));store.put(s,'game');};tx.oncomplete=resolve;};}));
 await page.reload();await page.locator('nav [data-tab="Quests"]').click();assert.equal(await page.locator('[data-claim-quest]').count(),6);
 await page.locator('[data-claim-quest="wash-100"]').click();await page.waitForFunction(()=>document.querySelector('[data-quest="wash-100"]').classList.contains('claimed'));let s=await read();assert.equal(s.balance,4500);assert.equal(s.questClaims['wash-100'].reward,3500);
 await page.locator('[data-quest-filter="ready"]').click();assert.equal(await page.locator('[data-quest]').count(),5);await page.locator('[data-claim-quest="set-basic"]').click();await page.waitForFunction(()=>!document.querySelector('[data-quest="set-basic"]'));assert.equal((await read()).balance,5000);
 await page.locator('[data-quest-filter="sets"]').click();assert.equal(await page.locator('[data-quest]').count(),13);await page.locator('[data-quest-set="red-club"]').click();assert.equal(await page.locator('.odds-row').count(),3);assert.match(await page.locator('.odds-list').textContent(),/W KOLEKCJI/);await page.locator('.odds-dialog [data-close]').click();await page.screenshot({path:'/tmp/whisky-quests-desktop.png',fullPage:true});
 await page.reload();await page.locator('nav [data-tab="Quests"]').click();assert.equal(await page.locator('[data-claim-quest="wash-100"]').count(),0);assert.equal(await page.locator('[data-quest="wash-100"].claimed').count(),1);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'/tmp/whisky-quests-mobile.png',fullPage:true});
 await page.locator('nav [data-tab="Work"]').click();await page.evaluate(()=>window.sinkRef=document.querySelector('#wash'));await page.locator('[data-claim-quest="wash-10"]').click();await page.waitForFunction(()=>document.querySelector('[data-quest-widget="bar"] [data-quest="wash-25"]'));assert.equal(await page.evaluate(()=>window.sinkRef===document.querySelector('#wash')),true);
 // Measure equivalent 200-frame workloads; include raster flush in each timing.
 const oldSource=execFileSync('git',['show','0218040:whisky-empire/components/wash-canvas.js'],{encoding:'utf8'});
 const performanceReport=await page.evaluate(async oldSource=>{
  const old=await import('data:text/javascript;base64,'+btoa(oldSource)),current=await import('/components/wash-canvas.js?v=quests-7');
  const dirt=Array.from({length:48},(_,i)=>({x:145+i%8*31,y:145+Math.floor(i/8)*34,left:.7}));
  function sample(draw){const canvas=document.createElement('canvas');canvas.width=520;canvas.height=430;const ctx=canvas.getContext('2d');for(let i=0;i<5;i++)draw(ctx,{dirt,sponge:{x:200,y:200},time:i*16});const start=performance.now();for(let i=0;i<200;i++)draw(ctx,{dirt,sponge:{x:200+i%100,y:200},progress:.8,time:i*16});ctx.getImageData(0,0,1,1);return (performance.now()-start)/200;}
  const previousMsPerFrame=sample(old.drawWashScene),cachedMsPerFrame=sample(current.drawWashScene);return {frames:200,previousMsPerFrame,cachedMsPerFrame,reductionPercent:(1-cachedMsPerFrame/previousMsPerFrame)*100};
 },oldSource);
 fs.writeFileSync('data/wash-performance-report.json',JSON.stringify({...performanceReport,note:'Chromium in cloud; equivalent Canvas draw workload with raster flush, not a guarantee of FPS on every device'},null,2));console.log('WASH CANVAS BENCHMARK',performanceReport);
 assert.deepEqual(errors,[]);console.log('QUESTS: 24 missions, legacy progress, claim once, albums, reload, mobile and same wash canvas: PASS');
}finally{await browser.close();}
