/* Refonte du bestiaire : dessins à la main (canvas), un par un. */
const TAU=Math.PI*2;
function seeded(seed){let s=seed%2147483647||1;return()=>(s=s*16807%2147483647)/2147483647}
function sh(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=k<0?0:255,t=Math.abs(k);return `rgb(${Math.round(r+(f-r)*t)},${Math.round(g+(f-g)*t)},${Math.round(b+(f-b)*t)})`}
function ell(c,x,y,rx,ry,fill,rot=0,stroke,lw=2){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
/* chemin lissé par les milieux */
function sm(c,pts,close){const n=pts.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];c.beginPath();
  if(close){let s=m(pts[n-1],pts[0]);c.moveTo(s[0],s[1]);for(let i=0;i<n;i++){const p=pts[i],q=m(p,pts[(i+1)%n]);c.quadraticCurveTo(p[0],p[1],q[0],q[1])}c.closePath()}
  else{c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<n-1;i++){const q=m(pts[i],pts[i+1]);c.quadraticCurveTo(pts[i][0],pts[i][1],q[0],q[1])}c.lineTo(pts[n-1][0],pts[n-1][1])}}
function shape(c,pts,fill,stroke,lw=2.5,hl){sm(c,pts,true);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke()}}
/* courbe de Catmull-Rom échantillonnée avec angle */
function spine(pts,steps=16){const out=[],Q=i=>pts[Math.max(0,Math.min(pts.length-1,i))];
  for(let i=0;i<pts.length-1;i++){const p0=Q(i-1),p1=Q(i),p2=Q(i+1),p3=Q(i+2);for(let j=0;j<steps;j++){const t=j/steps,t2=t*t,t3=t2*t;
    out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}
  out.push(pts[pts.length-1].slice());for(let i=0;i<out.length;i++){const a=out[Math.max(0,i-1)],b=out[Math.min(out.length-1,i+1)];out[i][2]=Math.atan2(b[1]-a[1],b[0]-a[0])}return out}
/* membre / queue / corps effilé : largeur variable le long de la courbe, ombré dessus clair / dessous sombre */
function taper(c,pts,ws,col,line,lw=2){const sp=spine(pts),n=sp.length,W=t=>{const f=t*(ws.length-1),i=Math.min(ws.length-2,Math.floor(f));return ws[i]+(ws[i+1]-ws[i])*(f-i)};
  const L=[],R=[];for(let i=0;i<n;i++){const [x,y,a]=sp[i],w=W(i/(n-1))/2;L.push([x+Math.sin(a)*w,y-Math.cos(a)*w]);R.push([x-Math.sin(a)*w,y+Math.cos(a)*w])}
  const poly=pts2=>{c.beginPath();pts2.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]))};
  poly(L.concat(R.reverse()));c.fillStyle=sh(col,-.22);c.fill();
  const L2=[],R2=[];for(let i=0;i<n;i++){const [x,y,a]=sp[i],w=W(i/(n-1))/2;L2.push([x+Math.sin(a)*w*.55-Math.sin(a)*w*.1,y-Math.cos(a)*w*.55+Math.cos(a)*w*.1]);R2.push([x-Math.sin(a)*w*.45,y+Math.cos(a)*w*.45])}
  poly(L2.concat(R2.reverse()));c.fillStyle=col;c.fill();
  if(line){poly(L.concat(R.slice().reverse()));c.strokeStyle=line;c.lineWidth=lw;c.lineJoin='round';c.stroke()}return sp}
function strokes(c,sp,ws,col,n,len,rnd,lw=1.4){c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';
  for(let i=0;i<n;i++){const k=Math.floor(rnd()*(sp.length-1)),[x,y,a]=sp[k],side=rnd()<.5?-1:1,w=(Array.isArray(ws)?ws[Math.min(ws.length-1,Math.floor(k/sp.length*ws.length))]:ws)/2*rnd();
    const px=x+Math.sin(a)*w*side,py=y-Math.cos(a)*w*side,l=len*(0.5+rnd());c.beginPath();c.moveTo(px,py);c.lineTo(px-Math.cos(a)*l+Math.sin(a)*side*l*.3,py-Math.sin(a)*l-Math.cos(a)*side*l*.3);c.stroke()}}
function glow(c,x,y,r,col,a=.5){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.globalAlpha=1}
function groundShadow(c,x,y,rx,ry){ell(c,x,y,rx,ry,'#0006')}

/* ------------------------------------------------------------------ LOUP ------------------------------------------------------------------ */
function loup(c,W,H,P){
  const rnd=seeded(P.seed);c.clearRect(0,0,W,H);groundShadow(c,262,318,200,16);
  // queue
  const tail=taper(c,[[128,190],[92,208],[70,246],[74,290]],[16,30,26,6],P.fur,P.line);strokes(c,tail,[16,30,26,6],sh(P.fur,.25),30,13,rnd);
  // pattes arrière (digitigrades) et avant, côté éloigné puis côté proche
  const leg=(pts,ws,dark)=>taper(c,pts,ws,dark?sh(P.fur,-.2):P.fur,P.line,2.2);
  leg([[372,214],[368,256],[356,292],[364,314]],[20,13,9,12],true);leg([[176,220],[196,252],[170,286],[178,314]],[34,16,9,12],true);
  // torse : poitrail profond, ventre creusé, côtes
  shape(c,[[118,178],[172,156],[246,150],[316,148],[366,168],[384,206],[360,246],[316,236],[262,214],[214,218],[168,238],[126,234],[108,204]],P.fur,P.line,3);
  c.save();sm(c,[[118,178],[172,156],[246,150],[316,148],[366,168],[384,206],[360,246],[316,236],[262,214],[214,218],[168,238],[126,234],[108,204]],true);c.clip();
  const bg=c.createLinearGradient(0,150,0,250);bg.addColorStop(0,sh(P.fur,.18));bg.addColorStop(.6,P.fur);bg.addColorStop(1,sh(P.fur,-.35));c.fillStyle=bg;c.fillRect(90,140,320,120);
  // côtes visibles sous le flanc
  c.strokeStyle=sh(P.fur,-.4);c.lineWidth=2.2;for(let i=0;i<6;i++){const x=300-i*17;c.beginPath();c.moveTo(x,176+i*1.5);c.quadraticCurveTo(x-10,198,x-4,222-i*1.4);c.stroke()}
  c.strokeStyle=sh(P.fur,.25)+'99';c.lineWidth=1.4;for(let i=0;i<6;i++){const x=297-i*17;c.beginPath();c.moveTo(x,176+i*1.5);c.quadraticCurveTo(x-10,198,x-4,222-i*1.4);c.stroke()}
  for(let i=0;i<150;i++){const x=110+rnd()*270,y=148+rnd()*100,l=7+rnd()*9;c.strokeStyle=rnd()<.5?sh(P.fur,-.3)+'cc':sh(P.fur,.3)+'aa';c.lineWidth=1.2;c.beginPath();c.moveTo(x,y);c.lineTo(x-l,y+l*.35);c.stroke()}
  c.restore();
  // crinière / garrot hérissé
  const mane=[];for(let i=0;i<22;i++){const x=300+i*3.6,y=147+Math.sin(i*1.3)*3;mane.push([x,y])}
  c.fillStyle=sh(P.fur,-.25);c.beginPath();c.moveTo(290,152);for(let i=0;i<14;i++){const x=290+i*6.5;c.lineTo(x+2,138-(i%3)*5-rnd()*6);c.lineTo(x+5,150)}c.lineTo(380,170);c.closePath();c.fill();
  // cou + tête
  shape(c,[[352,158],[392,134],[428,128],[440,150],[420,176],[382,196]],P.fur,P.line,3);
  shape(c,[[418,128],[448,132],[486,162],[490,176],[470,184],[440,180],[418,170]],sh(P.fur,.06),P.line,3);   // museau
  ell(c,490,171,7,5.5,'#0b0b0e',-.2);                                                                   // truffe
  c.strokeStyle='#0b0b0e';c.lineWidth=2.6;c.beginPath();c.moveTo(488,180);c.quadraticCurveTo(462,190,438,176);c.stroke();   // gueule
  c.fillStyle='#f4efe4';c.beginPath();c.moveTo(470,181);c.lineTo(473,191);c.lineTo(477,180);c.closePath();c.fill();c.beginPath();c.moveTo(452,184);c.lineTo(455,193);c.lineTo(459,183);c.closePath();c.fill();
  // oreilles dressées
  shape(c,[[408,132],[412,100],[430,126]],sh(P.fur,-.15),P.line,2.5);shape(c,[[424,128],[438,102],[448,134]],P.fur,P.line,2.5);
  shape(c,[[413,122],[414,108],[422,124]],sh(P.fur,-.5),null);
  // œil
  glow(c,436,148,24,P.eye,.55);c.fillStyle=P.eye;c.beginPath();c.moveTo(425,150);c.quadraticCurveTo(436,140,448,148);c.quadraticCurveTo(436,156,425,150);c.fill();ell(c,437,148,3,6,'#120c06');
  c.strokeStyle=sh(P.fur,-.6);c.lineWidth=3;c.beginPath();c.moveTo(422,142);c.lineTo(450,140);c.stroke();
  // pattes proches (au-dessus du torse)
  leg([[338,212],[336,258],[322,294],[330,316]],[26,15,10,13]);leg([[150,214],[176,250],[142,288],[152,316]],[40,18,10,14]);
  // coussinets et griffes
  for(const [x,y] of [[330,316],[152,316],[364,314],[178,314]]){ell(c,x+6,y,15,6,sh(P.fur,-.3),0,P.line,2);c.strokeStyle='#e8e0d0';c.lineWidth=2;for(let k=0;k<3;k++){c.beginPath();c.moveTo(x+14+k*3,y+2);c.lineTo(x+20+k*3,y+7);c.stroke()}}
  if(P.snow){c.fillStyle='#ffffffcc';for(let i=0;i<10;i++)ell(c,150+rnd()*220,150+rnd()*20,10+rnd()*10,3,'#ffffffcc',rnd()-.5)}
  if(P.ash){c.fillStyle='#4a4650';for(let i=0;i<14;i++)ell(c,130+rnd()*240,160+rnd()*60,10+rnd()*14,3+rnd()*3,'#2a262f88',rnd()*3)}
}

/* ------------------------------------------------------------------ VER DE TERRE ------------------------------------------------------------------ */
function ver(c,W,H){
  const rnd=seeded(7);c.clearRect(0,0,W,H);
  // sol éventré
  ell(c,260,300,230,40,'#2a1f16');ell(c,260,296,200,30,'#3a2c20');
  for(let i=0;i<30;i++){const a=rnd()*TAU,d=140+rnd()*80;ell(c,260+Math.cos(a)*d,300+Math.sin(a)*d*.2,3+rnd()*7,2+rnd()*4,'#4a382a',rnd())}
  // corps segmenté, dressé en S
  const body=spine([[300,330],[330,280],[280,220],[250,160],[262,110],[300,76]],20);
  const n=body.length;
  for(let i=0;i<n;i++){const t=i/(n-1),[x,y,a]=body[i],w=84-30*t+Math.sin(i*1.1)*0;const k=1-t*.35;
    const g=c.createRadialGradient(x-w*.2,y-w*.25,4,x,y,w*.6);g.addColorStop(0,sh('#c98c88',.2*k));g.addColorStop(.6,sh('#a8625e',-.05*k));g.addColorStop(1,sh('#5a2a2c',0));
    c.save();c.translate(x,y);c.rotate(a+Math.PI/2);c.beginPath();c.ellipse(0,0,w*.5,9,0,0,TAU);c.fillStyle=sh('#8a4a4a',-.1*(1-t));c.fill();c.strokeStyle='#3a1a1c';c.lineWidth=1.6;c.stroke();c.restore();}
  // dessin des anneaux plus gros et ombrés (du bas vers le haut)
  for(let i=0;i<n;i+=2){const t=i/(n-1),[x,y,a]=body[i],w=96-34*t;c.save();c.translate(x,y);c.rotate(a+Math.PI/2);
    const g=c.createLinearGradient(-w/2,0,w/2,0);g.addColorStop(0,'#4a2224');g.addColorStop(.35,'#b86e68');g.addColorStop(.6,'#a85c58');g.addColorStop(1,'#3a181c');
    c.beginPath();c.ellipse(0,0,w/2,12,0,0,TAU);c.fillStyle=g;c.fill();c.strokeStyle='#2a1012';c.lineWidth=2;c.stroke();c.restore()}
  // clitellum plus clair (bande)
  {const [x,y,a]=body[Math.floor(n*.55)];c.save();c.translate(x,y);c.rotate(a+Math.PI/2);c.beginPath();c.ellipse(0,0,50,15,0,0,TAU);c.fillStyle='#d9a8a0';c.fill();c.strokeStyle='#5a2a2c';c.lineWidth=2;c.stroke();c.restore()}
  // gueule : anneau de dents concentriques
  const [hx,hy]=body[n-1];c.save();c.translate(hx,hy);c.rotate(-0.55);
  ell(c,0,0,52,60,'#5a2a2c',0,'#2a1012',3);ell(c,0,0,42,50,'#1a0a0c');
  for(let r=0;r<3;r++){const n2=14-r*3,R=40-r*12,S=12-r*3;for(let i=0;i<n2;i++){const a2=i/n2*TAU;c.save();c.rotate(a2);c.translate(R*.8,R*.95);c.rotate(Math.PI);c.beginPath();c.moveTo(-S/2,0);c.lineTo(0,S*1.6);c.lineTo(S/2,0);c.closePath();c.fillStyle=r===0?'#efe3c8':'#d8c8a8';c.fill();c.restore()}}
  glow(c,0,0,26,'#ff4a3a',.45);c.restore();
  // terre qui retombe
  for(let i=0;i<14;i++)ell(c,hx-60+rnd()*120,hy+rnd()*50,3+rnd()*5,2+rnd()*3,'#4a382a');
}

/* ------------------------------------------------------------------ LIBELLULE FAUCHEUSE ------------------------------------------------------------------ */
function libellule(c,W,H){
  const rnd=seeded(3);c.clearRect(0,0,W,H);
  const cx=260,cy=190;
  // ailes : 4, translucides, nervurées (vue du dessus)
  const wing=(x,y,ang,len,wid,k)=>{c.save();c.translate(x,y);c.rotate(ang);
    const g=c.createLinearGradient(0,0,len,0);g.addColorStop(0,'rgba(170,230,235,.55)');g.addColorStop(1,'rgba(120,200,220,.22)');
    c.beginPath();c.moveTo(0,0);c.bezierCurveTo(len*.2,-wid*1.1,len*.8,-wid*.9,len,-wid*.1);c.bezierCurveTo(len*.85,wid*.5,len*.35,wid*.55,0,wid*.1);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='#2a5a66';c.lineWidth=1.8;c.stroke();
    c.strokeStyle='#2a5a6688';c.lineWidth=1;for(let i=0;i<7;i++){c.beginPath();c.moveTo(len*.05,0);c.quadraticCurveTo(len*.5,-wid*(.15+i*.14),len*(.55+i*.07),-wid*(.1+i*.12));c.stroke()}
    for(let i=0;i<26;i++){c.beginPath();c.moveTo(len*(.1+i*.035),-wid*.8*Math.sin((i/26)*Math.PI)*.9);c.lineTo(len*(.1+i*.035)+4,wid*.3);c.stroke()}
    c.beginPath();c.arc(len*.93,-wid*.12,4,0,TAU);c.fillStyle='#1f3f48';c.fill();c.restore()};
  wing(cx-6,cy-8,-2.55,200,52);wing(cx+6,cy-8,-0.6,200,52);wing(cx-4,cy+14,2.55,190,50);wing(cx+4,cy+14,0.6,190,50);
  // abdomen long segmenté vers le bas
  const ab=spine([[cx,cy+10],[cx+6,cy+70],[cx-8,cy+130],[cx-14,cy+188],[cx-4,cy+236]],14);
  for(let i=ab.length-1;i>=0;i--){const t=i/(ab.length-1),[x,y,a]=ab[i],w=20-12*t;c.save();c.translate(x,y);c.rotate(a+Math.PI/2);ell(c,0,0,w,7,i%4<2?'#1f6a66':'#2a8a80');c.restore()}
  for(let i=0;i<ab.length;i+=4){const [x,y,a]=ab[i],t=i/(ab.length-1),w=20-12*t;c.save();c.translate(x,y);c.rotate(a+Math.PI/2);c.strokeStyle='#0c2a28';c.lineWidth=2;c.beginPath();c.ellipse(0,0,w,7,0,0,TAU);c.stroke();ell(c,0,-3,w*.5,2.2,'#7fe0d0aa');c.restore()}
  {const [ex,ey]=ab[ab.length-1];for(const sx of [-1,1]){c.strokeStyle='#0c2a28';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(ex,ey);c.quadraticCurveTo(ex+sx*12,ey+22,ex+sx*20,ey+44);c.stroke();c.strokeStyle='#2a8a80';c.lineWidth=4;c.stroke()}}
  // thorax puissant
  ell(c,cx,cy,30,40,'#1f5a56',0,'#0c2a28',3);ell(c,cx-6,cy-10,15,22,'#3aa090',-.1);c.strokeStyle='#0c2a28';c.lineWidth=2;c.beginPath();c.moveTo(cx-20,cy-14);c.lineTo(cx+20,cy-14);c.moveTo(cx-24,cy+6);c.lineTo(cx+24,cy+6);c.stroke();
  // pattes-faux : lames avant épineuses
  for(const sx of [-1,1]){const lg=taper(c,[[cx+sx*14,cy-8],[cx+sx*40,cy-36],[cx+sx*52,cy-72],[cx+sx*36,cy-98]],[9,7,6,3],'#3a8a78','#0c2a28',1.8);
    c.fillStyle='#d8f0e4';for(let i=0;i<6;i++){const [x,y]=lg[8+i*7];c.beginPath();c.moveTo(x,y);c.lineTo(x+sx*10,y-3);c.lineTo(x+sx*2,y+5);c.closePath();c.fill()}
    taper(c,[[cx+sx*14,cy+6],[cx+sx*50,cy+30],[cx+sx*66,cy+70]],[8,6,3],'#2a6a60','#0c2a28',1.6)}
  // tête : énormes yeux composés à facettes
  ell(c,cx,cy-62,22,20,'#1f5a56',0,'#0c2a28',3);
  for(const sx of [-1,1]){const ex=cx+sx*22,ey=cy-66;ell(c,ex,ey,24,22,'#4a1a2a',0,'#1a0610',2.5);
    c.save();c.beginPath();c.ellipse(ex,ey,24,22,0,0,TAU);c.clip();c.strokeStyle='#e8567a88';c.lineWidth=1;for(let i=-24;i<=24;i+=6){c.beginPath();c.moveTo(ex+i,ey-24);c.lineTo(ex+i+8,ey+24);c.stroke();c.beginPath();c.moveTo(ex-24,ey+i);c.lineTo(ex+24,ey+i-6);c.stroke()}
    const g=c.createRadialGradient(ex-8,ey-9,1,ex,ey,26);g.addColorStop(0,'#ffd0e0cc');g.addColorStop(.35,'#e8567a55');g.addColorStop(1,'#1a061000');c.fillStyle=g;c.fillRect(ex-30,ey-30,60,60);c.restore()}
  // mandibules
  c.fillStyle='#d8e8d0';c.strokeStyle='#0c2a28';c.lineWidth=1.6;for(const sx of [-1,1]){c.beginPath();c.moveTo(cx+sx*5,cy-48);c.quadraticCurveTo(cx+sx*16,cy-34,cx+sx*6,cy-30);c.lineTo(cx+sx*4,cy-44);c.closePath();c.fill();c.stroke()}
}

