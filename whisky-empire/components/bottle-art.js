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
function renderCutout(img,id){
 const w=img.naturalWidth,h=img.naturalHeight,canvas=document.createElement('canvas');
 canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const outline=silhouettes[id];
 if(outline){
  ctx.beginPath();outline.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.drawImage(img,0,0);
 }else{
  ctx.drawImage(img,0,0);const frame=ctx.getImageData(0,0,w,h),d=frame.data;
  const seen=new Uint8Array(w*h),queue=new Uint32Array(w*h);let head=0,tail=0;
  const add=i=>{if(i<0||i>=w*h||seen[i])return;seen[i]=1;const j=i*4,low=Math.min(d[j],d[j+1],d[j+2]),high=Math.max(d[j],d[j+1],d[j+2]);if(d[j+3]<8||(low>=218&&high-low<27)){queue[tail++]=i;d[j+3]=0;}};
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  while(head<tail){const i=queue[head++],x=i%w;if(x)add(i-1);if(x<w-1)add(i+1);add(i-w);add(i+w);}
  ctx.putImageData(frame,0,0);
 }
 const data=ctx.getImageData(0,0,w,h).data;let left=w,right=0,top=h,bottom=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>16){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<=left||bottom<=top)throw Error('Empty bottle silhouette');
 const result=document.createElement('canvas'),pad=3;result.width=right-left+1+pad*2;result.height=bottom-top+1+pad*2;
 result.getContext('2d').drawImage(canvas,left,top,right-left+1,bottom-top+1,pad,pad,right-left+1,bottom-top+1);
 return new Promise((resolve,reject)=>result.toBlob(blob=>blob?resolve(URL.createObjectURL(blob)):reject(Error('Cutout failed')),'image/png'));
}
function cutout(src,id){if(!cache.has(src)){cache.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{try{resolve(renderCutout(img,id));}catch(e){reject(e);}};img.onerror=reject;img.src=src;}));}return cache.get(src);}
export function mountBottleArt(root){
 root.querySelectorAll('img[data-bottle]').forEach(img=>{
  const original=img.getAttribute('src');
  const prepare=()=>{if(img.dataset.preparing)return;img.dataset.preparing='true';cutout(original,img.dataset.bottle).then(url=>{if(!img.isConnected)return;img.src=url;img.classList.add('cutout-ready');}).catch(()=>{img.classList.add('cutout-ready');});};
  img.addEventListener('load',prepare,{once:true});if(img.complete&&img.naturalWidth)prepare();
 });
}
