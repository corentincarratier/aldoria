'use strict';
const $=id=>document.getElementById(id), world=$('world'), ctx=world.getContext('2d',{alpha:false});
const W=896,H=560,TAU=2*Math.PI;
const clamp=(n,l,h)=>Math.max(l,Math.min(h,n));
const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const fountain={x:98,y:99,r:50,lip:19}, spawn={x:273,y:341};
const hero={...spawn,angle:-.36,hp:150,phase:0,motion:0,draw:0,aiming:false,release:0,reload:0,dash:0,stamina:1,cast:null,flash:0};
const skills=[
  {id:'R2',name:'Flèche perçante',short:'Percée',glyph:'➶',cd:3},
  {id:'GL6',name:'Prison de glace',short:'Prison',glyph:'❄',cd:5,r:80,wind:.31,dur:2.4},
  {id:'TE8',name:'Séisme',short:'Séisme',glyph:'ϟ',cd:5,r:87,wind:.33,dur:1.7},
  {id:'AI8',name:'Tornade',short:'Tornade',glyph:'🌀︎',cd:6,r:73,wind:.28,dur:3}
];
const moves={z:'up',w:'up',arrowup:'up',s:'down',arrowdown:'down',d:'right',arrowright:'right',q:'left',a:'left',arrowleft:'left'};
const keys=new Set(),stick={x:0,y:0},aim={x:665,y:172},camera={x:0,y:0,scale:1};
const shots=[],zones=[],splinters=[],lodged=[],foes=[],assets={},cd={};
const saveKey='aldoria-essai-source-zenith-v1';
let time=0,prev=0,ready=false,paused=false,charge=null,notice=0,saveAt=0,pointer=null,touchSpell=null,free=false;
let audio;
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
function storePlace(){try{localStorage.setItem(saveKey,JSON.stringify({x:hero.x,y:hero.y,free}));}catch{}}
function restore(){try{const s=JSON.parse(localStorage.getItem(saveKey));if(s&&Number.isFinite(s.x)&&Number.isFinite(s.y)&&!blocked(s.x,s.y)){hero.x=s.x;hero.y=s.y;free=s.free===true;}}catch{}}
function guard(i){
  const viewWidth=world.clientWidth/camera.scale;
  const groupX=clamp(spawn.x+viewWidth*.38,424,680);
  const x=groupX+(i===1?-32:32),y=i===1?172:222;
  return {kind:i,x,y,startX:x,startY:y,angle:2.7,hp:100,dead:0,hit:0,freeze:0,phase:i,walk:0,swing:0,rearm:1,alert:0,stun:0};
}
function resetFoes(){foes.splice(0,foes.length,guard(1),guard(2));lodged.length=0;}
function resize(){
  const w=world.clientWidth,h=world.clientHeight,d=Math.min(window.devicePixelRatio||1,2);
  world.width=Math.round(w*d);world.height=Math.round(h*d);camera.scale=Math.min(Math.max(w/W,h/H),w/470);follow();
}
function follow(){
  const vw=world.clientWidth/camera.scale,vh=world.clientHeight/camera.scale;
  camera.x=vw>=W?(W-vw)/2:clamp(hero.x-vw/2,0,W-vw);
  camera.y=vh>=H?(H-vh)/2:clamp(hero.y-vh/2,0,H-vh);
  if(pointer){aim.x=clamp(camera.x+pointer.x/camera.scale,0,W);aim.y=clamp(camera.y+pointer.y/camera.scale,0,H);}
}
function point(e){const r=world.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};follow();}
function direction(){const x=stick.x+Number(keys.has('right'))-Number(keys.has('left')),y=stick.y+Number(keys.has('down'))-Number(keys.has('up')),n=Math.max(1,Math.hypot(x,y));return [x/n,y/n];}
function face(){return Math.atan2(aim.y-hero.y,aim.x-hero.x);}
function begin(id){
  if(!ready || paused || charge || hero.cast || hero.dash>0 || (id==='bow'?hero.reload:cd[id])>0)return false;
  hero.angle=face();charge={id,t:0};hero.draw=0;hero.aiming=id==='bow'||id==='R2';hero.prep=!hero.aiming;return true;
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
  const a=hero.angle,pose=SourceArt.bowPose(hero),gx=pose.grip[0]*2,gy=pose.grip[1]*2;
  const x=hero.x+Math.cos(a)*gx-Math.sin(a)*gy,y=hero.y+Math.sin(a)*gx+Math.cos(a)*gy;
  const heading=near(hero,aim)>40?Math.atan2(aim.y-y,aim.x-x):a;
  shots.push({x,y,angle:heading,speed:290+190*power,id,damage:id==='R2'?53:14+Math.round(power*22),ttl:3,hits:new Set()});
  hero.release=.235;hero.reload=.30;hero.lastDraw=power;sound(630,105,.12);
}
function release(id){
  if(charge?.id!==id || paused)return;
  hero.angle=face();const s=skills.find(s=>s.id===id);
  if(s)cd[id]=free?0:s.cd;
  if(id==='bow'||id==='R2')shoot(id,hero.draw);
  else{
    hero.cast={id,t:0,dur:s.wind+.32,wind:s.wind,fired:false,x:aim.x,y:aim.y,s};
    sound(id==='GL6'?340:id==='TE8'?93:220,id==='GL6'?720:id==='TE8'?60:480,s.wind,'sine');
  } cancel();
}
function dodge(){
  if(!ready||paused||hero.stamina<.999||hero.cast)return;
  const [x,y]=direction(),a=x||y?Math.atan2(y,x):hero.angle;
  cancel();hero.dash=.19;hero.stamina=0;hero.dashX=Math.cos(a);hero.dashY=Math.sin(a);hero.angle=a;
  sound(250,70,.14);
}
function fireZone(k){
  const s=k.s;zones.push({spell:k.id,x:k.x,y:k.y,r:s.r,t:0,dur:s.dur,struck:new Set(),pulse:new Map()});
  sound(k.id==='GL6'?810:k.id==='TE8'?115:220,k.id==='GL6'?310:k.id==='TE8'?36:83,.36);
}
function updateZone(z,dt){
  z.t+=dt;
  for(const e of foes){
    if(e.dead>0)continue;const d=near(z,e);
    if(z.spell==='TE8'){
      if(d<z.r && z.t>=d/z.r*.23 && !z.struck.has(e)){z.struck.add(e);harm(e,44);e.stun=.6;sparks(e.x,e.y,'#a98c64');}
    }else if(z.spell==='GL6'){
      if(z.t<=SpellArt.prisonTravel && d<=z.r+5){z.struck.add(e);move(e,(z.x-e.x)*dt*2.35,(z.y-e.y)*dt*2.35);e.stun=.12;}
      if(z.t>=SpellArt.prisonTravel && z.struck.has(e) && !z.pulse.has(e)){z.pulse.set(e,1);harm(e,28);e.freeze=1.55;e.swing=0;}
    }else if(d<z.r){
      const a=Math.atan2(e.y-z.y,e.x-z.x)+dt*2.9;
      const r=Math.max(13,d-dt*35);
      move(e,z.x+Math.cos(a)*r-e.x,z.y+Math.sin(a)*r-e.y);e.stun=.15;
      if(z.t>=(z.pulse.get(e)||0)){harm(e,7);z.pulse.set(e,z.t+.43);}
    }
  }
}
function updateGuard(e,dt){
  if(e.dead>0){e.dead-=dt;if(e.dead<=0)Object.assign(e,guard(e.kind));return;}
  for(const k of ['freeze','stun','hit','alert','rearm'])e[k]=Math.max(0,e[k]-dt);
  if(e.freeze||e.stun){e.walk=0;return;}
  const d=near(hero,e),fight=e.alert>0||d<128;
  const gx=fight?hero.x:e.startX+10*Math.cos(time*.52+e.kind),gy=fight?hero.y:e.startY+9*Math.sin(time*.47+e.kind);
  const a=Math.atan2(gy-e.y,gx-e.x),go=Math.hypot(gx-e.x,gy-e.y)>(fight?33:1);
  if(fight||go)e.angle=a;
  if(e.swing>0){
    const old=e.swing;e.swing=Math.max(0,e.swing-dt);
    if(old>.26&&e.swing<=.26&&d<44&&hero.dash<=0){hero.hp=Math.max(1,hero.hp-8);hero.flash=.2;sparks(hero.x,hero.y,'#b76c4a',5);sound(130,65,.1);}
  }else if(fight&&d<39&&!e.rearm){e.swing=.55;e.rearm=1.9;}
  e.walk=go&&!e.swing?1:0;
  if(e.walk){const v=(fight?22:9)*dt;move(e,Math.cos(a)*v,Math.sin(a)*v);e.phase+=v*.22;}
}
function tickShot(b,dt){
  const n=Math.ceil(b.speed*dt/3)||1;
  for(let k=0;k<n&&b.ttl>0;k++){
    b.x+=Math.cos(b.angle)*b.speed*dt/n;b.y+=Math.sin(b.angle)*b.speed*dt/n;
    for(const e of foes)if(!e.dead&&!b.hits.has(e)&&near(b,e)<17){
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
  else move(hero,dx*dt*88,dy*dt*88);
  const dist=Math.hypot(hero.x-ox,hero.y-oy);hero.motion+=(Math.min(1,dist/(dt*86||1))-hero.motion)*Math.min(1,dt*16);hero.phase+=dist*.2;
  follow();
  hero.release=Math.max(0,hero.release-dt);hero.reload=Math.max(0,hero.reload-dt);hero.flash=Math.max(0,hero.flash-dt);hero.stamina=Math.min(1,hero.stamina+dt/1.9);
  if(charge){charge.t+=dt;hero.draw=Math.min(1,charge.t/.54);hero.angle=face();}
  else if(!hero.cast && hero.release<=0 && dist>.01)hero.angle=Math.atan2(hero.y-oy,hero.x-ox);
  if(hero.cast){const k=hero.cast;k.t+=dt;if(!k.fired&&k.t>=k.wind){k.fired=true;fireZone(k);}if(k.t>=k.dur)hero.cast=null;}
  for(const k of Object.keys(cd))cd[k]=Math.max(0,cd[k]-dt);
  for(let i=zones.length-1;i>=0;i--){updateZone(zones[i],dt);if(zones[i].t>=zones[i].dur)zones.splice(i,1);}
  for(const e of foes)updateGuard(e,dt);
  for(let i=shots.length-1;i>=0;i--){tickShot(shots[i],dt);if(shots[i].ttl<=0)shots.splice(i,1);}
  for(let i=lodged.length-1;i>=0;i--)if((lodged[i].t-=dt)<=0)lodged.splice(i,1);
  for(let i=splinters.length-1;i>=0;i--){const p=splinters[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)splinters.splice(i,1);}
  if(near(hero,fountain)<116)hero.hp=Math.min(150,hero.hp+dt*24);
  if(notice>0&&(notice-=dt)<=0)$('notice').textContent='';
  if((saveAt+=dt)>2){saveAt=0;storePlace();}
  hud();
}
function aimGuide(){
  if(!charge)return;
  const s=skills.find(k=>k.id===charge.id);
  ctx.save();ctx.lineWidth=1;ctx.strokeStyle=s?.id==='GL6'?'#c9f6ffcb':'#fff0c9b8';ctx.setLineDash([4,5]);
  ctx.beginPath();
  if(s?.r)ctx.arc(aim.x,aim.y,s.r,0,TAU);
  else{const a=face(),dist=clamp(near(hero,aim),44,178);ctx.moveTo(hero.x+Math.cos(a)*37,hero.y+Math.sin(a)*37);ctx.lineTo(hero.x+Math.cos(a)*dist,hero.y+Math.sin(a)*dist);}
  ctx.stroke();ctx.restore();
}
function render(){
  const scale=camera.scale*world.width/world.clientWidth;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#27302c';ctx.fillRect(0,0,world.width,world.height);
  ctx.setTransform(scale,0,0,scale,-camera.x*scale,-camera.y*scale);
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();ctx.drawImage(assets.cour,0,0,W,H);
  SourceArt.water(ctx,fountain,time);
  for(const z of zones)SpellArt.draw(ctx,z,foes);
  aimGuide();
  const order=[hero,...foes].sort((a,b)=>a.y-b.y);
  for(const p of order){
    if(p===hero)SourceArt.archer(ctx,p,assets.personnages,time);
    else SourceArt.guard(ctx,p,assets.personnages,time);
  }
  for(const p of lodged){
    if(p.e.dead>0)continue;
    const a=p.e.angle-p.start,cs=Math.cos(a),sn=Math.sin(a);
    SourceArt.arrow(ctx,{x:p.e.x+p.x*cs-p.y*sn,y:p.e.y+p.x*sn+p.y*cs,angle:p.angle+a},time);
  }
  SourceArt.casting(ctx,hero);
  for(const b of shots)SourceArt.arrow(ctx,b,time);
  for(const z of zones)if(z.spell==='AI8')SpellArt.draw(ctx,z,foes,true);
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
    b.onclick=()=>{enableSound();cancel();if(begin(s.id)){touchSpell=s.id;say('Vise puis touche le terrain · '+s.name,2);}};
  }
}
function clearInput(){keys.clear();cancel();stick.x=stick.y=0;$('stick').firstElementChild.style.transform='';}
function pause(){if(!ready||paused)return;paused=true;clearInput();storePlace();$('menu').showModal();}
function resume(){if($('menu').open)$('menu').close();paused=false;prev=0;world.focus({preventScroll:true});}
$('pause').onclick=pause;$('resume').onclick=resume;
$('menu').addEventListener('cancel',e=>{e.preventDefault();resume();});
$('resetCd').onclick=()=>{for(const s of skills)cd[s.id]=0;hero.stamina=1;resume();say('Compétences rechargées.');};
$('free').onclick=()=>{free=!free;for(const s of skills)cd[s.id]=0;showFree();storePlace();};
function showFree(){$('free').textContent='Recharge instantanée · '+(free?'activée':'désactivée');$('free').setAttribute('aria-pressed',String(free));}
$('squad').onclick=()=>{resetFoes();zones.length=shots.length=splinters.length=0;hero.cast=null;resume();say('Les deux adversaires sont en place.');};
$('regen').onclick=()=>{hero.hp=150;resume();};
$('home').onclick=()=>{Object.assign(hero,spawn);hero.dash=0;hero.cast=null;follow();storePlace();resume();};
function keySkill(e){const m=/^(?:Digit|Numpad)([1-4])$/.exec(e.code);return m?skills[+m[1]-1].id:null;}
window.addEventListener('keydown',e=>{
  if(!ready||paused||e.altKey||e.ctrlKey||e.metaKey)return;
  const k=e.key.toLowerCase(),id=keySkill(e);
  if(!(moves[k]||id||k===' '||k==='escape'))return;
  if(e.target.tagName==='BUTTON'&&(k===' '||k==='enter'))return;
  e.preventDefault();if(e.repeat)return;enableSound();
  if(moves[k])keys.add(moves[k]);else if(id){if(touchSpell)cancel();begin(id);}else if(k===' ')dodge();else pause();
});
window.addEventListener('keyup',e=>{keys.delete(moves[e.key.toLowerCase()]);const id=keySkill(e);if(id)release(id);});
world.addEventListener('pointermove',point);
world.addEventListener('contextmenu',e=>e.preventDefault());
world.addEventListener('pointerdown',e=>{
  if(!ready||paused)return;world.focus({preventScroll:true});enableSound();point(e);
  if(e.button===2){cancel();return;}
  if(e.button!==0)return;world.setPointerCapture(e.pointerId);if(!touchSpell)begin('bow');
});
world.addEventListener('pointerup',e=>{if(e.button!==0)return;point(e);release(touchSpell||'bow');});
world.addEventListener('pointercancel',cancel);
$('dodge').onpointerdown=e=>{e.preventDefault();enableSound();dodge();};
$('shoot').onpointerdown=e=>{
  e.preventDefault();enableSound();if(touchSpell)cancel();
  const t=foes.filter(e=>!e.dead).sort((a,b)=>near(a,hero)-near(b,hero))[0];if(t){pointer=null;aim.x=t.x;aim.y=t.y;}
  $('shoot').setPointerCapture(e.pointerId);begin('bow');
};
$('shoot').onpointerup=()=>release('bow');$('shoot').onpointercancel=cancel;
const pad=$('stick');let padId=null;
function steer(e){const r=pad.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/27,y=(e.clientY-r.top-r.height/2)/27,n=Math.max(1,Math.hypot(x,y));stick.x=x/n;stick.y=y/n;pad.firstElementChild.style.transform='translate('+stick.x*22+'px,'+stick.y*22+'px)';}
pad.onpointerdown=e=>{if(padId!==null)return;padId=e.pointerId;pad.setPointerCapture(padId);steer(e);};pad.onpointermove=e=>{if(e.pointerId===padId)steer(e);};
pad.onlostpointercapture=()=>{padId=null;stick.x=stick.y=0;pad.firstElementChild.style.transform='';};
window.addEventListener('resize',resize);window.addEventListener('blur',clearInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();prev=0;}});
window.addEventListener('pagehide',()=>{if(ready)storePlace();});
function frame(stamp){
  if(!paused&&!document.hidden){const dt=prev?clamp((stamp-prev)/1000,0,.08):0;for(let rest=dt;rest>0;rest-=1/60)step(Math.min(rest,1/60));render();}
  prev=stamp;requestAnimationFrame(frame);
}
async function start(){
  await Promise.all(['cour','personnages'].map(async name=>{const im=new Image();im.src='../assets/source/'+name+'.webp';await im.decode();assets[name]=im;}));
  restore();resize();resetFoes();buildHud();showFree();hud();ready=true;render();
  say(matchMedia('(pointer:coarse)').matches?'Joystick pour marcher · Touche un sort puis le terrain':'ZQSD pour marcher · Clic maintenu pour tirer · 1 à 4 pour lancer un sort',5);
  requestAnimationFrame(frame);
}
start().catch(e=>{say('Chargement interrompu. Recharge la cour pour recommencer.',Infinity);console.error(e);});
