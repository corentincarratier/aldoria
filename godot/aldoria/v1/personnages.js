/* ============ Aldoria : dessin des personnages, armes et créatures ============ */
/* Repère local des armes : origine = la main, +x = vers l'avant de l'arme, unité s. */
const ART={};
(function(){
const TAU=Math.PI*2;
function steel(c,y0,y1){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#f4f8fb');g.addColorStop(.5,'#c3ccd5');g.addColorStop(1,'#7f8b97');return g}
function wood(c,y0,y1,a='#8a6236',b='#4e3520'){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g}
function glowDot(c,x,y,r,col,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,col+'00');c.globalAlpha*=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.globalAlpha/=a}
function hexA(col,a){return col.length===7?col+Math.round(a*255).toString(16).padStart(2,'0'):col}

/* ---------- armes ---------- */
const W={};
W.sword=(c,s,o={})=>{const L=(o.len||24)*s,bw=(o.bw||2.1)*s;
  // pommeau, poignée, garde
  c.beginPath();c.arc(-7.5*s,0,2.2*s,0,TAU);c.fillStyle='#c9a24a';c.fill();c.lineWidth=.6*s;c.strokeStyle='#6b5222';c.stroke();
  c.fillStyle='#4a2f1c';c.fillRect(-6*s,-1.3*s,5.6*s,2.6*s);
  c.strokeStyle='#2a190e';c.lineWidth=.5*s;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-5.4*s+i*1.4*s,-1.3*s);c.lineTo(-4.6*s+i*1.4*s,1.3*s);c.stroke()}
  c.beginPath();c.moveTo(-.4*s,-6*s);c.quadraticCurveTo(1.4*s,0,-.4*s,6*s);c.lineTo(.9*s,6*s);c.quadraticCurveTo(2.6*s,0,.9*s,-6*s);c.closePath();c.fillStyle='#c9a24a';c.fill();c.strokeStyle='#6b5222';c.lineWidth=.6*s;c.stroke();
  for(const yy of[-6,6]){c.beginPath();c.arc(.25*s,yy*s,1.2*s,0,TAU);c.fillStyle='#e0bd62';c.fill()}
  // lame
  const rust=o.rust;c.beginPath();c.moveTo(1.6*s,-bw);c.lineTo(L-5*s,-bw*.9);c.lineTo(L,0);c.lineTo(L-5*s,bw*.9);c.lineTo(1.6*s,bw);c.closePath();
  c.fillStyle=rust?wood(c,-bw,bw,'#b9a58a','#6f5a44'):steel(c,-bw,bw);c.fill();c.strokeStyle=rust?'#4a3a2a':'#56616c';c.lineWidth=.7*s;c.stroke();
  c.beginPath();c.moveTo(2.6*s,0);c.lineTo(L-7*s,0);c.strokeStyle=rust?'#8a7660':'#9aa6b2';c.lineWidth=.8*s;c.stroke();
  if(rust){c.fillStyle='#7a4a2a';for(let i=0;i<3;i++){c.beginPath();c.arc((6+i*5)*s,(i%2?.8:-.6)*s,.9*s,0,TAU);c.fill()}}
  if(o.glint){c.beginPath();c.moveTo(4*s,-bw*.55);c.lineTo(L-8*s,-bw*.5);c.strokeStyle='#ffffffaa';c.lineWidth=.5*s;c.stroke()}
};
W.greatsword=(c,s,o={})=>{c.save();c.translate(-3*s,0);
  c.fillStyle='#3d2616';c.fillRect(-11*s,-1.5*s,10*s,3*s);c.strokeStyle='#1e120a';c.lineWidth=.5*s;for(let i=0;i<7;i++){c.beginPath();c.moveTo(-10.5*s+i*1.4*s,-1.5*s);c.lineTo(-9.7*s+i*1.4*s,1.5*s);c.stroke()}
  c.beginPath();c.moveTo(-12*s,0);c.lineTo(-13.6*s,-2*s);c.lineTo(-15.2*s,0);c.lineTo(-13.6*s,2*s);c.closePath();c.fillStyle='#b8923c';c.fill();
  c.beginPath();c.moveTo(-1*s,-8.5*s);c.lineTo(.8*s,-8.5*s);c.lineTo(1.8*s,-2*s);c.lineTo(1.8*s,2*s);c.lineTo(.8*s,8.5*s);c.lineTo(-1*s,8.5*s);c.lineTo(0,2*s);c.lineTo(0,-2*s);c.closePath();c.fillStyle='#8a8f96';c.fill();c.strokeStyle='#3d434a';c.lineWidth=.7*s;c.stroke();
  c.beginPath();c.arc(.9*s,0,1.5*s,0,TAU);c.fillStyle=o.gem||'#d14b6a';c.fill();
  const L=36*s,bw=3.1*s;c.beginPath();c.moveTo(2*s,-bw);c.lineTo(5*s,-bw*1.15);c.lineTo(L-7*s,-bw);c.lineTo(L,0);c.lineTo(L-7*s,bw);c.lineTo(5*s,bw*1.15);c.lineTo(2*s,bw);c.closePath();c.fillStyle=steel(c,-bw,bw);c.fill();c.strokeStyle='#4d5862';c.lineWidth=.8*s;c.stroke();
  c.beginPath();c.moveTo(3*s,0);c.lineTo(L-10*s,0);c.strokeStyle='#8e9aa6';c.lineWidth=1.2*s;c.stroke();
  c.beginPath();c.moveTo(6*s,-bw*.6);c.lineTo(L-9*s,-bw*.55);c.strokeStyle='#ffffff99';c.lineWidth=.6*s;c.stroke();c.restore()};
