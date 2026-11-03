import {test} from 'node:test';import assert from 'node:assert/strict';import {initial,command,advance,payWash,pools,voucher,washRules,upgradeOffer,quickValue,auctionEstimate,UPGRADE_DEFS} from '../game/engine.js';
// Explicit test fixtures; these are not catalog records or shipped rewards.
import fs from 'node:fs';
const catalog=[...JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url))),voucher,{id:'fixture-low',name:'Johnnie Walker TEST FIXTURE',base:400,rarity:'Common'},{id:'fixture-high',name:'Johnnie Walker TEST FIXTURE HIGH',base:1200,rarity:'Uncommon'}];
test('starts at €10 and insufficient funds cannot mutate state',()=>{const s=initial(0);assert.equal(s.balance,1000);assert.throws(()=>command(s,catalog,{type:'buyCard',tier:6},0));assert.equal(s.balance,1000);});
test('reward is saved at purchase, claimed once, sold once',()=>{const start=initial(0);start.balance=2000;let s=command(start,catalog,{type:'buyCard',tier:0},0);const id=s.pending.bottle;s=command(s,catalog,{type:'reveal'},0);s=command(s,catalog,{type:'reveal'},0);assert.equal(s.items.length,1);assert.equal(s.items[0].bottle,id);const uid=s.items[0].uid;s=command(s,catalog,{type:'sell',uid},0);assert.throws(()=>command(s,catalog,{type:'sell',uid},0));});
test('auction locks item and settles exactly once across restarts',()=>{let s=command(initial(0),catalog,{type:'buy',id:'fixture-low'},0);const uid=s.items[0].uid;s=command(s,catalog,{type:'auction',uid,start:100,minutes:1},0);assert.throws(()=>command(s,catalog,{type:'sell',uid},0));s=command(JSON.parse(JSON.stringify(s)),catalog,{type:'tick'},120000);const n=s.transactions.length,b=s.balance;s=command(s,catalog,{type:'tick'},120000);assert.equal(s.transactions.length,n);assert.equal(s.balance,b);assert.notEqual(s.items[0].status,'auction');});
test('clock rollback cannot roll market back; refresh is deterministic',()=>{const a=initial(0),b=initial(0);advance(a,catalog,300000);advance(b,catalog,150000);advance(b,catalog,300000);assert.deepEqual(a.prices,b.prices);const tick=a.tick;advance(a,catalog,1);assert.equal(a.tick,tick);});
test('market stays bounded and buying then selling loses money',()=>{let s=initial(0);for(let i=0;i<30;i++)advance(s,catalog,i*300000);for(const b of catalog.filter(b=>!b.kind))assert.ok(s.prices[b.id].price>=b.base*.55&&s.prices[b.id].price<=b.base*1.2);s=initial(0);s=command(s,catalog,{type:'buy',id:'fixture-low'},0);s=command(s,catalog,{type:'sell',uid:s.items[0].uid},0);assert.ok(s.balance<1000);});
test('incomplete washing earns nothing',()=>{const s=initial(0);assert.throws(()=>payWash(s,{workId:0,activeMs:1999,coverage:1,distance:4000}));assert.equal(s.balance,1000);payWash(s,{workId:0,activeMs:8000,coverage:1,distance:1500});assert.equal(s.balance,1150);});
test('all available pools sum to 100%, have <= 90% baseline quick sell EV',()=>{for(const p of pools(catalog)){if(!p.pool.length)continue;assert.ok(Math.abs(p.pool.reduce((n,r)=>n+r.chance,0)-1)<1e-12);assert.ok(p.ev<=p.price*.9);}});

test('wash proof cannot be replayed',()=>{const s=initial(0),proof={workId:0,activeMs:8000,coverage:1,distance:1500};payWash(s,proof);assert.throws(()=>payWash(s,proof));assert.equal(s.balance,1150);});

test('scratch prices stay at the initial catalog quote through rising and falling markets',()=>{
 const s=initial(0);s.starterPassUsed=true;const baseline=pools(catalog,s);for(const multiplier of [.55,.9,1.2]){for(const b of catalog)s.prices[b.id]={price:Math.round(b.base*multiplier)};for(const p of pools(catalog,s)){const base=baseline.find(x=>x.id===p.id);assert.equal(p.price,base.price);assert.deepEqual(p.pool,base.pool);}}
});