/* ------------------------------------------------------------------ CHAUVE-SOURIS ------------------------------------------------------------------ */
function chauve(c,W,H){
  const rnd=seeded(5);c.clearRect(0,0,W,H);const cx=260,cy=175;
  const wing=(sx)=>{ // bras, doigts allongés, membrane festonnée
    const sh0=[cx+sx*28,cy-8],el=[cx+sx*100,cy-60],wr=[cx+sx*172,cy-38];
    const tips=[[cx+sx*236,cy-86],[cx+sx*246,cy-12],[cx+sx*214,cy+60],[cx+sx*156,cy+98]];
    // membrane : bord festonné entre les bouts de doigts
    c.beginPath();c.moveTo(sh0[0],sh0[1]);c.lineTo(el[0],el[1]);c.lineTo(wr[0],wr[1]);c.lineTo(tips[0][0],tips[0][1]);
    for(let i=0;i<3;i++){const a=tips[i],b=tips[i+1],mx=(a[0]+b[0])/2-sx*24,my=(a[1]+b[1])/2+6;c.quadraticCurveTo(mx,my,b[0],b[1])}
    c.quadraticCurveTo(cx+sx*92,cy+88,cx+sx*34,cy+44);c.closePath();
    const g=c.createLinearGradient(cx,0,cx+sx*250,0);g.addColorStop(0,'#3a2a4a');g.addColorStop(.7,'#4a3860');g.addColorStop(1,'#5a4678');c.fillStyle=g;c.fill();c.strokeStyle='#150f1c';c.lineWidth=2.5;c.lineJoin='round';c.stroke();
    // plis : veines entre les doigts
    c.strokeStyle='#150f1c99';c.lineWidth=1.6;for(const t of tips){c.beginPath();c.moveTo(wr[0],wr[1]);c.lineTo(t[0],t[1]);c.stroke();c.beginPath();c.moveTo(wr[0]-sx*14,wr[1]+8);c.quadraticCurveTo((wr[0]+t[0])/2-sx*20,(wr[1]+t[1])/2+18,t[0]-sx*10,t[1]+6);c.stroke()}
    c.strokeStyle='#8a78a822';c.lineWidth=5;c.beginPath();c.moveTo(cx+sx*60,cy+8);c.quadraticCurveTo(cx+sx*140,cy+20,cx+sx*190,cy+40);c.stroke();
    // os du bras épais et pouce crochu
    taper(c,[sh0,el,wr],[11,8,6],'#4a3a58','#150f1c',2);
    c.strokeStyle='#d8d0c0';c.lineWidth=3;c.beginPath();c.moveTo(wr[0],wr[1]);c.lineTo(wr[0]+sx*8,wr[1]-16);c.stroke();
    for(const t of tips){c.strokeStyle='#4a3a58';c.lineWidth=5;c.beginPath();c.moveTo(wr[0],wr[1]);c.lineTo(t[0],t[1]);c.stroke();c.strokeStyle='#150f1c';c.lineWidth=1.4;c.stroke()}
  };
  wing(-1);wing(1);
  // corps fourrure
  ell(c,cx,cy+18,36,52,'#3a2a4a',0,'#150f1c',3);
  const rnd2=seeded(9);for(let i=0;i<70;i++){const a=rnd2()*TAU,d=Math.sqrt(rnd2());const x=cx+Math.cos(a)*d*32,y=cy+18+Math.sin(a)*d*46;c.strokeStyle=rnd2()<.5?'#5a4870':'#2a1c38';c.lineWidth=1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y+7);c.stroke()}
  ell(c,cx,cy+36,22,28,'#6a5a82',0,null);
  // pieds-griffes
  for(const sx of [-1,1]){c.strokeStyle='#d8d0c0';c.lineWidth=2.4;for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(cx+sx*18+k*4,cy+66);c.lineTo(cx+sx*20+k*5,cy+80);c.stroke()}}
  // tête : oreilles géantes, museau plissé, crocs
  ell(c,cx,cy-34,30,26,'#4a3860',0,'#150f1c',3);
  for(const sx of [-1,1]){shape(c,[[cx+sx*14,cy-48],[cx+sx*30,cy-98],[cx+sx*46,cy-64],[cx+sx*36,cy-40]],'#4a3860','#150f1c',2.5);shape(c,[[cx+sx*20,cy-52],[cx+sx*30,cy-86],[cx+sx*38,cy-62]],'#8a5a7a',null);
    c.strokeStyle='#150f1c88';c.lineWidth=1.3;for(let i=0;i<4;i++){c.beginPath();c.moveTo(cx+sx*(22+i*4),cy-54);c.lineTo(cx+sx*(30+i*3),cy-86+i*6);c.stroke()}}
  // feuille nasale
  shape(c,[[cx-9,cy-30],[cx,cy-44],[cx+9,cy-30],[cx+4,cy-24],[cx-4,cy-24]],'#7a4a6a','#150f1c',2);ell(c,cx-3,cy-28,1.6,2.2,'#150f1c');ell(c,cx+3,cy-28,1.6,2.2,'#150f1c');
  for(const sx of [-1,1]){glow(c,cx+sx*13,cy-40,14,'#ff4a3a',.6);ell(c,cx+sx*13,cy-40,4.5,4.5,'#ff5a3a');ell(c,cx+sx*13,cy-40,1.5,3.5,'#200808')}
  // bouche ouverte et crocs
  c.beginPath();c.moveTo(cx-18,cy-20);c.quadraticCurveTo(cx,cy-2,cx+18,cy-20);c.quadraticCurveTo(cx,cy-14,cx-18,cy-20);c.fillStyle='#3a0a14';c.fill();c.strokeStyle='#150f1c';c.lineWidth=2;c.stroke();
  c.fillStyle='#f6f0e0';for(const sx of [-1,1]){c.beginPath();c.moveTo(cx+sx*12,cy-18);c.lineTo(cx+sx*10,cy-3);c.lineTo(cx+sx*6,cy-16);c.closePath();c.fill();c.beginPath();c.moveTo(cx+sx*4,cy-14);c.lineTo(cx+sx*3,cy-7);c.lineTo(cx+sx*1,cy-13);c.closePath();c.fill()}
}

/* ------------------------------------------------------------------ ANGUILLE À LANTERNE ------------------------------------------------------------------ */
function anguille(c,W,H,t=0){
  const rnd=seeded(11);c.clearRect(0,0,W,H);
  // reflets d'eau
  for(let i=0;i<10;i++){c.strokeStyle='#6ac8e822';c.lineWidth=2;c.beginPath();c.moveTo(20+i*50,310+Math.sin(i)*10);c.quadraticCurveTo(45+i*50,300,70+i*50,310);c.stroke()}
  const pts=[[56,256],[130,300],[210,262],[280,214],[352,170],[412,150]];
  // nageoire dorsale en ruban
  const sp=spine(pts,16);
  c.beginPath();sp.forEach(([x,y,a],i)=>{const o=14+8*Math.sin(i*.5);const px=x+Math.sin(a)*(-o-12),py=y-Math.cos(a)*(-o-12);i?c.lineTo(px,py):c.moveTo(px,py)});for(let i=sp.length-1;i>=0;i--){const [x,y,a]=sp[i];c.lineTo(x+Math.sin(a)*-12,y-Math.cos(a)*-12)}c.closePath();c.fillStyle='#2a5a7a99';c.fill();c.strokeStyle='#8ad8f066';c.lineWidth=1;c.stroke();
  const ws=[10,34,44,46,40,34];
  taper(c,pts,ws,'#3a6a82','#0c2a38',3);
  const body=spine(pts,16);
  // ventre clair + écailles
  c.strokeStyle='#bfe8f044';c.lineWidth=1.2;for(let i=3;i<body.length-6;i+=2){const [x,y,a]=body[i],w=(ws[Math.min(ws.length-1,Math.floor(i/body.length*ws.length))])/2;c.beginPath();c.arc(x,y,w*.8,a+Math.PI/2-.8,a+Math.PI/2+.8);c.stroke()}
  taper(c,pts.map(p=>[p[0]+0,p[1]+8]),[4,14,18,20,16,12],'#d8f0f0aa',null);
  // tête : mâchoire inférieure saillante, petits yeux, ouïes
  const hd=[412,150];c.save();c.translate(hd[0],hd[1]);c.rotate(-0.38);
  shape(c,[[-8,-22],[20,-26],[54,-12],[62,2],[40,12],[10,24],[-10,14]],'#3a6a82','#0c2a38',3);
  shape(c,[[10,10],[44,8],[64,20],[36,30],[8,26]],'#2a4e66','#0c2a38',2.5);
  c.fillStyle='#e8f6f0';for(let i=0;i<7;i++){c.beginPath();c.moveTo(18+i*6,10);c.lineTo(20+i*6,2);c.lineTo(23+i*6,10);c.closePath();c.fill()}
  glow(c,22,-10,12,'#ffe27a',.6);ell(c,22,-10,5,5,'#ffe27a','#0c2a38',1.5);ell(c,22,-10,1.4,4,'#120c06');
  c.strokeStyle='#0c2a38';c.lineWidth=2;c.beginPath();c.moveTo(-2,-6);c.quadraticCurveTo(-8,2,-2,12);c.stroke();c.beginPath();c.moveTo(4,-8);c.quadraticCurveTo(-2,2,4,12);c.stroke();c.restore();
  // lanterne sur tige (leurre) + halo
  const lx=450,ly=70;c.strokeStyle='#8ad8f0';c.lineWidth=3;c.beginPath();c.moveTo(398,132);c.quadraticCurveTo(404,60,lx,ly);c.stroke();
  glow(c,lx,ly,60,'#aef0ff',.55);ell(c,lx,ly,12,14,'#e8ffff','#6ac8e8',2);ell(c,lx-2,ly-3,5,6,'#fff');
  // éclairs autour du corps
  c.lineCap='round';c.lineJoin='round';
  const bolt=(x0,y0,x1,y1,seed)=>{const r=seeded(seed),n=7,pts=[[x0,y0]];for(let i=1;i<n;i++){const k=i/n;pts.push([x0+(x1-x0)*k+(r()-.5)*26,y0+(y1-y0)*k+(r()-.5)*26])}pts.push([x1,y1]);
    for(const [col,lw] of [['#2a8ac866',9],['#9fe8ff',3.4],['#ffffff',1.4]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke()}};
  bolt(330,160,260,70,1);bolt(300,205,200,130,2);bolt(240,235,150,170,3);bolt(360,140,446,224,4);bolt(190,270,110,215,5);
  glow(c,330,170,38,'#8ae0ff',.35);
}

/* ------------------------------------------------------------------ SCORPION GÉANT ------------------------------------------------------------------ */
function scorpion(c,W,H){
  const rnd=seeded(13);c.clearRect(0,0,W,H);const cx=250,cy=210;
  groundShadow(c,cx,cy+60,170,50);
  const body='#a8742e',dark='#4a2e12',hi='#e0a850';
  // pattes (4 paires articulées)
  for(let i=0;i<4;i++)for(const sx of [-1,1]){const y0=cy-24+i*17,sp=[[cx+sx*28,y0],[cx+sx*(72+i*6),y0-24+i*12],[cx+sx*(116+i*4),y0+4+i*10],[cx+sx*(138+i*6),y0+44+i*10]];
    taper(c,sp,[10,8,6,3],body,dark,1.8)}
  // queue : segments courbés au-dessus du corps, dard
  const tail=[[cx,cy+54],[cx-6,cy+112],[cx-50,cy+110],[cx-84,cy+50],[cx-60,cy-30],[cx-10,cy-80],[cx+44,cy-70]];
  const ts=spine(tail,10);for(let i=0;i<ts.length;i++){const t=i/(ts.length-1),[x,y,a]=ts[i],w=26-12*t;c.save();c.translate(x,y);c.rotate(a);ell(c,0,0,9,w/2,i%5<3?body:sh(body,-.1),0,dark,1.4);c.restore()}
  for(let i=0;i<ts.length;i+=5){const [x,y,a]=ts[i];c.strokeStyle=dark;c.lineWidth=1.6;c.beginPath();c.moveTo(x+Math.sin(a)*14,y-Math.cos(a)*14);c.lineTo(x-Math.sin(a)*14,y+Math.cos(a)*14);c.stroke()}
  const [ex,ey]=ts[ts.length-1];ell(c,ex-4,ey+2,16,12,sh(body,-.05),0.4,dark,2);
  c.fillStyle='#2a1a0a';c.beginPath();c.moveTo(ex+6,ey-6);c.quadraticCurveTo(ex+36,ey-28,ex+40,ey-4);c.quadraticCurveTo(ex+24,ey-12,ex+8,ey+4);c.closePath();c.fill();glow(c,ex+36,ey-8,16,'#9aff6a',.6);ell(c,ex+37,ey-8,3.5,3.5,'#d8ffb0');
  // pinces énormes
  for(const sx of [-1,1]){const arm=taper(c,[[cx+sx*20,cy-34],[cx+sx*66,cy-72],[cx+sx*108,cy-96]],[18,16,16],body,dark,2);
    const [px,py]=[cx+sx*108,cy-96];c.save();c.translate(px,py);c.rotate(sx*(-0.9));
    shape(c,[[0,-26],[34,-24],[74,-8],[80,6],[46,-4],[8,12],[-14,6],[-16,-12]],sh(body,.05),dark,2.6);
    shape(c,[[8,12],[46,0],[78,14],[70,22],[34,20],[4,26]],sh(body,-.1),dark,2.4);
    c.strokeStyle=hi+'99';c.lineWidth=2;c.beginPath();c.moveTo(-6,-12);c.quadraticCurveTo(30,-22,66,-8);c.stroke();c.restore()}
  // carapace en bouclier + segments
  shape(c,[[cx-44,cy-46],[cx,cy-62],[cx+44,cy-46],[cx+50,cy+4],[cx+34,cy+54],[cx,cy+66],[cx-34,cy+54],[cx-50,cy+4]],body,dark,3);
  c.save();sm(c,[[cx-44,cy-46],[cx,cy-62],[cx+44,cy-46],[cx+50,cy+4],[cx+34,cy+54],[cx,cy+66],[cx-34,cy+54],[cx-50,cy+4]],true);c.clip();
  const g=c.createLinearGradient(cx-50,0,cx+50,0);g.addColorStop(0,sh(body,-.35));g.addColorStop(.35,hi);g.addColorStop(.6,body);g.addColorStop(1,sh(body,-.45));c.fillStyle=g;c.fillRect(cx-60,cy-70,120,150);
  c.strokeStyle=dark;c.lineWidth=2.4;for(let i=0;i<5;i++){c.beginPath();c.moveTo(cx-52,cy+2+i*13);c.quadraticCurveTo(cx,cy-4+i*13,cx+52,cy+2+i*13);c.stroke()}
  c.strokeStyle=dark+'cc';c.lineWidth=2;c.beginPath();c.moveTo(cx,cy-60);c.lineTo(cx,cy+64);c.stroke();
  for(let i=0;i<40;i++)ell(c,cx-40+rnd()*80,cy-40+rnd()*100,1.6,1.2,sh(body,.3)+'88');c.restore();
  // yeux
  for(const sx of [-1,1]){ell(c,cx+sx*10,cy-46,5,6,'#150b04');ell(c,cx+sx*10,cy-47,2,2.4,'#ff6a4a')}
  ell(c,cx+sx(1)*28,cy-34,3,3,'#150b04');ell(c,cx-28,cy-34,3,3,'#150b04');
  // chélicères
  for(const sx of [-1,1])shape(c,[[cx+sx*6,cy-62],[cx+sx*20,cy-76],[cx+sx*18,cy-58]],dark,'#150b04',1.8);
  function sx(v){return v}
}


/* ======================================================= RENDU EN JEU : VUE DU DESSUS ======================================================= */
/* Convention du jeu : le mob regarde vers +x, rayon r, pose 'idle' ou 'atk'. */
function heroTop(c,x,y,r){c.save();c.translate(x,y);ell(c,0,r*.75,r*1.1,r*.4,'#0004');ell(c,0,0,r*.62,r*1.0,'#34527a',0,'#14213a',Math.max(1,r*.1));ell(c,r*.12,0,r*.5,r*.5,'#e8c9a0',0,'#14213a',Math.max(1,r*.08));ell(c,r*.12,0,r*.48,r*.4,'#5a3a22');
  c.strokeStyle='#c8ccd4';c.lineWidth=Math.max(1.5,r*.14);c.lineCap='round';c.beginPath();c.moveTo(r*.5,r*.7);c.lineTo(r*1.9,r*.2);c.stroke();ell(c,r*.5,r*.7,r*.2,r*.2,'#e8c9a0');c.restore()}
function fitDraw(c,x,y,r,f,fn,size,fwd){ // réemploie un portrait déjà dessiné de dessus
  const k=(r*3.1)/size;c.save();c.translate(x,y);c.rotate(f-(fwd??-Math.PI/2));c.scale(k,k);c.translate(-260,-190);fn(c,520,380);c.restore()}

function loupTop(c,x,y,r,f,P,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const rnd=seeded(P.seed),st=Math.sin(t*9)*(pose==='atk'?0.5:0.25);
  ell(c,-.1*u,.15*u,2.1*u,.9*u,'#0004');
  // queue touffue
  c.beginPath();c.moveTo(-1.3*u,0);c.bezierCurveTo(-2.1*u,-.25*u+st*u*.3,-2.7*u,-.1*u,-3.0*u,.2*u+st*u*.4);c.bezierCurveTo(-2.6*u,.5*u,-2.0*u,.4*u,-1.3*u,.22*u);c.closePath();c.fillStyle=sh(P.fur,-.15);c.fill();c.strokeStyle=P.line;c.lineWidth=Math.max(1,u*.1);c.stroke();
  // pattes : 4, foulée alternée
  const leg=(lx,ly,sd,ph)=>{const off=Math.sin(t*9+ph)*(pose==='atk'?.5:.3)*u;c.save();c.translate(lx+off,ly);ell(c,.1*u,0,.62*u,.2*u,sh(P.fur,-.2),0,P.line,Math.max(1,u*.08));c.restore()};
  leg(.75*u,-.78*u,-1,0);leg(.75*u,.78*u,1,Math.PI);leg(-.85*u,-.82*u,-1,Math.PI);leg(-.85*u,.82*u,1,0);
  // torse : épaules larges, taille creusée, hanches
  sm(c,[[1.1*u,0],[.85*u,-.72*u],[.2*u,-.62*u],[-.3*u,-.42*u],[-.85*u,-.6*u],[-1.35*u,-.38*u],[-1.45*u,0],[-1.35*u,.38*u],[-.85*u,.6*u],[-.3*u,.42*u],[.2*u,.62*u],[.85*u,.72*u]],true);
  const g=c.createLinearGradient(0,-u,0,u);g.addColorStop(0,sh(P.fur,.2));g.addColorStop(.5,P.fur);g.addColorStop(1,sh(P.fur,-.25));c.fillStyle=g;c.fill();c.strokeStyle=P.line;c.lineWidth=Math.max(1,u*.1);c.stroke();
  c.strokeStyle=sh(P.fur,-.45);c.lineWidth=Math.max(1,u*.14);c.beginPath();c.moveTo(1.0*u,0);c.lineTo(-1.3*u,0);c.stroke();                       // arête du dos
  c.strokeStyle=sh(P.fur,-.3)+'aa';c.lineWidth=Math.max(.8,u*.06);for(let i=0;i<5;i++){const xx=.5*u-i*.4*u;c.beginPath();c.moveTo(xx,-.3*u);c.quadraticCurveTo(xx-.1*u,-.5*u,xx-.2*u,-.52*u);c.moveTo(xx,.3*u);c.quadraticCurveTo(xx-.1*u,.5*u,xx-.2*u,.52*u);c.stroke()}  // côtes
  for(let i=0;i<24;i++){const xx=-1.3*u+rnd()*2.3*u,yy=(rnd()-.5)*1.1*u;c.strokeStyle=rnd()<.5?sh(P.fur,.3)+'99':sh(P.fur,-.3)+'99';c.lineWidth=Math.max(.7,u*.05);c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-.28*u,yy+(rnd()-.5)*.12*u);c.stroke()}
  if(P.snow)for(let i=0;i<5;i++)ell(c,-1+rnd()*1.6*u,(rnd()-.5)*u,.3*u,.14*u,'#ffffffcc');
  // tête : crâne, museau, oreilles
  const jaw=pose==='atk'?.2*u:0;
  sm(c,[[1.5*u,0],[1.35*u,-.4*u],[1.0*u,-.5*u],[.9*u,0],[1.0*u,.5*u],[1.35*u,.4*u]],true);c.fillStyle=sh(P.fur,.05);c.fill();c.strokeStyle=P.line;c.lineWidth=Math.max(1,u*.1);c.stroke();
  sm(c,[[1.3*u,-.22*u],[2.15*u,-.13*u-jaw],[2.3*u,0],[2.15*u,.13*u+jaw],[1.3*u,.22*u]],true);c.fillStyle=sh(P.fur,.1);c.fill();c.stroke();
  if(pose==='atk'){c.fillStyle='#2a0a10';c.beginPath();c.moveTo(1.7*u,-jaw*.8);c.lineTo(2.2*u,-jaw);c.lineTo(2.2*u,jaw);c.lineTo(1.7*u,jaw*.8);c.closePath();c.fill();c.fillStyle='#f4efe4';for(let i=0;i<3;i++){c.beginPath();c.moveTo(1.85*u+i*.15*u,-jaw*.9);c.lineTo(1.9*u+i*.15*u,-jaw*.3);c.lineTo(1.95*u+i*.15*u,-jaw*.9);c.fill();c.beginPath();c.moveTo(1.85*u+i*.15*u,jaw*.9);c.lineTo(1.9*u+i*.15*u,jaw*.3);c.lineTo(1.95*u+i*.15*u,jaw*.9);c.fill()}}
  ell(c,2.3*u,0,.11*u,.09*u,'#0b0b0e');
  for(const s2 of [-1,1]){c.beginPath();c.moveTo(1.12*u,s2*.34*u);c.lineTo(.82*u,s2*.78*u);c.lineTo(1.0*u,s2*.18*u+s2*.34*u);c.closePath();c.fillStyle=sh(P.fur,-.1);c.fill();c.strokeStyle=P.line;c.stroke();
    glow(c,1.55*u,s2*.2*u,.35*u,P.eye,.7);ell(c,1.55*u,s2*.2*u,.1*u,.07*u,P.eye)}
  c.restore()}

function verTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const rnd=seeded(4);
  ell(c,-.6*u,.2*u,2.6*u,1.1*u,'#0005');
  for(let i=8;i>=0;i--){const k=i/8,bx=-(.6+i*.62)*u,by=Math.sin(t*3+i*.7)*.16*u*(1+k),w=(1.0-.4*k)*u;
    const g=c.createRadialGradient(bx-.2*u,by-.3*u,.1*u,bx,by,w);g.addColorStop(0,'#c98c88');g.addColorStop(.7,'#a8625e');g.addColorStop(1,'#5a2a2c');ell(c,bx,by,w*.5,w,g,0,'#2a1012',Math.max(1,u*.08));
    c.strokeStyle='#3a1a1c88';c.lineWidth=Math.max(1,u*.07);c.beginPath();c.moveTo(bx+.2*u,by-w*.9);c.lineTo(bx+.2*u,by+w*.9);c.stroke()}
  ell(c,-2.4*u,0,.3*u,.95*u,'#d9a8a0',0,'#5a2a2c',Math.max(1,u*.07));
  // tête : gueule ronde à anneaux de dents
  ell(c,.5*u,0,1.15*u,1.15*u,'#8a4a4a',0,'#2a1012',Math.max(1,u*.1));const open=pose==='atk'?1:.8;ell(c,.75*u,0,.8*u*open,.8*u*open,'#1a0a0c');
  for(let ring=0;ring<2;ring++){const R=(.78-ring*.28)*u*open,n=12-ring*4;for(let i=0;i<n;i++){const a=i/n*TAU;c.save();c.translate(.75*u,0);c.rotate(a);c.translate(R,0);c.rotate(Math.PI);c.beginPath();c.moveTo(0,-.1*u);c.lineTo(.28*u,0);c.lineTo(0,.1*u);c.closePath();c.fillStyle=ring?'#d8c8a8':'#efe3c8';c.fill();c.restore()}}
  glow(c,.75*u,0,.45*u,'#ff4a3a',.45);
  for(let i=0;i<10;i++)ell(c,(.4+rnd()*1.4)*u,(rnd()-.5)*2.4*u,.08*u+rnd()*.12*u,.06*u,'#4a382a');c.restore()}

function anguilleTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);
  const pts=[];for(let i=0;i<8;i++)pts.push([(1.4-i*.62)*u,Math.sin(t*5-i*.9)*.42*u*(.3+i*.12)]);
  const sp=spine(pts,10);ell(c,-.8*u,.4*u,2.7*u,.7*u,'#0004');
  // ruban de nageoire sur les flancs
  for(const s2 of [-1,1]){c.beginPath();sp.forEach(([px,py,a],i)=>{const o=(.42+.1*Math.sin(i*.6))*u*s2;const X=px+Math.sin(a)*(-o),Y=py-Math.cos(a)*(-o);i?c.lineTo(X,Y):c.moveTo(X,Y)});for(let i=sp.length-1;i>=0;i--){const [px,py,a]=sp[i];c.lineTo(px+Math.sin(a)*(-.22*u*s2),py-Math.cos(a)*(-.22*u*s2))}c.closePath();c.fillStyle='#2a5a7a88';c.fill()}
  taper(c,pts,[.9*u,.7*u,.62*u,.55*u,.45*u,.3*u,.14*u],'#3a6a82','#0c2a38',Math.max(1,u*.08));
  // tête : mâchoire, yeux, lanterne
  ell(c,1.7*u,0,.7*u,.5*u,'#3a6a82',0,'#0c2a38',Math.max(1,u*.08));
  const jw=pose==='atk'?.28*u:.1*u;c.fillStyle='#2a4e66';c.beginPath();c.moveTo(1.9*u,-.15*u-jw);c.lineTo(2.5*u,-.05*u-jw*.5);c.lineTo(2.5*u,.05*u+jw*.5);c.lineTo(1.9*u,.15*u+jw);c.closePath();c.fill();c.strokeStyle='#0c2a38';c.stroke();
  c.fillStyle='#e8f6f0';for(let i=0;i<4;i++){c.beginPath();c.moveTo(2.0*u+i*.12*u,-.1*u-jw*.5);c.lineTo(2.05*u+i*.12*u,-.02*u);c.lineTo(2.1*u+i*.12*u,-.1*u-jw*.5);c.fill()}
  for(const s2 of [-1,1]){ell(c,1.65*u,s2*.3*u,.1*u,.1*u,'#ffe27a','#0c2a38',1)}
  c.strokeStyle='#8ad8f0';c.lineWidth=Math.max(1,u*.09);c.beginPath();c.moveTo(1.6*u,0);c.quadraticCurveTo(2.2*u,-.9*u,2.7*u,-.7*u);c.stroke();glow(c,2.7*u,-.7*u,u*.9,'#aef0ff',.7);ell(c,2.7*u,-.7*u,.22*u,.22*u,'#e8ffff');
  if(pose==='atk'){for(const [a,l] of [[-.5,3.4],[.2,3.8],[.9,3.2],[-1.1,3]]){const rr=seeded(Math.round(a*10+t*7)),pts2=[[2.7*u,-.7*u]];for(let i=1;i<6;i++){const k=i/6;pts2.push([2.7*u+Math.cos(a)*l*u*k+(rr()-.5)*.5*u,-.7*u+Math.sin(a)*l*u*k+(rr()-.5)*.5*u])}
    for(const [col,lw] of [['#2a8ac877',Math.max(2,u*.35)],['#9fe8ff',Math.max(1,u*.12)],['#ffffff',Math.max(.6,u*.05)]]){c.strokeStyle=col;c.lineWidth=lw;c.lineJoin='round';c.beginPath();pts2.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke()}}}
  c.restore()}

function crapaudTop(c,x,y,r,f,pose,t=0){const P={skin:'#6f8a3c',wart:'#8aa04a',eye:'#e2b53a',pupil:'#10140c'},u=r;c.save();c.translate(x,y);c.rotate(f);const leap=pose==='atk'?1.25:1;
  ell(c,0,.6*u,1.7*u,.8*u,'#0004');c.fillStyle=sh(P.skin,-.15);c.strokeStyle=sh(P.skin,-.55);c.lineWidth=Math.max(1,u*.07);
  for(const sg of [-1,1]){c.beginPath();c.moveTo(-.5*u,sg*.5*u);c.lineTo(-1.1*u*leap,sg*1.15*u);c.lineTo(-1.75*u*leap,sg*.95*u);c.lineTo(-1.55*u*leap,sg*1.3*u);c.lineTo(-.95*u,sg*1.5*u);c.lineTo(-.2*u,sg*.85*u);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(.6*u,sg*.45*u);c.lineTo(1.05*u,sg*.95*u);c.lineTo(1.35*u,sg*.85*u);c.lineTo(1.25*u,sg*1.1*u);c.lineTo(.85*u,sg*1.15*u);c.closePath();c.fill();c.stroke()}
  const bg=c.createRadialGradient(.2*u,-.2*u,.1*u,0,0,1.4*u);bg.addColorStop(0,sh(P.skin,.3));bg.addColorStop(.6,P.skin);bg.addColorStop(1,sh(P.skin,-.4));ell(c,-.1*u,0,1.25*u,.95*u,bg,0,sh(P.skin,-.55),Math.max(1,u*.07));
  const rnd=seeded(5);for(let i=0;i<10;i++){const a=rnd()*TAU,d=Math.sqrt(rnd());ell(c,-.1*u+Math.cos(a)*d*.95*u,Math.sin(a)*d*.7*u,u*(.07+rnd()*.1),u*(.06+rnd()*.08),P.wart)}
  ell(c,1.05*u,0,.62*u,.58*u,sh(P.skin,.05),0,sh(P.skin,-.55),Math.max(1,u*.07));
  for(const sg of [-1,1]){ell(c,1.12*u,sg*.38*u,.27*u,.27*u,sh(P.skin,-.2));ell(c,1.15*u,sg*.38*u,.2*u,.2*u,P.eye);ell(c,1.18*u,sg*.38*u,.05*u,.17*u,P.pupil)}
  if(pose==='atk'){c.strokeStyle='#d4687a';c.lineWidth=Math.max(2,u*.2);c.lineCap='round';c.beginPath();c.moveTo(1.5*u,0);c.lineTo(3.4*u,0);c.stroke();ell(c,3.5*u,0,.22*u,.22*u,'#e8788a')}
  c.restore()}

