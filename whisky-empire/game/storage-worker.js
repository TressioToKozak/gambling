import {transact} from './storage-core.js?v=fluid-8';
import {snapshot} from './snapshot.js?v=fluid-8';
let catalog;
self.onmessage=async({data})=>{
 if(data.type==='catalog'){catalog=data.catalog;return;}
 const {id,action,proof,options,now}=data;
 try{if(!catalog)throw Error('Brak katalogu');const state=await transact(catalog,action,proof,now);self.postMessage({id,state:snapshot(state,options)});}
 catch(error){self.postMessage({id,error:error.message});}
};
