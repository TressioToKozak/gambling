import 'fake-indexeddb/auto';
import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {transact} from '../game/storage.js';import {voucher} from '../game/engine.js';
const catalog=[...JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url))),voucher];
test('IndexedDB serializes concurrent purchases, reward claims, sales and wash payouts',async()=>{
 await transact(catalog,{type:'reset'});
 for(let i=0;i<6;i++)await transact(catalog,{type:'tick'},{workId:i,activeMs:2500,coverage:1,distance:1000});
 const bought=await Promise.allSettled([transact(catalog,{type:'buyCard',tier:0}),transact(catalog,{type:'buyCard',tier:0})]);
 assert.equal(bought.filter(r=>r.status==='fulfilled').length,1);
 let s=await transact(catalog);assert.equal(s.balance,500);assert.equal(s.starterPassUsed,true);assert.equal(s.pending.starterDiscount,500);
 await Promise.all([transact(catalog,{type:'reveal'}),transact(catalog,{type:'reveal'})]);
 s=await transact(catalog);assert.equal(s.items.length,1);
 const sold=await Promise.allSettled([transact(catalog,{type:'sell',uid:s.items[0].uid}),transact(catalog,{type:'sell',uid:s.items[0].uid})]);
 assert.equal(sold.filter(r=>r.status==='fulfilled').length,1);
 s=await transact(catalog);assert.equal(s.transactions.filter(t=>t.type==='quick sell').length,1);
 const proof={workId:s.workId,activeMs:8000,coverage:1,distance:1500};
 const wages=await Promise.allSettled([transact(catalog,{type:'tick'},proof),transact(catalog,{type:'tick'},proof)]);
 assert.equal(wages.filter(r=>r.status==='fulfilled').length,1);
 assert.equal((await transact(catalog)).washed,7);
 const gifts=await Promise.allSettled([transact(catalog,{type:'starter'}),transact(catalog,{type:'starter'})]);
 assert.equal(gifts.filter(r=>r.status==='fulfilled').length,1);
 assert.equal((await transact(catalog)).items.filter(x=>x.source==='starter').length,1);
});

test('concurrent upgrade purchases apply one level and one charge',async()=>{
 await transact(catalog,{type:'reset'});for(let i=0;i<3;i++)await transact(catalog,{type:'tick'},{workId:i,activeMs:2500,coverage:1,distance:1000});
 const bought=await Promise.allSettled([transact(catalog,{type:'upgrade',id:'sponge',expectedLevel:0}),transact(catalog,{type:'upgrade',id:'sponge',expectedLevel:0})]);
 assert.equal(bought.filter(r=>r.status==='fulfilled').length,1);const s=await transact(catalog);assert.equal(s.upgrades.sponge,1);assert.equal(s.balance,100);assert.equal(s.transactions.filter(t=>t.type==='upgrade').length,1);
});
