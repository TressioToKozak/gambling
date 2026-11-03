import fs from 'node:fs';
import {pools,initial,random,voucher,washRules,UPGRADE_DEFS} from '../game/engine.js';
const bottles=JSON.parse(fs.readFileSync('data/catalog.json')),c=[...bottles,voucher];
if(!bottles.length){console.error('No catalog to simulate');process.exitCode=2;}else{
 const s=initial(0),vip={...s,starterPassUsed:true,upgrades:{loyalty:3}},discounted=pools(c,vip);
 for(const card of pools(c)){
  let sum=0,profitable=0;const counts={};const price=card.price;
  for(let i=0;i<10000;i++){let r=random(s),id=card.pool.at(-1).id;for(const p of card.pool){r-=p.chance;if(r<0){id=p.id;break;}}counts[id]=(counts[id]??0)+1;const payout=Math.floor(c.find(b=>b.id===id).base*.85);sum+=payout;if(payout>price)profitable++;}
  const vipPrice=discounted.find(p=>p.id===card.id).price;
  console.log(JSON.stringify({pack:card.id,name:card.name,editions:card.pool.length,price,firstPassPrice:pools(c,initial(0)).find(p=>p.id===card.id).price,runs:10000,counts,expected:card.ev,observed:sum/10000,returnPercent:sum/10000/price*100,profitableDraws:profitable,maxDiscountPrice:vipPrice,upperBoundReturnPercent:card.ev*1.2/vipPrice*100}));
 }
 const max=initial(0);max.upgrades=Object.fromEntries(UPGRADE_DEFS.map(d=>[d.id,3]));const baseRules=washRules(initial(0)),maxRules=washRules(max);
 fs.writeFileSync('data/progression-report.json',JSON.stringify({startingCash:1000,starterPassAmount:500,starterPassUses:1,base:baseRules,max:maxRules,baseTheoreticalEuroPerMinute:baseRules.reward/100*60000/baseRules.activeMs,maxTheoreticalEuroPerMinute:maxRules.reward/100*60000/maxRules.activeMs,totalUpgradeCost:UPGRADE_DEFS.reduce((n,d)=>n+d.costs.reduce((n,v)=>n+v,0),0),discountChangesOdds:false},null,2));
}