test('first bottle quest is available once after a real wash and survives reload',()=>{let s=initial(0);assert.throws(()=>command(s,catalog,{type:'starter'},0));payWash(s,{workId:0,activeMs:2500,coverage:.95,distance:600});s=command(s,catalog,{type:'starter'},0);assert.equal(s.items[0].bottle,'jw-004');assert.equal(s.items[0].source,'starter');assert.equal(s.balance,1150);assert.throws(()=>command(JSON.parse(JSON.stringify(s)),catalog,{type:'starter'},0));});

test('themed packs include all matching Black Label and Label editions, with no fragments',()=>{
 const packs=pools(catalog);assert.deepEqual(packs.find(p=>p.id==='basic').pool.map(r=>r.id),['jw-004','jw-2e092d2b628a','jw-001']);
 for(const [id,pattern] of [['black',/\bblack label\b/i],['labels',/\blabel\b/i]]){const expected=catalog.filter(b=>b.source&&!b.kind&&pattern.test(b.name)).map(b=>b.id).sort();assert.deepEqual(packs.find(p=>p.id===id).pool.map(r=>r.id).sort(),expected);}
 assert.ok(packs.every(p=>p.pool.every(r=>r.id!==voucher.id&&r.chance>0)));
});
test('purchased loyalty lowers prices without changing odds or creating positive expected returns',()=>{
 const s=initial(0);s.upgrades={loyalty:3};s.starterPassUsed=true;const base=pools(catalog),discount=pools(catalog,s);
 for(let i=0;i<base.length;i++){assert.equal(discount[i].price,Math.ceil(base[i].basePrice*.92));assert.deepEqual(discount[i].pool,base[i].pool);assert.ok(base[i].ev<discount[i].price);}
});
test('upgrades debit once, reject stale level purchases and preserve old saves',()=>{
 let s=initial(0);delete s.upgrades;assert.equal(washRules(s).reward,150);assert.equal(washRules(s).radius,48);s.balance=0;assert.throws(()=>command(s,catalog,{type:'upgrade',id:'sponge',expectedLevel:0},0));
 s.balance=10000;s=command(s,catalog,{type:'upgrade',id:'sponge',expectedLevel:0},0);assert.equal(s.balance,9300);assert.equal(s.upgrades.sponge,1);assert.equal(washRules(s).radius,58);
 assert.throws(()=>command(s,catalog,{type:'upgrade',id:'sponge',expectedLevel:0},0));assert.equal(s.balance,9300);
 s.upgrades.sponge=3;assert.throws(()=>command(s,catalog,{type:'upgrade',id:'sponge',expectedLevel:3},0));
});
test('maximum work upgrades give a finite earned payout and reject invalid proof',()=>{
 const s=initial(0);s.upgrades={speed:3,soap:3,sponge:3,tips:3};const r=washRules(s);assert.equal(r.activeMs,1250);assert.equal(r.reward,250);assert.equal(r.radius,80);assert.equal(r.cleanMs,75);
 assert.throws(()=>payWash(s,{workId:0,activeMs:NaN,coverage:1,distance:1000}));assert.throws(()=>payWash(s,{workId:0,activeMs:1249,coverage:1,distance:1000}));
 payWash(s,{workId:0,activeMs:1250,coverage:.95,distance:600});assert.equal(s.balance,1250);
});
test('legacy pending fragment remains redeemable after pack replacement',()=>{
 const s=initial(0);s.pending={uid:5,bottle:voucher.id,cost:500,revealed:false};s.seq=5;
 const revealed=command(s,catalog,{type:'reveal'},0);const sold=command(revealed,catalog,{type:'sell',uid:5},0);assert.equal(sold.balance,1200);assert.equal(sold.pending,null);
});

test('six starter collections have distinct pools and one is affordable with the first pass',()=>{
 const packs=pools(catalog,initial(0)),starter=packs.filter(p=>p.starter);assert.equal(starter.length,6);assert.equal(packs.length,13);assert.equal(new Set(starter.map(p=>p.pool.map(r=>r.id).join(','))).size,6);
 const red=starter.find(p=>p.id==='red-club');assert.equal(red.regularPrice,1275);assert.equal(red.price,775);assert.equal(red.starterDiscount,500);assert.ok(red.price<=initial(0).balance);
});
test('the starter pass is consumed once across packs and survives a restart',()=>{
 let s=initial(0);s.balance=10000;const normal=pools(catalog);s=command(s,catalog,{type:'buyCard',packId:'red-club'},0);assert.equal(s.pending.cost,775);assert.equal(s.pending.starterDiscount,500);assert.equal(s.starterPassUsed,true);
 s=command(s,catalog,{type:'reveal'},0);s=command(s,catalog,{type:'keep'},0);s=JSON.parse(JSON.stringify(s));
 for(const p of pools(catalog,s)){assert.equal(p.starterDiscount,0);assert.equal(p.price,normal.find(n=>n.id===p.id).price);}
 s=command(s,catalog,{type:'buyCard',packId:'red-club'},0);assert.equal(s.pending.cost,1275);assert.equal(s.pending.starterDiscount,0);
 const poor=initial(0);poor.balance=100;assert.throws(()=>command(poor,catalog,{type:'buyCard',packId:'red-club'},0));assert.equal(poor.starterPassUsed,false);
});