W.dagger=(c,s,o={})=>{c.fillStyle='#3b2a1e';c.fillRect(-4.5*s,-1.1*s,4.5*s,2.2*s);c.beginPath();c.arc(-5*s,0,1.4*s,0,TAU);c.fillStyle='#8a8f96';c.fill();
  c.beginPath();c.moveTo(0,-3.4*s);c.lineTo(1.2*s,-3.4*s);c.lineTo(1.2*s,3.4*s);c.lineTo(0,3.4*s);c.closePath();c.fillStyle='#6b6f76';c.fill();
  c.beginPath();c.moveTo(1.2*s,-1.6*s);c.quadraticCurveTo(8*s,-2.2*s,13*s,-.4*s);c.lineTo(13.4*s,.3*s);c.quadraticCurveTo(8*s,1.2*s,1.2*s,1.5*s);c.closePath();c.fillStyle=steel(c,-2*s,2*s);c.fill();c.strokeStyle='#4d5862';c.lineWidth=.6*s;c.stroke();
  if(o.poison){c.beginPath();c.moveTo(6*s,.6*s);c.lineTo(12*s,0);c.strokeStyle='#7bd66b';c.lineWidth=.9*s;c.stroke()}};
W.spear=(c,s,o={})=>{c.beginPath();c.moveTo(-16*s,0);c.lineTo(26*s,0);c.strokeStyle='#5a3d22';c.lineWidth=2.4*s;c.lineCap='round';c.stroke();c.strokeStyle='#8a6236';c.lineWidth=1*s;c.beginPath();c.moveTo(-15*s,-.4*s);c.lineTo(25*s,-.4*s);c.stroke();
  c.fillStyle='#3a3f45';c.fillRect(24*s,-1.6*s,3*s,3.2*s);
  c.beginPath();c.moveTo(27*s,0);c.quadraticCurveTo(30*s,-3.6*s,38*s,0);c.quadraticCurveTo(30*s,3.6*s,27*s,0);c.fillStyle=steel(c,-3*s,3*s);c.fill();c.strokeStyle='#4d5862';c.lineWidth=.6*s;c.stroke();
  c.beginPath();c.moveTo(28*s,0);c.lineTo(36*s,0);c.strokeStyle='#8e9aa6';c.lineWidth=.6*s;c.stroke();
  c.fillStyle=o.tassel||'#b8333a';for(let i=0;i<3;i++){c.beginPath();c.moveTo(24*s,0);c.lineTo(20*s,(i-1)*2.2*s+Math.sin((ART.t||0)*9+i)*.6*s);c.lineTo(21*s,(i-1)*2.2*s+1*s);c.closePath();c.fill()}};
W.mace=(c,s)=>{c.beginPath();c.moveTo(-7*s,0);c.lineTo(12*s,0);c.strokeStyle='#4e3520';c.lineWidth=2.4*s;c.stroke();c.fillStyle='#2a1c12';c.fillRect(-7*s,-1.5*s,5*s,3*s);
  for(let i=0;i<7;i++){const a=i/7*TAU;c.beginPath();c.moveTo(15*s+Math.cos(a)*3*s,Math.sin(a)*3*s);c.lineTo(15*s+Math.cos(a+.25)*6.4*s,Math.sin(a+.25)*6.4*s);c.lineTo(15*s+Math.cos(a+.6)*3*s,Math.sin(a+.6)*3*s);c.closePath();c.fillStyle='#6b737c';c.fill()}
  c.beginPath();c.arc(15*s,0,4*s,0,TAU);c.fillStyle=steel(c,-4*s,4*s);c.fill();c.strokeStyle='#3d434a';c.lineWidth=.7*s;c.stroke();c.beginPath();c.arc(14*s,-1.2*s,1.2*s,0,TAU);c.fillStyle='#ffffff88';c.fill()};
W.club=(c,s)=>{c.beginPath();c.moveTo(-6*s,-1.4*s);c.quadraticCurveTo(10*s,-2*s,22*s,-5.5*s);c.quadraticCurveTo(27*s,0,22*s,5.5*s);c.quadraticCurveTo(10*s,2*s,-6*s,1.4*s);c.closePath();c.fillStyle=wood(c,-5*s,5*s,'#8a6a44','#4a3420');c.fill();c.strokeStyle='#2e2014';c.lineWidth=.8*s;c.stroke();
  for(const [x,y] of[[14,-2.5],[19,2.4],[22,-1],[9,1]]){c.beginPath();c.arc(x*s,y*s,1.1*s,0,TAU);c.fillStyle='#3a2818';c.fill()}
  for(const [x,y,a] of[[17,-4,-.9],[21,4,.9],[24,0,0]]){c.beginPath();c.moveTo(x*s,y*s);c.lineTo((x+Math.cos(a)*3.4)*s,(y+Math.sin(a)*3.4)*s);c.strokeStyle='#cfd6dc';c.lineWidth=1*s;c.stroke()}};
W.axe=(c,s)=>{
  c.save();c.scale(s,s);
  c.lineCap='round';c.strokeStyle='#674529';c.lineWidth=3;
  c.beginPath();c.moveTo(-9,0);c.lineTo(20,0);c.stroke();
  c.fillStyle=steel(c,-3,10);c.strokeStyle='#485360';c.lineWidth=.8;
  c.beginPath();c.moveTo(16,-3);c.lineTo(21,-3);c.lineTo(21,2);
  c.quadraticCurveTo(22,6,25,8);c.quadraticCurveTo(19,13,12,9);
  c.quadraticCurveTo(17,6,16,1);c.closePath();c.fill();c.stroke();c.restore();
};
W.hammer=(c,s)=>{c.beginPath();c.moveTo(-12*s,0);c.lineTo(26*s,0);c.strokeStyle='#4e3520';c.lineWidth=2.8*s;c.stroke();for(let i=0;i<4;i++){c.fillStyle='#c9a24a';c.fillRect((-6+i*7)*s,-1.7*s,1.4*s,3.4*s)}
  c.save();c.translate(28*s,0);c.fillStyle=steel(c,-10*s,10*s);c.beginPath();c.roundRect(-5*s,-11*s,10*s,22*s,2*s);c.fill();c.strokeStyle='#3d434a';c.lineWidth=.8*s;c.stroke();
  c.fillStyle='#c9a24a';c.fillRect(-5*s,-7.5*s,10*s,2*s);c.fillRect(-5*s,5.5*s,10*s,2*s);c.beginPath();c.arc(0,0,2.4*s,0,TAU);c.fill();
  c.beginPath();c.moveTo(5*s,-2.5*s);c.lineTo(10*s,0);c.lineTo(5*s,2.5*s);c.closePath();c.fillStyle='#9aa6b2';c.fill();c.restore()};