/* ---------- humains vus du dessus : même taille, silhouettes et équipements qui se distinguent ---------- */
function hBody(c,u,col,line){ell(c,-.05*u,0,.58*u,1.02*u,col,0,line||'#16121a',Math.max(1,u*.08))}
function hHead(c,u,skin,x=.12){ell(c,x*u,0,.52*u,.5*u,skin,0,'#16121a',Math.max(1,u*.07))}
function hArm(c,u,sx,tx,ty,col,hand){c.strokeStyle='#16121a';c.lineWidth=Math.max(2,u*.34);c.lineCap='round';c.beginPath();c.moveTo(.05*u,sx*.9*u);c.lineTo(tx*u,ty*u);c.stroke();c.strokeStyle=col;c.lineWidth=Math.max(1.5,u*.24);c.stroke();ell(c,tx*u,ty*u,.17*u,.17*u,hand||'#e8c9a0')}
function line(c,x1,y1,x2,y2,col,w){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
const HUM={
 garde(c,u,atk,t){ // armure rouge intégrale, heaume à plumet, épée et grand bouclier
  hBody(c,u,'#8a1a22');for(const s of [-1,1]){hArm(c,u,s,s>0?1.1:.7,s>0?.8:-.95,'#a82a32','#c8ccd4')}
  line(c,.85*u,.82*u,2.0*u,atk?.2*u:.62*u,'#d8dce4',Math.max(2,u*.16));line(c,.78*u,.74*u,.95*u,.96*u,'#d8b24a',Math.max(2,u*.16));
  sm(c,[[1.45*u,-1.3*u],[1.05*u,-.45*u],[.95*u,-.95*u],[.55*u,-1.15*u]],true);c.fillStyle='#8a1a22';c.fill();c.strokeStyle='#d8b24a';c.lineWidth=Math.max(1,u*.09);c.stroke();line(c,.95*u,-1.0*u,.95*u,-.5*u,'#d8b24a',Math.max(1,u*.1));
  for(const s of [-1,1]){ell(c,-.05*u,s*.98*u,.4*u,.34*u,'#a82a32',0,'#d8b24a',Math.max(1,u*.09))}
  ell(c,.12*u,0,.56*u,.52*u,'#aab0ba',0,'#16121a',Math.max(1,u*.08));line(c,.56*u,-.25*u,.56*u,.25*u,'#101018',Math.max(1.5,u*.12));line(c,.5*u,0,-.55*u,0,'#c82a34',Math.max(2,u*.2))},
 hallebardier(c,u,atk,t){ // mailles, tabard rouge, salade à crête, hallebarde
  hBody(c,u,'#6a707a');line(c,.5*u,0,-.6*u,0,'#8a1a22',Math.max(3,u*.5));for(const s of [-1,1])hArm(c,u,s,s>0?.9:1.3,s>0?.55:-.2,'#7a808a','#e8c9a0');
  const sh1=atk?.35*u:0;line(c,-1.5*u,.3*u,3.0*u,.18*u-sh1,'#6a4a2a',Math.max(2,u*.14));
  c.beginPath();c.moveTo(2.4*u,.12*u-sh1);c.lineTo(3.2*u,-.5*u-sh1);c.lineTo(3.3*u,.05*u-sh1);c.lineTo(2.7*u,.28*u-sh1);c.closePath();c.fillStyle='#d8dce4';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.06);c.stroke();line(c,3.0*u,.18*u-sh1,3.9*u,.18*u-sh1,'#d8dce4',Math.max(2,u*.14));
  sm(c,[[.7*u,0],[.4*u,-.5*u],[-.2*u,-.45*u],[-.35*u,0],[-.2*u,.45*u],[.4*u,.5*u]],true);c.fillStyle='#9aa0aa';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);c.stroke();line(c,.65*u,0,-.35*u,0,'#c0c6d0',Math.max(2,u*.16));ell(c,.55*u,0,.08*u,.2*u,'#101018')},
 archer(c,u,atk,t){ // capuche rouge sombre, casque ouvert à nasal, arc long, carquois
  c.fillStyle='#4a1018';c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);sm(c,[[-.2*u,-.95*u],[-1.5*u,-.4*u],[-1.7*u,0],[-1.5*u,.4*u],[-.2*u,.95*u]],true);c.fill();c.stroke();
  hBody(c,u,'#5a1a22');ell(c,-.75*u,.7*u,.2*u,.5*u,'#6a4a2a',-.5,'#16121a',1);for(let i=0;i<3;i++)line(c,-.9*u+i*.12*u,.4*u,-1.05*u+i*.12*u,.1*u,'#e8e0d0',Math.max(1,u*.07));
  hArm(c,u,-1,1.1,-.7,'#6a2a32');hArm(c,u,1,atk?.3:.8,atk?.05:.3,'#6a2a32');
  c.strokeStyle='#5a3a1a';c.lineWidth=Math.max(2,u*.16);c.beginPath();c.arc(.9*u,-.55*u,1.4*u,-1.0,1.0);c.stroke();line(c,.9*u+Math.cos(-1.0)*1.4*u,-.55*u+Math.sin(-1.0)*1.4*u,.9*u+Math.cos(1.0)*1.4*u,-.55*u+Math.sin(1.0)*1.4*u,'#e8e0d0',Math.max(.8,u*.05));
  if(atk){line(c,.2*u,.05*u,2.2*u,-.55*u,'#d8d0c0',Math.max(1.2,u*.07));c.fillStyle='#c8ccd4';c.beginPath();c.moveTo(2.2*u,-.55*u);c.lineTo(1.95*u,-.7*u);c.lineTo(1.95*u,-.42*u);c.closePath();c.fill()}
  ell(c,.12*u,0,.54*u,.5*u,'#8a909a',0,'#16121a',Math.max(1,u*.08));line(c,.66*u,0,.18*u,0,'#6a707a',Math.max(1.5,u*.14));line(c,.1*u,-.5*u,.1*u,.5*u,'#6a707a',Math.max(1,u*.1))},
 pirate(c,u,atk,t){ // chapeau tricorne à tête de mort, bandana, chemise rayée, ceinture rouge, sabre d'abordage
  hBody(c,u,'#ece6d6');for(let i=-3;i<=3;i++)line(c,-.5*u,i*.3*u,.4*u,i*.3*u,'#2a5a8a',Math.max(1,u*.09));ell(c,-.05*u,0,.2*u,1.0*u,'#a82a2a');
  hArm(c,u,-1,.7,-.9,'#ece6d6');hArm(c,u,1,1.0,atk?.1:.8,'#ece6d6');
  c.strokeStyle='#d8dce4';c.lineWidth=Math.max(2,u*.15);c.beginPath();c.moveTo(1.0*u,atk?.1*u:.8*u);c.quadraticCurveTo(2.0*u,atk?-.7*u:.2*u,2.4*u,atk?-.2*u:.6*u);c.stroke();line(c,.95*u,(atk?.1:.8)*u-.28*u,.95*u,(atk?.1:.8)*u+.28*u,'#d8b24a',Math.max(2,u*.14));
  line(c,-.4*u,-.1*u,-1.3*u,-.5*u,'#c82a2a',Math.max(2,u*.2));line(c,-.4*u,.1*u,-1.2*u,.35*u,'#c82a2a',Math.max(2,u*.18));
  hHead(c,u,'#d8b088');sm(c,[[.85*u,0],[.35*u,-.95*u],[-.25*u,-.55*u],[-.55*u,0],[-.25*u,.55*u],[.35*u,.95*u]],true);c.fillStyle='#1a1a22';c.fill();c.strokeStyle='#d8b24a';c.lineWidth=Math.max(1,u*.07);c.stroke();ell(c,.2*u,0,.17*u,.2*u,'#ece6d6');line(c,.1*u,-.14*u,.3*u,.14*u,'#1a1a22',Math.max(1,u*.05));line(c,.1*u,.14*u,.3*u,-.14*u,'#1a1a22',Math.max(1,u*.05))},
 capitaine(c,u,atk,t){ // grand manteau bleu à galons d'or, bicorne à plume, sabre et pistolet
  c.fillStyle='#1c2f5a';c.strokeStyle='#d8b24a';c.lineWidth=Math.max(1,u*.09);sm(c,[[-.3*u,-.95*u],[-1.7*u,-1.1*u],[-2.1*u,-.3*u],[-2.0*u,.4*u],[-1.7*u,1.0*u],[-.3*u,.95*u]],true);c.fill();c.stroke();
  hBody(c,u,'#24407a','#d8b24a');for(let i=-2;i<=2;i++)ell(c,.25*u,i*.22*u,.06*u,.06*u,'#d8b24a');hArm(c,u,-1,.9,-.8,'#24407a');hArm(c,u,1,1.0,atk?0:.8,'#24407a');
  c.strokeStyle='#e0e4ec';c.lineWidth=Math.max(2.5,u*.18);c.beginPath();c.moveTo(1.0*u,atk?0:.8*u);c.quadraticCurveTo(2.2*u,atk?-.9*u:.1*u,2.7*u,atk?-.3*u:.6*u);c.stroke();line(c,.95*u,(atk?0:.8)*u-.32*u,.95*u,(atk?0:.8)*u+.32*u,'#d8b24a',Math.max(2,u*.16));
  line(c,.9*u,-.8*u,1.45*u,-.8*u,'#2a2a30',Math.max(2,u*.2));line(c,1.2*u,-.8*u,1.2*u,-.5*u,'#6a4a2a',Math.max(2,u*.18));
  hHead(c,u,'#d8b088');sm(c,[[.7*u,0],[.2*u,-1.1*u],[-.5*u,-.75*u],[-.7*u,0],[-.5*u,.75*u],[.2*u,1.1*u]],true);c.fillStyle='#14182a';c.fill();c.strokeStyle='#d8b24a';c.lineWidth=Math.max(1.5,u*.1);c.stroke();
  c.strokeStyle='#f4f0e4';c.lineWidth=Math.max(1.5,u*.14);c.beginPath();c.moveTo(.1*u,-.6*u);c.bezierCurveTo(-.5*u,-1.4*u,-1.2*u,-1.0*u,-1.1*u,-.4*u);c.stroke();c.strokeStyle='#c82a2a';c.lineWidth=Math.max(1,u*.08);c.beginPath();c.moveTo(.1*u,-.6*u);c.bezierCurveTo(-.4*u,-1.3*u,-1.1*u,-.95*u,-1.0*u,-.4*u);c.stroke()},
 katniss(c,u,atk,t){ // villageoise des bois : cape de feuilles, longue tresse, arc en bandoulière puis dégainé
  c.fillStyle='#3e5230';c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);sm(c,[[.1*u,-.98*u],[-.9*u,-1.1*u],[-1.2*u,-.3*u],[-1.0*u,.5*u],[-.8*u,1.1*u],[.1*u,.98*u]],true);c.fill();c.stroke();
  for(let i=0;i<8;i++){const a=i/8*TAU;ell(c,-.6*u+Math.cos(a)*.5*u,Math.sin(a)*.7*u,.14*u,.07*u,i%2?'#5a7a3a':'#4a6a2e',a)}
  hBody(c,u,'#5a6a3a');
  if(!atk){c.strokeStyle='#5a3a1a';c.lineWidth=Math.max(2,u*.16);c.beginPath();c.moveTo(.4*u,-.95*u);c.quadraticCurveTo(-1.0*u,0,.3*u,.95*u);c.stroke();line(c,.4*u,-.95*u,.3*u,.95*u,'#d8d0c0',Math.max(.8,u*.05));ell(c,-.6*u,.4*u,.18*u,.45*u,'#6a4a2a',-.3,'#16121a',1);hArm(c,u,-1,.5,-.55,'#5a6a3a');hArm(c,u,1,.5,.55,'#5a6a3a')}
  else{hArm(c,u,-1,1.4,-.5,'#5a6a3a');hArm(c,u,1,.5,.25,'#5a6a3a');c.strokeStyle='#5a3a1a';c.lineWidth=Math.max(2,u*.18);c.beginPath();c.arc(1.1*u,-.5*u,1.35*u,-1.0,1.0);c.stroke();line(c,1.1*u+Math.cos(-1.0)*1.35*u,-.5*u+Math.sin(-1.0)*1.35*u,.5*u,.25*u,'#e8e0d0',Math.max(.8,u*.05));line(c,.5*u,.25*u,1.1*u+Math.cos(1.0)*1.35*u,-.5*u+Math.sin(1.0)*1.35*u,'#e8e0d0',Math.max(.8,u*.05));line(c,.5*u,.25*u,2.3*u,-.35*u,'#d8d0c0',Math.max(1.2,u*.07));c.fillStyle='#c8ccd4';c.beginPath();c.moveTo(2.4*u,-.35*u);c.lineTo(2.1*u,-.5*u);c.lineTo(2.1*u,-.2*u);c.closePath();c.fill()}
  const sw=Math.sin(t*6)*.1*u;for(let i=0;i<7;i++)ell(c,-.5*u-i*.28*u,.1*u+sw*(i/7)*3,.22*u,.15*u,i%2?'#3a2412':'#4a2e18');
  hHead(c,u,'#e0b890');sm(c,[[.62*u,0],[.3*u,-.5*u],[-.2*u,-.46*u],[-.32*u,0],[-.2*u,.46*u],[.3*u,.5*u]],true);c.fillStyle='#4a2e18';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.06);c.stroke();ell(c,.35*u,0,.22*u,.3*u,'#e0b890')},
 brume(c,u,atk,t){ // cape grise-bleue, brume qui la suit, déplacement très rapide
  const w=Math.sin(t*5)*.25*u;for(let i=0;i<4;i++){c.globalAlpha=.28-i*.05;sm(c,[[-.3*u,-.9*u],[-1.6*u-i*.5*u,-1.1*u+w],[-2.6*u-i*.7*u,-.2*u],[-2.4*u-i*.6*u,.6*u-w],[-1.5*u-i*.4*u,1.1*u],[-.3*u,.9*u]],true);c.fillStyle='#bcd0e0';c.fill()}c.globalAlpha=1;
  c.fillStyle='#3a4a5a';c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);sm(c,[[.3*u,-.9*u],[-1.4*u,-1.0*u+w*.4],[-1.9*u,0],[-1.4*u,1.0*u-w*.4],[.3*u,.9*u]],true);c.fill();c.stroke();
  hBody(c,u,'#4a5a6a');hArm(c,u,-1,1.1,-.55,'#4a5a6a');hArm(c,u,1,atk?.5:.9,atk?.1:.4,'#4a5a6a');
  c.strokeStyle='#4a5a6a';c.lineWidth=Math.max(2,u*.14);c.beginPath();c.arc(.9*u,-.4*u,1.25*u,-1.0,1.0);c.stroke();
  sm(c,[[.95*u,0],[.35*u,-.62*u],[-.35*u,-.55*u],[-.55*u,0],[-.35*u,.55*u],[.35*u,.62*u]],true);c.fillStyle='#3a4a5a';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);c.stroke();ell(c,.4*u,0,.28*u,.3*u,'#16121a');glow(c,.5*u,-.1*u,.3*u,'#aef0ff',.8);glow(c,.5*u,.1*u,.3*u,'#aef0ff',.8)},
 guerrier(c,u,atk,t){ // turban, voile, gilet de cuir, cimeterre et rondache de bronze
  hBody(c,u,'#b88a4a');ell(c,-.05*u,0,.2*u,1.0*u,'#8a2a2a');hArm(c,u,-1,.95,-.85,'#c89a5a');hArm(c,u,1,1.0,atk?.1:.8,'#c89a5a');
  ell(c,1.0*u,-.88*u,.42*u,.42*u,'#b8742a',0,'#16121a',Math.max(1,u*.08));ell(c,1.0*u,-.88*u,.16*u,.16*u,'#d8a050');
  c.strokeStyle='#e8f0f4';c.lineWidth=Math.max(2.5,u*.18);c.beginPath();c.moveTo(1.0*u,atk?.1*u:.8*u);c.bezierCurveTo(1.8*u,atk?-.9*u:0,2.6*u,atk?-.7*u:.3*u,2.9*u,atk?.1*u:.9*u);c.stroke();line(c,.95*u,(atk?.1:.8)*u-.28*u,.95*u,(atk?.1:.8)*u+.28*u,'#d8b24a',Math.max(2,u*.14));
  line(c,-.3*u,0,-1.5*u,-.3*u,'#e8dcc0',Math.max(2,u*.22));
  hHead(c,u,'#b8845a');ell(c,.1*u,0,.62*u,.6*u,'#e8dcc0',0,'#16121a',Math.max(1,u*.08));for(let i=0;i<4;i++){c.strokeStyle='#b8a888';c.lineWidth=Math.max(1,u*.07);c.beginPath();c.arc(.1*u,0,(.5-i*.1)*u,i,i+3.5);c.stroke()}ell(c,.55*u,0,.14*u,.34*u,'#16121a')},
 orc(c,u,atk,t){ // petit, trapu, grandes oreilles pointues, gros nez, défenses, hache tenue dans le bon sens
  hBody(c,u,'#6a8a4a');line(c,.3*u,-.7*u,-.3*u,.7*u,'#5a3a1a',Math.max(2,u*.2));hArm(c,u,-1,.85,-.9,'#6a8a4a','#6a8a4a');hArm(c,u,1,1.0,atk?.05:.75,'#6a8a4a','#6a8a4a');
  line(c,.7*u,atk?.05*u:.75*u,2.0*u,atk?-.25*u:.5*u,'#6a4a2a',Math.max(2,u*.18));c.beginPath();c.moveTo(1.8*u,(atk?-.25:.5)*u);c.lineTo(2.4*u,(atk?-.95:-.2)*u);c.lineTo(2.55*u,(atk?-.2:.5)*u);c.lineTo(2.3*u,(atk?.25:.95)*u);c.closePath();c.fillStyle='#b0b6c0';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.07);c.stroke();
  for(const s of [-1,1]){c.beginPath();c.moveTo(.1*u,s*.4*u);c.lineTo(-.15*u,s*1.55*u);c.lineTo(.5*u,s*.55*u);c.closePath();c.fillStyle='#7a9a58';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.07);c.stroke()}
  hHead(c,u,'#7a9a58');ell(c,.7*u,0,.3*u,.24*u,'#6a8a4a',0,'#16121a',Math.max(1,u*.07));line(c,-.15*u,-.44*u,-.15*u,.44*u,'#8a2a2a',Math.max(2,u*.14));
  for(const s of [-1,1]){c.beginPath();c.moveTo(.6*u,s*.2*u);c.lineTo(.95*u,s*.3*u);c.lineTo(.62*u,s*.34*u);c.closePath();c.fillStyle='#f0ead8';c.fill()}ell(c,.45*u,-.18*u,.07*u,.07*u,'#ffd24a');ell(c,.45*u,.18*u,.07*u,.07*u,'#ffd24a')},
 roi(c,u,atk,t){ // robe de pourpre, collerette d'hermine, couronne ; aucune arme, il lève les mains
  c.fillStyle='#6a1428';c.strokeStyle='#d8b24a';c.lineWidth=Math.max(1,u*.09);sm(c,[[-.3*u,-1.0*u],[-1.5*u,-1.2*u],[-2.0*u,0],[-1.5*u,1.2*u],[-.3*u,1.0*u]],true);c.fill();c.stroke();
  hBody(c,u,'#8a1a30','#d8b24a');ell(c,-.05*u,0,.62*u,1.05*u,'#f2eee4',0,'#16121a',Math.max(1,u*.07));for(let i=0;i<9;i++){const a=i/9*TAU;ell(c,-.05*u+Math.cos(a)*.42*u,Math.sin(a)*.78*u,.06*u,.06*u,'#16121a')}
  const wob=Math.sin(t*14)*.06*u;hArm(c,u,-1,atk?1.0:.7,atk?-1.1:-.95,'#8a1a30');hArm(c,u,1,atk?1.0:.7,atk?1.1+wob/u:.95,'#8a1a30');
  hHead(c,u,'#e0b890');c.fillStyle='#d8b24a';c.strokeStyle='#8a6a1a';c.lineWidth=Math.max(1,u*.07);c.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,rr=i%2?.36*u:.52*u;c.lineTo(.12*u+Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();c.fill();c.stroke();ell(c,.12*u,0,.12*u,.12*u,'#c82a34')},
 momie(c,u,atk,t){ // bandelettes en croix, avance les bras tendus, bandes qui traînent, souffle des bourrasques de sable
  const sw=Math.sin(t*3)*.15*u;for(let i=0;i<4;i++){c.strokeStyle=i%2?'#cdbf9a':'#b8aa86';c.lineWidth=Math.max(1.5,u*.2);c.lineCap='round';c.beginPath();c.moveTo(-.6*u,(i-1.5)*.3*u);c.quadraticCurveTo(-1.5*u,(i-1.5)*.5*u+sw,-2.4*u-i*.2*u,(i-1.5)*.7*u-sw);c.stroke()}
  hBody(c,u,'#cdbf9a');c.strokeStyle='#8a7a58';c.lineWidth=Math.max(1,u*.07);for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(-.5*u,i*.3*u-.3*u);c.lineTo(.4*u,i*.3*u+.3*u);c.stroke()}
  for(const s of [-1,1]){c.strokeStyle='#16121a';c.lineWidth=Math.max(2,u*.34);c.lineCap='round';c.beginPath();c.moveTo(.05*u,s*.85*u);c.lineTo(1.75*u,s*(atk?.35:.5)*u);c.stroke();c.strokeStyle='#cdbf9a';c.lineWidth=Math.max(1.5,u*.24);c.stroke();for(let k=0;k<4;k++){c.strokeStyle='#8a7a58';c.lineWidth=Math.max(1,u*.06);c.beginPath();c.moveTo((.4+k*.35)*u,s*(.8-k*.08)*u-.14*u);c.lineTo((.5+k*.35)*u,s*(.8-k*.08)*u+.14*u);c.stroke()}ell(c,1.8*u,s*(atk?.35:.5)*u,.17*u,.17*u,'#cdbf9a','#16121a',1)}
  hHead(c,u,'#cdbf9a');c.strokeStyle='#8a7a58';c.lineWidth=Math.max(1,u*.07);for(let i=0;i<5;i++){c.beginPath();c.arc(.12*u,0,(.5-i*.08)*u,i*1.2,i*1.2+3);c.stroke()}glow(c,.5*u,-.14*u,.22*u,'#aef060',.9);glow(c,.5*u,.14*u,.22*u,'#aef060',.9);
  if(atk){c.strokeStyle='#d8c08a99';c.lineWidth=Math.max(1.5,u*.14);for(let i=0;i<4;i++){c.beginPath();c.arc(2.6*u,0,(.5+i*.38)*u,t*5+i,t*5+i+2.4);c.stroke()}}},
};
function humanTop(type){return (c,x,y,r,f,pose,t)=>{c.save();c.translate(x,y);c.rotate(f);ell(c,0,.5*r,1.25*r,.55*r,'#0004');const sc=type==='orc'?1:1;HUM[type](c,r*sc,pose==='atk',t);c.restore()}}

