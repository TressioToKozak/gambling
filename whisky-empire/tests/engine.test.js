import {test} from 'node:test';import assert from 'node:assert/strict';import {initial,command,advance,payWash,pools,voucher,washRules,upgradeOffer} from '../game/engine.js';
// Explicit test fixtures; these are not catalog records or shipped rewards.
import fs from 'node:fs';
const catalog=[...JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url))),voucher,{id:'fixture-low',name:'Johnnie Walker TEST FIXTURE',base:400,rarity:'Common'},{id:'fixture-high',name:'Johnnie Walker TEST FIXTURE HIGH',base:1200,rarity:'Uncommon'}];
test('starts at €10 and insufficient funds cannot mutate state',()=>{const s=initial(0);assert.equal(s.balance,1000);assert.throws(()=>command(s,catalog,{type:'buyCard',tier:6},0));assert.equal(s.balance,1000);});
test('reward is saved at purchase, claimed once, sold once',()=>{const start=initial(0);start.balance=2000;let s=command(start,catalog,{type:'buyCard',tier:0},0);const id=s.pending.bottle;s=command(s,catalog,{type:'reveal'},0);s=command(s,catalog,{type:'reveal'},0);assert.equal(s.items.length,1);assert.equal(s.items[0].bottle,id);const uid=s.items[0].uid;s=command(s,catalog,{type:'sell',uid},0);assert.throws(()=>command(s,catalog,{type:'sell',uid},0));});
test('auction locks item and settles exactly once across restarts',()=>{let s=command(initial(0),catalog,{type:'buy',id:'fixture-low'},0);const uid=s.items[0].uid;s=command(s,catalog,{type:'auction',uid,start:100,minutes:1},0);assert.throws(()=>command(s,catalog,{type:'sell',uid},0));s=command(JSON.parse(JSON.stringify(s)),catalog,{type:'tick'},120000);const n=s.transactions.length,b=s.balance;s=command(s,catalog,{type:'tick'},120000);assert.equal(s.transactions.length,n);assert.equal(s.balance,b);assert.notEqual(s.items[0].status,'auction');});
test('clock rollback cannot roll market back; refresh is deterministic',()=>{const a=initial(0),b=initial(0);advance(a,catalog,300000);advance(b,catalog,150000);advance(b,catalog,300000);assert.deepEqual(a.prices,b.prices);const tick=a.tick;advance(a,catalog,1);assert.equal(a.tick,tick);});
test('market stays bounded and buying then selling loses money',()=>{let s=initial(0);for(let i=0;i<30;i++)advance(s,catalog,i*300000);for(const b of catalog.filter(b=>!b.kind))assert.ok(s.prices[b.id].price>=b.base*.55&&s.prices[b.id].price<=b.base*1.2);s=initial(0);s=command(s,catalog,{type:'buy',id:'fixture-low'},0);s=command(s,catalog,{type:'sell',uid:s.items[0].uid},0);assert.ok(s.balance<1000);});
test('incomplete washing earns nothing',()=>{const s=initial(0);assert.throws(()=>payWash(s,{workId:0,activeMs:2499,coverage:1,distance:4000}));assert.equal(s.balance,1000);payWash(s,{workId:0,activeMs:8000,coverage:1,distance:1500});assert.equal(s.balance,1100);});
test('all available pools sum to 100%, have <= 80% baseline quick sell EV',()=>{for(const p of pools(catalog)){if(!p.pool.length)continue;assert.ok(Math.abs(p.pool.reduce((n,r)=>n+r.chance,0)-1)<1e-12);assert.ok(p.ev<=p.price*.8);}});

test('wash proof cannot be replayed',()=>{const s=initial(0),proof={workId:0,activeMs:8000,coverage:1,distance:1500};payWash(s,proof);assert.throws(()=>payWash(s,proof));assert.equal(s.balance,1100);});

test('no positive scratch EV even at the upper price bound',()=>{for(const p of pools(catalog))assert.ok(p.ev*1.2<p.price);});

test('first bottle quest is available once after a real wash and survives reload',()=>{let s=initial(0);assert.throws(()=>command(s,catalog,{type:'starter'},0));payWash(s,{workId:0,activeMs:2500,coverage:.95,distance:600});s=command(s,catalog,{type:'starter'},0);assert.equal(s.items[0].bottle,'jw-004');assert.equal(s.items[0].source,'starter');assert.equal(s.balance,1100);assert.throws(()=>command(JSON.parse(JSON.stringify(s)),catalog,{type:'starter'},0));});

test('themed packs include all matching Black Label and Label editions, with no fragments',()=>{
 const packs=pools(catalog);assert.deepEqual(packs.find(p=>p.id==='basic').pool.map(r=>r.id),['jw-004','jw-2e092d2b628a','jw-001']);
 for(const [id,pattern] of [['black',/\bblack label\b/i],['labels',/\blabel\b/i]]){const expected=catalog.filter(b=>b.source&&!b.kind&&pattern.test(b.name)).map(b=>b.id).sort();assert.deepEqual(packs.find(p=>p.id===id).pool.map(r=>r.id).sort(),expected);}
 assert.ok(packs.every(p=>p.pool.every(r=>r.id!==voucher.id&&r.chance>0)));
});
test('purchased loyalty lowers prices without changing odds or creating positive expected returns',()=>{
 const s=initial(0);s.upgrades={loyalty:3};const base=pools(catalog),discount=pools(catalog,s);
 for(let i=0;i<base.length;i++){assert.equal(discount[i].price,Math.ceil(base[i].basePrice*.92));assert.deepEqual(discount[i].pool,base[i].pool);assert.ok(base[i].ev*1.2<discount[i].price);}
});
test('upgrades debit once, reject stale level purchases and preserve old saves',()=>{
 let s=initial(0);delete s.upgrades;assert.equal(washRules(s).reward,100);assert.equal(washRules(s).radius,48);assert.throws(()=>command(s,catalog,{type:'upgrade',id:'sponge',expectedLevel:0},0));
 s.balance=10000;s=command(s,catalog,{type:'upgrade',id:'sponge',expectedLevel:0},0);assert.equal(s.balance,8800);assert.equal(s.upgrades.sponge,1);assert.equal(washRules(s).radius,58);
 assert.throws(()=>command(s,catalog,{type:'upgrade',id:'sponge',expectedLevel:0},0));assert.equal(s.balance,8800);
 s.upgrades.sponge=3;assert.throws(()=>command(s,catalog,{type:'upgrade',id:'sponge',expectedLevel:3},0));
});
test('maximum work upgrades give a finite earned payout and reject invalid proof',()=>{
 const s=initial(0);s.upgrades={speed:3,soap:3,sponge:3,tips:3};const r=washRules(s);assert.equal(r.activeMs,1600);assert.equal(r.reward,180);assert.equal(r.radius,80);assert.equal(r.cleanMs,90);
 assert.throws(()=>payWash(s,{workId:0,activeMs:NaN,coverage:1,distance:1000}));assert.throws(()=>payWash(s,{workId:0,activeMs:1599,coverage:1,distance:1000}));
 payWash(s,{workId:0,activeMs:1600,coverage:.95,distance:600});assert.equal(s.balance,1180);
});
test('legacy pending fragment remains redeemable after pack replacement',()=>{
 const s=initial(0);s.pending={uid:5,bottle:voucher.id,cost:500,revealed:false};s.seq=5;
 const revealed=command(s,catalog,{type:'reveal'},0);const sold=command(revealed,catalog,{type:'sell',uid:5},0);assert.equal(sold.balance,1200);assert.equal(sold.pending,null);
});