W.shield=(c,s,o={})=>{const col=o.col||'#7a2e2e';c.save();c.translate(2*s,0);
  c.beginPath();c.moveTo(0,-9*s);c.quadraticCurveTo(4.5*s,-8*s,4.8*s,0);c.quadraticCurveTo(4.5*s,8*s,0,9*s);c.quadraticCurveTo(-2*s,0,0,-9*s);c.fillStyle=col;c.fill();c.lineWidth=1.4*s;c.strokeStyle='#c9a24a';c.stroke();
  c.beginPath();c.moveTo(2.4*s,-6*s);c.lineTo(2.4*s,6*s);c.moveTo(.6*s,-1*s);c.lineTo(4.2*s,-1*s);c.strokeStyle='#e8d48a';c.lineWidth=1*s;c.stroke();
  c.beginPath();c.arc(2.6*s,0,1.6*s,0,TAU);c.fillStyle=steel(c,-1.6*s,1.6*s);c.fill();c.restore()};
W.staff=(c,s,o={})=>{const cry=o.cry||'#9db8ff',gl=o.glow==null?.6:o.glow;
  c.beginPath();c.moveTo(-12*s,0);c.lineTo(25*s,0);c.strokeStyle=wood(c,-1.5*s,1.5*s,'#7a5532','#3e2a18');c.lineWidth=2.3*s;c.lineCap='round';c.stroke();
  c.strokeStyle='#2a1c10';c.lineWidth=.4*s;for(let i=0;i<5;i++){c.beginPath();c.moveTo((-9+i*7)*s,-.6*s);c.lineTo((-6+i*7)*s,-.5*s);c.stroke()}
  c.fillStyle='#c9a24a';c.fillRect(22*s,-1.6*s,2.4*s,3.2*s);
  c.strokeStyle='#c9a24a';c.lineWidth=1*s;for(const sg of[-1,1]){c.beginPath();c.moveTo(24*s,sg*1.2*s);c.quadraticCurveTo(27*s,sg*4.5*s,30.5*s,sg*2.2*s);c.stroke()}
  glowDot(c,29*s,0,(9+gl*5)*s,cry,.35+gl*.5);
  c.beginPath();c.moveTo(25.5*s,0);c.lineTo(29*s,-3.2*s);c.lineTo(32.5*s,0);c.lineTo(29*s,3.2*s);c.closePath();c.fillStyle=cry;c.fill();c.strokeStyle='#ffffffaa';c.lineWidth=.6*s;c.stroke();
  c.beginPath();c.moveTo(27.5*s,-1.2*s);c.lineTo(29*s,-2.4*s);c.lineTo(29.6*s,-.6*s);c.closePath();c.fillStyle='#ffffffcc';c.fill()};
W.druid=(c,s,o={})=>{c.beginPath();c.moveTo(-12*s,.5*s);c.bezierCurveTo(-4*s,-1.8*s,2*s,2*s,8*s,-.6*s);c.bezierCurveTo(14*s,-2.6*s,18*s,1.8*s,24*s,0);
  c.strokeStyle='#4e3520';c.lineWidth=2.8*s;c.lineCap='round';c.stroke();c.strokeStyle='#7a5a36';c.lineWidth=1*s;c.stroke();
  for(const x of[-3,11]){c.beginPath();c.ellipse(x*s,0,1.6*s,1.9*s,0,0,TAU);c.fillStyle='#3e2a18';c.fill()}
  c.beginPath();c.moveTo(24*s,0);c.bezierCurveTo(29*s,-4*s,32*s,1*s,28.5*s,2.4*s);c.bezierCurveTo(26.5*s,3*s,26*s,.5*s,28*s,.2*s);c.strokeStyle='#4e3520';c.lineWidth=2*s;c.stroke();
  glowDot(c,28.5*s,.4*s,7*s,'#9fe3a6',.6);c.beginPath();c.arc(28.4*s,.6*s,1.7*s,0,TAU);c.fillStyle='#d8ffd0';c.fill();
  const lf=(x,y,a,l)=>{c.save();c.translate(x*s,y*s);c.rotate(a);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(l*.5*s,-l*.35*s,l*s,0);c.quadraticCurveTo(l*.5*s,l*.35*s,0,0);c.fillStyle='#4f9a4c';c.fill();c.beginPath();c.moveTo(0,0);c.lineTo(l*.85*s,0);c.strokeStyle='#2e6a32';c.lineWidth=.4*s;c.stroke();c.restore()};
  lf(23,-.5,-1.9,6);lf(22,.5,1.7,5.5);lf(17,-.6,-2.3,4.5);lf(8,-.4,1.9,4)};
