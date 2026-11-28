'use strict';

const $ = id => document.getElementById(id);
const world = $('world');
const ctx = world.getContext('2d', { alpha: false });
const W = 852, H = 480, TAU = Math.PI * 2;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const spawn = { x: 426, y: 268 };
const hero = { ...spawn, face: Math.PI / 2, hp: 150, stride: 0, walk: false,
  stamina: 1, dash: 0, dx: 0, dy: 0, release: 0, reload: 0, heavy: 0 };
const source = { x: 317, y: 200 };
const smith = { x: 683, y: 309 }, resident = { x: 500, y: 158 };
const targets = [{ x: 520, y: 262 }, { x: 573, y: 262 }].map(p => ({ ...p, hp: 100, hit: 0, down: 0 }));
const arsenal = {
  R2: ['Flèche perçante', 9], F2: ['Tir chargé', 8], F4: ['Tir lourd', 16],
  G3: ['Flèche de recul', 7], GL6: ['Prison de glace', 12], TE8: ['Séisme', 12]
};
const arrows = [], zones = [], impacts = [];
const keys = new Set(), timers = {}, camera = { x: 0, y: 0, scale: 1 };
const aim = { x: 520, y: 243 }, stick = { x: 0, y: 0 };
const assets = {};
let kit = 'arc', time = 0, held = null, noticeTime = 0, paused = false, ready = false;
let pointer = null, targetFocus = null, previous = 0, saveTimer = 0, audio;
let displayedStamina = -1, displayedHp = -1;
const saveKey = 'aldoria-essai-place-brune-v1';
const slots = () => kit === 'arc' ? ['R2','F2','F4','G3'] : ['R2','F2','GL6','TE8'];

