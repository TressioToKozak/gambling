// The durable state keeps all history. Interactive screens only need the latest 24 real points.
export function snapshot(s,{fullHistory=false}={}){
 if(fullHistory)return s;
 return {...s,history:s.history.slice(-24),prices:Object.fromEntries(Object.entries(s.prices).map(([id,p])=>[id,{...p,history:p.history.slice(-24)}]))};
}
