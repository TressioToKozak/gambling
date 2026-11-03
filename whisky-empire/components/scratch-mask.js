// Geometric sample mask matches round Canvas strokes without GPU pixel readback.
export function createScratchMask(width,height,cell=5){
 const columns=Math.ceil(width/cell),rows=Math.ceil(height/cell),mask=new Uint8Array(columns*rows);let cleared=0;
 return {erase(a,b,radius){
  const dx=b.x-a.x,dy=b.y-a.y,length2=dx*dx+dy*dy,r2=radius*radius;
  const left=Math.max(0,Math.floor((Math.min(a.x,b.x)-radius)/cell)),right=Math.min(columns-1,Math.floor((Math.max(a.x,b.x)+radius)/cell));
  const top=Math.max(0,Math.floor((Math.min(a.y,b.y)-radius)/cell)),bottom=Math.min(rows-1,Math.floor((Math.max(a.y,b.y)+radius)/cell));
  for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const i=y*columns+x;if(mask[i])continue;const px=(x+.5)*cell-a.x,py=(y+.5)*cell-a.y,t=length2?Math.max(0,Math.min(1,(px*dx+py*dy)/length2)):0;if((px-t*dx)**2+(py-t*dy)**2<=r2){mask[i]=1;cleared++;}}
  return cleared/mask.length;
 },get coverage(){return cleared/mask.length;}};
}