W.bow=(c,s,o={})=>{const p=o.pull||0;c.save();c.translate(4*s,0);
  c.beginPath();c.moveTo(-1.5*s,-14*s);c.quadraticCurveTo(1*s,-14*s,3*s,-10*s);c.quadraticCurveTo(6*s,-4*s,4.6*s,0);c.quadraticCurveTo(6*s,4*s,3*s,10*s);c.quadraticCurveTo(1*s,14*s,-1.5*s,14*s);
  c.strokeStyle='#4e3520';c.lineWidth=2.8*s;c.lineCap='round';c.stroke();c.strokeStyle='#9a7246';c.lineWidth=1.2*s;c.stroke();
  c.fillStyle='#2a1c10';c.fillRect(3.4*s,-2.2*s,2.6*s,4.4*s);
  const sx=-1.2*s-p*10*s;c.beginPath();c.moveTo(-1.5*s,-14*s);c.lineTo(sx,0);c.lineTo(-1.5*s,14*s);c.strokeStyle='#efe7d8';c.lineWidth=.6*s;c.stroke();
  if(p>.08){c.beginPath();c.moveTo(sx,0);c.lineTo(15*s,0);c.strokeStyle='#c9a26a';c.lineWidth=1*s;c.stroke();c.beginPath();c.moveTo(15*s,-1.6*s);c.lineTo(19*s,0);c.lineTo(15*s,1.6*s);c.closePath();c.fillStyle='#cfd6dc';c.fill();
    c.fillStyle='#e5534b';c.beginPath();c.moveTo(sx,0);c.lineTo(sx+3.4*s,-1.8*s);c.lineTo(sx+4*s,0);c.lineTo(sx+3.4*s,1.8*s);c.closePath();c.fill()}
  c.restore()};
W.whip=(c,s,o={})=>{c.fillStyle='#3b2416';c.fillRect(-5*s,-1.3*s,7*s,2.6*s);c.beginPath();c.arc(-5.5*s,0,1.5*s,0,TAU);c.fillStyle='#c9a24a';c.fill();
  const t=(ART.t||0),ph=o.crack||0;c.beginPath();c.moveTo(2*s,0);for(let i=1;i<=12;i++){const x=2*s+i*2.6*s*(1+ph*.5),y=Math.sin(i*.7+t*6)*(1.5+i*.35)*s*(1-ph*.6);c.lineTo(x,y)}
  c.strokeStyle='#5a3a22';c.lineWidth=1.1*s;c.lineCap='round';c.stroke();if(ph>.5){glowDot(c,34*s,0,4*s,'#ffe9b0',.8)}};
W.flask=(c,s)=>{c.beginPath();c.arc(0,0,3.4*s,0,TAU);c.fillStyle='#7bd66bcc';c.fill();c.strokeStyle='#e8f4f0';c.lineWidth=.7*s;c.stroke();c.fillStyle='#c9e6ea';c.fillRect(-1*s,-5.8*s,2*s,2.8*s);c.fillStyle='#8a6236';c.fillRect(-1.2*s,-7*s,2.4*s,1.4*s);c.beginPath();c.arc(-1*s,-1*s,.9*s,0,TAU);c.fillStyle='#ffffffaa';c.fill()};
W.book=(c,s)=>{c.fillStyle='#6b2a2a';c.fillRect(-3*s,-4*s,6*s,8*s);c.fillStyle='#f3ead9';c.fillRect(-2.4*s,-3.6*s,4.8*s,7.2*s);c.strokeStyle='#c9a24a';c.lineWidth=.6*s;c.beginPath();c.moveTo(0,-3.6*s);c.lineTo(0,3.6*s);c.stroke()};
ART.W=W;

