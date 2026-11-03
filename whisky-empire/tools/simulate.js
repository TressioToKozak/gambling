import fs from 'node:fs';
import {pools,initial,random,voucher,washRules,UPGRADE_DEFS,command} from '../game/engine.js';
const bottles=JSON.parse(fs.readFileSync('data/catalog.json')),c=[...bottles,voucher];
if(!bottles.length){console.error('No catalog to simulate');process.exitCode=2;}else{
 const s=initial(0),vip={...s,starterPassUsed:true,upgrades:{loyalty:3,luck:3,quicksell:3}},discounted=pools(c,vip);
 for(const card of pools(c)){
  let sum=0,profitable=0;const counts={};const price=card.price;
  for(let i=0;i<10000;i++){let r=random(s),id=card.pool.at(-1).id;for(const p of card.pool){r-=p.chance;if(r<0){id=p.id;break;}}counts[id]=(counts[id]??0)+1;const payout=Math.floor(c.find(b=>b.id===id).base*.85);sum+=payout;if(payout>price)profitable++;}
  const upgraded=discounted.find(p=>p.id===card.id),vipPrice=upgraded.price,peakEV=upgraded.pool.reduce((n,r)=>n+Math.floor(Math.round(c.find(b=>b.id===r.id).base*1.2)*.88)*r.chance,0);
  console.log(JSON.stringify({pack:card.id,name:card.name,editions:card.pool.length,price,firstPassPrice:pools(c,initial(0)).find(p=>p.id===card.id).price,runs:10000,counts,expected:card.ev,observed:sum/10000,returnPercent:sum/10000/price*100,profitableDraws:profitable,maxDiscountPrice:vipPrice,upperBoundReturnPercent:peakEV/vipPrice*100}));
 }
 const max=initial(0);max.upgrades=Object.fromEntries(UPGRADE_DEFS.map(d=>[d.id,3]));const baseRules=washRules(initial(0)),maxRules=washRules(max);
 fs.writeFileSync('data/progression-report.json',JSON.stringify({startingCash:1000,starterPassAmount:500,starterPassUses:1,base:baseRules,max:maxRules,baseTheoreticalEuroPerMinute:baseRules.reward/100*60000/baseRules.activeMs,maxTheoreticalEuroPerMinute:maxRules.reward/100*60000/maxRules.activeMs,totalUpgradeCost:UPGRADE_DEFS.reduce((n,d)=>n+d.costs.reduce((n,v)=>n+v,0),0),discountChangesOdds:false,purchasedLuckChangesOdds:true,maxLuckWeightBoost:.24,maxQuickSellRate:.88},null,2));
}

// 10,000 independent price-19/start-18 one-minute auction scenarios.
const auctionCatalog=[{id:'auction-fixture',name:'Auction simulation fixture',base:1900,rarity:'Uncommon'}];let sold=0,totalNet=0;
for(let i=0;i<10000;i++){let s=initial(0);s.seed=1000+i*7919;s.balance=10000;s=command(s,auctionCatalog,{type:'buy',id:'auction-fixture'},0);s=command(s,auctionCatalog,{type:'auction',uid:s.items[0].uid,start:1800,minutes:1},0);s=command(s,auctionCatalog,{type:'tick'},75000);if(s.auctions[0].status==='sold'){sold++;totalNet+=Math.floor(s.auctions[0].bid*.95);}}
fs.writeFileSync('data/auction-report.json',JSON.stringify({runs:10000,market:1900,start:1800,minutes:1,sold,unsold:10000-sold,salePercent:sold/100,averageNetWhenSold:sold?totalNet/sold:0},null,2));
