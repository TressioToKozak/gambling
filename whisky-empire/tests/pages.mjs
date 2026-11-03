import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith('/gambling/')){res.writeHead(404).end();return;}
  const file=path.resolve(root,url.pathname.slice('/gambling/'.length)||'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{const body=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream'}).end(body);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(`http://127.0.0.1:${server.address().port}/gambling/`);
  await page.locator('dialog').getByRole('button',{name:'Zaczynamy'}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.world-bottle img.cutout-ready').length===5);
  const silhouettes=await page.locator('.world-bottle img').evaluateAll(async images=>Promise.all(images.map(async img=>{
    const copy=new Image();copy.src=img.src;await copy.decode();const canvas=document.createElement('canvas');canvas.width=copy.width;canvas.height=copy.height;const ctx=canvas.getContext('2d');ctx.drawImage(copy,0,0);return {blob:img.src.startsWith('blob:'),corners:[[0,0],[copy.width-1,0],[0,copy.height-1],[copy.width-1,copy.height-1]].map(([x,y])=>ctx.getImageData(x,y,1,1).data[3])};
  })));
  assert.equal(silhouettes.length,5);for(const art of silhouettes){assert.equal(art.blob,true);assert.ok(art.corners.every(alpha=>alpha===0),'Product background must be transparent');}
  console.log('PASS: five hero bottles have real transparent corners');
  await page.locator('nav [data-tab="Marketplace"]').click();
  assert.equal(await page.locator('.product').count(),235);
  await page.locator('.product img').evaluateAll(images=>Promise.all(images.map(img=>{const copy=new Image();copy.src=img.src;return copy.decode();})));
  assert.deepEqual(errors,[]);
  console.log('PASS: GitHub Pages /gambling/ prefix, modules, catalog and all 235 photos');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
