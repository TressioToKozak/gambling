// Procedural crystal tumbler: no external product photograph or generated label.
export function drawWashScene(ctx,{dirt,sponge,progress=0,radius=48,time=0}){
 ctx.clearRect(0,0,520,430);
 ctx.save();
 const shadow=ctx.createRadialGradient(263,374,5,263,374,158);shadow.addColorStop(0,'#071e2999');shadow.addColorStop(1,'#071e2900');ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(263,374,157,26,0,0,Math.PI*2);ctx.fill();
 // Body, rim and heavy crystal base share the same optical perspective.
 const body=new Path2D();body.moveTo(116,101);body.bezierCurveTo(121,177,132,301,145,351);body.bezierCurveTo(163,388,363,388,382,351);body.bezierCurveTo(395,282,404,166,410,101);body.closePath();
 const glass=ctx.createLinearGradient(115,0,410,0);glass.addColorStop(0,'#d9f7ff5e');glass.addColorStop(.07,'#eaffff12');glass.addColorStop(.25,'#dcf9ff09');glass.addColorStop(.48,'#b3e5f31a');glass.addColorStop(.72,'#e2faff05');glass.addColorStop(.92,'#c9f8ff30');glass.addColorStop(1,'#edffff85');ctx.fillStyle=glass;ctx.fill(body);
 ctx.save();ctx.clip(body);
 for(let i=0;i<11;i++){
  const top=123+i*26,bottom=151+i*21.5;ctx.beginPath();ctx.moveTo(top,113);ctx.lineTo(top+18,113);ctx.lineTo(bottom+15,354);ctx.lineTo(bottom,354);ctx.closePath();const facet=ctx.createLinearGradient(top,0,top+19,0);facet.addColorStop(0,'#efffff02');facet.addColorStop(.75,'#efffff08');facet.addColorStop(1,'#efffff35');ctx.fillStyle=facet;ctx.fill();
 }
 // Warm ring marks and fingerprints disappear with the actual cleaning mask.
 dirt.forEach((spot,i)=>{
  if(spot.left<=0)return;ctx.save();ctx.translate(spot.x,spot.y);ctx.rotate(Math.sin(i*2.7)*.7);ctx.globalAlpha=spot.left*.60;
  if(i%7===0){ctx.strokeStyle='#c9ac7d88';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,0,21,9,0,.3,5.4);ctx.stroke();ctx.strokeStyle='#a78a6333';ctx.lineWidth=3;ctx.stroke();}
  else if(i%3===0){ctx.strokeStyle='#d6c3a960';ctx.lineWidth=1;for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(j-2,0,6+j*2,4+j,0,.5,4.8);ctx.stroke();}}
  else{const stain=ctx.createRadialGradient(0,0,1,0,0,16);stain.addColorStop(0,'#c2aa7d42');stain.addColorStop(1,'#b2926c00');ctx.fillStyle=stain;ctx.beginPath();ctx.ellipse(0,0,16,9,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#c0a57744';for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(Math.sin(i+j*2.3)*13,Math.cos(i*3+j)*7,.8+(j%2)*.6,0,Math.PI*2);ctx.fill();}ctx.restore();
 });
 ctx.restore();
 ctx.strokeStyle='#ddfcff65';ctx.lineWidth=2;ctx.stroke(body);
 const base=ctx.createLinearGradient(0,326,0,380);base.addColorStop(0,'#e2fbff05');base.addColorStop(.4,'#c9f5ff4d');base.addColorStop(.7,'#e9ffff24');base.addColorStop(1,'#eeffff9c');ctx.fillStyle=base;ctx.beginPath();ctx.ellipse(263,350,119,24,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#eaffff85';ctx.lineWidth=1.4;ctx.stroke();ctx.beginPath();ctx.ellipse(263,345,111,14,0,0,Math.PI);ctx.strokeStyle='#f2ffffaa';ctx.stroke();
 ctx.fillStyle='#071d2e44';ctx.beginPath();ctx.ellipse(263,101,146,30,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#eeffffb8';ctx.lineWidth=3.2;ctx.stroke();ctx.beginPath();ctx.ellipse(263,101,137,23,0,0,Math.PI*2);ctx.strokeStyle='#a9d5df88';ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.ellipse(263,95,137,24,0,Math.PI*1.03,Math.PI*1.84);ctx.strokeStyle='#fffef3';ctx.lineWidth=2.1;ctx.stroke();
 // Bright vertical highlights make the wall thickness visible against the sink.
 ctx.beginPath();ctx.moveTo(128,129);ctx.bezierCurveTo(131,180,140,268,148,307);ctx.strokeStyle='#f1ffff70';ctx.lineWidth=4;ctx.lineCap='round';ctx.stroke();ctx.beginPath();ctx.moveTo(394,127);ctx.lineTo(378,302);ctx.strokeStyle='#f1ffff35';ctx.lineWidth=2;ctx.stroke();
 for(let i=0;i<4;i++){ctx.beginPath();for(let x=75;x<450;x+=7){const y=393+i*4+Math.sin(x/27+time/500+i)*2;if(x===75)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.strokeStyle=`rgba(132,215,224,${.14-i*.025})`;ctx.lineWidth=1;ctx.stroke();}
 if(sponge){
  ctx.save();ctx.translate(sponge.x,sponge.y);ctx.rotate(-.15);ctx.fillStyle='#b8ebee0a';ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e7ffff33';ctx.setLineDash([3,6]);ctx.stroke();ctx.setLineDash([]);
  const width=radius*1.32,height=radius*.85;ctx.shadowColor='#051e3588';ctx.shadowBlur=10;ctx.shadowOffsetY=5;ctx.fillStyle='#437c5d';ctx.beginPath();ctx.roundRect(-width/2,-height/2+7,width,height,8);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;const soap=ctx.createLinearGradient(0,-height/2,0,height/2);soap.addColorStop(0,'#ffe89e');soap.addColorStop(1,'#e6b74d');ctx.fillStyle=soap;ctx.beginPath();ctx.roundRect(-width/2,-height/2,width,height-5,8);ctx.fill();ctx.fillStyle='#b58a393b';for(let i=0;i<18;i++){ctx.beginPath();ctx.ellipse(Math.sin(i*7)*width*.38,Math.cos(i*3)*height*.3,1.6+(i%3),1+(i%2),.3,0,Math.PI*2);ctx.fill();}
  for(let i=0;i<15;i++){const a=i*2.4+time/2600,x=Math.sin(a)*(width*.62),y=Math.cos(a*1.1)*height*.64,r=2+(i%6);ctx.fillStyle='#f0ffff55';ctx.strokeStyle='#e8ffffaa';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();}
  ctx.restore();
 }
 // A small glint grows with clean surface area, never with idle time.
 if(progress>.7){ctx.strokeStyle=`rgba(239,255,255,${(progress-.7)*2})`;ctx.lineWidth=2;for(const [x,y] of [[158,159],[366,286]]){ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-9);ctx.lineTo(x,y+9);ctx.stroke();}}
 ctx.restore();
}