/* ---------- créatures : golems, ombre, griffon ---------- */
function golemTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const atk=pose==='atk';ell(c,0,.5*u,1.7*u,1.2*u,'#0005');
  for(const s of [-1,1]){const ax=atk?1.7:1.1;c.fillStyle='#5a6888';c.strokeStyle='#14182a';c.lineWidth=Math.max(1.5,u*.08);c.beginPath();c.roundRect(.2*u,s*1.0*u-.4*u,ax*u,.8*u,u*.12);c.fill();c.stroke();ell(c,(.2+ax)*u,s*1.0*u,.5*u,.5*u,'#7a8aaa',0,'#14182a',Math.max(1.5,u*.08))}
  c.beginPath();c.roundRect(-1.1*u,-1.25*u,2.2*u,2.5*u,u*.2);const g=c.createLinearGradient(-u,-u,u,u);g.addColorStop(0,'#8a9ab8');g.addColorStop(1,'#4a5878');c.fillStyle=g;c.fill();c.strokeStyle='#14182a';c.lineWidth=Math.max(1.5,u*.09);c.stroke();
  c.strokeStyle='#14182a99';c.lineWidth=Math.max(1,u*.06);c.beginPath();c.moveTo(-.9*u,-.4*u);c.lineTo(-.2*u,-.5*u);c.lineTo(.1*u,.4*u);c.moveTo(.4*u,-1.1*u);c.lineTo(.5*u,-.3*u);c.stroke();
  const rnd=seeded(9);const cry=(cx,cy,sz,rot)=>{c.save();c.translate(cx,cy);c.rotate(rot);glow(c,0,0,sz*1.5,'#5ae8ff',.6);c.beginPath();c.moveTo(0,-sz*1.4);c.lineTo(sz*.6,-sz*.3);c.lineTo(sz*.5,sz*.8);c.lineTo(-sz*.5,sz*.8);c.lineTo(-sz*.6,-sz*.3);c.closePath();c.fillStyle='#7af0ff';c.fill();c.strokeStyle='#1a6a8a';c.lineWidth=Math.max(1,u*.05);c.stroke();c.beginPath();c.moveTo(0,-sz*1.4);c.lineTo(sz*.15,sz*.7);c.strokeStyle='#e8ffff';c.stroke();c.restore()};
  for(const s of [-1,1]){cry(-.1*u,s*1.15*u,.34*u,s*.3+Math.PI/2*s*0);cry(-.7*u,s*.8*u,.26*u,s*.5);cry(-.5*u,s*1.28*u,.2*u,s*.9)}cry(-.9*u,0,.3*u,Math.PI/2);cry(-.6*u,-.3*u,.22*u,1.2);
  c.beginPath();c.roundRect(.55*u,-.45*u,.7*u,.9*u,u*.1);c.fillStyle='#6a7a98';c.fill();c.strokeStyle='#14182a';c.lineWidth=Math.max(1.5,u*.08);c.stroke();line(c,1.1*u,-.22*u,1.1*u,.22*u,'#5ae8ff',Math.max(2,u*.14));glow(c,1.1*u,0,.35*u,'#5ae8ff',.8);
  glow(c,-.1*u,0,.55*u,'#5ae8ff',atk?.8:.4);c.restore()}
function gardienTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const atk=pose==='atk';ell(c,0,.6*u,1.9*u,1.4*u,'#0005');
  const rock=(cx,cy,s,seed,col)=>{const rr=seeded(seed),pts=[];for(let i=0;i<9;i++){const a=i/9*TAU;pts.push([cx+Math.cos(a)*s*(.8+rr()*.4),cy+Math.sin(a)*s*(.8+rr()*.4)])}sm(c,pts,true);const g=c.createRadialGradient(cx-s*.3,cy-s*.3,s*.1,cx,cy,s);g.addColorStop(0,sh(col,.25));g.addColorStop(1,sh(col,-.3));c.fillStyle=g;c.fill();c.strokeStyle='#14141a';c.lineWidth=Math.max(1.5,u*.07);c.stroke()};
  for(const s of [-1,1]){const ax=atk?1.9:1.3;rock(.9*u,s*1.15*u,.55*u,s+3,'#7a7a84');rock((.9+ax*.6)*u,s*1.0*u,.62*u,s+5,'#8a8a94')}
  rock(-.9*u,0,1.0*u,1,'#6a6a74');rock(0,-.7*u,.9*u,2,'#7a7a84');rock(0,.7*u,.9*u,3,'#74747e');rock(.5*u,0,.8*u,4,'#8a8a94');
  const rnd=seeded(2);for(let i=0;i<7;i++)ell(c,(rnd()-.6)*1.8*u,(rnd()-.5)*2*u,.2*u+rnd()*.2*u,.12*u,'#4a6a3a99',rnd()*3);
  c.strokeStyle='#ffb347';c.lineWidth=Math.max(1.5,u*.08);c.lineCap='round';glow(c,-.2*u,0,.5*u,'#ffb347',.4);for(const [a,b,cc,d] of [[-1.2,-.3,-.5,-.1],[-.6,.5,-.1,.7],[-.9,0,-.3,.2]]){c.beginPath();c.moveTo(a*u,b*u);c.lineTo(cc*u,d*u);c.stroke()}
  ell(c,.9*u,0,.34*u,.34*u,'#1a1410',0,'#14141a',Math.max(1,u*.06));glow(c,.9*u,0,.5*u,'#ffb347',.9);ell(c,.9*u,0,.16*u,.16*u,'#ffd27a');c.restore()}
function ombreTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const atk=pose==='atk',w=Math.sin(t*6)*.3*u;
  for(let i=0;i<5;i++){c.globalAlpha=.55-i*.09;c.fillStyle=i%2?'#3a2a5a':'#2a1c44';c.beginPath();c.moveTo(-.2*u,-.8*u+i*.3*u);c.bezierCurveTo(-1.2*u,(-1.2+i*.5)*u+w,-2.0*u-i*.3*u,(-.5+i*.3)*u,-2.8*u-i*.5*u,(-.2+i*.1)*u+w);c.bezierCurveTo(-2.0*u,(.6-i*.1)*u,-1.2*u,(1.1-i*.4)*u-w,-.2*u,(.8-i*.3)*u);c.closePath();c.fill()}c.globalAlpha=1;
  sm(c,[[.9*u,0],[.4*u,-.8*u],[-.7*u,-.95*u],[-1.1*u,0],[-.7*u,.95*u],[.4*u,.8*u]],true);const g=c.createLinearGradient(-u,0,u,0);g.addColorStop(0,'#1a1228');g.addColorStop(1,'#3a2a5a');c.fillStyle=g;c.fill();c.strokeStyle='#0a0612';c.lineWidth=Math.max(1,u*.08);c.stroke();
  for(const s of [-1,1]){c.strokeStyle='#241a38';c.lineWidth=Math.max(2,u*.3);c.lineCap='round';c.beginPath();c.moveTo(0,s*.8*u);c.lineTo((atk?1.5:1.0)*u,s*(atk?.3:.7)*u);c.stroke();line(c,(atk?1.5:1.0)*u,s*(atk?.3:.7)*u,(atk?2.5:1.9)*u,s*(atk?.1:.55)*u,'#cfc0f0',Math.max(1.5,u*.1))}
  glow(c,.55*u,0,.7*u,'#c9a2ff',.5);for(const s of [-1,1]){ell(c,.55*u,s*.2*u,.13*u,.07*u,'#e8d8ff');glow(c,.55*u,s*.2*u,.3*u,'#c9a2ff',.8)}c.restore()}
function griffonTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const atk=pose==='atk',fl=Math.sin(t*(atk?10:5))*.18;ell(c,0,.7*u,2.4*u,1.3*u,'#0005');
  for(const s of [-1,1]){c.save();c.rotate(s*(.35+fl));for(let i=0;i<9;i++){const L=(2.6-Math.abs(i-4)*.12)*u*(1+fl*.2),a=-s*(.06*i);c.save();c.translate(-.1*u,s*(.3+i*.17)*u);c.rotate(s*Math.PI/2*.9+(-.6+i*.14)*s*0);const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'#c8a060');g.addColorStop(1,'#6a4a22');c.beginPath();c.ellipse(L*.5*0,L*.5*s*0,0,0,0,0,0);c.restore()}c.restore()}
  // ailes : grandes plumes en éventail
  for(const s of [-1,1]){for(let i=0;i<10;i++){const a=(-.5+i*.17)*(-s)+Math.PI/2*s*0,L=(2.8-i*.1)*u,ang=s*(Math.PI/2)+((i-4.5)*.17)*(-s)+s*fl;c.save();c.translate(-.2*u,s*.5*u);c.rotate(ang);const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'#b8884a');g.addColorStop(1,i%2?'#5a3a1a':'#7a5028');c.beginPath();c.moveTo(0,-.2*u);c.quadraticCurveTo(L*.6,-.3*u,L,0);c.quadraticCurveTo(L*.6,.3*u,0,.2*u);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='#2a1a0a';c.lineWidth=Math.max(1,u*.05);c.stroke();c.restore()}}
  // corps de lion, queue à touffe
  c.beginPath();c.moveTo(-1.5*u,0);c.bezierCurveTo(-2.2*u,-.2*u,-2.6*u,.5*u,-3.0*u,.3*u);c.strokeStyle='#b8884a';c.lineWidth=Math.max(2,u*.2);c.stroke();ell(c,-3.1*u,.3*u,.28*u,.2*u,'#8a5a2a');
  ell(c,-.2*u,0,1.5*u,.8*u,'#d8a860',0,'#2a1a0a',Math.max(1.5,u*.08));ell(c,-.1*u,0,1.2*u,.5*u,'#e8be78');
  for(const s of [-1,1]){ell(c,.9*u,s*.7*u,.5*u,.18*u,'#d8a860',0,'#2a1a0a',1);c.strokeStyle='#f4efe4';c.lineWidth=Math.max(1,u*.07);for(let k=0;k<3;k++){c.beginPath();c.moveTo(1.3*u,s*(.62+k*.07)*u);c.lineTo(1.55*u,s*(.6+k*.09)*u);c.stroke()}}
  // tête d'aigle : collerette, bec crochu, yeux
  ell(c,1.0*u,0,.65*u,.6*u,'#f4efe4',0,'#2a1a0a',Math.max(1.5,u*.07));ell(c,1.15*u,0,.5*u,.45*u,'#fbf8f0');
  c.fillStyle='#e8b43a';c.strokeStyle='#2a1a0a';c.lineWidth=Math.max(1,u*.06);c.beginPath();c.moveTo(1.35*u,-.28*u);c.quadraticCurveTo(2.25*u,-.2*u,2.2*u,.1*u);c.quadraticCurveTo(1.9*u,.0*u,1.35*u,.28*u);c.closePath();c.fill();c.stroke();
  for(const s of [-1,1]){ell(c,1.2*u,s*.3*u,.1*u,.09*u,'#e8b43a');ell(c,1.22*u,s*.3*u,.04*u,.06*u,'#14100a')}c.restore()}


/* ============================ RÉVISIONS (retours du joueur) ============================ */
/* loup d'origine du jeu (ART.beast), repris tel quel */
function oldWolfTop(c,x,y,r,f,pose,t,col){const ph=t*(pose==='atk'?12:8),dk=sh(col,-.35),lt=sh(col,.35);c.save();c.translate(x,y);c.rotate(f);
  c.beginPath();c.moveTo(-r*1.1,0);c.quadraticCurveTo(-r*1.9,Math.sin(ph*.5)*r*.5,-r*2.1,Math.sin(ph*.5+1)*r*.3);c.lineWidth=r*.32;c.strokeStyle=dk;c.lineCap='round';c.stroke();
  [[.7,-.5],[.7,.5],[-.7,-.5],[-.7,.5]].forEach(([lx,ly],i)=>{const o=Math.sin(ph+(i%2?Math.PI:0))*r*.22;c.beginPath();c.ellipse(lx*r+o,ly*r,r*.26,r*.14,0,0,TAU);c.fillStyle=dk;c.fill()});
  const g=c.createLinearGradient(0,-r*.6,0,r*.6);g.addColorStop(0,col);g.addColorStop(.5,lt);g.addColorStop(1,col);c.beginPath();c.ellipse(0,0,r*1.25,r*.58,0,0,TAU);c.fillStyle=g;c.fill();c.strokeStyle='#0008';c.lineWidth=1.2;c.stroke();
  c.beginPath();c.ellipse(-r*.1,0,r*.9,r*.16,0,0,TAU);c.fillStyle=dk;c.fill();c.beginPath();c.ellipse(r*.75,0,r*.42,r*.52,0,0,TAU);c.fillStyle=lt;c.fill();
  c.beginPath();c.arc(r*1.2,0,r*.46,0,TAU);c.fillStyle=col;c.fill();c.strokeStyle='#0008';c.stroke();
  c.beginPath();c.ellipse(r*1.65,0,r*.32,r*.2,0,0,TAU);c.fillStyle=lt;c.fill();c.beginPath();c.arc(r*1.95,0,r*.09,0,TAU);c.fillStyle='#111';c.fill();
  for(const sg of[-1,1]){c.beginPath();c.moveTo(r*1.05,sg*r*.18);c.lineTo(r*.95,sg*r*.62);c.lineTo(r*1.32,sg*r*.32);c.closePath();c.fillStyle=dk;c.fill()}
  c.fillStyle='#ffd84a';for(const sg of[-1,1]){c.beginPath();c.arc(r*1.42,sg*r*.2,r*.07,0,TAU);c.fill()}
  if(pose==='atk'){c.beginPath();c.moveTo(r*1.75,-r*.12);c.lineTo(r*2.05,0);c.lineTo(r*1.75,r*.12);c.fillStyle='#fff';c.fill()}c.restore()}

/* chauve-souris vue de dessus : on la voit de dos, face contre terre */
function chauveTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const fl=Math.sin(t*(pose==='atk'?16:11))*.22;
  ell(c,-.2*u,.5*u,1.7*u,1.0*u,'#0004');
  for(const s of [-1,1]){const k=1+fl*s*0,sp=s;const sh0=[.35*u,s*.35*u],el=[.55*u,s*1.5*u*(1+fl)],wr=[-.15*u,s*2.8*u*(1+fl)];
    const tips=[[.1*u,s*3.2*u*(1+fl)],[-.7*u,s*3.05*u*(1+fl)],[-1.35*u,s*2.3*u*(1+fl)],[-1.6*u,s*1.2*u]];
    c.beginPath();c.moveTo(sh0[0],sh0[1]);c.lineTo(el[0],el[1]);c.lineTo(wr[0],wr[1]);c.lineTo(tips[0][0],tips[0][1]);
    for(let i=0;i<3;i++){const a=tips[i],b=tips[i+1];c.quadraticCurveTo((a[0]+b[0])/2+.35*u,(a[1]+b[1])/2-s*.2*u,b[0],b[1])}
    c.quadraticCurveTo(-1.3*u,s*.5*u,-.4*u,s*.3*u);c.closePath();const g=c.createLinearGradient(0,0,0,s*3*u);g.addColorStop(0,'#4a3860');g.addColorStop(1,'#6a5088');c.fillStyle=g;c.fill();c.strokeStyle='#150f1c';c.lineWidth=Math.max(1,u*.07);c.lineJoin='round';c.stroke();
    c.strokeStyle='#150f1caa';c.lineWidth=Math.max(.8,u*.05);for(const tp of tips){c.beginPath();c.moveTo(wr[0],wr[1]);c.lineTo(tp[0],tp[1]);c.stroke()}
    c.strokeStyle='#4a3a58';c.lineWidth=Math.max(1.5,u*.16);c.beginPath();c.moveTo(sh0[0],sh0[1]);c.lineTo(el[0],el[1]);c.lineTo(wr[0],wr[1]);c.stroke();c.strokeStyle='#150f1c';c.lineWidth=Math.max(.7,u*.05);c.stroke()}
  // membrane de queue et petites pattes
  c.beginPath();c.moveTo(-.7*u,-.3*u);c.lineTo(-1.5*u,-.5*u);c.lineTo(-1.65*u,0);c.lineTo(-1.5*u,.5*u);c.lineTo(-.7*u,.3*u);c.closePath();c.fillStyle='#4a3860';c.fill();c.strokeStyle='#150f1c';c.lineWidth=Math.max(1,u*.06);c.stroke();
  // corps et tête (dos)
  ell(c,-.15*u,0,.95*u,.5*u,'#3a2a4a',0,'#150f1c',Math.max(1,u*.08));for(let i=0;i<14;i++){const xx=-.8*u+i*.12*u;line(c,xx,-.2*u+(i%3)*.1*u,xx-.14*u,-.12*u+(i%3)*.1*u,'#5a4870',Math.max(.8,u*.05))}
  ell(c,.8*u,0,.42*u,.38*u,'#4a3860',0,'#150f1c',Math.max(1,u*.07));ell(c,1.15*u,0,.17*u,.14*u,'#3a2a4a');
  for(const s of [-1,1]){c.beginPath();c.moveTo(.75*u,s*.18*u);c.lineTo(.5*u,s*.82*u);c.lineTo(1.0*u,s*.36*u);c.closePath();c.fillStyle='#4a3860';c.fill();c.strokeStyle='#150f1c';c.lineWidth=Math.max(1,u*.06);c.stroke();c.beginPath();c.moveTo(.76*u,s*.26*u);c.lineTo(.62*u,s*.62*u);c.lineTo(.9*u,s*.36*u);c.closePath();c.fillStyle='#8a5a7a';c.fill()}
  c.restore()}