// Footprints follow the walls at ground level. The roof overhangs remain walkable.
const blocks = [
  [0,0,277,103], [45,94,244,149], [77,140,206,162],
  [348,0,526,111], [371,106,515,121], [552,0,712,123], [710,0,812,112],
  [0,100,47,189], [0,185,118,302], [0,295,127,327],
  [579,176,836,288], [596,277,657,310], [686,282,728,300], [739,279,825,308],
  [0,359,294,480], [0,322,227,360], [566,354,852,480], [639,331,852,354]
];
function blocked(x, y) {
  if (x < 9 || x > W-9 || y < 12 || y > H-8) return true;
  if (((x-source.x)/72)**2 + ((y-source.y)/56)**2 < 1) return true;
  return blocks.some(([l,t,r,b]) => x > l-4 && x < r+4 && y > t-2 && y < b+2);
}
function move(dx,dy) {
  const count = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))/2);
  for (let i=0; i<count; i++) {
    if (!blocked(hero.x+dx/count,hero.y)) hero.x += dx/count;
    if (!blocked(hero.x,hero.y+dy/count)) hero.y += dy/count;
  }
}
function save() {
  try { localStorage.setItem(saveKey, JSON.stringify({x:hero.x,y:hero.y,kit})); } catch {}
}
function restore() {
  try {
    const s=JSON.parse(localStorage.getItem(saveKey));
    if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && !blocked(s.x,s.y)) {
      hero.x=s.x; hero.y=s.y;
    }
    if (s?.kit === 'magie') kit='magie';
  } catch {}
}
function tell(message, seconds=3) {
  $('notice').textContent=message;
  noticeTime=seconds;
}
function sound(from,to,len=0.12,type='sine',volume=0.045) {
  if (!audio || audio.state!=='running') return;
  const o=audio.createOscillator(), g=audio.createGain(), t=audio.currentTime;
  o.type=type; o.frequency.setValueAtTime(from,t); o.frequency.exponentialRampToValueAtTime(to,t+len);
  g.gain.setValueAtTime(volume,t); g.gain.exponentialRampToValueAtTime(.001,t+len);
  o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t+len);
}
function unlockAudio() {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state==='suspended') audio.resume().catch(()=>{});
  } catch {}
}
function resize() {
  const width=world.clientWidth, height=world.clientHeight, dpr=Math.min(devicePixelRatio || 1,2);
  world.width=Math.round(width*dpr); world.height=Math.round(height*dpr);
  camera.scale=Math.max(width/W,height/H);
  follow();
}
function follow() {
  camera.x=clamp(hero.x-world.clientWidth/camera.scale/2,0,Math.max(0,W-world.clientWidth/camera.scale));
  camera.y=clamp(hero.y-world.clientHeight/camera.scale/2,0,Math.max(0,H-world.clientHeight/camera.scale));
  if (pointer) {
    aim.x=camera.x+pointer.x/camera.scale;
    aim.y=camera.y+pointer.y/camera.scale;
  }
}
function pointAt(e) {
  if (!Number.isFinite(e.clientX)) return;
  const b=world.getBoundingClientRect();
  pointer={x:e.clientX-b.left,y:e.clientY-b.top}; follow();
}
function aimAngle() { return Math.atan2(aim.y-(hero.y-18),aim.x-hero.x); }
function begin(id) {
  if (!ready || paused || held || (id==='basic'?hero.reload:timers[id])>0) return;
  if (!pointer && matchMedia('(pointer:coarse)').matches) {
    const t=targets.filter(t=>t.hp>0).sort((a,b)=>distance(a,hero)-distance(b,hero))[0];
    if (t) {aim.x=t.x; aim.y=t.y-18;}
  }
  held={id,since:time}; hero.face=aimAngle();
}
function dodge() {
  if (!ready || paused || hero.stamina<.999) return;
  const [x,y]=direction(), a=x||y ? Math.atan2(y,x) : hero.face;
  held=null; hero.dash=.185; hero.stamina=0; hero.dx=Math.cos(a); hero.dy=Math.sin(a);
  sound(320,72,.15,'triangle');
}
function hit(t,damage) {
  if (t.hp<=0) return;
  t.hp=Math.max(0,t.hp-damage); t.hit=.23;
  impacts.push({x:t.x,y:t.y-34,text:'−'+damage,t:0});
  if (!t.hp) t.down=2.5;
  sound(157,65,.13,'triangle');
}
function release(id) {
  if (held?.id!==id || paused) return;
  const duration=clamp((time-held.since)/.65,0,1), a=aimAngle();
  held=null; hero.face=a; hero.release=.20;
  if (id!=='basic') timers[id]=arsenal[id][1];
  if (id==='F4') {hero.heavy=8; tell('Tir lourd · 8 s',1.5); sound(180,350); return;}
  if (id==='GL6' || id==='TE8') {
    const reach=Math.min(200,distance(hero,aim)), theta=Math.atan2(aim.y-hero.y,aim.x-hero.x);
    const x=hero.x+Math.cos(theta)*reach, y=hero.y+Math.sin(theta)*reach;
    zones.push({x,y,r:id==='GL6'?48:62,t:0,dur:id==='GL6'?2.35:1.65,spell:id});
    for (const t of targets) if (distance(t,{x,y})<65) hit(t,id==='GL6'?32:50);
    sound(id==='GL6'?670:95,id==='GL6'?230:35,.32); return;
  }
  const vx=Math.cos(a), vy=Math.sin(a), speed=230+80*duration;
  arrows.push({x:hero.x+vx*10,y:hero.y-18+vy*10,vx:vx*speed,vy:vy*speed,
    id,damage:(id==='F2'?60:id==='R2'?42:id==='G3'?40:12+Math.round(duration*8))*(hero.heavy>0?2:1), hits:new Set(),ttl:2});
  hero.reload=hero.heavy>0?.52:.36;
  if (id==='G3') move(-vx*32,-vy*32);
  sound(510,110,.14,'triangle');
}
function direction() {
  const dx=stick.x+Number(keys.has('right'))-Number(keys.has('left'));
  const dy=stick.y+Number(keys.has('down'))-Number(keys.has('up'));
  const norm=Math.max(1,Math.hypot(dx,dy));
  return [dx/norm,dy/norm];
}
function tickArrow(b,dt) {
  const n=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/3));
  b.ttl-=dt;
  for (let i=0;i<n && b.ttl>0;i++) {
    b.x+=b.vx*dt/n; b.y+=b.vy*dt/n;
    for (const t of targets) {
      if (!b.hits.has(t) && t.hp>0 && ((b.x-t.x)/11)**2+((b.y-(t.y-18))/14)**2<=1) {
        hit(t,b.damage); b.hits.add(t); if (b.id!=='R2') b.ttl=0;
      }
    }
    if (blocked(b.x,b.y+18)) b.ttl=0;
  }
}
function nearby() {
  if (Math.hypot((hero.x-source.x)/1.18,hero.y-source.y)<80) return 'source';
  if (distance(hero,smith)<36) return 'smith';
  if (distance(hero,resident)<32) return 'resident';
  return null;
}
const prompts={source:'Boire à la source',smith:'Parler au forgeron',resident:'Parler à la villageoise'};
function interact() {
  const who=nearby();
  if (who==='source') {hero.hp=150; hero.stamina=1; tell('La source restaure ta vie et ton esquive.'); sound(380,670,.3);}
  if (who==='smith') tell('Forgeron · Essaie la flèche perçante sur les deux cibles alignées.');
  if (who==='resident') tell('Villageoise · La source de Brune nous accueille toujours au retour.');
}
function advance(dt) {
  time+=dt; const [dx,dy]=direction();
  const oldX=hero.x, oldY=hero.y;
  if (hero.dash>0) {
    const step=Math.min(dt,hero.dash); move(hero.dx*232*step,hero.dy*232*step); hero.dash-=step;
  } else {move(dx*66*dt,dy*66*dt);}
  const walked=Math.hypot(hero.x-oldX,hero.y-oldY);
  hero.walk=walked>.02; hero.stride+=walked;
  if (held) hero.face=aimAngle(); else if (hero.walk && hero.release<=0) hero.face=Math.atan2(hero.y-oldY,hero.x-oldX);
  hero.stamina=Math.min(1,hero.stamina+dt/2.4);
  for (const k of ['release','heavy','reload']) hero[k]=Math.max(0,hero[k]-dt);
  for (const k of Object.keys(timers)) timers[k]=Math.max(0,timers[k]-dt);
  for (let i=arrows.length-1;i>=0;i--) { tickArrow(arrows[i],dt); if(arrows[i].ttl<=0) arrows.splice(i,1); }
  for (let i=zones.length-1;i>=0;i--) {zones[i].t+=dt; if(zones[i].t>=zones[i].dur) zones.splice(i,1);}
  for (let i=impacts.length-1;i>=0;i--) {impacts[i].t+=dt; if(impacts[i].t>.80) impacts.splice(i,1);}
  for (const t of targets) {
    t.hit=Math.max(0,t.hit-dt);
    if(t.down>0 && (t.down-=dt)<=0) t.hp=100;
  }
  resident.x=505+42*Math.sin(time*.19); resident.y=151+5*Math.cos(time*.19);
  if (noticeTime>0 && (noticeTime-=dt)<=0) $('notice').textContent='';
  if ((saveTimer+=dt)>1.5) {saveTimer=0; save();}
  follow(); updateHud();
}
function ellipse(x,y,rx,ry,color) {
  ctx.fillStyle=color; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,TAU); ctx.fill();
}
function sprite(sheet,row,col,p,height,flip=false,lean=0) {
  ctx.save(); ctx.translate(p.x,p.y); ctx.scale(flip?-1:1,1); ctx.rotate(lean);
  ctx.drawImage(assets[sheet],col*160,row*160,160,160,-height/2,-height*155/160,height,height);
  ctx.restore();
}
function drawHero() {
  const side=Math.cos(hero.face), vertical=Math.sin(hero.face);
  const shooting=held!==null || hero.release>0;
  const row=shooting?3:Math.abs(side)>.62?1:vertical<0?2:0;
  let frame=hero.walk?1+Math.floor(hero.stride/6)%3:0;
  if (shooting) frame=held?Math.min(2,Math.floor((time-held.since)*7)):3;
  const flip=(row===1 || row===3) && side<0;
  const breathe=hero.walk||shooting?0:Math.sin(time*2.4)*.34;
  ellipse(hero.x+2,hero.y-1,8,2.5,'#35271d70');
  sprite('archer',row,frame,{x:hero.x,y:hero.y+breathe},51,flip,hero.dash>0?.24:0);
}
function drawTarget(t) {
  ctx.save(); ctx.translate(t.x,t.y); ctx.rotate(t.hp<=0?1.16:Math.sin(t.hit*43)*t.hit*.32);
  ellipse(2,0,10,2,'#36251f5f');
  ctx.lineCap='round';
  for (const sign of [-1,1]) {
    ctx.strokeStyle='#513824'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(0,-18);ctx.lineTo(sign*5,0);ctx.stroke();
  }
  ellipse(0,-16,10,12,'#493626'); ellipse(0,-17,9,11,'#ceaa71');
  for (let i=8;i>=2;i-=2) {
    ctx.strokeStyle=i%4?'#9f5232':'#a58250';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(0,-17,i*.80,i,0,0,TAU);ctx.stroke();
  }
  ellipse(0,-17,1.7,2,'#883c2b'); ctx.restore();
  if (t.hp>0 && t.hp<100) {ctx.fillStyle='#342c24'; ctx.fillRect(t.x-11,t.y-34,22,2);ctx.fillStyle='#d4b26f';ctx.fillRect(t.x-11,t.y-34,22*t.hp/100,2);}
}
function animatePlace() {
  ctx.save();
  for(let i=0;i<3;i++) {
    const phase=(time*.6+i/3)%1;
    ctx.strokeStyle='rgba(209,255,248,'+(.36*(1-phase))+')'; ctx.lineWidth=.7;
    ctx.beginPath();ctx.ellipse(319,182,3+phase*36,1+phase*15,0,.08,TAU-.27);ctx.stroke();
  }
  for(let i=0;i<9;i++) {
    const s=(time*(1.4+i%3*.22)+i*.17)%1;
    ellipse(318+Math.sin(i*19+s*6)*2,157+s*23,.35,.75,'#deffffb5');
  }
  SpellArt.flame(ctx,722,255,6+1.6*Math.sin(time*5),time);
  ctx.restore();
}
const foregrounds=[
  {box:[22,318,196,93],poly:[[22,409],[29,338],[146,335],[146,322],[166,322],[166,336],[217,340],[218,409]]},
  {box:[644,324,172,87],poly:[[645,408],[646,343],[716,339],[717,326],[735,326],[736,339],[812,340],[787,408]]},
  {box:[613,156,220,77],poly:[[613,233],[617,163],[711,159],[715,174],[733,174],[732,158],[830,160],[832,232]]}
];
function redrawRoof(roof) {
  const [x,y,w,h]=roof.box; const points=roof.poly;
  ctx.save();ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1)) ctx.lineTo(...p);
  ctx.closePath();ctx.clip(); const plate=assets.place;
  ctx.drawImage(plate,x*plate.width/W,y*plate.height/H,w*plate.width/W,h*plate.height/H,x,y,w,h);ctx.restore();
}
function render() {
  const scale=camera.scale*world.width/world.clientWidth;
  ctx.setTransform(scale,0,0,scale,-camera.x*scale,-camera.y*scale);
  ctx.drawImage(assets.place,0,0,W,H); animatePlace();
  for (const z of zones) SpellArt.draw(ctx,z,[]);
  if (held) {
    const ground=['TE8','GL6'].includes(held.id);
    ctx.save(); ctx.strokeStyle='#fff0b8ad'; ctx.lineWidth=.9;ctx.setLineDash([2.4,3.5]);
    ctx.beginPath();
    if (ground) {
      const d=Math.min(200,distance(hero,aim)), a=Math.atan2(aim.y-hero.y,aim.x-hero.x);
      ctx.ellipse(hero.x+Math.cos(a)*d,hero.y+Math.sin(a)*d,held.id==='TE8'?62:48,held.id==='TE8'?62:48,0,0,TAU);
    } else {
      const a=aimAngle(), len=clamp(Math.hypot(aim.x-hero.x,aim.y-hero.y+18),27,125);
      ctx.moveTo(hero.x+Math.cos(a)*14,hero.y-18+Math.sin(a)*14);
      ctx.lineTo(hero.x+Math.cos(a)*len,hero.y-18+Math.sin(a)*len);
    }
    ctx.stroke(); ctx.restore();
  }
  const actors=[
    [hero.y,drawHero],
    [smith.y,()=>{ellipse(smith.x+2,smith.y-1,8,2.6,'#35271d66');sprite('habitants',0,[0,1,1,2,3,0][Math.floor(time*5)%6],smith,42);}],
    [resident.y,()=>{ellipse(resident.x+1,resident.y-1,6.6,2.4,'#35271d66');sprite('habitants',1,Math.floor(time*4)%4,resident,43,Math.cos(time*.19)<0);}],
    ...targets.map(t=>[t.y,()=>drawTarget(t)]),
    ...foregrounds.map(r=>[r.box[1]+r.box[3],()=>redrawRoof(r)])
  ];
  for(const b of arrows) actors.push([b.y+18,()=>{
    ctx.save();ctx.translate(b.x,b.y);ctx.scale(.46,.46);
    SpellArt.projectile(ctx,{x:0,y:0,vx:b.vx,vy:b.vy,r:3,arrow:true,spellId:b.id,heavyShot:hero.heavy>0},time);ctx.restore();
  }]);
  actors.sort((a,b)=>a[0]-b[0]);for(const [,draw] of actors) draw();
  for(const p of impacts) {
    ctx.save();ctx.globalAlpha=Math.min(1,(.8-p.t)*3);ctx.font='bold 8px Georgia';ctx.textAlign='center';
    ctx.lineWidth=2;ctx.strokeStyle='#493224';ctx.fillStyle='#ffdb95';
    ctx.strokeText(p.text,p.x,p.y-17*p.t);ctx.fillText(p.text,p.x,p.y-17*p.t);ctx.restore();
  }
}
function icon(c,id) {
  const g=c.getContext('2d');g.scale(2,2);g.translate(15,15);
  g.strokeStyle=id==='GL6'?'#b8ebef':id==='TE8'?'#e8bd7a':'#edcd83';g.fillStyle=g.strokeStyle;
  g.lineWidth=1.6;g.lineCap='round';g.lineJoin='round';
  const line=(points)=>{g.beginPath();g.moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);g.stroke();};
  const arrow=(x,y,n)=>{line([[x-n,y+n],[x,y],[x-5,y+1.2]]);line([[x,y],[x-1,y+5]]);};
  if(id==='F4'){g.beginPath();g.arc(0,0,8.5,0,TAU);g.stroke();line([[-12,0],[-6,0]]);line([[6,0],[12,0]]);line([[0,-12],[0,-6]]);line([[0,6],[0,12]]);}
  else if(id==='GL6'){for(let i=0;i<6;i++){g.rotate(TAU/6);line([[0,0],[0,-11]]);line([[-3,-7],[0,-4],[3,-7]]);}}
  else if(id==='TE8'){line([[-10,8],[-4,1],[-6,-1],[0,-9],[-1,-3],[4,-5],[2,1],[9,-1]]);}
  else {arrow(8,-9,17); if(id==='F2') {arrow(1,-9,10);arrow(9,-2,10);} if(id==='G3'){line([[-10,1],[-6,1]]);line([[-8,5],[-3,5]]);}}
}
function bindButton(button,onDown,onUp) {
  let active=null;
  button.addEventListener('pointerdown',e=>{
    if(active!==null || e.button!==0)return; e.preventDefault();unlockAudio();
    active=e.pointerId;button.setPointerCapture(active);onDown();
  });
  button.addEventListener('pointerup',e=>{if(e.pointerId===active){active=null;onUp();}});
  button.addEventListener('lostpointercapture',()=>{if(active!==null){held=null;active=null;}});
}
function buildHud() {
  const skills=$('skills');skills.replaceChildren();
  slots().forEach((id,i)=>{
    const b=document.createElement('button'),key=document.createElement('kbd'),c=document.createElement('canvas'),e=document.createElement('em');
    b.title=arsenal[id][0]+' · '+arsenal[id][1]+' s'; b.setAttribute('aria-label',b.title); b.dataset.id=id;
    key.textContent=i+1;c.width=c.height=60; icon(c,id);b.append(c,key,e);
    bindButton(b,()=>begin(id),()=>release(id));
    b.addEventListener('click',event=>{if(event.detail===0){begin(id);release(id);}});
    skills.appendChild(b);
  });
  $('loadout').textContent=kit==='arc'?'Équiper Prison de glace et Séisme':'Reprendre les quatre techniques d’archer';
  updateHud();
}
function updateHud() {
  const stamina=Math.round(hero.stamina*100);
  if (displayedStamina!==stamina) {
    displayedStamina=stamina; $('dashBar').style.width=stamina+'%';
  }
  if (displayedHp!==hero.hp) {
    displayedHp=hero.hp; $('hpBar').style.width=(hero.hp/150*100)+'%'; $('hp').textContent=hero.hp+' / 150 PV';
  }
  for(const b of $('skills').children) {
    const id=b.dataset.id, sec=timers[id] || 0;
    const shade=Math.ceil(100*sec/arsenal[id][1])+'%', label=sec>0?String(Math.ceil(sec)):'';
    if(b.style.getPropertyValue('--shade')!==shade) b.style.setProperty('--shade',shade);
    b.classList.toggle('aim',held?.id===id);
    if(b.lastChild.textContent!==label) b.lastChild.textContent=label;
  }
  const n=nearby();
  if(n!==targetFocus) {
    targetFocus=n;$('talk').hidden=!n;if(n)$('talk').textContent='E · '+prompts[n];
  }
}
function clearInput() {keys.clear();held=null;stick.x=stick.y=0;$('stick').firstChild.style.transform='';}
function pause() {
  if(!ready || paused)return;
  paused=true;clearInput();save();$('menu').showModal();
}
function resume() {if($('menu').open)$('menu').close();paused=false;previous=0;world.focus({preventScroll:true});}
$('pause').onclick=pause;$('resume').onclick=resume;
$('menu').addEventListener('cancel',e=>{e.preventDefault();resume();});
$('loadout').onclick=()=>{kit=kit==='arc'?'magie':'arc';buildHud();save();};
$('resetCd').onclick=()=>{for(const id of Object.keys(timers))timers[id]=0; hero.stamina=1;hero.reload=0;resume();tell('Compétences et esquive rechargées.');};
$('resetTarget').onclick=()=>{for(const t of targets){t.hp=100;t.down=t.hit=0;}resume();tell('Les deux cibles sont prêtes.');};
$('home').onclick=()=>{Object.assign(hero,spawn);hero.dash=0;follow();save();resume();tell('De retour sur la place.');};
$('fullscreen').onclick=async()=>{try {if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{resume();tell('Plein écran indisponible dans cette fenêtre.');}};
$('talk').onclick=interact;
const controls={z:'up',w:'up',q:'left',a:'left',s:'down',d:'right',arrowup:'up',arrowleft:'left',arrowdown:'down',arrowright:'right'};
function slotKey(e) {
  const m=/^(?:Digit|Numpad)([1-4])$/.exec(e.code);
  return m?slots()[Number(m[1])-1]:undefined;
}
window.addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||!ready)return;
  if(paused)return;
  const k=e.key.toLowerCase(), s=slotKey(e);
  if(!(controls[k]||s||['escape',' ','e'].includes(k)))return;
  e.preventDefault();if(e.repeat)return;unlockAudio();
  if(controls[k])keys.add(controls[k]);
  else if(s)begin(s);else if(k===' ')dodge();else if(k==='e')interact();else pause();
});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(controls[k])keys.delete(controls[k]);const s=slotKey(e);if(s && !paused)release(s);});
world.addEventListener('pointermove',pointAt);
world.addEventListener('pointerdown',e=>{
  if(!ready||paused)return;
  world.focus({preventScroll:true});unlockAudio();pointAt(e);
  if(e.button===2){held=null;return;}
  if(e.button===0){world.setPointerCapture(e.pointerId);begin('basic');}
});
world.addEventListener('pointerup',e=>{if(e.button===0){pointAt(e);release('basic');}});
world.addEventListener('pointercancel',()=>{held=null;});
world.addEventListener('contextmenu',e=>e.preventDefault());
bindButton($('shoot'),()=>begin('basic'),()=>release('basic'));
bindButton($('dodge'),dodge,()=>{});
const pad=$('stick');let padId=null;
function steer(e) {
  const b=pad.getBoundingClientRect(), dx=(e.clientX-b.left-b.width/2)/28, dy=(e.clientY-b.top-b.height/2)/28, len=Math.max(1,Math.hypot(dx,dy));
  stick.x=dx/len;stick.y=dy/len;pad.firstChild.style.transform='translate('+stick.x*22+'px,'+stick.y*22+'px)';
}
pad.onpointerdown=e=>{if(padId!==null)return;padId=e.pointerId;pad.setPointerCapture(padId);steer(e);};
pad.onpointermove=e=>{if(e.pointerId===padId)steer(e);};
pad.onlostpointercapture=()=>{padId=null;stick.x=stick.y=0;pad.firstChild.style.transform='';};
window.addEventListener('resize',resize);
window.addEventListener('blur',()=>{clearInput();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();save();previous=0;}});
window.addEventListener('pagehide',save);
function frame(stamp) {
  if(!paused && !document.hidden) {
    advance(previous?Math.min(.05,(stamp-previous)/1000):0); render();
  }
  previous=stamp;requestAnimationFrame(frame);
}
async function startPlace() {
  await Promise.all(['place','archer','habitants'].map(async name=>{
    const image=new Image(); image.src='../assets/brune/'+name+'.webp';await image.decode();assets[name]=image;
  }));
  restore();resize();buildHud();ready=true;render();
  tell('ZQSD pour marcher · Maintiens le tir puis relâche vers une cible',4);
  if(matchMedia('(pointer:coarse)').matches)tell('Déplace-toi au joystick. Touche une cible pour tirer.',4);
  requestAnimationFrame(frame);
}
startPlace().catch(error=>{tell('Le décor n’a pas pu être chargé. Recharge la page.',Infinity);console.error(error);});