test('every pack has a profitable baseline jackpot, including Red Rye and ultra-limited reserve',()=>{
 for(const p of pools(catalog)){assert.ok(p.pool.length>0,p.id);assert.ok(p.max*.85>p.price,p.id+' top reward must recover ticket cost');}
 assert.ok(pools(catalog).find(p=>p.id==='red-club').pool.some(r=>r.id==='jw-851ef6c0baad'));
 const royal=pools(catalog).find(p=>p.id==='imperial');assert.ok(royal.price>=850000);assert.equal(royal.pool.length,6);
});
test('luck shifts probability toward higher-value bottles without depending on balance or loss history',()=>{
 const base=initial(0),upgraded=initial(0);upgraded.upgrades={luck:3};const p=pools(catalog,base).find(p=>p.id==='red-club'),q=pools(catalog,upgraded).find(p=>p.id==='red-club');assert.ok(q.pool.find(r=>r.id==='jw-851ef6c0baad').chance>p.pool.find(r=>r.id==='jw-851ef6c0baad').chance);
 upgraded.balance=9999999;upgraded.transactions=[{type:'scratch',amount:-999999}];assert.deepEqual(pools(catalog,upgraded).find(p=>p.id==='red-club').pool,q.pool);
});
test('all combinations of luck, quick sell and VIP have negative repeat EV at catalog baseline',()=>{
 for(let luck=0;luck<4;luck++)for(let quicksell=0;quicksell<4;quicksell++)for(let loyalty=0;loyalty<4;loyalty++){
 const s=initial(0);s.starterPassUsed=true;s.upgrades={luck,quicksell,loyalty};for(const p of pools(catalog,s)){assert.ok(p.ev<p.price,p.id);assert.ok(Math.abs(p.pool.reduce((n,r)=>n+r.chance,0)-1)<1e-12);}}
});

test('better quick sell applies exactly and purchased luck cannot reroll an existing scratch',()=>{
 let s=initial(0);s.balance=100000;s=command(s,catalog,{type:'buyCard',packId:'basic'},0);const reward=s.pending.bottle;s=command(s,catalog,{type:'upgrade',id:'luck',expectedLevel:0},0);assert.equal(s.pending.bottle,reward);
 s.upgrades.quicksell=3;assert.equal(quickValue(s,catalog.find(b=>b.id==='jw-001')),Math.floor(1895*.88));assert.ok(quickValue(s,catalog.find(b=>b.id==='jw-001'))<Math.ceil(1895*1.03));
});
test('auction price advice rewards competitive prices while excessive asks can go unsold',()=>{
 assert.ok(auctionEstimate(1900,1800,1).chance>.8);assert.ok(auctionEstimate(1900,1800,5).chance>auctionEstimate(1900,1800,1).chance);assert.equal(auctionEstimate(1900,3000,15).chance,0);assert.ok(auctionEstimate(1900,1800).maxBid*.95<1900*1.03);
});