/* crapaud vu de dessus : pattes arrière à cuisse, tibia et pied palmé ; pattes avant à doigts ; yeux saillants */
function crapaudTop(c,x,y,r,f,pose,t=0){const P={skin:'#6f8a3c',dark:'#4a5e26',wart:'#8aa04a',belly:'#d8cf8a'},u=r;c.save();c.translate(x,y);c.rotate(f);const leap=pose==='atk'?1.2:1;
  ell(c,0,.6*u,1.9*u,1.1*u,'#0004');
  const toes=(bx,by,ang,n,len,wid)=>{for(let i=0;i<n;i++){const a=ang+(i-(n-1)/2)*.42,ex=bx+Math.cos(a)*len,ey=by+Math.sin(a)*len;c.beginPath();c.moveTo(bx,by);c.lineTo(ex,ey);c.strokeStyle=P.dark;c.lineWidth=Math.max(1.5,wid*2.2);c.lineCap='round';c.stroke();c.strokeStyle=P.skin;c.lineWidth=Math.max(1,wid*1.5);c.stroke();ell(c,ex,ey,wid*.9,wid*.9,sh(P.skin,.15))}};
  for(const s of [-1,1]){
    // patte arrière : cuisse -> genou -> cheville -> pied palmé
    const hip=[-.5*u,s*.75*u],knee=[(.1)*u,s*1.75*u],ank=[-1.25*u*leap,s*1.95*u],ft=[-1.85*u*leap,s*2.2*u];
    taper(c,[hip,knee,ank],[.85*u,.55*u,.34*u],P.skin,'#16200c',Math.max(1,u*.07));
    c.beginPath();c.moveTo(ank[0],ank[1]);for(let i=0;i<4;i++){const a=Math.PI+s*(.55+i*.28),ex=ft[0]+Math.cos(a)*.5*u,ey=ft[1]+Math.sin(a)*.5*u;c.lineTo(ex,ey)}c.closePath();c.fillStyle=sh(P.skin,-.1);c.fill();c.strokeStyle='#16200c';c.lineWidth=Math.max(1,u*.06);c.stroke();
    toes(ank[0],ank[1],Math.PI+s*.9,4,.95*u,.1*u);
    // patte avant : bras -> coude -> main à 4 doigts
    const sho=[.55*u,s*.6*u],elb=[.7*u,s*1.25*u],hnd=[1.35*u,s*1.35*u];
    taper(c,[sho,elb,hnd],[.5*u,.34*u,.26*u],P.skin,'#16200c',Math.max(1,u*.06));toes(hnd[0],hnd[1],s*.45,4,.5*u,.07*u)}
  const bg=c.createRadialGradient(.2*u,-.2*u,.1*u,0,0,1.5*u);bg.addColorStop(0,sh(P.skin,.3));bg.addColorStop(.6,P.skin);bg.addColorStop(1,sh(P.skin,-.4));
  ell(c,-.15*u,0,1.3*u,1.0*u,bg,0,'#16200c',Math.max(1,u*.08));c.strokeStyle=sh(P.skin,-.35);c.lineWidth=Math.max(1,u*.1);c.beginPath();c.moveTo(.9*u,0);c.lineTo(-1.2*u,0);c.stroke();
  const rnd=seeded(5);for(let i=0;i<14;i++){const a=rnd()*TAU,d=Math.sqrt(rnd());const px=-.15*u+Math.cos(a)*d*1.0*u,py=Math.sin(a)*d*.78*u;ell(c,px,py,u*(.07+rnd()*.11),u*(.06+rnd()*.09),P.wart);ell(c,px-.02*u,py-.02*u,u*.03,u*.02,'#fff3')}
  // tête large, yeux saillants rouges-ambre à paupière
  ell(c,1.1*u,0,.7*u,.62*u,sh(P.skin,.06),0,'#16200c',Math.max(1,u*.08));c.strokeStyle='#16200c';c.lineWidth=Math.max(1,u*.08);c.beginPath();c.moveTo(1.7*u,-.3*u);c.quadraticCurveTo(1.85*u,0,1.7*u,.3*u);c.stroke();
  for(const s of [-1,1]){const ex=1.05*u,ey=s*.52*u;ell(c,ex,ey,.34*u,.34*u,sh(P.skin,-.25),0,'#16200c',Math.max(1,u*.07));ell(c,ex+.03*u,ey,.25*u,.25*u,'#7a1a10');ell(c,ex+.03*u,ey,.2*u,.2*u,'#e8902a');ell(c,ex+.04*u,ey,.2*u,.045*u,'#10140c');c.beginPath();c.arc(ex,ey,.3*u,s>0?.2:Math.PI+.2,s>0?Math.PI-.2:TAU-.2);c.strokeStyle=sh(P.skin,-.45);c.lineWidth=Math.max(1,u*.09);c.stroke();ell(c,ex-.07*u,ey-.06*u,.04*u,.03*u,'#fffc')}
  if(pose==='atk'){c.strokeStyle='#d4687a';c.lineWidth=Math.max(2,u*.22);c.lineCap='round';c.beginPath();c.moveTo(1.7*u,0);c.lineTo(3.6*u,0);c.stroke();ell(c,3.7*u,0,.24*u,.24*u,'#e8788a')}
  c.restore()}

/* anguille : un seul corps continu (tête, mâchoire et queue dans la même courbe) */
function eelOutline(c,x,y,u,t,jaw,col,dark){
  const N=9,pts=[];for(let i=0;i<N;i++)pts.push([(1.8-i*.62)*u,Math.sin(t*5-i*.9)*.4*u*(.2+i*.13)]);
  const sp=spine(pts,12),n=sp.length,W=k=>{const q=k/(n-1);const prof=[[0,.18],[.1,.42],[.22,.62],[.5,.52],[.8,.3],[1,.06]];let a=prof[0],b=prof[1];for(let i=1;i<prof.length;i++){if(q<=prof[i][0]){a=prof[i-1];b=prof[i];break}}const m=(q-a[0])/((b[0]-a[0])||1);return (a[1]+(b[1]-a[1])*m)*u};
  const L=[],R=[];for(let i=0;i<n;i++){const [px,py,a]=sp[i],w=W(i);L.push([px+Math.sin(a)*w,py-Math.cos(a)*w]);R.push([px-Math.sin(a)*w,py+Math.cos(a)*w])}
  // mâchoire inférieure qui s'ouvre : le haut de la tête reste dans la courbe
  const poly=L.concat(R.reverse());c.beginPath();poly.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
  const g=c.createLinearGradient(0,-.7*u,0,.7*u);g.addColorStop(0,sh(col,.18));g.addColorStop(.5,col);g.addColorStop(1,sh(col,-.3));c.fillStyle=g;c.fill();c.strokeStyle=dark;c.lineWidth=Math.max(1,u*.09);c.lineJoin='round';c.stroke();return sp}
function anguilleTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);ell(c,-.6*u,.5*u,2.8*u,.8*u,'#0004');
  // nageoire continue sur tout le dos
  const sp0=spine(Array.from({length:9},(_,i)=>[(1.8-i*.62)*u,Math.sin(t*5-i*.9)*.4*u*(.2+i*.13)]),12);
  for(const s2 of [-1,1]){c.beginPath();sp0.forEach(([px,py,a],i)=>{const o=(.5+.14*Math.sin(i*.55+t*3))*u*s2*(i<14?.4+i/24:1);const X=px+Math.sin(a)*o*(-1),Y=py-Math.cos(a)*o*(-1);i?c.lineTo(X,Y):c.moveTo(X,Y)});for(let i=sp0.length-1;i>=0;i--){const [px,py,a]=sp0[i];c.lineTo(px+Math.sin(a)*.25*u*s2*-1,py-Math.cos(a)*.25*u*s2*-1)}c.closePath();c.fillStyle='#2a5a7a99';c.fill();c.strokeStyle='#8ad8f055';c.lineWidth=Math.max(.8,u*.04);c.stroke()}
  const sp=eelOutline(c,0,0,u,t,pose==='atk'?.3:.12,'#3a6a82','#0c2a38');
  // ligne latérale, mâchoire entrouverte, yeux, lanterne attachée à la tête par une tige continue
  c.strokeStyle='#bfe8f044';c.lineWidth=Math.max(.8,u*.05);c.beginPath();sp.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();
  const [hx,hy,ha]=sp[1];const jw=pose==='atk'?.22*u:.07*u;c.strokeStyle='#0c2a38';c.lineWidth=Math.max(1.2,u*.08);c.beginPath();c.moveTo(hx+.1*u,hy);c.lineTo(hx+.75*u,hy);c.stroke();
  c.fillStyle='#e8f6f0';for(let i=0;i<4;i++){c.beginPath();c.moveTo(hx+.25*u+i*.14*u,hy-.02*u);c.lineTo(hx+.3*u+i*.14*u,hy-.12*u-jw*.5);c.lineTo(hx+.34*u+i*.14*u,hy-.02*u);c.fill();c.beginPath();c.moveTo(hx+.25*u+i*.14*u,hy+.02*u);c.lineTo(hx+.3*u+i*.14*u,hy+.12*u+jw*.5);c.lineTo(hx+.34*u+i*.14*u,hy+.02*u);c.fill()}
  for(const s2 of [-1,1]){ell(c,hx-.15*u,hy+s2*.36*u,.1*u,.08*u,'#ffe27a','#0c2a38',1)}
  c.strokeStyle='#8ad8f0';c.lineWidth=Math.max(1.5,u*.11);c.lineCap='round';c.beginPath();c.moveTo(hx-.2*u,hy-.1*u);c.bezierCurveTo(hx+.3*u,hy-.9*u,hx+1.0*u,hy-1.0*u,hx+1.4*u,hy-.7*u);c.stroke();
  const lx=hx+1.4*u,ly=hy-.7*u;glow(c,lx,ly,u*1.0,'#aef0ff',.7);ell(c,lx,ly,.22*u,.22*u,'#e8ffff','#6ac8e8',Math.max(1,u*.05));
  if(pose==='atk'){for(const [a,l] of [[-.5,3.4],[.2,3.8],[.9,3.2],[-1.1,3]]){const rr=seeded(Math.round(a*10+t*7)),pts2=[[lx,ly]];for(let i=1;i<6;i++){const k=i/6;pts2.push([lx+Math.cos(a)*l*u*k+(rr()-.5)*.5*u,ly+Math.sin(a)*l*u*k+(rr()-.5)*.5*u])}
    for(const [col,lw] of [['#2a8ac877',Math.max(2,u*.35)],['#9fe8ff',Math.max(1,u*.12)],['#ffffff',Math.max(.6,u*.05)]]){c.strokeStyle=col;c.lineWidth=lw;c.lineJoin='round';c.beginPath();pts2.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke()}}}
  c.restore()}
/* portrait : même anguille, tête dans la courbe du corps */
function anguille(c,W,H){c.clearRect(0,0,W,H);c.save();c.translate(250,215);c.rotate(-.12);anguilleTop(c,-60,0,62,0,'atk',1.4);c.restore()}

/* scorpion : 3 paires de pattes, queue qui se replie au-dessus du corps, vraies pinces */
function scorpion(c,W,H){
  c.clearRect(0,0,W,H);const cx=250,cy=215,body='#a8742e',dark='#4a2e12',hi='#e0a850';groundShadow(c,cx,cy+70,170,50);
  for(let i=0;i<3;i++)for(const sx of [-1,1]){const y0=cy-6+i*26,sp=[[cx+sx*30,y0],[cx+sx*(78+i*8),y0-18+i*10],[cx+sx*(122+i*8),y0+8+i*14],[cx+sx*(142+i*10),y0+52+i*12]];taper(c,sp,[11,8,6,3],body,dark,1.8)}
  // queue : monte derrière, se courbe au-dessus du corps, dard vers l'avant
  const tail=[[cx,cy+56],[cx+8,cy+120],[cx+64,cy+128],[cx+104,cy+66],[cx+88,cy-14],[cx+40,cy-62],[cx-6,cy-64]];
  const ts=spine(tail,10);for(let i=ts.length-1;i>=0;i--){const t=i/(ts.length-1),[x,y,a]=ts[i],w=17+14*t;c.save();c.translate(x,y);c.rotate(a);ell(c,0,0,10+3*t,w/2,sh(body,.12*t-.05),0,dark,1.4);c.restore()}
  for(let i=2;i<ts.length;i+=6){const [x,y,a]=ts[i];c.strokeStyle=dark;c.lineWidth=1.6;c.beginPath();c.moveTo(x+Math.sin(a)*14,y-Math.cos(a)*14);c.lineTo(x-Math.sin(a)*14,y+Math.cos(a)*14);c.stroke()}
  const [ex,ey,ea]=ts[ts.length-1];c.save();c.translate(ex,ey);c.rotate(ea);ell(c,2,0,24,17,sh(body,.2),0,dark,2);c.fillStyle='#2a1a0a';c.beginPath();c.moveTo(14,-7);c.quadraticCurveTo(48,-12,56,10);c.quadraticCurveTo(38,0,14,8);c.closePath();c.fill();glow(c,50,3,15,'#9aff6a',.6);ell(c,52,4,3.4,3.4,'#d8ffb0');c.restore();
  // pinces : bras articulé puis vraie pince (doigt fixe, doigt mobile, creux)
  for(const sx of [-1,1]){taper(c,[[cx+sx*22,cy-32],[cx+sx*58,cy-62],[cx+sx*86,cy-98]],[16,15,14],body,dark,2);
    c.save();c.translate(cx+sx*86,cy-98);c.rotate(sx*-.15);if(sx<0)c.scale(-1,1);
    shape(c,[[-20,0],[-16,-30],[0,-62],[22,-76],[40,-70],[30,-54],[16,-40],[22,-14],[14,6],[-6,12]],sh(body,.05),dark,2.6);
    shape(c,[[14,6],[28,-8],[48,-34],[62,-30],[56,-10],[38,12],[22,24]],sh(body,-.08),dark,2.4);
    c.strokeStyle=hi+'99';c.lineWidth=2;c.beginPath();c.moveTo(-12,-6);c.quadraticCurveTo(4,-44,30,-68);c.stroke();c.restore()}
  shape(c,[[cx-44,cy-44],[cx,cy-62],[cx+44,cy-44],[cx+50,cy+4],[cx+34,cy+56],[cx,cy+68],[cx-34,cy+56],[cx-50,cy+4]],body,dark,3);
  c.save();sm(c,[[cx-44,cy-44],[cx,cy-62],[cx+44,cy-44],[cx+50,cy+4],[cx+34,cy+56],[cx,cy+68],[cx-34,cy+56],[cx-50,cy+4]],true);c.clip();
  const g=c.createLinearGradient(cx-50,0,cx+50,0);g.addColorStop(0,sh(body,-.35));g.addColorStop(.35,hi);g.addColorStop(.6,body);g.addColorStop(1,sh(body,-.45));c.fillStyle=g;c.fillRect(cx-60,cy-70,120,150);
  c.strokeStyle=dark;c.lineWidth=2.4;for(let i=0;i<5;i++){c.beginPath();c.moveTo(cx-52,cy+4+i*13);c.quadraticCurveTo(cx,cy-2+i*13,cx+52,cy+4+i*13);c.stroke()}c.beginPath();c.moveTo(cx,cy-60);c.lineTo(cx,cy+66);c.strokeStyle=dark+'cc';c.stroke();c.restore();
  for(const sx of [-1,1]){ell(c,cx+sx*10,cy-46,5,6,'#150b04');ell(c,cx+sx*10,cy-47,2,2.4,'#ff6a4a');ell(c,cx+sx*26,cy-34,3,3,'#150b04')}
  for(const sx of [-1,1])shape(c,[[cx+sx*6,cy-62],[cx+sx*20,cy-78],[cx+sx*18,cy-58]],dark,'#150b04',1.8)}

/* sabre : lame droite-courbe, plus ou moins large, courbée vers l'extérieur (du côté de la main) */
function blade(c,u,x1,y1,x2,y2,bend,w,col,guard){const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,side=y1>=0?1:-1,cx=mx+nx*bend*side*-0,cy=my+side*bend;
  c.beginPath();c.moveTo(x1+nx*w*.5,y1+ny*w*.5);c.quadraticCurveTo(cx+nx*w*.6,cy+ny*w*.6,x2,y2);c.quadraticCurveTo(cx-nx*w*.4,cy-ny*w*.4,x1-nx*w*.5,y1-ny*w*.5);c.closePath();c.fillStyle=col;c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.06);c.stroke();
  c.strokeStyle='#ffffffaa';c.lineWidth=Math.max(.8,u*.04);c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo(cx,cy,x2,y2);c.stroke();
  if(guard){const gx=x1,gy=y1;c.strokeStyle='#d8b24a';c.lineWidth=Math.max(2,u*.14);c.lineCap='round';c.beginPath();c.moveTo(gx-nx*.3*u,gy-ny*.3*u);c.lineTo(gx+nx*.3*u,gy+ny*.3*u);c.stroke()}}
/* arc tenu dans la main, vu de dessus : le haut de l'arc part vers l'avant, la corde vers l'archer */
function bowHold(c,u,gx,gy,atk,wood,drawX,drawY){const tip=1.05*u,back=.55*u;
  c.strokeStyle='#16121a';c.lineWidth=Math.max(3,u*.26);c.lineCap='round';c.beginPath();c.moveTo(gx-back,gy-tip);c.quadraticCurveTo(gx+.55*u,gy,gx-back,gy+tip);c.stroke();c.strokeStyle=wood;c.lineWidth=Math.max(2,u*.18);c.stroke();
  const sx=atk?drawX:gx-.45*u,sy=atk?drawY:gy;c.strokeStyle='#efe8d4';c.lineWidth=Math.max(.8,u*.05);c.beginPath();c.moveTo(gx-back,gy-tip);c.lineTo(sx,sy);c.lineTo(gx-back,gy+tip);c.stroke();
  if(atk){line(c,drawX,drawY,gx+1.2*u,gy,'#d8d0c0',Math.max(1.2,u*.07));c.fillStyle='#c8ccd4';c.beginPath();c.moveTo(gx+1.4*u,gy);c.lineTo(gx+1.12*u,gy-.12*u);c.lineTo(gx+1.12*u,gy+.12*u);c.closePath();c.fill();ell(c,drawX,drawY,.17*u,.17*u,'#e8c9a0','#16121a',Math.max(1,u*.05))}
  ell(c,gx,gy,.2*u,.2*u,'#e8c9a0','#16121a',Math.max(1,u*.06));ell(c,gx,gy,.1*u,.28*u,sh(wood,-.3))}
function armTo(c,u,s,tx,ty,col){hArm(c,u,s,tx,ty,col)}

HUM.archer=(c,u,atk,t)=>{ // capuche rouge sombre, casque ouvert à nasal, arc long tenu en main, carquois
  c.fillStyle='#4a1018';c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);sm(c,[[-.2*u,-.95*u],[-1.5*u,-.4*u],[-1.7*u,0],[-1.5*u,.4*u],[-.2*u,.95*u]],true);c.fill();c.stroke();
  hBody(c,u,'#5a1a22');ell(c,-.75*u,.7*u,.2*u,.5*u,'#6a4a2a',-.5,'#16121a',1);for(let i=0;i<3;i++)line(c,-.9*u+i*.12*u,.4*u,-1.05*u+i*.12*u,.1*u,'#e8e0d0',Math.max(1,u*.07));
  const gx=1.25*u,gy=-.45*u;armTo(c,u,-1,1.25,-.45,'#6a2a32');armTo(c,u,1,atk?.55:.55,atk?.2:.55,'#6a2a32');bowHold(c,u,gx,gy,atk,'#7a5a2a',.55*u,.2*u);
  ell(c,.12*u,0,.54*u,.5*u,'#8a909a',0,'#16121a',Math.max(1,u*.08));line(c,.66*u,0,.18*u,0,'#6a707a',Math.max(1.5,u*.14));line(c,.1*u,-.5*u,.1*u,.5*u,'#6a707a',Math.max(1,u*.1))};
HUM.guerrier=(c,u,atk,t)=>{ // turban, voile, gilet de cuir, cimeterre peu courbé, rondache de bronze
  hBody(c,u,'#b88a4a');ell(c,-.05*u,0,.2*u,1.0*u,'#8a2a2a');hArm(c,u,-1,.95,-.85,'#c89a5a');hArm(c,u,1,1.0,atk?.1:.8,'#c89a5a');
  ell(c,1.0*u,-.88*u,.42*u,.42*u,'#b8742a',0,'#16121a',Math.max(1,u*.08));ell(c,1.0*u,-.88*u,.16*u,.16*u,'#d8a050');
  blade(c,u,1.0*u,(atk?.1:.8)*u,2.7*u,(atk?-.2:.55)*u,.16*u,.2*u,'#e8f0f4',true);
  line(c,-.3*u,0,-1.5*u,-.3*u,'#e8dcc0',Math.max(2,u*.22));
  hHead(c,u,'#b8845a');ell(c,.1*u,0,.62*u,.6*u,'#e8dcc0',0,'#16121a',Math.max(1,u*.08));for(let i=0;i<4;i++){c.strokeStyle='#b8a888';c.lineWidth=Math.max(1,u*.07);c.beginPath();c.arc(.1*u,0,(.5-i*.1)*u,i,i+3.5);c.stroke()}ell(c,.55*u,0,.14*u,.34*u,'#16121a')};
