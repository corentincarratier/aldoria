// Un segment accessible tient compte de la même empreinte que le déplacement réel.
function passageLibre(x,y,tx,ty) {
  const n=Math.max(1,Math.ceil(Math.hypot(tx-x,ty-y)/6));
  for(let i=1;i<=n;i++)if(blocked(x+(tx-x)*i/n,y+(ty-y)*i/n))return false;
  return true;
}
function directionLibre(e,gx,gy) {
  if(passageLibre(e.x,e.y,gx,gy)){e.route=null;return {x:gx,y:gy};}
  if(e.route && time<e.route.until && passageLibre(e.x,e.y,e.route.x,e.route.y) && near(e,e.route)>5)return e.route;
  // Grille de la cour, uniquement lorsqu'un obstacle coupe le trajet direct.
  const cell=20,cols=Math.ceil(W/cell),rows=Math.ceil(H/cell);
  const px=col=>clamp((col+.5)*cell,12,W-12),py=row=>clamp((row+.5)*cell,12,H-12);
  const id=(x,y)=>clamp(Math.floor(y/cell),0,rows-1)*cols+clamp(Math.floor(x/cell),0,cols-1);
  const source=id(e.x,e.y),queue=[source],parent=new Int32Array(cols*rows).fill(-1);
  parent[source]=source;let best=source,bestDistance=Infinity;
  for(let i=0;i<queue.length;i++){
    const k=queue[i],cx=k%cols,cy=Math.floor(k/cols),x=k===source?e.x:px(cx),y=k===source?e.y:py(cy);
    const d=Math.hypot(x-gx,y-gy);
    if(d<bestDistance){best=k;bestDistance=d;}
    if(passageLibre(x,y,gx,gy)){best=k;break;}
    for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const nx=cx+ox,ny=cy+oy,n=ny*cols+nx;
      if(nx<0||ny<0||nx>=cols||ny>=rows||parent[n]!==-1)continue;
      if(!passageLibre(x,y,px(nx),py(ny)))continue;
      parent[n]=k;queue.push(n);
    }
  }
  for(let k=best;k!==source;k=parent[k]){
    const x=px(k%cols),y=py(Math.floor(k/cols));
    if(passageLibre(e.x,e.y,x,y))return e.route={x,y,until:time+1.0};
  }
  return {x:e.x,y:e.y};
}
function turnTowards(current,target,limit) {
  const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
  return current+clamp(delta,-limit,limit);
}
function placeDeMelee(e,d) {
  const base=e.kind===1?-2.58:.51,rayon=29;
  let slot;
  for(const delta of [0,.52,-.52,1.05,-1.05,1.57,-1.57,2.1,-2.1,Math.PI]){
    const a=base+delta,x=hero.x+rayon*Math.cos(a),y=hero.y+rayon*Math.sin(a);
    if(!passageLibre(hero.x,hero.y,x,y))continue;
    slot={x,y};break;
  }
  if(!slot)return {x:e.x,y:e.y};
  if(d<62 && d>1){
    const from=Math.atan2(e.y-hero.y,e.x-hero.x),to=Math.atan2(slot.y-hero.y,slot.x-hero.x);
    const angle=turnTowards(from,to,.72),radius=Math.max(rayon,Math.min(37,d));
    const x=hero.x+radius*Math.cos(angle),y=hero.y+radius*Math.sin(angle);
    if(Math.abs(Math.sin((to-angle)/2))>.01 && passageLibre(e.x,e.y,x,y))return {x,y};
  }
  return slot;
}
function steerGuard(e,dt) {
  const d=near(hero,e);
  if(d<128)e.alert=Math.max(e.alert,1.8);
  if(e.alert>0)e.fighting=true;
  if(d>178 && !e.alert)e.fighting=false;
  let gx=e.startX,gy=e.startY;
  if(e.fighting) {
    // Les places sont ancrées au terrain. Elles restent stables quand le héros pivote.
    const slot=placeDeMelee(e,d);gx=slot.x;gy=slot.y;
  }else{
    gx+=e.patrol*17;gy+=e.patrol*(e.kind===1?8:-8);
    if(Math.hypot(gx-e.x,gy-e.y)<3 && time>e.waitUntil){e.patrol*=-1;e.waitUntil=time+2;}
  }
  const goal=directionLibre(e,gx,gy),dx=goal.x-e.x,dy=goal.y-e.y,len=Math.hypot(dx,dy);
  const guardRange=e.kind===1?32:36;
  if(e.swing>0){
    const old=e.swing;e.swing=Math.max(0,e.swing-dt);
    if(old>.26&&e.swing<=.26&&d<guardRange+12&&hero.dash<=0){
      hero.hp=Math.max(1,hero.hp-8);hero.flash=.2;sparks(hero.x,hero.y,'#b76c4a',5);sound(130,65,.1);
    }
  }else if(e.fighting&&d<guardRange+4&&!e.rearm){
    e.swing=.55;e.rearm=1.9;
  }
  const vmax=e.fighting?37:13;
  let speed=Math.min(vmax,len*2.8);
  if(e.swing || (!e.fighting&&time<e.waitUntil))speed=0;
  if(e.slow>0)speed*=.4;
  let vx=dx/(len||1)*speed,vy=dy/(len||1)*speed;
  for(const other of foes){
    if(other===e || other.dead)continue;
    const gap=near(e,other);
    if(gap>=31)continue;
    const push=(31-gap)*2;
    vx+=(gap>.01?(e.x-other.x)/gap:(e.kind===1?-1:1))*push;
    vy+=(gap>.01?(e.y-other.y)/gap:0)*push;
  }
  const smooth=1-Math.exp(-dt*10);e.vx+=(vx-e.vx)*smooth;e.vy+=(vy-e.vy)*smooth;
  const ox=e.x,oy=e.y;
  move(e,e.vx*dt,e.vy*dt);
  const travelled=Math.hypot(e.x-ox,e.y-oy);
  e.walk+=(Math.min(1,travelled/(dt*19||1))-e.walk)*smooth;
  e.phase+=travelled*TAU/32;
  const bearing=e.fighting && d<68?Math.atan2(hero.y-e.y,hero.x-e.x):Math.atan2(e.vy,e.vx);
  if((e.fighting || travelled>dt*1.2) && e.swing<.38)e.angle=turnTowards(e.angle,bearing,dt*5);
}