/* ---------- corps humanoïde : un rond détaillé ---------- */
function shade(col,k){const n=parseInt(col.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return'#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}
ART.shade=shade;
function body(c,r,col,head,o={}){
  // pieds qui alternent quand il marche
  const st=Math.sin(o.walk||0)*r*.28;c.fillStyle='#1d1814';for(const sg of[-1,1]){c.beginPath();c.ellipse(st*sg,sg*r*.42,r*.3,r*.2,0,0,TAU);c.fill()}
  if(head==='cape'||head==='hood'||head==='robe'){c.beginPath();c.moveTo(r*.2,-r*.92);c.quadraticCurveTo(-r*1.9,-r*.6+(o.flut||0),-r*1.55,0);c.quadraticCurveTo(-r*1.9,r*.6-(o.flut||0),r*.2,r*.92);c.closePath();c.fillStyle=o.cape||shade(col,-.35);c.fill()}
  const g=c.createRadialGradient(-r*.25,-r*.3,r*.1,0,0,r*1.05);g.addColorStop(0,shade(col,.28));g.addColorStop(.75,col);g.addColorStop(1,shade(col,-.3));
  c.beginPath();c.arc(0,0,r,0,TAU);c.fillStyle=g;c.fill();c.lineWidth=o.lw||1.6;c.strokeStyle=o.edge||'#0b0a0dcc';c.stroke();
  // épaulières / ceinture
  if(o.armor){for(const sg of[-1,1]){c.beginPath();c.ellipse(r*.05,sg*r*.72,r*.38,r*.26,0,0,TAU);c.fillStyle=steel(c,sg*r*.5,sg*r*.95);c.fill();c.strokeStyle='#3d434a';c.lineWidth=.8;c.stroke()}}
  // tête vue du dessus
  const hr=r*.52;
  if(head==='helm'){c.beginPath();c.arc(r*.08,0,hr,0,TAU);c.fillStyle=steel(c,-hr,hr);c.fill();c.strokeStyle='#3d434a';c.lineWidth=1;c.stroke();c.beginPath();c.moveTo(-hr*.8,0);c.lineTo(r*.08+hr,0);c.strokeStyle='#5d6773';c.lineWidth=1.6;c.stroke();if(o.plume){c.beginPath();c.moveTo(-hr*.6,0);c.quadraticCurveTo(-r*1.2,-r*.2,-r*1.4,r*.15);c.strokeStyle=o.plume;c.lineWidth=2.4;c.stroke()}}
  else if(head==='hood'){c.beginPath();c.arc(r*.05,0,hr*1.12,0,TAU);c.fillStyle=shade(col,-.45);c.fill();c.beginPath();c.arc(r*.25,0,hr*.62,-1.2,1.2);c.fillStyle='#0a0810';c.fill();if(o.eyes){c.fillStyle=o.eyes;for(const sg of[-1,1]){c.beginPath();c.arc(r*.42,sg*hr*.28,r*.08,0,TAU);c.fill()}}}
  else if(head==='skull'){c.beginPath();c.arc(r*.08,0,hr*1.05,0,TAU);c.fillStyle='#ece5d2';c.fill();c.strokeStyle='#8a8170';c.lineWidth=1;c.stroke();c.fillStyle='#1a1622';for(const sg of[-1,1]){c.beginPath();c.ellipse(r*.32,sg*hr*.42,r*.13,r*.11,0,0,TAU);c.fill()}c.fillStyle='#ff4a3a';for(const sg of[-1,1]){c.beginPath();c.arc(r*.34,sg*hr*.42,r*.04,0,TAU);c.fill()}c.strokeStyle='#8a8170';c.lineWidth=.8;c.beginPath();c.moveTo(r*.5,-hr*.25);c.lineTo(r*.5,hr*.25);c.stroke()}
  else if(head==='zombie'){c.beginPath();c.arc(r*.1,r*.05,hr,0,TAU);c.fillStyle='#8aa070';c.fill();c.strokeStyle='#3a4a2a';c.lineWidth=1;c.stroke();c.fillStyle='#4a5a3a';c.beginPath();c.arc(-r*.05,-r*.15,hr*.35,0,TAU);c.fill();c.fillStyle='#e8e070';for(const sg of[-1,1]){c.beginPath();c.arc(r*.42,sg*hr*.38+r*.05,r*.08,0,TAU);c.fill()}}
  else if(head==='hair'){c.beginPath();c.arc(r*.05,0,hr,0,TAU);c.fillStyle='#e8c4a0';c.fill();c.beginPath();c.arc(-r*.05,0,hr*1.05,Math.PI*.45,Math.PI*1.55);c.fillStyle=o.hair||'#3a2418';c.fill();c.beginPath();c.moveTo(-r*.3,-hr*.4);c.quadraticCurveTo(-r*1.3,-r*.1+(o.flut||0)*.3,-r*1.2,r*.35);c.quadraticCurveTo(-r*.7,0,-r*.3,hr*.4);c.fill()}
  else if(head==='cape'){c.beginPath();c.arc(r*.05,0,hr,0,TAU);c.fillStyle='#e8c4a0';c.fill();c.strokeStyle='#7a5a40';c.lineWidth=.8;c.stroke();c.beginPath();c.arc(-r*.02,0,hr*1.02,Math.PI*.5,Math.PI*1.5);c.fillStyle=o.hair||'#4a3020';c.fill()}
  else if(head==='robe'){c.beginPath();c.arc(r*.05,0,hr,0,TAU);c.fillStyle='#e8c4a0';c.fill();c.beginPath();c.arc(-r*.08,0,hr*.95,Math.PI*.5,Math.PI*1.5);c.fillStyle='#e8e2d2';c.fill()}
  if(o.crown){const cr=hr*.92,cc=o.crownCol||"#f2c14e";c.save();c.translate(r*.06,0);for(let k=0;k<8;k++){const a=k/8*TAU;c.beginPath();c.moveTo(Math.cos(a-.22)*cr,Math.sin(a-.22)*cr);c.lineTo(Math.cos(a)*(cr+r*.2),Math.sin(a)*(cr+r*.2));c.lineTo(Math.cos(a+.22)*cr,Math.sin(a+.22)*cr);c.closePath();c.fillStyle=cc;c.fill();c.strokeStyle='#0008';c.lineWidth=.6;c.stroke()}
    c.beginPath();c.arc(0,0,cr,0,TAU);c.strokeStyle=cc;c.lineWidth=r*.14;c.stroke();c.beginPath();c.arc(0,0,cr+r*.07,0,TAU);c.strokeStyle='#0006';c.lineWidth=.6;c.stroke();
    for(const a of[0,Math.PI*.5,Math.PI,Math.PI*1.5]){c.beginPath();c.arc(Math.cos(a)*cr,Math.sin(a)*cr,r*.06,0,TAU);c.fillStyle=a===0?'#d14b6a':'#4f8ff7';c.fill()}c.restore()}
}
function hand(c,x,y,r,skin,angle=0){
  c.save();c.translate(x,y);c.rotate(angle);c.scale(r/13,r/13);
  c.lineJoin='round';c.lineWidth=.65;c.strokeStyle='#44352b';
  c.beginPath();c.moveTo(-3,-1.4);c.lineTo(-.6,-1.9);c.lineTo(.3,1.5);c.lineTo(-2.5,1.6);c.closePath();
  c.fillStyle='#67503a';c.fill();c.stroke();
  c.beginPath();c.moveTo(-1.2,-1.7);c.quadraticCurveTo(.1,-2.35,1.5,-1.15);
  c.lineTo(1.85,.55);c.quadraticCurveTo(1.2,1.75,-.4,1.45);c.lineTo(-1.35,.6);c.closePath();
  c.fillStyle=skin||'#b49072';c.fill();c.stroke();
  c.beginPath();c.moveTo(-.35,-.95);c.lineTo(.65,-.4);c.strokeStyle='#f0ddbe80';c.stroke();c.restore();
}

/* Dessine un humanoïde complet. g = {col, head, main, off, back, cry, swing, pull, glow, ...} */
ART.humanoid=(c,x,y,r,f,g)=>{
  const s=r/13;c.save();c.translate(x,y);c.rotate(f);
  // arme dans le dos (classe secondaire rangée)
  if(g.back){c.save();c.translate(-r*.6,0);c.rotate(Math.PI*.78);c.globalAlpha*=.9;W[g.back](c,s*.75,{cry:g.cry});c.restore()}
  if(g.paintBody)g.paintBody(c,r);
  else body(c,r,g.col,g.head,{crown:g.crown,crownCol:g.crownCol,cape:g.cape,armor:g.armor,plume:g.plume,eyes:g.eyes,hair:g.hair,walk:g.walk,flut:g.flut,lw:g.lw,edge:g.edge});
  const skin=g.skin||(g.head==='helm'||g.armor?'#796e5e':g.main==='bow'?'#927650':'#b39073'),sw=g.swing||0;
  const put=(wk,hx,hy,a,opt)=>{if(!wk)return;c.save();c.translate(hx,hy);c.rotate(a);
    if(wk==='claws'){for(const d of[-1,0,1]){c.beginPath();c.moveTo(0,d*r*.12);c.lineTo(r*.45,d*r*.2);c.strokeStyle='#c8d0a8';c.lineWidth=1.2*s;c.stroke()}}
    else W[wk](c,s*(opt.sc||1),opt);c.restore();hand(c,hx,hy,r,skin,a)};
  const two=g.main==='greatsword'||g.main==='spear'||g.main==='hammer'||g.main==='bow'||g.main==='club';
  if(g.main==='bow'){put('bow',r*.62,0,0,{pull:g.pull||0});hand(c,r*.62+4*s-(g.pull||0)*10*s-1*s,0,r,skin)}
  else if(two){const a=g.main==='spear'?(-.05+sw*-.15):(.55-sw*1.9);const thr=g.main==='spear'?sw*r*.55:0;put(g.main,r*.55+thr,r*.45,a,{});hand(c,r*.55+thr-Math.cos(a)*5*s,r*.45-Math.sin(a)*5*s,r,skin,a)}
  else{
    const ma=g.main==='staff'||g.main==='druid'?(-.08):g.main==='whip'?(.3-sw*.9):(.5-sw*2.1);
    put(g.main,r*.48,r*.72,ma,{cry:g.cry,glow:g.glow,rust:g.rust,crack:sw,poison:g.poison,glint:1});
    if(g.off==='shield')put('shield',r*.55,-r*.62,-.25,{col:g.shieldCol});
    else if(g.off==='dagger')put('dagger',r*.48,-r*.72,-.5+sw*.6*(g.main==='dagger'?-1:0)+(g.main==='dagger'?-sw*1.2:0),{poison:g.poison});
    else if(g.off==='flask')put('flask',r*.5,-r*.78,0,{});
    else if(g.off==='book')put('book',r*.55,-r*.68,0,{});
    else if(g.off)put(g.off,r*.48,-r*.72,g.off==='staff'||g.off==='druid'?.08:-.5,{cry:g.cry2||g.cry,glow:g.glow});
    else if(g.main!=='claws')hand(c,r*.5,-r*.72,r,skin);
  }
  if(g.main==='claws')put('claws',r*.75,-r*.5,-.25,{});
  c.restore()};

/* ---------- créatures ---------- */
const legs=(c,r,ph,pts,col,len)=>{for(let i=0;i<pts.length;i++){const [lx,ly]=pts[i],o=Math.sin(ph+(i%2?Math.PI:0))*r*.22;c.beginPath();c.ellipse(lx*r+o,ly*r,r*len,r*.14,0,0,TAU);c.fillStyle=col;c.fill()}};
ART.beast=(c,kind,x,y,r,f,o={})=>{
  const ph=o.walk||0;c.save();c.translate(x,y);c.rotate(f);
  if(kind==='wolf'||kind==='dog'){const col=o.col||(kind==='dog'?'#8a5a36':'#7d7f88'),dk=shade(col,-.35),lt=shade(col,.35);
    c.beginPath();c.moveTo(-r*1.1,0);c.quadraticCurveTo(-r*1.9,Math.sin(ph*.5)*r*.5,-r*2.1,Math.sin(ph*.5+1)*r*.3);c.lineWidth=r*.32;c.strokeStyle=dk;c.lineCap='round';c.stroke();
    legs(c,r,ph,[[.7,-.5],[.7,.5],[-.7,-.5],[-.7,.5]],dk,.26);
    const g=c.createLinearGradient(0,-r*.6,0,r*.6);g.addColorStop(0,col);g.addColorStop(.5,lt);g.addColorStop(1,col);c.beginPath();c.ellipse(0,0,r*1.25,r*.58,0,0,TAU);c.fillStyle=g;c.fill();c.strokeStyle='#0008';c.lineWidth=1.2;c.stroke();
    c.beginPath();c.ellipse(-r*.1,0,r*.9,r*.16,0,0,TAU);c.fillStyle=dk;c.fill();
    if(kind==='wolf'){c.beginPath();c.ellipse(r*.75,0,r*.42,r*.52,0,0,TAU);c.fillStyle=lt;c.fill()}
    c.beginPath();c.arc(r*1.2,0,r*.46,0,TAU);c.fillStyle=col;c.fill();c.strokeStyle='#0008';c.stroke();
    c.beginPath();c.ellipse(r*1.65,0,r*.32,r*.2,0,0,TAU);c.fillStyle=lt;c.fill();c.beginPath();c.arc(r*1.95,0,r*.09,0,TAU);c.fillStyle='#111';c.fill();
    if(kind==='wolf'){for(const sg of[-1,1]){c.beginPath();c.moveTo(r*1.05,sg*r*.18);c.lineTo(r*.95,sg*r*.62);c.lineTo(r*1.32,sg*r*.32);c.closePath();c.fillStyle=dk;c.fill()}}
    else{for(const sg of[-1,1]){c.beginPath();c.ellipse(r*1.05,sg*r*.46,r*.2,r*.12,sg*.6,0,TAU);c.fillStyle=dk;c.fill()}}
    c.fillStyle=o.eyes||'#ffd84a';for(const sg of[-1,1]){c.beginPath();c.arc(r*1.42,sg*r*.2,r*.07,0,TAU);c.fill()}
    if(o.open){c.beginPath();c.moveTo(r*1.75,-r*.12);c.lineTo(r*2.05,0);c.lineTo(r*1.75,r*.12);c.fillStyle='#fff';c.fill()}}
  else if(kind==='bear'||kind==='boar'){const col=o.col||(kind==='bear'?'#6b4a30':'#5a4030'),dk=shade(col,-.35),lt=shade(col,.3);
    legs(c,r,ph,[[.55,-.62],[.55,.62],[-.55,-.62],[-.55,.62]],dk,.3);
    const g=c.createRadialGradient(-r*.2,-r*.2,r*.1,0,0,r*1.2);g.addColorStop(0,lt);g.addColorStop(1,col);c.beginPath();c.ellipse(0,0,r*1.15,r*.88,0,0,TAU);c.fillStyle=g;c.fill();c.strokeStyle='#0009';c.lineWidth=1.4;c.stroke();
    if(kind==='boar'){c.strokeStyle=dk;c.lineWidth=1.2;for(let i=0;i<7;i++){c.beginPath();c.moveTo(-r*.8+i*r*.26,-r*.1);c.lineTo(-r*.9+i*r*.26,r*.1);c.stroke()}}
    c.beginPath();c.arc(r*1.0,0,r*.52,0,TAU);c.fillStyle=col;c.fill();c.strokeStyle='#0009';c.stroke();
    c.beginPath();c.ellipse(r*1.42,0,r*.26,r*.24,0,0,TAU);c.fillStyle=kind==='bear'?'#c9a880':'#c89a8a';c.fill();c.beginPath();c.arc(r*1.6,0,r*.08,0,TAU);c.fillStyle='#111';c.fill();
    if(kind==='bear'){for(const sg of[-1,1]){c.beginPath();c.arc(r*.8,sg*r*.45,r*.17,0,TAU);c.fillStyle=dk;c.fill()}}
    else{for(const sg of[-1,1]){c.beginPath();c.moveTo(r*1.4,sg*r*.2);c.quadraticCurveTo(r*1.75,sg*r*.45,r*1.6,sg*r*.55);c.strokeStyle='#f3ead9';c.lineWidth=r*.1;c.stroke()}}
    c.fillStyle='#1a1410';for(const sg of[-1,1]){c.beginPath();c.arc(r*1.18,sg*r*.2,r*.07,0,TAU);c.fill()}}
  else if(kind==='bird'||kind==='eagle'||kind==='griffon'){const col=o.col||(kind==='bird'?'#ffd84a':kind==='eagle'?'#e8f2ff':'#d8b26a'),dk=shade(col,-.3),fl=Math.sin(ph*1.6)*.35;
    for(const sg of[-1,1]){c.save();c.scale(1,sg);c.beginPath();c.moveTo(r*.3,r*.2);c.bezierCurveTo(r*.4,r*(1.2+fl),r*.2,r*(2.1+fl),-r*.2,r*(2.5+fl));
      for(let i=0;i<5;i++){const t=i/4;c.lineTo(-r*(.3+t*.5),r*(2.4-t*1.9+fl*(1-t))+r*.15);c.lineTo(-r*(.42+t*.5),r*(2.2-t*1.9+fl*(1-t)))}
      c.lineTo(-r*.5,r*.25);c.closePath();const g=c.createLinearGradient(0,0,0,r*2.4);g.addColorStop(0,col);g.addColorStop(1,dk);c.fillStyle=g;c.fill();c.strokeStyle='#0007';c.lineWidth=1;c.stroke();c.restore()}
    c.beginPath();c.moveTo(-r*.7,0);c.lineTo(-r*1.5,-r*.45);c.lineTo(-r*1.65,0);c.lineTo(-r*1.5,r*.45);c.closePath();c.fillStyle=dk;c.fill();
    c.beginPath();c.ellipse(0,0,r*.85,r*.42,0,0,TAU);c.fillStyle=col;c.fill();c.strokeStyle='#0008';c.stroke();
    c.beginPath();c.arc(r*.8,0,r*.32,0,TAU);c.fillStyle=kind==='griffon'?'#f3ead9':col;c.fill();c.stroke();
    c.beginPath();c.moveTo(r*1.05,-r*.12);c.lineTo(r*1.45,0);c.lineTo(r*1.05,r*.12);c.closePath();c.fillStyle='#e0a030';c.fill();
    c.fillStyle='#111';for(const sg of[-1,1]){c.beginPath();c.arc(r*.9,sg*r*.15,r*.06,0,TAU);c.fill()}
    if(o.spark&&Math.random()<.5){c.beginPath();let px=(Math.random()-.5)*r*2,py=(Math.random()-.5)*r*3;c.moveTo(px,py);for(let i=0;i<3;i++){px+=(Math.random()-.5)*r*.8;py+=(Math.random()-.5)*r*.8;c.lineTo(px,py)}c.strokeStyle='#fff6a0';c.lineWidth=1.5;c.stroke()}}
  else if(kind==='wyvern'||kind==='dragon'){const col=o.col||(kind==='wyvern'?'#5fae58':'#c8443c'),dk=shade(col,-.4),lt=shade(col,.3),fl=Math.sin(ph*1.2)*.3;
    c.beginPath();c.moveTo(-r*.6,0);c.bezierCurveTo(-r*1.4,Math.sin(ph*.4)*r*.5,-r*2,-Math.sin(ph*.4)*r*.6,-r*2.6,0);c.strokeStyle=col;c.lineWidth=r*.3;c.lineCap='round';c.stroke();
    c.beginPath();c.moveTo(-r*2.5,0);c.lineTo(-r*2.95,-r*.28);c.lineTo(-r*3.05,0);c.lineTo(-r*2.95,r*.28);c.closePath();c.fillStyle=dk;c.fill();
    for(const sg of[-1,1]){c.save();c.scale(1,sg);const tip=[[r*.1,r*(2.6+fl)],[-r*.6,r*(2.3+fl)],[-r*1.05,r*(1.6+fl*.6)],[-r*1.2,r*.9]];
      c.beginPath();c.moveTo(r*.35,r*.3);c.lineTo(r*.45,r*(1.4+fl*.5));c.lineTo(tip[0][0],tip[0][1]);c.quadraticCurveTo(-r*.15,r*(2+fl),tip[1][0],tip[1][1]);c.quadraticCurveTo(-r*.7,r*(1.7+fl),tip[2][0],tip[2][1]);c.quadraticCurveTo(-r*.95,r*1.15,tip[3][0],tip[3][1]);c.lineTo(-r*.4,r*.3);c.closePath();
      c.fillStyle=hexA(dk,.85);c.fill();c.strokeStyle=shade(col,-.6);c.lineWidth=1.2;c.stroke();
      c.beginPath();for(const [tx,ty] of tip){c.moveTo(r*.45,r*(1.4+fl*.5));c.lineTo(tx,ty)}c.strokeStyle=shade(col,-.55);c.lineWidth=1.4;c.stroke();c.restore()}
    if(kind==='dragon')legs(c,r,ph,[[.4,-.55],[.4,.55],[-.45,-.55],[-.45,.55]],dk,.22);
    const g=c.createLinearGradient(0,-r*.5,0,r*.5);g.addColorStop(0,col);g.addColorStop(.5,lt);g.addColorStop(1,col);c.beginPath();c.ellipse(0,0,r*.9,r*.5,0,0,TAU);c.fillStyle=g;c.fill();c.strokeStyle='#0009';c.lineWidth=1.2;c.stroke();
    for(let i=0;i<5;i++){c.beginPath();c.moveTo(-r*.7+i*r*.32,0);c.lineTo(-r*.55+i*r*.32,-r*.14);c.lineTo(-r*.4+i*r*.32,0);c.fillStyle=dk;c.fill()}
    c.beginPath();c.moveTo(r*.7,0);c.quadraticCurveTo(r*1.1,Math.sin(ph*.7)*r*.25,r*1.45,0);c.strokeStyle=col;c.lineWidth=r*.34;c.stroke();
    c.beginPath();c.ellipse(r*1.7,0,r*.42,r*.3,0,0,TAU);c.fillStyle=col;c.fill();c.strokeStyle='#0009';c.stroke();
    for(const sg of[-1,1]){c.beginPath();c.moveTo(r*1.55,sg*r*.2);c.lineTo(r*1.2,sg*r*.55);c.lineTo(r*1.45,sg*r*.18);c.fillStyle=kind==='dragon'?'#e8d8b0':dk;c.fill()}
    c.fillStyle=kind==='dragon'?'#ffd84a':'#e8ff70';for(const sg of[-1,1]){c.beginPath();c.ellipse(r*1.82,sg*r*.15,r*.08,r*.05,0,0,TAU);c.fill()}
    if(o.breath){for(let i=0;i<4;i++){c.beginPath();c.arc(r*(2.2+i*.35),(Math.random()-.5)*r*.4,r*(.12+i*.05),0,TAU);c.fillStyle=kind==='dragon'?'#ffb347':'#9fe06b';c.fill()}}}
  else if(kind==='goblin'){const col=o.col||'#6fa04a';legs(c,r,ph,[[0,-.38],[0,.38]],'#2a2418',.28);
    for(const sg of[-1,1]){c.beginPath();c.moveTo(r*.05,sg*r*.35);c.lineTo(-r*.25,sg*r*1.35);c.lineTo(r*.3,sg*r*.55);c.closePath();c.fillStyle=shade(col,-.15);c.fill();c.strokeStyle='#0008';c.lineWidth=1;c.stroke()}
    c.restore();ART.humanoid(c,x,y,r,f,{col:'#6b4a2a',head:'gob',skin:col,main:o.main||'dagger',off:o.off,rust:1,swing:o.swing,walk:ph,gob:col});c.save();c.translate(x,y);c.rotate(f);
    c.beginPath();c.arc(r*.1,0,r*.55,0,TAU);c.fillStyle=col;c.fill();c.strokeStyle='#0009';c.lineWidth=1;c.stroke();
    c.fillStyle='#ffe04a';for(const sg of[-1,1]){c.beginPath();c.arc(r*.42,sg*r*.2,r*.1,0,TAU);c.fill()}c.fillStyle='#111';for(const sg of[-1,1]){c.beginPath();c.arc(r*.46,sg*r*.2,r*.04,0,TAU);c.fill()}
    c.beginPath();c.moveTo(r*.55,0);c.lineTo(r*.8,0);c.strokeStyle=shade(col,-.3);c.lineWidth=r*.16;c.stroke()}
  else if(kind==='troll'){const col=o.col||'#6f8a6a';c.restore();
    ART.humanoid(c,x,y,r,f,{col,head:'troll',skin:shade(col,-.1),main:'club',swing:o.swing,walk:ph,lw:2});c.save();c.translate(x,y);c.rotate(f);
    c.fillStyle=shade(col,-.25);for(const [a,b,rr] of[[-.4,-.3,.16],[-.2,.45,.12],[-.55,.2,.1],[.1,-.6,.1]]){c.beginPath();c.arc(a*r,b*r,rr*r,0,TAU);c.fill()}
    c.beginPath();c.arc(r*.25,0,r*.42,0,TAU);c.fillStyle=shade(col,.1);c.fill();c.strokeStyle='#0009';c.lineWidth=1.2;c.stroke();
    for(const sg of[-1,1]){c.beginPath();c.moveTo(r*.15,sg*r*.32);c.lineTo(r*.05,sg*r*.7);c.lineTo(r*.35,sg*r*.38);c.fillStyle=shade(col,-.2);c.fill()}
    c.fillStyle='#ffb030';for(const sg of[-1,1]){c.beginPath();c.arc(r*.5,sg*r*.15,r*.07,0,TAU);c.fill()}
    for(const sg of[-1,1]){c.beginPath();c.moveTo(r*.62,sg*r*.1);c.lineTo(r*.82,sg*r*.2);c.lineTo(r*.62,sg*r*.2);c.fillStyle='#f3ead9';c.fill()}}
  c.restore()};
})();

