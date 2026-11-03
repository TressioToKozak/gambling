import {upgradeValue} from './upgrades.js?v=lounge-5';
const DEFINITIONS=[
 {id:'basic',starter:true,name:'Basic',subtitle:'Trzy klasyki. Twój pierwszy drop.',icon:'🥃',color:'#ffad62',price:1600,power:0,ids:['jw-004','jw-2e092d2b628a','jw-001'],chances:[.60,.32,.08],risk:'Spokojny start'},
 {id:'red-club',starter:true,name:'Red Club',subtitle:'Red Soul i Red Label. Lekki start.',icon:'♥',color:'#ff929c',price:1450,ids:['jw-2e092d2b628a','jw-004'],chances:[.90,.10],risk:'Na rozgrzewkę'},
 {id:'ruby-rush',starter:true,name:'Ruby Rush',subtitle:'Red Soul, Black Ruby i Red Icons.',icon:'💗',color:'#f69cc8',price:2000,ids:['jw-2e092d2b628a','jw-5a762327e7ef','jw-ffa2a4db4241'],chances:[.55,.30,.15],risk:'Rubinowy drop'},
 {id:'double-trouble',starter:true,name:'Double Trouble',subtitle:'Black Label, Double Black, Black Ruby.',icon:'♠',color:'#c5b6e8',price:2400,ids:['jw-001','jw-005','jw-5a762327e7ef'],chances:[.65,.25,.10],risk:'Ciemna strona'},
 {id:'cask-lab',starter:true,name:'Cask Lab',subtitle:'Red Soul, żyto i eksperymenty z beczką.',icon:'🛢️',color:'#cba475',price:2400,ids:['jw-2e092d2b628a','jw-851ef6c0baad','jw-ed-3dd3c92b6e7f','jw-ed-c1d303c435b6'],chances:[.55,.25,.15,.05],risk:'Eksperymentalny'},
 {id:'golden-hour',starter:true,name:'Golden Hour',subtitle:'Black Label, Gold Reserve i Green Label.',icon:'🌅',color:'#ffd67c',price:2800,ids:['jw-001','jw-003','jw-006'],chances:[.65,.28,.07],risk:'Złoty zachód'},
 {id:'black',name:'Black Edition',subtitle:'Cała rodzina Black Label.',icon:'♠',color:'#c9bedb',power:2.25,match:b=>/\bblack label\b/i.test(b.name),risk:'Kolekcjonerski'},
 {id:'green',name:'Green Room',subtitle:'Green Label i Island Green.',icon:'🌿',color:'#a1ddb3',power:2.2,match:b=>/\bgreen label\b|\bisland green\b/i.test(b.name),risk:'Umiarkowany'},
 {id:'labels',name:'Labels',subtitle:'Red. Black. Gold. Blue. I więcej.',icon:'🎨',color:'#ffca77',power:1.85,match:b=>/\blabel\b/i.test(b.name),risk:'Duża różnorodność'},
 {id:'blue',name:'Blue Society',subtitle:'Świat limitowanych Blue Label.',icon:'💎',color:'#8ec8ff',power:2,match:b=>/\bblue label\b/i.test(b.name),risk:'Premium'},
 {id:'passport',name:'World Passport',subtitle:'Miasta, podróże i rzadkie destynacje.',icon:'🌍',color:'#86ded9',power:1.9,match:b=>/cities|city|airport|explorers|duty|johnnie walker house|striding city|\b(?:berlin|london|paris|milan|rome|sydney|taipei|seoul|beijing|shanghai|miami|barcelona|texas|california|las vegas|new york)\b/i.test(b.name),risk:'Odkrywca'},
 {id:'vault',name:'Collector’s Vault',subtitle:'Archiwalne wydania i białe kruki.',icon:'👑',color:'#ff9b9f',power:1.35,match:b=>b.category==='Kolekcjonerska'||b.rarity==='Mythic'||/ghost|king george|the john walker|directors blend/i.test(b.name),risk:'Wysoka zmienność'},
];
function weightedPool(items,power){
 const total=items.reduce((n,b)=>n+1/Math.pow(b.base,power),0),units=1000000;
 const rows=items.map(b=>{const exact=(1/Math.pow(b.base,power))/total*units;return {id:b.id,parts:Math.max(1,Math.floor(exact)),remainder:exact-Math.floor(exact)};});
 let delta=units-rows.reduce((n,r)=>n+r.parts,0);const ranked=[...rows].sort((a,b)=>b.remainder-a.remainder||a.id.localeCompare(b.id));
 for(let i=0;delta>0;i++,delta--)ranked[i%ranked.length].parts++;
 for(let i=ranked.length-1;delta<0;i=(i-1+ranked.length)%ranked.length)if(ranked[i].parts>1){ranked[i].parts--;delta++;}
 return rows.map(r=>({id:r.id,chance:r.parts/units}));
}
export function buildPacks(c,s){
 const bottles=c.filter(b=>!b.kind&&b.source),discount=upgradeValue(s,'loyalty');
 return DEFINITIONS.map(d=>{
  const items=(d.ids?d.ids.map(id=>bottles.find(b=>b.id===id)).filter(Boolean):bottles.filter(d.match)).sort((a,b)=>a.base-b.base||a.id.localeCompare(b.id));
  const available=d.ids?items.length===d.ids.length:items.length>0;
  const pool=!available?[]:d.chances?d.ids.map((id,i)=>({id,chance:d.chances[i]})):weightedPool(items,d.power);
  const ev=pool.reduce((n,r)=>n+Math.floor(c.find(b=>b.id===r.id).base*.85)*r.chance,0);
  const basePrice=d.price??Math.ceil(ev/.70/100)*100,regularPrice=Math.ceil(basePrice*(1-discount)),starterDiscount=s&&!s.starterPassUsed&&d.starter?500:0,price=regularPrice-starterDiscount;
  return {id:d.id,name:d.name,subtitle:d.subtitle,icon:d.icon,color:d.color,risk:d.risk,starter:!!d.starter,pool,ev,basePrice,regularPrice,starterDiscount,price,discount,min:items[0]?.base??0,max:items.at(-1)?.base??0,preview:[...new Set([items[0]?.id,items[Math.floor(items.length/2)]?.id,items.at(-1)?.id].filter(Boolean))]};
 });
}
