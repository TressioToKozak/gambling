// Display-only masks. Original photographs and their label pixels remain unchanged.
// The five hero silhouettes also exclude the studio floor reflections.
const silhouettes={
 'jw-001':[[178,120],[194,117],[238,121],[249,132],[249,183],[243,211],[239,235],[243,263],[262,295],[291,322],[309,351],[312,399],[311,846],[306,877],[291,888],[154,889],[137,879],[131,860],[130,365],[138,338],[165,307],[181,275],[187,239],[185,216],[178,197]],
 'jw-002':[[124,7],[386,20],[387,195],[415,162],[430,128],[432,48],[439,40],[491,40],[500,48],[500,112],[492,135],[492,157],[509,182],[535,206],[545,234],[544,779],[534,803],[403,809],[383,797],[379,771],[140,773],[99,741],[97,43]],
 'jw-003':[[111,102],[130,80],[321,88],[322,314],[360,265],[374,219],[372,174],[374,116],[377,74],[387,69],[429,70],[440,84],[440,130],[434,153],[438,178],[438,213],[454,250],[481,289],[502,337],[505,873],[498,904],[477,919],[344,920],[327,906],[319,887],[138,879],[111,851]],
 'jw-004':[[147,93],[165,90],[207,94],[218,104],[218,160],[213,187],[215,219],[227,256],[248,282],[270,307],[285,335],[288,371],[287,848],[282,870],[270,881],[111,882],[96,871],[91,851],[91,351],[99,322],[120,292],[140,261],[151,221],[151,185],[146,165]],
 'jw-006':[[176,126],[190,123],[231,127],[240,138],[239,191],[234,221],[233,257],[244,290],[266,321],[286,346],[297,375],[299,867],[294,892],[282,905],[148,907],[134,896],[129,874],[129,385],[137,355],[156,326],[173,294],[181,261],[179,224],[175,200]],
};
const cache=new Map();

let worker,serial=0,workerFailed=false;const tasks=new Map();
function idleFallback(src,outline){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const idle=globalThis.requestIdleCallback??(fn=>setTimeout(fn,0));idle(async()=>{try{const {renderCutout}=await import('./bottle-cutout.js?v=fluid-8');resolve(await renderCutout(img,outline));}catch(error){reject(error);}});};img.onerror=reject;img.src=src;});}
function process(src,outline){
 if(typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'||workerFailed)return idleFallback(src,outline);
 if(!worker){worker=new Worker(new URL('./bottle-worker.js?v=fluid-8',import.meta.url),{type:'module',name:'whisky-bottle-art'});
  worker.onmessage=({data})=>{const task=tasks.get(data.id);if(!task)return;tasks.delete(data.id);if(data.error)task.reject(Error(data.error));else task.resolve(data.blob);};
  worker.onerror=()=>{workerFailed=true;worker.terminate();for(const task of tasks.values())idleFallback(task.src,task.outline).then(task.resolve,task.reject);tasks.clear();};
 }
 return new Promise((resolve,reject)=>{const id=++serial;tasks.set(id,{resolve,reject,src,outline});worker.postMessage({id,src:new URL(src,document.baseURI).href,outline});});
}
function cutout(src,id){if(!cache.has(src))cache.set(src,process(src,silhouettes[id]).then(async blob=>{const url=URL.createObjectURL(blob),decoded=new Image();decoded.src=url;await decoded.decode();return url;}));return cache.get(src);}
export function mountBottleArt(root){
 root.querySelectorAll('img[data-bottle]').forEach(img=>{
  if(img.dataset.preparing)return;const original=img.getAttribute('src');
  const prepare=()=>{if(img.dataset.preparing)return;img.dataset.preparing='true';cutout(original,img.dataset.bottle).then(url=>{if(!img.isConnected)return;img.src=url;img.classList.add('cutout-ready');}).catch(()=>{img.classList.add('cutout-ready');});};
  img.addEventListener('load',prepare,{once:true});if(img.complete&&img.naturalWidth)prepare();
 });
}
