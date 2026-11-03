import {renderCutout} from './bottle-cutout.js?v=fluid-8';
self.onmessage=async({data:{id,src,outline}})=>{let bitmap;try{
 const response=await fetch(src);if(!response.ok)throw Error('Brak zdjęcia');bitmap=await createImageBitmap(await response.blob());const blob=await renderCutout(bitmap,outline);self.postMessage({id,blob});
}catch(error){self.postMessage({id,error:error.message});}finally{bitmap?.close();}};