HUM.pirate=(c,u,atk,t)=>{ // tricorne à tête de mort, bandana, chemise rayée, sabre d'abordage large
  hBody(c,u,'#ece6d6');for(let i=-3;i<=3;i++)line(c,-.5*u,i*.3*u,.4*u,i*.3*u,'#2a5a8a',Math.max(1,u*.09));ell(c,-.05*u,0,.2*u,1.0*u,'#a82a2a');
  hArm(c,u,-1,.7,-.9,'#ece6d6');hArm(c,u,1,1.0,atk?.1:.8,'#ece6d6');
  blade(c,u,1.0*u,(atk?.1:.8)*u,2.55*u,(atk?-.15:.5)*u,.12*u,.34*u,'#d8dce4',true);
  line(c,-.4*u,-.1*u,-1.3*u,-.5*u,'#c82a2a',Math.max(2,u*.2));line(c,-.4*u,.1*u,-1.2*u,.35*u,'#c82a2a',Math.max(2,u*.18));
  hHead(c,u,'#d8b088');sm(c,[[.85*u,0],[.35*u,-.95*u],[-.25*u,-.55*u],[-.55*u,0],[-.25*u,.55*u],[.35*u,.95*u]],true);c.fillStyle='#1a1a22';c.fill();c.strokeStyle='#d8b24a';c.lineWidth=Math.max(1,u*.07);c.stroke();ell(c,.2*u,0,.17*u,.2*u,'#ece6d6');line(c,.1*u,-.14*u,.3*u,.14*u,'#1a1a22',Math.max(1,u*.05));line(c,.1*u,.14*u,.3*u,-.14*u,'#1a1a22',Math.max(1,u*.05))};
HUM.capitaine=(c,u,atk,t)=>{ // grand manteau bleu à galons d'or, bicorne à plume, sabre large et crochet à la main gauche
  c.fillStyle='#1c2f5a';c.strokeStyle='#d8b24a';c.lineWidth=Math.max(1,u*.09);sm(c,[[-.3*u,-.95*u],[-1.7*u,-1.1*u],[-2.1*u,-.3*u],[-2.0*u,.4*u],[-1.7*u,1.0*u],[-.3*u,.95*u]],true);c.fill();c.stroke();
  hBody(c,u,'#24407a','#d8b24a');for(let i=-2;i<=2;i++)ell(c,.25*u,i*.22*u,.06*u,.06*u,'#d8b24a');hArm(c,u,-1,.95,-.8,'#24407a','#c8ccd4');hArm(c,u,1,1.0,atk?0:.8,'#24407a');
  // crochet de fer au bout du bras gauche
  c.strokeStyle='#16121a';c.lineWidth=Math.max(3,u*.2);c.lineCap='round';c.beginPath();c.moveTo(.95*u,-.8*u);c.quadraticCurveTo(1.45*u,-.95*u,1.55*u,-.55*u);c.stroke();c.strokeStyle='#c8ccd4';c.lineWidth=Math.max(1.8,u*.12);c.stroke();ell(c,.95*u,-.8*u,.16*u,.16*u,'#8a6a1a','#16121a',1);
  blade(c,u,1.0*u,(atk?0:.8)*u,2.75*u,(atk?-.25:.5)*u,.13*u,.38*u,'#e0e4ec',true);
  hHead(c,u,'#d8b088');sm(c,[[.7*u,0],[.2*u,-1.1*u],[-.5*u,-.75*u],[-.7*u,0],[-.5*u,.75*u],[.2*u,1.1*u]],true);c.fillStyle='#14182a';c.fill();c.strokeStyle='#d8b24a';c.lineWidth=Math.max(1.5,u*.1);c.stroke();
  c.strokeStyle='#f4f0e4';c.lineWidth=Math.max(1.5,u*.14);c.beginPath();c.moveTo(.1*u,-.6*u);c.bezierCurveTo(-.5*u,-1.4*u,-1.2*u,-1.0*u,-1.1*u,-.4*u);c.stroke();c.strokeStyle='#c82a2a';c.lineWidth=Math.max(1,u*.08);c.beginPath();c.moveTo(.1*u,-.6*u);c.bezierCurveTo(-.4*u,-1.3*u,-1.1*u,-.95*u,-1.0*u,-.4*u);c.stroke()};
HUM.katniss=(c,u,atk,t)=>{ // villageoise des bois : longs cheveux, silhouette fine, jupe de cuir, arc en bandoulière puis tenu en main
  const sw=Math.sin(t*5)*.12*u;
  // longs cheveux au vent derrière et sur les épaules
  for(let i=0;i<9;i++){const yy=(i-4)*.2*u;c.strokeStyle=i%2?'#3a2412':'#4a2e18';c.lineWidth=Math.max(2,u*.22);c.lineCap='round';c.beginPath();c.moveTo(-.1*u,yy*.5);c.quadraticCurveTo(-1.0*u,yy*1.3+sw*(i-4)*.25,-1.9*u,yy*1.7+sw)} 
  for(let i=0;i<9;i++){const yy=(i-4)*.2*u;c.strokeStyle=i%2?'#3a2412':'#4a2e18';c.lineWidth=Math.max(2,u*.22);c.lineCap='round';c.beginPath();c.moveTo(-.1*u,yy*.5);c.quadraticCurveTo(-1.0*u,yy*1.3+sw*(i-4)*.25,-1.9*u,yy*1.7+sw);c.stroke()}
  // jupe de cuir qui s'évase derrière la taille, torse fin, épaules étroites
  sm(c,[[-.1*u,-.7*u],[-.9*u,-1.0*u],[-1.15*u,0],[-.9*u,1.0*u],[-.1*u,.7*u]],true);c.fillStyle='#4a5a30';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);c.stroke();
  ell(c,-.05*u,0,.5*u,.85*u,'#5a6a3a',0,'#16121a',Math.max(1,u*.08));ell(c,-.05*u,0,.36*u,.5*u,'#6a7a44');line(c,.28*u,-.45*u,.28*u,.45*u,'#3a2a14',Math.max(2,u*.14));
  if(!atk){c.strokeStyle='#5a3a1a';c.lineWidth=Math.max(2,u*.16);c.beginPath();c.moveTo(.35*u,-.85*u);c.quadraticCurveTo(-.95*u,0,.25*u,.85*u);c.stroke();line(c,.35*u,-.85*u,.25*u,.85*u,'#d8d0c0',Math.max(.8,u*.05));hArm(c,u,-1,.55,-.5,'#5a6a3a');hArm(c,u,1,.5,.5,'#5a6a3a')}
  else{armTo(c,u,-1,1.3,-.45,'#5a6a3a');armTo(c,u,1,.5,.2,'#5a6a3a');bowHold(c,u,1.3*u,-.45*u,true,'#6a4a22',.5*u,.2*u)}
  hHead(c,u,'#e0b890',.1);sm(c,[[.58*u,0],[.3*u,-.5*u],[-.25*u,-.5*u],[-.4*u,0],[-.25*u,.5*u],[.3*u,.5*u]],true);c.fillStyle='#4a2e18';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.06);c.stroke();ell(c,.3*u,0,.22*u,.3*u,'#e0b890');
  for(let i=0;i<5;i++)ell(c,-.55*u+i*.02*u,(i-2)*.2*u,.12*u,.06*u,'#5a7a3a',(i-2)*.3)};
HUM.brume=(c,u,atk,t)=>{ // cape grise-bleue, brume qui la suit, arc tenu en main
  const w=Math.sin(t*5)*.25*u;for(let i=0;i<4;i++){c.globalAlpha=.28-i*.05;sm(c,[[-.3*u,-.9*u],[-1.6*u-i*.5*u,-1.1*u+w],[-2.6*u-i*.7*u,-.2*u],[-2.4*u-i*.6*u,.6*u-w],[-1.5*u-i*.4*u,1.1*u],[-.3*u,.9*u]],true);c.fillStyle='#bcd0e0';c.fill()}c.globalAlpha=1;
  c.fillStyle='#3a4a5a';c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);sm(c,[[.3*u,-.9*u],[-1.4*u,-1.0*u+w*.4],[-1.9*u,0],[-1.4*u,1.0*u-w*.4],[.3*u,.9*u]],true);c.fill();c.stroke();
  hBody(c,u,'#4a5a6a');armTo(c,u,-1,1.25,-.4,'#4a5a6a');armTo(c,u,1,.55,.45,'#4a5a6a');bowHold(c,u,1.25*u,-.4*u,atk,'#5a6a7a',.55*u,.2*u);
  sm(c,[[.95*u,0],[.35*u,-.62*u],[-.35*u,-.55*u],[-.55*u,0],[-.35*u,.55*u],[.35*u,.62*u]],true);c.fillStyle='#3a4a5a';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);c.stroke();ell(c,.4*u,0,.28*u,.3*u,'#16121a');glow(c,.5*u,-.1*u,.3*u,'#aef0ff',.8);glow(c,.5*u,.1*u,.3*u,'#aef0ff',.8)};
HUM.orc=(c,u,atk,t)=>{ // petit, trapu, oreilles collées à la tête, gros nez, défenses, lance à pointe de pierre
  hBody(c,u,'#6a8a4a');line(c,.3*u,-.7*u,-.3*u,.7*u,'#5a3a1a',Math.max(2,u*.2));hArm(c,u,-1,.85,-.9,'#6a8a4a','#6a8a4a');hArm(c,u,1,1.0,atk?.05:.75,'#6a8a4a','#6a8a4a');
  const hy=(atk?.05:.75)*u,ty=(atk?-.1:.35)*u;line(c,-.7*u,hy+.1*u,3.4*u,ty,'#6a4a2a',Math.max(2,u*.17));
  c.beginPath();c.moveTo(3.0*u,ty-.2*u);c.quadraticCurveTo(3.4*u,ty-.28*u,4.15*u,ty);c.quadraticCurveTo(3.4*u,ty+.28*u,3.0*u,ty+.2*u);c.closePath();c.fillStyle='#a8aab0';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.07);c.stroke();line(c,3.05*u,ty,4.1*u,ty,'#ffffff88',Math.max(.8,u*.04));line(c,3.0*u,ty-.14*u,3.0*u,ty+.14*u,'#8a7a5a',Math.max(2,u*.14));
  // oreilles : leur base recouvre le bord de la tête
  for(const s of [-1,1]){c.beginPath();c.moveTo(.05*u,s*.28*u);c.lineTo(-.45*u,s*1.5*u);c.lineTo(.4*u,s*.5*u);c.closePath();c.fillStyle='#7a9a58';c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.07);c.stroke();c.beginPath();c.moveTo(.08*u,s*.34*u);c.lineTo(-.28*u,s*1.18*u);c.lineTo(.28*u,s*.5*u);c.closePath();c.fillStyle='#a8886a';c.fill()}
  hHead(c,u,'#7a9a58');ell(c,.7*u,0,.3*u,.24*u,'#6a8a4a',0,'#16121a',Math.max(1,u*.07));line(c,-.15*u,-.44*u,-.15*u,.44*u,'#8a2a2a',Math.max(2,u*.14));
  for(const s of [-1,1]){c.beginPath();c.moveTo(.6*u,s*.2*u);c.lineTo(.95*u,s*.3*u);c.lineTo(.62*u,s*.34*u);c.closePath();c.fillStyle='#f0ead8';c.fill()}ell(c,.45*u,-.18*u,.07*u,.07*u,'#ffd24a');ell(c,.45*u,.18*u,.07*u,.07*u,'#ffd24a')};
HUM.momie=(c,u,atk,t)=>{ // silhouette d'un seul tenant (bras et corps fusionnés), bandes qui flottent au vent
  const wv=(k)=>Math.sin(t*4+k*1.3)*.3*u;
  for(let i=0;i<7;i++){const y0=(i-3)*.28*u;c.strokeStyle=i%2?'#cdbf9a':'#b8aa86';c.lineWidth=Math.max(1.5,u*.2);c.lineCap='round';c.beginPath();c.moveTo(-.5*u,y0);c.bezierCurveTo(-1.4*u,y0+wv(i),-2.2*u-i*.1*u,y0-wv(i+2),-2.9*u-i*.12*u,y0*1.5+wv(i+4));c.stroke()}
  const reach=atk?2.0:1.75;
  sm(c,[[.6*u,-.55*u],[reach*u,-.5*u],[(reach+.25)*u,-.25*u],[(reach+.25)*u,.25*u],[reach*u,.5*u],[.6*u,.55*u],[.2*u,1.0*u],[-.5*u,.85*u],[-.65*u,0],[-.5*u,-.85*u],[.2*u,-1.0*u]],true);
  const g=c.createLinearGradient(0,-u,0,u);g.addColorStop(0,'#d8cba6');g.addColorStop(.5,'#cdbf9a');g.addColorStop(1,'#a89a76');c.fillStyle=g;c.fill();c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.08);c.stroke();
  c.save();sm(c,[[.6*u,-.55*u],[reach*u,-.5*u],[(reach+.25)*u,-.25*u],[(reach+.25)*u,.25*u],[reach*u,.5*u],[.6*u,.55*u],[.2*u,1.0*u],[-.5*u,.85*u],[-.65*u,0],[-.5*u,-.85*u],[.2*u,-1.0*u]],true);c.clip();c.strokeStyle='#8a7a58';c.lineWidth=Math.max(1,u*.07);for(let i=-8;i<=14;i++){c.beginPath();c.moveTo((i*.28-.9)*u,-1.1*u);c.lineTo((i*.28-.3)*u,1.1*u);c.stroke()}c.restore();
  c.strokeStyle='#16121a';c.lineWidth=Math.max(1,u*.06);c.beginPath();c.moveTo(.7*u,0);c.lineTo((reach+.2)*u,0);c.stroke();   // fente entre les deux bras
  hHead(c,u,'#cdbf9a');c.strokeStyle='#8a7a58';c.lineWidth=Math.max(1,u*.07);for(let i=0;i<5;i++){c.beginPath();c.arc(.12*u,0,(.5-i*.08)*u,i*1.2,i*1.2+3);c.stroke()}glow(c,.5*u,-.14*u,.22*u,'#aef060',.9);glow(c,.5*u,.14*u,.22*u,'#aef060',.9);
  if(atk){c.strokeStyle='#d8c08a99';c.lineWidth=Math.max(1.5,u*.14);for(let i=0;i<4;i++){c.beginPath();c.arc(2.9*u,0,(.5+i*.38)*u,t*5+i,t*5+i+2.4);c.stroke()}}};

/* golem de cristal : torse arrondi, épaules carrées incrustées de cristaux, gros poings, noyau lumineux */
function golemTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const atk=pose==='atk';ell(c,0,.6*u,1.9*u,1.3*u,'#0005');
  const rock=(pts,col,lw=1.8)=>{sm(c,pts,true);const g=c.createLinearGradient(0,-u,0,u);g.addColorStop(0,sh(col,.22));g.addColorStop(1,sh(col,-.3));c.fillStyle=g;c.fill();c.strokeStyle='#14182a';c.lineWidth=Math.max(1.5,u*.07*lw/1.8);c.stroke()};
  const cry=(cx,cy,sz,rot)=>{c.save();c.translate(cx,cy);c.rotate(rot);glow(c,0,0,sz*1.6,'#5ae8ff',.5);c.beginPath();c.moveTo(0,-sz*1.5);c.lineTo(sz*.62,-sz*.3);c.lineTo(sz*.5,sz*.8);c.lineTo(-sz*.5,sz*.8);c.lineTo(-sz*.62,-sz*.3);c.closePath();c.fillStyle='#7af0ff';c.fill();c.strokeStyle='#1a6a8a';c.lineWidth=Math.max(1,u*.05);c.stroke();c.beginPath();c.moveTo(0,-sz*1.5);c.lineTo(sz*.15,sz*.7);c.strokeStyle='#e8ffff';c.stroke();c.restore()};
  for(const s of [-1,1]){const ax=atk?1.8:1.3; // bras épais jusqu'au gros poing
    rock([[.0*u,s*.9*u],[.9*u,s*.85*u],[(ax)*u,s*.8*u],[(ax+.2)*u,s*1.2*u],[(ax-.2)*u,s*1.55*u],[.7*u,s*1.5*u],[-.1*u,s*1.35*u]],'#5a6a8a');
    rock([[(ax-.1)*u,s*.75*u],[(ax+.7)*u,s*.7*u],[(ax+.85)*u,s*1.15*u],[(ax+.5)*u,s*1.5*u],[(ax-.1)*u,s*1.35*u]],'#7a8aaa');
    // épaule carrée : bloc à angles vifs
    c.beginPath();c.moveTo(-.55*u,s*.85*u);c.lineTo(.4*u,s*.8*u);c.lineTo(.5*u,s*1.7*u);c.lineTo(-.6*u,s*1.75*u);c.closePath();const g=c.createLinearGradient(0,s*.8*u,0,s*1.75*u);g.addColorStop(0,'#8a9ab8');g.addColorStop(1,'#4a5878');c.fillStyle=g;c.fill();c.strokeStyle='#14182a';c.lineWidth=Math.max(1.5,u*.08);c.stroke();
    cry(-.1*u,s*1.25*u,.36*u,s*.25);cry(.2*u,s*1.55*u,.24*u,s*.7);cry(-.4*u,s*1.5*u,.22*u,-s*.3)}
  rock([[1.0*u,0],[.8*u,-.85*u],[-.2*u,-1.05*u],[-1.0*u,-.8*u],[-1.25*u,0],[-1.0*u,.8*u],[-.2*u,1.05*u],[.8*u,.85*u]],'#6a7a9a',2.2);                  // torse arrondi
  c.strokeStyle='#14182a99';c.lineWidth=Math.max(1,u*.06);c.beginPath();c.moveTo(-.9*u,-.5*u);c.lineTo(-.3*u,-.2*u);c.lineTo(-.4*u,.5*u);c.moveTo(.5*u,-.6*u);c.lineTo(.2*u,-.1*u);c.stroke();
  for(let i=0;i<4;i++)cry(-1.0*u+i*.05*u,(i-1.5)*.4*u,.26*u-i%2*.06*u,Math.PI/2+(i-1.5)*.18);
  rock([[.95*u,-.38*u],[1.3*u,-.3*u],[1.4*u,0],[1.3*u,.3*u],[.95*u,.38*u],[.7*u,0]],'#7a8aaa',2);line(c,1.15*u,-.18*u,1.15*u,.18*u,'#5ae8ff',Math.max(2,u*.14));glow(c,1.15*u,0,.4*u,'#5ae8ff',.9);
  glow(c,-.1*u,0,.6*u,'#5ae8ff',atk?.85:.4);c.restore()}

