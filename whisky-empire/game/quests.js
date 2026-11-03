import {buildPacks} from './packs.js?v=fluid-8';
// One-time milestones; all progress is derived from the durable game state.
const cached=new WeakMap();
export function questDefinitions(c){
 if(cached.has(c))return cached.get(c);
 const defs=[
  ...[[10,500],[25,1000],[100,3500],[250,7000]].map(([goal,reward])=>({id:'wash-'+goal,group:'bar',icon:'🧽',title:goal===100?'Mistrz zlewu':'Czysta robota',description:`Umyj ${goal} szklanek`,kind:'wash',goal,reward})),
  ...[[1,200],[10,800],[25,1500],[100,4500],[250,10000]].map(([goal,reward])=>({id:'scratch-'+goal,group:'scratch',icon:'🎟️',title:goal===10?'Łowca dropów':'Jeszcze jeden drop',description:`Odkryj ${goal} zdrapek`,kind:'scratch',goal,reward})),
  ...[[5,500],[25,2000]].map(([goal,reward])=>({id:'trade-'+goal,group:'trade',icon:'💰',title:'Ruch w interesie',description:`Sprzedaj ${goal} butelek`,kind:'trade',goal,reward})),
  ...buildPacks(c).filter(p=>p.pool.length).map(p=>({id:'set-'+p.id,group:'sets',icon:p.icon,title:p.name,description:'Posiadaj jednocześnie wszystkie wydania z zestawu',kind:'set',bottles:p.pool.map(r=>r.id),goal:p.pool.length,reward:Math.min(1000000,Math.max(500,Math.round(p.pool.reduce((sum,r)=>sum+c.find(b=>b.id===r.id).base,0)*.12/100)*100)),color:p.color})),
 ];cached.set(c,defs);return defs;
}
export function quests(s,c){
 const owned=new Set(s.items.filter(x=>x.status!=='sold').map(x=>x.bottle)),opened=s.items.filter(x=>x.source==='scratch').length,sold=s.items.filter(x=>x.status==='sold'&&x.bottle!=='game-fragment').length;
 return questDefinitions(c).map(q=>{const claimed=!!s.questClaims?.[q.id],count=q.kind==='wash'?s.washed:q.kind==='scratch'?opened:q.kind==='trade'?sold:q.bottles.filter(id=>owned.has(id)).length;return {...q,count:Math.min(q.goal,count),claimed,ready:!claimed&&count>=q.goal};});
}
