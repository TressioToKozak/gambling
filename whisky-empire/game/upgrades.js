// All costs and wages are euro cents; effects depend only on purchased levels.
export const UPGRADE_DEFS = [
  {id:'sponge',group:'bar',name:'Gąbka XXL',emoji:'🧽',color:'#9fdac5',description:'Większy zasięg każdego ruchu.',costs:[700,1800,4500],values:[48,58,68,80],unit:'px',labels:['Zwykła','Duża','XXL','Mega']},
  {id:'soap',group:'bar',name:'Turbo piana',emoji:'🫧',color:'#91d9ee',description:'Plamy znikają szybciej.',costs:[1000,2500,6000],values:[1,1.25,1.6,2],unit:'×',labels:['Klasyczna','Fresh','Turbo','Ultra']},
  {id:'speed',group:'bar',name:'Zwinne dłonie',emoji:'⚡',color:'#ffcf77',description:'Krótszy wymagany czas pracy.',costs:[1500,3500,8000],values:[2000,1750,1500,1250],unit:'ms',labels:['Rookie','Quick','Pro','Lightning']},
  {id:'tips',group:'bar',name:'Napiwki',emoji:'🪙',color:'#d9fb74',description:'Wyższa wypłata za kieliszek.',costs:[1200,3200,7500],values:[150,180,210,250],unit:'cents',labels:['1,50 €','1,80 €','2,10 €','2,50 €']},
  {id:'loyalty',group:'scratch',name:'Klub kolekcjonera',emoji:'🎟️',color:'#c3a0ff',description:'Stała zniżka na wszystkie zestawy.',costs:[4500,12000,28000],values:[0,.02,.05,.08],unit:'discount',labels:['0%','−2%','−5%','−8%']},
  {id:'coin',group:'scratch',name:'Moneta XXL',emoji:'🪙',color:'#ffce79',description:'Większa moneta odsłania szerszy pas zdrapki.',costs:[2000,6000,14000],values:[22,28,35,43],unit:'px',labels:['Pocket','Large','XL','XXL']},
  {id:'quicksell',group:'scratch',name:'Ekspert sprzedaży',emoji:'💰',color:'#a8e0b1',description:'Quick Sell: większy procent bieżącej ceny rynkowej.',costs:[7000,20000,60000],values:[.85,.86,.87,.88],unit:'rate',labels:['85%','86%','87%','88%']},
  {id:'luck',group:'scratch',name:'Nos kolekcjonera',emoji:'🍀',color:'#c5a5ff',description:'Zwiększa względne wagi cenniejszych wydań. Dokładne szanse w każdym zestawie.',costs:[9000,26000,80000],values:[0,.08,.16,.24],unit:'luck',labels:['0%','+8%','+16%','+24%']},

];
export function upgradeLevel(s,id){const n=s?.upgrades?.[id];return Number.isInteger(n)&&n>=0&&n<=3?n:0;}
export function upgradeValue(s,id){const d=UPGRADE_DEFS.find(d=>d.id===id);return d.values[upgradeLevel(s,id)];}
export function washRules(s){return {activeMs:upgradeValue(s,'speed'),coverage:.95,distance:600,radius:upgradeValue(s,'sponge'),cleanMs:150/upgradeValue(s,'soap'),reward:upgradeValue(s,'tips')};}
export function upgradeOffer(s,id){const d=UPGRADE_DEFS.find(d=>d.id===id);if(!d)throw Error('Nieznane ulepszenie');const level=upgradeLevel(s,id);return {...d,level,cost:d.costs[level]??null,current:d.values[level],next:d.values[level+1]??null};}
