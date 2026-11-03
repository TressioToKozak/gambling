function surface(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
export async function renderCutout(img,outline){
 const w=img.naturalWidth??img.width,h=img.naturalHeight??img.height,canvas=surface(w,h);
 canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});
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
 const result=surface(1,1),pad=3;result.width=right-left+1+pad*2;result.height=bottom-top+1+pad*2;
 result.getContext('2d').drawImage(canvas,left,top,right-left+1,bottom-top+1,pad,pad,right-left+1,bottom-top+1);
 if(result.convertToBlob)return result.convertToBlob({type:'image/png'});
 return new Promise((resolve,reject)=>result.toBlob(blob=>blob?resolve(blob):reject(Error('Cutout failed')),'image/png'));
}
