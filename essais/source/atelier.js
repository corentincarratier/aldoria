'use strict';
const $=id=>document.getElementById(id), world=$('world'), ctx=world.getContext('2d');
const W=896,H=560,TAU=2*Math.PI;
const clamp=(n,l,h)=>Math.max(l,Math.min(h,n));
const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const fountain={x:98,y:99,r:50,lip:19}, spawn={x:273,y:341};
const hero={...spawn,angle:-.36,hp:150,phase:0,motion:0,draw:0,aiming:false,release:0,reload:0,dash:0,stamina:1,cast:null,flash:0};
const skills=[
  {id:'R2',name:'Flèche perçante',short:'Percée',glyph:'➶',cd:9,speed:570,width:5.4},
  {id:'GL6',name:'Prison de glace',short:'Prison',glyph:'❄',cd:16,r:84,range:420,wind:.4,dur:2.4},
  {id:'TE8',name:'Séisme',short:'Séisme',glyph:'ϟ',cd:18,r:126,wind:.5,dur:1.7},
  {id:'AI8',name:'Tornade',short:'Tornade',glyph:'🌀︎',cd:14,r:48,speed:66,wind:0,dur:5}
];
const moves={z:'up',w:'up',arrowup:'up',s:'down',arrowdown:'down',d:'right',arrowright:'right',q:'left',a:'left',arrowleft:'left'};
const keys=new Set(),stick={x:0,y:0},aim={x:665,y:172},camera={x:0,y:0,scale:1};
const shots=[],zones=[],splinters=[],lodged=[],foes=[],assets={},cd={};
const saveKey='aldoria-essai-source-zenith-v1';
let time=0,prev=0,ready=false,paused=false,charge=null,notice=0,saveAt=0,pointer=null,touchSpell=null,free=false;
const framePeriod=1000/30,simulationStep=1/60;
let nextFrame=0,physicsRemainder=0;
let audio,viewWidth=1,viewHeight=1,lastSave='',nextHud=0,groundX=NaN,groundY=NaN;
const floor=$('cour');
function sound(f,to,length,type='triangle',vol=.042) {
  if(!audio || audio.state!=='running')return;
  const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;
  o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(to,t+length);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+length);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+length);
}
function enableSound(){try{audio ||= new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
function say(text,sec=2.8){$('notice').textContent=text;notice=sec;}
function blocked(x,y,r=12){
  if(x<r || y<r || x>W-r || y>H-r)return true;
  if(Math.hypot(x-fountain.x,y-fountain.y)<74+r)return true;
  return x>674-r && y>544-(x-674)*.73-r;
}
function move(p,dx,dy,r=12) {
  const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
  for(let i=0;i<n;i++){if(!blocked(p.x+dx/n,p.y,r))p.x+=dx/n;if(!blocked(p.x,p.y+dy/n,r))p.y+=dy/n;}
}
function storePlace(){try{const current=JSON.stringify({x:hero.x,y:hero.y,free});if(current!==lastSave){localStorage.setItem(saveKey,current);lastSave=current;}}catch{}}
function restore(){try{const s=JSON.parse(localStorage.getItem(saveKey));if(s&&Number.isFinite(s.x)&&Number.isFinite(s.y)&&!blocked(s.x,s.y)){hero.x=s.x;hero.y=s.y;free=s.free===true;}}catch{}}
function guard(i){
  const visibleWidth=viewWidth/camera.scale;
  const groupX=clamp(spawn.x+visibleWidth*.38,424,680);
  const x=groupX+(i===1?-32:32),y=i===1?172:222;
  return {kind:i,x,y,startX:x,startY:y,angle:2.7,hp:100,dead:0,hit:0,freeze:0,phase:i,walk:0,swing:0,rearm:1,alert:0,stun:0,slow:0,vx:0,vy:0,fighting:false,route:null,patrol:i===1?1:-1,waitUntil:0};
}
function resetFoes(){foes.splice(0,foes.length,guard(1),guard(2));lodged.length=0;}
function resize(){
  const w=world.clientWidth,h=world.clientHeight,d=Math.min(window.devicePixelRatio||1,1.5);
  viewWidth=w;viewHeight=h;world.width=Math.round(w*d);world.height=Math.round(h*d);camera.scale=Math.min(Math.max(w/W,h/H),w/470);floor.style.width=W*camera.scale+'px';floor.style.height=H*camera.scale+'px';groundX=NaN;follow();
}
function follow(){
  const vw=viewWidth/camera.scale,vh=viewHeight/camera.scale;
  camera.x=vw>=W?(W-vw)/2:clamp(hero.x-vw/2,0,W-vw);
  camera.y=vh>=H?(H-vh)/2:clamp(hero.y-vh/2,0,H-vh);
  if(camera.x!==groundX||camera.y!==groundY){
    floor.style.transform='translate3d('+(-camera.x*camera.scale)+'px,'+(-camera.y*camera.scale)+'px,0)';
    groundX=camera.x;groundY=camera.y;
  }
  if(pointer){aim.x=clamp(camera.x+pointer.x/camera.scale,0,W);aim.y=clamp(camera.y+pointer.y/camera.scale,0,H);}
}
function point(e){const r=world.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};follow();}
function direction(){const x=stick.x+Number(keys.has('right'))-Number(keys.has('left')),y=stick.y+Number(keys.has('down'))-Number(keys.has('up')),n=Math.max(1,Math.hypot(x,y));return [x/n,y/n];}
function face(){return Math.atan2(aim.y-hero.y,aim.x-hero.x);}
function begin(id,owner=id){
  if(!ready || paused || charge || hero.cast || hero.cut || hero.dash>0 || (id==='bow'?hero.reload:cd[id])>0)return false;
  hero.angle=face();charge={id,owner,t:0};hero.draw=0;hero.aiming=id==='bow'||id==='R2';hero.prep=!hero.aiming;return true;
}
function cancel(){charge=null;touchSpell=null;hero.prep=false;hero.aiming=false;hero.draw=0;}
function sparks(x,y,col,n=8){
  for(let i=0;i<n;i++){const a=Math.random()*TAU,s=10+Math.random()*40;splinters.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.18+Math.random()*.24,col});}
}
function harm(e,n){
  if(e.dead>0)return;e.hp=Math.max(0,e.hp-n);e.hit=.25;e.alert=3.5;
  if(!e.hp){e.dead=2.90;e.swing=0;e.freeze=0;}
}
function shoot(id,power) {
  const line=ligneTir(id,charge.t),{x,y,focus,power:overcharge}=line;
  const heading=line.angle+(id==='bow'?(Math.random()*2-1)*.55*(1-focus):0);
  const speed=id==='R2'?skills[0].speed:330+95*overcharge;
  const ttl=line.length/speed;
  shots.push({x,y,angle:heading,speed,id,damage:id==='R2'?53:14+Math.round(overcharge*22),ttl,hits:new Set()});
  hero.release=.235;hero.reload=.25;hero.lastDraw=power;sound(630,105,.12);
}
function release(id,owner=id){
  if(charge?.id!==id || charge.owner!==owner || paused)return;
  hero.angle=face();const s=skills.find(s=>s.id===id);
  if(s)cd[id]=free?0:s.cd;
  if(id==='bow'||id==='R2')shoot(id,hero.draw);
  else{
    hero.cast={id,t:0,dur:s.wind+.32,wind:s.wind,fired:false,...cibleSort(id),s};
    if(!s.wind){hero.cast.fired=true;fireZone(hero.cast);}
    if(s.wind)sound(id==='GL6'?340:93,id==='GL6'?720:60,s.wind,'sine');
  } cancel();
}
function cut(){
  if(!ready||paused||hero.cut||hero.dash||hero.cast||charge)return;
  if(pointer)hero.angle=face();
  hero.cut=.36;sound(220,82,.12);
}
function dodge(){
  if(!ready||paused||hero.stamina<.999||hero.cast||hero.cut)return;
  const [x,y]=direction(),a=x||y?Math.atan2(y,x):hero.angle;
  cancel();hero.dash=.19;hero.stamina=0;hero.dashX=Math.cos(a);hero.dashY=Math.sin(a);hero.angle=a;
  sound(250,70,.14);
}
function fireZone(k){
  const s=k.s,z={spell:k.id,x:k.x,y:k.y,r:s.r,t:0,dur:s.dur,angle:k.angle,struck:new Set(),pulse:new Map()};
  if(k.id==='TE8'){
    const tile=document.createElement('canvas'),side=Math.ceil(s.r*2+4);
    tile.width=tile.height=side;tile.getContext('2d').drawImage(floor,side/2-z.x,side/2-z.y,W,H);z.surface=tile;
  }
  if(k.id==='GL6'){
    z.empreinte=CourMatieres.empreinte(z);
    for(const e of foes)if(!e.dead && near(z,e)<=z.r)z.struck.add(e);
  }
  zones.push(z);
  sound(k.id==='GL6'?810:k.id==='TE8'?115:220,k.id==='GL6'?310:k.id==='TE8'?36:83,.36);
}
function updateZone(z,dt){
  z.t+=dt;
  if(z.spell==='AI8'){z.x+=Math.cos(z.angle)*skills[3].speed*dt;z.y+=Math.sin(z.angle)*skills[3].speed*dt;}
  for(const e of foes){
    if(e.dead>0)continue;const d=near(z,e);
    if(z.spell==='TE8'){
      if(d<z.r && z.t>=d/z.r*.23 && !z.struck.has(e)){z.struck.add(e);harm(e,44);e.stun=1.5;sparks(e.x,e.y,'#a98c64');}
    }else if(z.spell==='GL6'){
      if(z.t<=SpellArt.prisonTravel && z.struck.has(e)){move(e,(z.x-e.x)*dt*2.35,(z.y-e.y)*dt*2.35);e.stun=.12;}
      if(z.t>=SpellArt.prisonTravel && z.struck.has(e) && !z.pulse.has(e)){z.pulse.set(e,1);harm(e,28);e.freeze=2;e.swing=0;}
    }else if(d<z.r){
      e.slow=.28;
      if(z.t>=(z.pulse.get(e)||0)){harm(e,7);z.pulse.set(e,z.t+.43);}
    }
  }
}
function updateGuard(e,dt){
  if(e.dead>0){e.dead-=dt;if(e.dead<=0)Object.assign(e,guard(e.kind));return;}
  for(const k of ['freeze','stun','hit','alert','rearm','slow'])e[k]=Math.max(0,e[k]-dt);
  if(e.freeze||e.stun){e.vx=e.vy=0;return;}
  steerGuard(e,dt);
}
function tickShot(b,dt){
  const n=Math.ceil(b.speed*Math.min(dt,b.ttl)/3)||1;
  const distance=b.speed*Math.min(dt,b.ttl)/n;
  for(let k=0;k<n&&b.ttl>0;k++){
    b.x+=Math.cos(b.angle)*distance;b.y+=Math.sin(b.angle)*distance;
    for(const e of foes)if(!e.dead&&!b.hits.has(e)&&near(b,e)<(b.id==='R2'?17+skills[0].width:17)){
      b.hits.add(e);harm(e,b.damage);sparks(b.x,b.y,'#d8be89',7);sound(170,74,.085);
      if(b.id!=='R2'){lodged.push({e,x:b.x-e.x,y:b.y-e.y,angle:b.angle,start:e.angle,t:.8});b.ttl=0;break;}
    }
    if(blocked(b.x,b.y,1)){sparks(b.x,b.y,'#b79765',5);b.ttl=0;}
  }
  b.ttl-=dt;
}
function step(dt) {
  time+=dt;const [dx,dy]=direction();
  const ox=hero.x,oy=hero.y;
  if(hero.dash>0){const slice=Math.min(hero.dash,dt);move(hero,hero.dashX*slice*335,hero.dashY*slice*335);hero.dash-=slice;}
  else if(!(hero.cast && hero.cast.t<hero.cast.wind)){
    const speed=keys.has('walk')?47:88;move(hero,dx*dt*speed,dy*dt*speed);
  }
  const dist=Math.hypot(hero.x-ox,hero.y-oy);hero.motion+=(Math.min(1,dist/(dt*86||1))-hero.motion)*Math.min(1,dt*16);hero.phase+=dist*TAU/36;
  if(dist>.01){const heading=Math.atan2(hero.y-oy,hero.x-ox);hero.travelAngle=turnTowards(hero.travelAngle??heading,heading,dt*11);}
  follow();
  hero.release=Math.max(0,hero.release-dt);hero.reload=Math.max(0,hero.reload-dt);hero.flash=Math.max(0,hero.flash-dt);hero.stamina=Math.min(1,hero.stamina+dt/1.9);
  if(charge){charge.t+=dt;hero.draw=Math.min(1,charge.t/.6);hero.angle=face();}
  else if(!hero.cast && hero.release<=0 && !hero.dash && !hero.cut && (pointer || dist>.01))hero.angle=turnTowards(hero.angle,dist>.01?hero.travelAngle:face(),dt*12);
  if(hero.cast){const k=hero.cast;k.t+=dt;if(!k.fired&&k.t>=k.wind){k.fired=true;fireZone(k);}if(k.t>=k.dur)hero.cast=null;}
  if(hero.cut>0){
    const last=hero.cut;hero.cut=Math.max(0,last-dt);
    if(last>.15&&hero.cut<=.15){
      for(const e of foes){
        const bearing=Math.atan2(e.y-hero.y,e.x-hero.x)-hero.angle;
        if(!e.dead&&near(hero,e)<41&&Math.cos(bearing)>.42){
          harm(e,24);sparks(e.x,e.y,'#ddbd8a',5);
        }
      }
    }
  }
  for(const k of Object.keys(cd))cd[k]=Math.max(0,cd[k]-dt);
  for(let i=zones.length-1;i>=0;i--){updateZone(zones[i],dt);if(zones[i].t>=zones[i].dur)zones.splice(i,1);}
  for(const e of foes)updateGuard(e,dt);
  for(let i=shots.length-1;i>=0;i--){tickShot(shots[i],dt);if(shots[i].ttl<=0)shots.splice(i,1);}
  for(let i=lodged.length-1;i>=0;i--)if((lodged[i].t-=dt)<=0)lodged.splice(i,1);
  for(let i=splinters.length-1;i>=0;i--){const p=splinters[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)splinters.splice(i,1);}
  if(near(hero,fountain)<116)hero.hp=Math.min(150,hero.hp+dt*24);
  if(notice>0&&(notice-=dt)<=0)$('notice').textContent='';
  if((saveAt+=dt)>2){saveAt=0;storePlace();}
  if(time>=nextHud){hud();nextHud=time+.08;}
}
function render(){
  const scale=camera.scale*world.width/viewWidth;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,world.width,world.height);
  ctx.setTransform(scale,0,0,scale,-camera.x*scale,-camera.y*scale);
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  CourMatieres.water(ctx,fountain,time);
  for(const z of zones){
    if(z.spell==='GL6'){
      CourMatieres.solGlace(ctx,z);
      CourMatieres.glace(ctx,z,false,assets.ice);
    }else SpellArt.draw(ctx,z,foes);
  }
  aimGuide();
  const order=[hero,...foes].sort((a,b)=>a.y-b.y);
  for(const p of order){
    if(p===hero)SourceArt.archer(ctx,p,assets.poses,time);
    else SourceArt.guard(ctx,p,assets.poses,time);
  }
  for(const p of lodged){
    if(p.e.dead>0)continue;
    const a=p.e.angle-p.start,cs=Math.cos(a),sn=Math.sin(a);
    SourceArt.arrow(ctx,{x:p.e.x+p.x*cs-p.y*sn,y:p.e.y+p.x*sn+p.y*cs,angle:p.angle+a},time);
  }
  SourceArt.casting(ctx,hero);
  for(const b of shots)SourceArt.arrow(ctx,b,time);
  for(const z of zones){
    if(z.spell==='GL6')CourMatieres.glace(ctx,z,true,assets.ice);
    else if(z.spell==='AI8')SpellArt.draw(ctx,z,foes,true);
  }
  for(const p of splinters){ctx.globalAlpha=Math.min(1,p.life*6);ctx.fillStyle=p.col;ctx.fillRect(p.x,p.y,2,1.2);}
  ctx.restore();
}
function hud(){
  const hp=Math.ceil(hero.hp)+' / 150 PV';if($('hp').textContent!==hp)$('hp').textContent=hp;
  $('hpBar').style.width=Math.ceil(hero.hp/1.5)+'%';$('dashBar').style.width=Math.round(hero.stamina*100)+'%';
  for(const b of $('skills').children){
    const s=skills[Number(b.dataset.slot)],left=cd[s.id]||0;
    const label=left?String(Math.ceil(left)):'';
    if(b.lastChild.textContent!==label)b.lastChild.textContent=label;
    b.style.setProperty('--shade',Math.ceil(left*100/s.cd)+'%');b.classList.toggle('aim',charge?.id===s.id||touchSpell===s.id);
  }
}
function buildHud(){
  for(const [i,s] of skills.entries()){
    const b=document.createElement('button');b.dataset.slot=i;b.dataset.id=s.id;b.title=s.name+' · '+(i+1);b.setAttribute('aria-label',b.title);
    const g=document.createElement('span'),k=document.createElement('kbd'),label=document.createElement('span'),timer=document.createElement('em');
    g.className='glyph';g.textContent=s.glyph;k.textContent=i+1;label.className='caption';label.textContent=s.short;
    b.append(g,k,label,timer);$('skills').append(b);
    b.onpointerdown=e=>{
      if(e.button!==0||charge)return;e.preventDefault();enableSound();
      if(begin(s.id,e.pointerId)){b.setPointerCapture(e.pointerId);point(e);}
    };
    b.onpointermove=e=>{if(charge?.owner===e.pointerId)point(e);};
    b.onpointerup=e=>{if(charge?.owner===e.pointerId){point(e);release(s.id,e.pointerId);}};
    b.onlostpointercapture=b.onpointercancel=e=>{if(charge?.owner===e.pointerId)cancel();};
    b.onclick=e=>{if(e.detail===0&&!charge&&begin(s.id))touchSpell=s.id;};
  }
}
function clearInput(){keys.clear();cancel();stick.x=stick.y=0;$('stick').firstElementChild.style.transform='';}
function pause(){if(!ready||paused)return;paused=true;clearInput();storePlace();$('menu').showModal();}
function resume(){if($('menu').open)$('menu').close();paused=false;resetClock();world.focus({preventScroll:true});}
$('pause').onclick=pause;$('resume').onclick=resume;
$('menu').addEventListener('cancel',e=>{e.preventDefault();resume();});
$('resetCd').onclick=()=>{for(const s of skills)cd[s.id]=0;hero.stamina=1;resume();say('Compétences rechargées.');};
$('free').onclick=()=>{free=!free;for(const s of skills)cd[s.id]=0;showFree();storePlace();};
function showFree(){$('free').textContent='Recharge instantanée · '+(free?'activée':'désactivée');$('free').setAttribute('aria-pressed',String(free));}
$('squad').onclick=()=>{resetFoes();zones.length=shots.length=splinters.length=0;hero.cast=null;resume();say('Les deux adversaires sont en place.');};
$('regen').onclick=()=>{hero.hp=150;resume();};
$('home').onclick=()=>{Object.assign(hero,spawn);hero.dash=0;hero.cast=null;follow();storePlace();resume();};
function keySkill(e){const m=/^(?:Digit|Numpad)([1-4])$/.exec(e.code);return m?skills[+m[1]-1].id:null;}
window.addEventListener('pointerdown',e=>{if(e.button===2&&charge){cancel();e.preventDefault();}},true);
window.addEventListener('keydown',e=>{
  if(!ready||paused||e.altKey||e.ctrlKey||e.metaKey)return;
  const k=e.key.toLowerCase(),id=keySkill(e);
  if(!(moves[k]||id||k===' '||k==='escape'||k==='shift'||k==='f'))return;
  if(e.target.tagName==='BUTTON'&&(k===' '||k==='enter'))return;
  e.preventDefault();if(e.repeat)return;enableSound();
  if(k==='shift')keys.add('walk');else if(k==='f')cut();else if(moves[k])keys.add(moves[k]);else if(id){if(touchSpell)cancel();begin(id);}else if(k===' ')dodge();else pause();
});
window.addEventListener('keyup',e=>{keys.delete(e.key==='Shift'?'walk':moves[e.key.toLowerCase()]);const id=keySkill(e);if(id)release(id);});
world.addEventListener('pointermove',point);
world.addEventListener('contextmenu',e=>e.preventDefault());
world.addEventListener('pointerdown',e=>{
  if(!ready||paused)return;world.focus({preventScroll:true});enableSound();point(e);
  if(e.button===2){cancel();return;}
  if(e.button!==0)return;world.setPointerCapture(e.pointerId);if(!touchSpell)begin('bow',e.pointerId);
});
world.addEventListener('pointerup',e=>{if(e.button!==0)return;point(e);if(touchSpell)release(touchSpell);else release('bow',e.pointerId);});
function cancelPointer(e){if(charge?.owner===e.pointerId)cancel();}
world.addEventListener('pointercancel',cancelPointer);world.addEventListener('lostpointercapture',cancelPointer);
$('blade').onpointerdown=e=>{e.preventDefault();enableSound();cut();};
$('dodge').onpointerdown=e=>{e.preventDefault();enableSound();dodge();};
$('shoot').onpointerdown=e=>{
  if(e.button!==0||charge&&!touchSpell)return;e.preventDefault();enableSound();if(touchSpell)cancel();
  const t=foes.filter(e=>!e.dead).sort((a,b)=>near(a,hero)-near(b,hero))[0];if(t){pointer=null;aim.x=t.x;aim.y=t.y;}
  if(begin('bow',e.pointerId))$('shoot').setPointerCapture(e.pointerId);
};
$('shoot').onpointerup=e=>release('bow',e.pointerId);$('shoot').onpointercancel=$('shoot').onlostpointercapture=cancelPointer;
const pad=$('stick');let padId=null;
function steer(e){const r=pad.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/27,y=(e.clientY-r.top-r.height/2)/27,n=Math.max(1,Math.hypot(x,y));stick.x=x/n;stick.y=y/n;pad.firstElementChild.style.transform='translate('+stick.x*22+'px,'+stick.y*22+'px)';}
pad.onpointerdown=e=>{if(padId!==null)return;padId=e.pointerId;pad.setPointerCapture(padId);steer(e);};pad.onpointermove=e=>{if(e.pointerId===padId)steer(e);};
pad.onlostpointercapture=()=>{padId=null;stick.x=stick.y=0;pad.firstElementChild.style.transform='';};
window.addEventListener('resize',resize);window.addEventListener('blur',clearInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();resetClock();}});
window.addEventListener('pagehide',()=>{if(ready)storePlace();});
function resetClock(){prev=nextFrame=physicsRemainder=0;}
function frame(stamp){
  if(!paused&&!document.hidden && (!nextFrame||stamp+.45>=nextFrame)){
    // Le prochain rendez-vous reste sur la grille de 30 Hz, même sur écran 144 Hz.
    physicsRemainder+=prev?Math.min(.15,(stamp-prev)/1000):0;
    while(physicsRemainder+1e-8>=simulationStep){step(simulationStep);physicsRemainder-=simulationStep;}
    prev=stamp;
    if(!nextFrame)nextFrame=stamp;
    nextFrame+=(1+Math.max(0,Math.floor((stamp-nextFrame+.45)/framePeriod)))*framePeriod;
    render();
  }
  requestAnimationFrame(frame);
}
async function start(){
  await Promise.all([floor.decode(),...Object.entries({poses:'textile-poses',ice:'prison-cristaux',eau:'source-vivante'}).map(async ([id,name])=>{
    const image=new Image();image.src='../assets/source/'+name+'.webp';await image.decode();assets[id]=image;
  })]);
  restore();resize();resetFoes();buildHud();showFree();hud();ready=true;render();
  say(matchMedia('(pointer:coarse)').matches?'Joystick pour marcher · Maintiens un sort et glisse pour viser':'ZQSD pour marcher · Clic maintenu pour bander l’arc · Maintiens 1 à 4 pour viser',5);
  requestAnimationFrame(frame);
}
start().catch(e=>{say('Chargement interrompu. Recharge la cour pour recommencer.',Infinity);console.error(e);});
