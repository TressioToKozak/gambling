// IndexedDB, market simulation and history serialization run off the UI thread.
let worker,cachedCatalog,sequence=0,failed=false;
const pending=new Map();
export async function transact(catalog,action,proof,options={}){
 if(typeof Worker==='undefined')return (await import('./storage-core.js?v=fluid-8')).transact(catalog,action,proof);
 if(failed)throw Error('Zapis jest niedostępny. Odśwież grę, aby bezpiecznie odczytać postęp.');
 if(!worker){worker=new Worker(new URL('./storage-worker.js?v=fluid-8',import.meta.url),{type:'module',name:'whisky-economy'});
  worker.onmessage=({data})=>{const task=pending.get(data.id);if(!task)return;pending.delete(data.id);if(data.error)task.reject(Error(data.error));else task.resolve(data.state);};
  worker.onerror=()=>{failed=true;for(const task of pending.values())task.reject(Error('Nie można połączyć się z zapisem gry. Odśwież stronę.'));pending.clear();worker.terminate();};
 }
 if(cachedCatalog!==catalog){worker.postMessage({type:'catalog',catalog});cachedCatalog=catalog;}
 return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});worker.postMessage({id,action,proof,options,now:Date.now()});});
}