test('washing, scratch and trading quests require actual progress and pay once',()=>{
 let s=initial(0);assert.throws(()=>command(s,catalog,{type:'claimQuest',id:'wash-10'},0));assert.throws(()=>command(s,catalog,{type:'claimQuest',id:'missing'},0));
 for(let i=0;i<10;i++)payWash(s,{workId:i,activeMs:2000,coverage:1,distance:600});
 const before=s.balance;s=command(s,catalog,{type:'claimQuest',id:'wash-10'},0);assert.equal(s.balance,before+500);assert.throws(()=>command(JSON.parse(JSON.stringify(s)),catalog,{type:'claimQuest',id:'wash-10'},0));
 s=command(s,catalog,{type:'buyCard',packId:'red-club'},0);assert.throws(()=>command(s,catalog,{type:'claimQuest',id:'scratch-1'},0));
 s=command(s,catalog,{type:'reveal'},0);s=command(s,catalog,{type:'claimQuest',id:'scratch-1'},0);assert.equal(s.questClaims['scratch-1'].reward,200);
 assert.throws(()=>command(s,catalog,{type:'claimQuest',id:'trade-5'},0));s.items=Array.from({length:5},(_,i)=>({uid:100+i,bottle:'jw-004',status:'sold'}));
 s=command(s,catalog,{type:'claimQuest',id:'trade-5'},0);assert.equal(s.questClaims['trade-5'].reward,500);
});
test('album quest counts distinct currently owned editions, includes auction locks and survives reload',()=>{
 let s=initial(0);s.items=[{uid:1,bottle:'jw-004',status:'collection'},{uid:2,bottle:'jw-004',status:'collection'},{uid:3,bottle:'jw-001',status:'auction'},{uid:4,bottle:'jw-2e092d2b628a',status:'sold'}];
 assert.throws(()=>command(s,catalog,{type:'claimQuest',id:'set-basic'},0));s.items[3].status='collection';s=command(s,catalog,{type:'claimQuest',id:'set-basic'},0);
 assert.equal(s.balance,1500);assert.throws(()=>command(JSON.parse(JSON.stringify(s)),catalog,{type:'claimQuest',id:'set-basic'},0));assert.equal(s.transactions.filter(t=>t.type==='quest').length,1);
});
test('a displayed fixed scratch quote remains valid after market prices move',()=>{
 const s=initial(0);s.balance=100000;s.starterPassUsed=true;const quoted=pools(catalog,s)[0].price;for(const b of catalog)s.prices[b.id]={price:Math.round(b.base*1.2)};
 const next=command(s,catalog,{type:'buyCard',packId:'basic',maxPrice:quoted},0);assert.equal(next.pending.cost,quoted);assert.equal(next.balance,100000-quoted);assert.throws(()=>command(s,catalog,{type:'buyCard',packId:'basic',maxPrice:quoted-1},0));
});

test('market changes cannot modify any fixed pack quote or chance at any upgrade level',()=>{
 for(let luck=0;luck<4;luck++)for(let quicksell=0;quicksell<4;quicksell++)for(let loyalty=0;loyalty<4;loyalty++){
 const s=initial(0);s.starterPassUsed=true;s.upgrades={luck,quicksell,loyalty};const baseline=pools(catalog,s);catalog.forEach((b,i)=>s.prices[b.id]={price:Math.round(b.base*(i%2?.55:1.2))});
 for(const p of pools(catalog,s)){const old=baseline.find(x=>x.id===p.id);assert.equal(p.price,old.price);assert.deepEqual(p.pool,old.pool);}}
});

test('starter packs have improved baseline returns and five middle rewards are within 10% of break even',()=>{
 const starter=pools(catalog).filter(p=>p.starter);let nearEven=0;
 for(const p of starter){assert.ok(p.ev/p.price>=.8,p.id+' baseline return');const prizes=p.pool.map(r=>catalog.find(b=>b.id===r.id)).sort((a,b)=>a.base-b.base),middle=Math.floor(prizes[Math.floor(prizes.length/2)].base*.85);if(Math.abs(middle/p.price-1)<=.1)nearEven++;}
 assert.ok(nearEven>=5);
});

test('closing an unexposed, partially scratched or revealed ticket stores exactly one owned bottle',()=>{
 for(const revealed of [false,true]){let s=initial(0);s.balance=10000;s=command(s,catalog,{type:'buyCard',packId:'basic'},0);const pending=structuredClone(s.pending);if(revealed)s=command(s,catalog,{type:'reveal'},0);
 s=command(s,catalog,{type:'stashScratch',uid:pending.uid},0);assert.equal(s.pending,null);assert.equal(s.items.length,1);assert.equal(s.items[0].bottle,pending.bottle);assert.equal(s.items[0].uid,pending.uid);assert.equal(s.items[0].cost,pending.cost);assert.equal(s.items[0].status,'collection');
 assert.throws(()=>command(JSON.parse(JSON.stringify(s)),catalog,{type:'stashScratch',uid:pending.uid},0));assert.equal(s.items.length,1);
 }
});
test('a stale close cannot consume a different ticket and no ticket is stashed for free',()=>{
 let s=initial(0);assert.throws(()=>command(s,catalog,{type:'stashScratch',uid:1},0));s.balance=10000;s=command(s,catalog,{type:'buyCard',packId:'basic'},0);assert.throws(()=>command(s,catalog,{type:'stashScratch',uid:s.pending.uid+1},0));assert.equal(s.items.length,0);
});
