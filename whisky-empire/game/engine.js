// All currency is integer euro cents. This module has no browser dependencies.
export const tiers = ['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
export function initial(now=Date.now()) { return {version:1,balance:1000,items:[],pending:null,auctions:[],transactions:[],washed:0,workId:0,seq:0,tick:0,epoch:now,last:now,prices:{},history:[],news:[],sound:false,tutorial:true,seed:271828}; }
export function random(s) { s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0; return s.seed/4294967296; }
export function validateCatalog(c) { const ids=new Set(); for(const b of c) { if(!b.id||ids.has(b.id)||!b.name?.includes('Johnnie Walker')||!Number.isInteger(b.base)||b.base<=0||!tiers.includes(b.rarity)||!b.source||!b.imageSource||!b.image) throw Error('Nieprawidłowy katalog lub brak źródeł'); ids.add(b.id); } return c; }
export const voucher={id:'game-fragment',name:'Fragment kolekcji — przedmiot gry',base:200,rarity:'Common',kind:'voucher',image:'',source:'Whisky Empire — fikcyjny przedmiot',imageSource:'Brak fotografii — nagroda tekstowa'};
export function pools(c) {
 const specs=[['Budget',500,[[voucher.id,.9],['jw-004',.1]]],['Classic',1500,[['jw-004',.70],['jw-2e092d2b628a',.24],['jw-001',.06]]],['Silver',2500,[['jw-004',.35],['jw-001',.35],['jw-005',.25],['jw-006',.05]]],['Gold',3500,[['jw-001',.35],['jw-005',.25],['jw-003',.25],['jw-006',.15]]],['Platinum',6000,[['jw-006',.40],['jw-003',.30],['jw-007',.25],['jw-002',.05]]],['Diamond',25000,[['jw-002',.65],['jw-010',.25],['jw-b796e19b1d48',.09],['jw-d06af9adc2c2',.01]]],['Legendary',250000,[['jw-d06af9adc2c2',.675],['jw-ed-79e6703b3050',.30],['jw-bbb3e123ff54',.02],['jw-3168521d58c6',.005]]]];
 return specs.map(([name,price,entries])=>{const pool=entries.every(([id])=>id===voucher.id||c.some(b=>b.id===id))?entries.map(([id,chance])=>({id,chance})):[];return {name,price,pool,ev:pool.reduce((n,r)=>{const b=r.id===voucher.id?voucher:c.find(b=>b.id===r.id);return n+b.base*(b.kind==='voucher'?1:.85)*r.chance;},0)};});
}
export function quickValue(s,b){return Math.floor(value(s,b)*(b.kind==='voucher'?1:.85));}
function record(s,type,amount,details='') { s.transactions.push({id:++s.seq,type,amount,details,time:s.last}); s.balance+=amount; if(s.balance<0)throw Error('Niewystarczające środki'); }
function item(s,id){ const x=s.items.find(x=>x.uid===id); if(!x||x.status!=='collection')throw Error('Butelka niedostępna'); return x; }
export function value(s,b){return s.prices[b.id]?.price??b.base;}
export function advance(s,c,now) {
 s.last=Math.max(s.last,now); const target=Math.floor((s.last-s.epoch)/12500); // 24 ticks = 5 minute market day
 // Cap work per call without discarding unprocessed ticks.
 for(let n=0;s.tick<target&&n<240;n++) { s.tick++; const event=s.tick%24===0?(random(s)-.5)*.07:0;
 if(event)s.news.unshift({tick:s.tick,text:event>0?'Popyt kolekcjonerów rośnie':'Korekta na rynku whisky'});
 for(const b of c){ if(b.kind==='voucher')continue; const p=s.prices[b.id]??{price:b.base,trend:0,history:[{tick:0,price:b.base}]}; p.trend=p.trend*.85+(random(s)-.5)*.006; const rarity=tiers.indexOf(b.rarity); const change=(b.base-p.price)*.025+p.price*(p.trend+(random(s)-.5)*(.016+rarity*.006)+event*(1+rarity*.2)); p.price=Math.round(Math.max(b.base*.55,Math.min(b.base*1.2,p.price+change))); p.history.push({tick:s.tick,price:p.price}); p.history=p.history.slice(-6000); s.prices[b.id]=p; }
 const time=s.epoch+s.tick*12500;
 for(const a of s.auctions.filter(a=>a.status==='active')) { const b=c.find(b=>b.id===a.bottle); if(!b)continue;
 if(time<=a.end && random(s)<.16) {const ceiling=value(s,b)*a.interest; const bid=a.bid?Math.ceil(a.bid*1.04):a.start;if(bid<=ceiling){a.bid=bid;a.bids.push({tick:s.tick,bid});if(a.buyNow&&bid>=a.buyNow){a.bid=a.buyNow;a.end=time;}}}
 if(time>=a.end){ const x=s.items.find(x=>x.uid===a.uid);a.status=a.bid?'sold':'unsold';x.status=a.bid?'sold':'collection';if(a.bid){record(s,'auction',Math.floor(a.bid*.95),b.name);x.proceeds=Math.floor(a.bid*.95);}} }
 s.history.push({tick:s.tick,balance:s.balance,collection:s.items.filter(x=>x.status!=='sold').reduce((n,x)=>n+value(s,c.find(b=>b.id===x.bottle)),0)}); s.history=s.history.slice(-6000);
 } s.news=s.news.slice(0,10);
}
export function command(state,c,action,now=Date.now()) {
 const s=structuredClone(state); advance(s,c,now);
 if(action.type==='sound')s.sound=!s.sound;
 if(action.type==='tutorial')s.tutorial=false;
 if(action.type==='buyCard') { if(s.pending)throw Error('Najpierw odbierz obecną zdrapkę'); const card=pools(c)[action.tier];if(!card?.pool.length)throw Error('Brak zweryfikowanej puli nagród');if(s.balance<card.price)throw Error('Niewystarczające środki');record(s,'scratch',-card.price,card.name);let r=random(s),reward=card.pool.at(-1).id;for(const p of card.pool){r-=p.chance;if(r<0){reward=p.id;break;}}s.pending={uid:++s.seq,bottle:reward,cost:card.price,revealed:false}; }
 if(action.type==='reveal') {if(!s.pending)throw Error('Brak zdrapki');if(!s.pending.revealed){s.pending.revealed=true;s.items.push({...s.pending,status:'collection',source:'scratch',time:s.last});}}
 if(action.type==='keep'){if(!s.pending?.revealed)throw Error('Zdrap kartę');s.pending=null;}
 if(action.type==='buy'){const b=c.find(b=>b.id===action.id);if(!b||b.kind==='voucher')throw Error('Nieznana butelka');const cost=Math.ceil(value(s,b)*1.03);if(s.balance<cost)throw Error('Niewystarczające środki');record(s,'purchase',-cost,b.name);s.items.push({uid:++s.seq,bottle:b.id,cost,status:'collection',source:'market',time:s.last});}
 if(action.type==='sell'){const x=item(s,action.uid),b=c.find(b=>b.id===x.bottle);x.status='sold';x.proceeds=quickValue(s,b);record(s,'quick sell',x.proceeds,b.name);if(s.pending?.uid===x.uid)s.pending=null;}
 if(action.type==='auction'){const x=item(s,action.uid);if(x.bottle===voucher.id)throw Error('Fragment można wyłącznie odebrać lub wymienić');if(![1,5,15].includes(action.minutes)||!Number.isInteger(action.start)||action.start<1||!Number.isInteger(action.buyNow??0)||(action.buyNow&&action.buyNow<action.start))throw Error('Nieprawidłowa aukcja');x.status='auction';s.auctions.push({uid:x.uid,bottle:x.bottle,start:action.start,buyNow:action.buyNow||0,bid:0,bids:[],end:s.last+action.minutes*60000,status:'active',interest:.65+random(s)*.6});if(s.pending?.uid===x.uid)s.pending=null;}
 if(action.type!=='tick') {s.history.push({tick:s.tick,balance:s.balance,collection:s.items.filter(x=>x.status!=='sold').reduce((n,x)=>n+value(s,c.find(b=>b.id===x.bottle)),0)});s.history=s.history.slice(-6000);}
 return s;
}
export function payWash(s,proof){if(proof.workId!==s.workId)throw Error('To wynagrodzenie zostało już odebrane');if(proof.activeMs<8000||proof.coverage<.99||proof.distance<1500)throw Error('Dokończ mycie');record(s,'work',100,'Umyty kieliszek');s.washed++;s.workId++;}
export function achievements(s,c){const own=s.items.filter(x=>x.status!=='sold');const total=s.balance+own.reduce((n,x)=>n+value(s,c.find(b=>b.id===x.bottle)),0);return [['First Bottle',s.items.length>0],['Hard Worker',s.washed>=100],['First Profit',s.items.some(x=>x.proceeds>x.cost)],['Collector',own.length>=25],['Whisky Investor',total>=100000],['Whisky Tycoon',total>=10000000]];}