/* golem de pierre : construit en blocs taillés (plaques du torse, bras en piles de blocs, tête-bloc), runes et mousse */
function gardienTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f);const atk=pose==='atk';ell(c,0,.6*u,2.0*u,1.5*u,'#0005');
  const block=(x0,y0,w,h,col,ch=.18)=>{c.beginPath();c.moveTo(x0+ch*w,y0);c.lineTo(x0+w-ch*w,y0);c.lineTo(x0+w,y0+ch*h);c.lineTo(x0+w,y0+h-ch*h);c.lineTo(x0+w-ch*w,y0+h);c.lineTo(x0+ch*w,y0+h);c.lineTo(x0,y0+h-ch*h);c.lineTo(x0,y0+ch*h);c.closePath();const g=c.createLinearGradient(x0,y0,x0,y0+h);g.addColorStop(0,sh(col,.2));g.addColorStop(1,sh(col,-.25));c.fillStyle=g;c.fill();c.strokeStyle='#14141a';c.lineWidth=Math.max(1.5,u*.07);c.stroke();c.strokeStyle='#ffffff22';c.lineWidth=Math.max(1,u*.04);c.beginPath();c.moveTo(x0+.1*w,y0+.18*h);c.lineTo(x0+.9*w,y0+.18*h);c.stroke()};
  const moss=(x0,y0,w,h)=>{const rr=seeded(Math.round(x0*7+y0*13));for(let i=0;i<4;i++)ell(c,x0+rr()*w,y0+(rr()<.5?0:h),.2*u+rr()*.2*u,.1*u,'#4a6a3a99',rr()*3)};
  for(const s of [-1,1]){const ex=atk?1.0:.6;   // bras : trois blocs empilés puis poing énorme
    block(-.4*u,s*.9*u-.35*u,.9*u,.7*u,'#7a7a84');block(.4*u,s*1.05*u-.4*u,.9*u,.8*u,'#84848e');block((1.2+ex*.4)*u,s*1.15*u-.55*u,1.0*u,1.1*u,'#8e8e98');moss(.4*u,s*1.05*u-.4*u,.9*u,.8*u);
    block(-.7*u,s*1.0*u-.55*u,.8*u,1.1*u,'#6a6a74')}                // épaule
  block(-1.15*u,-.95*u,2.3*u,.7*u,'#6a6a74');block(-1.3*u,-.3*u,2.6*u,.6*u,'#74747e');block(-1.15*u,.25*u,2.3*u,.7*u,'#6a6a74');block(-.2*u,-.7*u,1.3*u,1.4*u,'#80808a',.14);   // plaques du torse
  c.strokeStyle='#ffb347';c.lineWidth=Math.max(1.5,u*.08);c.lineCap='round';glow(c,-.5*u,0,.6*u,'#ffb347',.35);for(const [a,b,cc,d] of [[-1.0,-.5,-.4,-.5],[-.9,0,-.3,0],[-1.0,.5,-.4,.5]]){c.beginPath();c.moveTo(a*u,b*u);c.lineTo(cc*u,d*u);c.stroke()}
  block(.85*u,-.5*u,.85*u,1.0*u,'#8a8a94',.2);moss(.85*u,-.5*u,.85*u,1.0*u);                                             // tête-bloc
  ell(c,1.45*u,0,.3*u,.3*u,'#1a1410',0,'#14141a',Math.max(1,u*.06));glow(c,1.45*u,0,.55*u,'#ffb347',.9);ell(c,1.45*u,0,.15*u,.15*u,'#ffd27a');
  c.restore()}

/* ombre : elle se dandine en se déplaçant, comme un fantôme */
function ombreTop(c,x,y,r,f,pose,t=0){const u=r;c.save();c.translate(x,y);c.rotate(f+Math.sin(t*5)*.14);c.translate(0,Math.sin(t*5)*.18*u);const atk=pose==='atk',w=Math.sin(t*6)*.3*u;
  for(let i=0;i<5;i++){c.globalAlpha=.55-i*.09;c.fillStyle=i%2?'#3a2a5a':'#2a1c44';c.beginPath();c.moveTo(-.2*u,-.8*u+i*.3*u);c.bezierCurveTo(-1.2*u,(-1.2+i*.5)*u+w,-2.0*u-i*.3*u,(-.5+i*.3)*u,-2.8*u-i*.5*u,(-.2+i*.1)*u+w*1.3);c.bezierCurveTo(-2.0*u,(.6-i*.1)*u,-1.2*u,(1.1-i*.4)*u-w,-.2*u,(.8-i*.3)*u);c.closePath();c.fill()}c.globalAlpha=1;
  sm(c,[[.9*u,0],[.4*u,-.8*u],[-.7*u,-.95*u],[-1.1*u,0],[-.7*u,.95*u],[.4*u,.8*u]],true);const g=c.createLinearGradient(-u,0,u,0);g.addColorStop(0,'#1a1228');g.addColorStop(1,'#3a2a5a');c.fillStyle=g;c.fill();c.strokeStyle='#0a0612';c.lineWidth=Math.max(1,u*.08);c.stroke();
  for(const s of [-1,1]){c.strokeStyle='#241a38';c.lineWidth=Math.max(2,u*.3);c.lineCap='round';c.beginPath();c.moveTo(0,s*.8*u);c.lineTo((atk?1.5:1.0)*u,s*(atk?.3:.7)*u);c.stroke();line(c,(atk?1.5:1.0)*u,s*(atk?.3:.7)*u,(atk?2.5:1.9)*u,s*(atk?.1:.55)*u,'#cfc0f0',Math.max(1.5,u*.1))}
  glow(c,.55*u,0,.7*u,'#c9a2ff',.5);for(const s of [-1,1]){ell(c,.55*u,s*.2*u,.13*u,.07*u,'#e8d8ff');glow(c,.55*u,s*.2*u,.3*u,'#c9a2ff',.8)}c.restore()}
/* ---------- registre des fiches (portrait + rendu en jeu) ---------- */
const FICHES=[];function fiche(o){FICHES.push(o)}
const SC={cs:'#16121a'};
const wolfP={cendre:{seed:3,fur:'#7a7480',line:'#17141c',eye:'#ffcf4a',ash:1},neige:{seed:8,fur:'#dfe8ef',line:'#2a3440',eye:'#9fe8ff',snow:1}};
fiche({g:'g-betes',id:'loup-c',ext:3.2,cls:'',t:'Loup cendré',sub:'Clairière du Saule · Bois de Saule',r:13,top:(c,x,y,r,f,p,t)=>oldWolfTop(c,x,y,r,f,p,t,'#5a5560'),tags:['chg'],pts:['<b>Le design d\'origine</b>, repris tel quel (le chien errant est supprimé : le loup est le seul canidé commun).','Bond lent qui se corrige vers toi, morsure sur toi seul.']});
fiche({g:'g-betes',id:'loup-n',ext:3.2,cls:'snow',t:'Loup des neiges',sub:'Monts du Givre et au-delà',r:13,top:(c,x,y,r,f,p,t)=>oldWolfTop(c,x,y,r,f,p,t,'#dfe8ef'),tags:['chg'],pts:['Design d\'origine en blanc givré.']});
fiche({g:'g-betes',id:'chef-c',ext:3.4,cls:'',t:'Chef de meute',sub:'Les meutes : un par meute',r:15,draw:c=>loup(c,520,380,wolfP.cendre),top:(c,x,y,r,f,p,t)=>loupTop(c,x,y,r,f,wolfP.cendre,p,t),tags:['new'],pts:['Le nouveau dessin du loup, réservé aux <b>chefs de meute</b> : plus grand, ventre creusé, côtes, crinière hérissée.']});
fiche({g:'g-betes',id:'chef-n',ext:3.4,cls:'snow',t:'Chef de meute des neiges',sub:'Meutes des monts',r:15,draw:c=>loup(c,520,380,wolfP.neige),top:(c,x,y,r,f,p,t)=>loupTop(c,x,y,r,f,wolfP.neige,p,t),tags:['new'],pts:['Même chef, pelage blanc givré.']});
fiche({g:'g-betes',id:'chauve',ext:2.6,cls:'',t:'Chauve-souris',sub:'Grottes et falaises',r:11,draw:chauve,top:chauveTop,
  tags:['chg'],pts:['<b>Ailes de chauve-souris</b> à doigts allongés et membrane festonnée, oreilles géantes, feuille nasale, <b>crocs</b>, yeux rouges.']});
fiche({g:'g-betes',id:'griffon',ext:4.2,cls:'sand',t:'Griffon des cimes',sub:'Montagnes',r:22,top:griffonTop,
  tags:['chg'],pts:['<b>Plus gros</b> (rayon 22, ailes ouvertes sur plus de 5× son rayon) : tête d\'aigle à bec crochu, collerette blanche, corps de lion, queue à touffe, grandes plumes.']});
fiche({g:'g-bugs',id:'crapaud',cls:'swamp',t:'Crapaud géant',sub:'Grand marais',r:15,top:crapaudTop,tags:['chg'],pts:['Le design du gros plan est déjà dans l\'atelier ; ici sa version dessus : pattes arrière repliées, verrues, yeux dorés, <b>langue</b> en attaque.']});
fiche({g:'g-bugs',id:'ver',ext:3.2,cls:'',t:'Ver de terre géant',sub:'Grand marais',r:22,draw:ver,top:verTop,tags:['chg'],pts:['<b>Un vrai ver</b> : corps annelé, clitellum clair, gueule circulaire à anneaux de dents. Il avance sous terre (monticule) et jaillit.']});
fiche({g:'g-bugs',id:'libellule',cls:'swamp',t:'Libellule faucheuse',sub:'Marais et rivières',r:11,draw:libellule,top:(c,x,y,r,f,p,t)=>fitDraw(c,x,y,r*1.1,f,libellule,300),tags:['chg'],pts:['<b>Quatre ailes nervurées</b>, yeux composés, thorax, long abdomen annelé, pattes-faux.']});
fiche({g:'g-bugs',id:'anguille',ext:3.6,cls:'sea',t:'Anguille à lanterne',sub:'Rivières, près des ponts',r:14,draw:anguille,top:anguilleTop,tags:['chg'],pts:['<b>Une anguille</b> : corps sinueux, nageoires en ruban, mâchoire saillante, lanterne de leurre. <b>Éclairs</b> en attaque, pas de flèches.']});
fiche({g:'g-desert',id:'scorpion',cls:'sand',t:'Scorpion géant',sub:'Désert et rive de sable',r:16,draw:scorpion,top:(c,x,y,r,f,p,t)=>fitDraw(c,x,y,r*1.2,f,scorpion,320),tags:['chg'],pts:['<b>Un vrai scorpion</b> : carapace, <b>3 paires de pattes</b>, vraies pinces à deux doigts, queue enroulée au-dessus du dos et dard venimeux.']});
fiche({g:'g-desert',id:'momie',ext:3.2,cls:'sand',t:'Momie',sub:'Désert (remplace l\'esprit du désert)',r:16,top:humanTop('momie'),tags:['new'],pts:['Silhouette <b>d\'un seul tenant</b> (bras fondus dans le corps), <b>bandes qui flottent au vent</b> derrière elle (animées), avance lentement comme un zombie.','<b>S\'arrête pour créer des bourrasques de sable</b> (les arcs autour d\'elle en attaque).']});
fiche({g:'g-desert',id:'guerrier',ext:3.2,cls:'sand',t:'Guerrier du désert',sub:'Désert',r:15,top:humanTop('guerrier'),tags:['chg'],pts:['Turban, voile, gilet de cuir, <b>cimeterre peu courbé, tourné vers l\'extérieur</b>, rondache de bronze.','Capacité : <b>embuscade</b> — il surgit du sol à un endroit précis quand tu passes (piège).']});
fiche({g:'g-mont',id:'golem',ext:4.4,cls:'snow',t:'Golem de cristal',sub:'Grotte et montagnes',r:24,top:golemTop,tags:['chg'],pts:['Torse <b>arrondi</b>, seules les <b>épaules sont carrées</b> et incrustées de cristaux ; gros poings, noyau lumineux.','Très lent, énormément de PV, il <b>frappe le sol</b> : la canalisation te <b>tire vers lui</b> ; murs et pics de cristal.']});
fiche({g:'g-mont',id:'gardien',ext:4.4,cls:'snow',t:'Gardien du Mont Solitaire',sub:'Mont Solitaire (secret)',r:30,top:gardienTop,tags:['chg'],pts:['<b>Golem de pierre construit</b> : blocs taillés empilés (épaules, bras, plaques du torse), joints visibles, mousse, runes ambrées, un seul œil. Plus gros et plus ancien que le golem de cristal.']});
fiche({g:'g-mont',id:'ombre',ext:3.6,cls:'royal',t:'Ombre',sub:'Forêts sombres et grottes',r:14,top:ombreTop,tags:['chg'],pts:['Cape de fumée violette qui se défait, <b>se dandine en avançant comme un fantôme</b>, <b>deux dagues</b>, yeux violets lumineux : plus classe et moins banale.']});
fiche({g:'g-hum',id:'garde',cls:'royal',t:'Garde du roi',sub:'Ville et château',r:15,top:humanTop('garde'),tags:['chg'],pts:['<b>Armure rouge intégrale</b> : heaume fermé à plumet, grosses épaulières dorées, épée et grand bouclier.']});
fiche({g:'g-hum',id:'hallebardier',ext:4.0,cls:'royal',t:'Hallebardier du roi',sub:'Ville et château',r:15,top:humanTop('hallebardier'),tags:['chg'],pts:['Mailles, tabard rouge, <b>salade à crête</b>, longue hallebarde.']});
fiche({g:'g-hum',id:'archer',ext:3.4,cls:'royal',t:'Archer du roi',sub:'Remparts et ville',r:15,top:humanTop('archer'),tags:['chg'],pts:['Casque ouvert à nasal, capuche rouge sombre, carquois ; <b>arc tenu en main</b> (corde au repos, tendue en attaque).']});
fiche({g:'g-hum',id:'pirate',ext:3.2,cls:'sea',t:'Pirate',sub:'Plage',r:15,top:humanTop('pirate'),tags:['chg'],pts:['<b>Tricorne à tête de mort</b>, bandana, chemise rayée, ceinture rouge, <b>sabre d\'abordage</b> large, peu courbé, tourné vers l\'extérieur.','Décor prévu : épave de bateau dans leur camp.']});
fiche({g:'g-hum',id:'capitaine',ext:3.8,cls:'sea',t:'Capitaine pirate',sub:'Plage',r:16,top:humanTop('capitaine'),tags:['chg'],pts:['Long manteau bleu à galons d\'or, <b>bicorne à plume</b>, <b>crochet à la main gauche</b>, sabre large courbé vers l\'extérieur.']});
fiche({g:'g-hum',id:'orc',cls:'',t:'Garde orque',sub:'Clan des Pins',r:13,top:humanTop('orc'),tags:['chg'],pts:['<b>Petit et trapu</b>, grandes oreilles pointues, gros nez, défenses, pagne de feuilles, <b>oreilles attachées à la tête</b>, <b>longue lance à pointe de pierre</b>.']});
fiche({g:'g-hum',id:'katniss',cls:'swamp',t:'Katniss',sub:'Fin-de-Route',r:15,top:humanTop('katniss'),tags:['chg'],pts:['Villageoise des bois : <b>longs cheveux</b>, silhouette plus féminine, jupe de cuir ; arc en bandoulière au repos, <b>bien tenu en main</b> en attaque.']});
fiche({g:'g-hum',id:'brume',ext:3.6,cls:'swamp',t:'Archère des brumes',sub:'Brumes',r:14,top:humanTop('brume'),tags:['chg'],pts:['Cape grise-bleue, <b>brume qui la suit</b>, beaucoup plus rapide ; arc tenu en main.']});
fiche({g:'g-hum',id:'roi',ext:3.2,cls:'royal',t:'Le roi',sub:'Château',r:15,top:humanTop('roi'),tags:['chg'],pts:['<b>Sans épée</b> : robe de pourpre, collerette d\'hermine, couronne ; il lève les mains et tremble.']});
const NOTES=[
 '<b>Supprimés</b> : chien errant, Éteint, esprit du désert (remplacé par la momie), noyé, « l\'ancien étant » (je comprends : l\'Éteint).',
 '<b>Taille</b> : héros, gardes, pirates et villageois adultes à la même taille ; enfants plus petits (tuer un enfant coûte plus d\'honneur).',
 '<b>Pas encore redessinés</b> : yeti (tu le gardes), ours, sanglier, boss.',
 '<b>Références</b> : planches de monstres et de créatures de la collection OpenGameArt (loups, scorpions, golems, gobelins, libellule, momie…) regardées pour les proportions et silhouettes ; dessins refaits à la main, aucune image copiée.'];
function render(){for(const f of FICHES){const host=document.getElementById(f.g);const el=document.createElement('article');el.className='card '+(f.cls||'');
  el.innerHTML=(f.draw?'<canvas class="pt" width="520" height="380"></canvas>':'')+`<header><h3>${f.t}</h3><span>${f.sub}</span></header><div>${(f.tags||[]).map(t=>`<span class="tag ${t}">${t==='new'?'nouveau':'redessiné'}</span>`).join('')}</div><div class="game"><div><canvas class="big" width="340" height="200"></canvas><small>Rendu en jeu ×4, au repos</small></div><div><canvas class="atk" width="340" height="200"></canvas><small>Rendu en jeu ×4, en attaque</small></div><div><canvas class="real" width="120" height="90"></canvas><small>Taille réelle</small></div></div><ul>${f.pts.map(p=>`<li>${p}</li>`).join('')}</ul>`;
  host.appendChild(el);f._el=el;if(f.draw){const cv=el.querySelector('.pt');try{f.draw(cv.getContext('2d'),cv)}catch(e){console.error(f.id,e)}}}
  document.getElementById('notes').innerHTML=NOTES.map(n=>`<li>${n}</li>`).join('')}
function frame(){const t=performance.now()/1000;for(const f of FICHES){const e=f._el,ext=f.ext||2.9,K=Math.max(.8,Math.min(4,125/(f.r*ext)));
  const paint=(sel,k,pose,mx)=>{const cv=e.querySelector(sel),c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);const r=f.r*k,cy=cv.height*.55;
    try{f.top(c,cv.width*mx,cy,r,0,pose,t)}catch(er){console.error(f.id,er)}heroTop(c,cv.width*(sel==='.real'?.2:.15),cy,16*k,0)};
  paint('.big',K,'idle',.62);paint('.atk',K,'atk',.62);paint('.real',1,'idle',.66)}
  requestAnimationFrame(frame)}
render();frame();
