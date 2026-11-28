// Distances de combat d’Aldoria exprimées à l'échelle de la cour.
const tailleCombat=.6;
function cibleSort(id) {
  const s=skills.find(k=>k.id===id), angle=face();
  const distance=Math.min(near(hero,aim),(s?.range||450)*1.45*tailleCombat);
  if(id==='GL6')return {x:hero.x+Math.cos(angle)*distance,y:hero.y+Math.sin(angle)*distance,angle};
  return {x:hero.x,y:hero.y,angle};
}
function chargeArc(t) {
  return {focus:Math.min(1,t/.6),power:clamp((t-.6)/.8,0,1)};
}
// La pointe du guide et le projectile se basent sur le même point de décoche.
function ligneTir(id,t) {
  const a=face(),{grip}=SourceArt.bowPose(hero),{focus,power}=chargeArc(t);
  const x=hero.x+2*(Math.cos(a)*grip[0]-Math.sin(a)*grip[1]);
  const y=hero.y+2*(Math.sin(a)*grip[0]+Math.cos(a)*grip[1]);
  const angle=near(hero,aim)>40?Math.atan2(aim.y-y,aim.x-x):a;
  const portée=id==='R2'?skills[0].speed*1.3:550*tailleCombat*(1+.12*power);
  return {x,y,angle,length:Math.max(1,portée-Math.hypot(x-hero.x,y-hero.y)),focus,power};
}
function aimGuide(){
  if(!charge)return;
  const id=charge.id,s=skills.find(k=>k.id===id),c=ctx;
  const a=face(),target=cibleSort(id);
  c.save();c.lineWidth=1.25;c.strokeStyle='#a4efff';c.fillStyle='rgba(126,226,255,.20)';
  function circle(x,y,r,fill) {
    c.beginPath();c.arc(x,y,r,0,TAU);if(fill)c.fill();c.stroke();
  }
  function corridor(length,radius,origin=hero,angle=a) {
    c.translate(origin.x,origin.y);c.rotate(angle);
    c.beginPath();c.moveTo(0,-radius);c.lineTo(length,-radius);c.arc(length,0,radius,-Math.PI/2,Math.PI/2);
    c.lineTo(0,radius);c.arc(0,0,radius,Math.PI/2,Math.PI*1.5);c.closePath();c.fill();c.stroke();
  }
  if(id==='bow'){
    const line=ligneTir(id,charge.t),{focus,power,length:r}=line,half=.55*(1-focus);
    c.translate(line.x,line.y);c.rotate(line.angle);c.strokeStyle=power>=1?'#ffe1a0':'#f5ddae';c.fillStyle='#eac78821';
    c.beginPath();c.moveTo(0,0);
    if(half>.002){c.arc(0,0,r,-half,half);c.closePath();c.fill();}
    else c.lineTo(r,0);
    c.stroke();
  }else if(id==='R2'){const line=ligneTir(id,charge.t);corridor(line.length,s.width,line,line.angle);}
  else if(id==='AI8')corridor(s.speed*s.dur,s.r);
  else if(id==='GL6'){circle(hero.x,hero.y,s.range*1.45*tailleCombat,false);circle(target.x,target.y,s.r,true);}
  else circle(hero.x,hero.y,s.r,true);
  c.restore();
}
