// Matières de l'atelier. Toutes les coordonnées sont celles du monde, comme les collisions.
const SpellArt = (() => {
  const tau = Math.PI * 2;
  const unit = n => Math.max(0, Math.min(1, n));
  const clampFade = (t, duration, tail) => unit((duration - t) / tail);
  const paintings = new Map();
  function random(seed) {
    let state = seed >>> 0;
    return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
  }
  function disc(c, x, y, rx, ry, color) {
    c.fillStyle = color;
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, tau); c.fill();
  }
  function shape(c, points) {
    c.beginPath(); c.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) c.lineTo(...points[i]);
    c.closePath();
  }
  function face(c, color, ...points) { shape(c, points); c.fillStyle = color; c.fill(); }
  function cloudlet(c,x,y,r,color) {
    const g=c.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,color); g.addColorStop(1,'transparent');
    disc(c,x,y,r,r,g);
  }
  function painted(key, size, paint) {
    if (!paintings.has(key)) {
      const layer = document.createElement('canvas'); layer.width = layer.height = size;
      const ctx = layer.getContext('2d'); ctx.translate(size/2,size/2);
      paint(ctx); paintings.set(key,layer);
    }
    return paintings.get(key);
  }
  function roughRadius(a) {
    return .90+.047*Math.sin(3*a+.5)+.032*Math.cos(5*a)+.021*Math.sin(9*a-1);
  }
  function outline(c,r) {
    c.beginPath();
    for(let i=0;i<96;i++){const a=i*tau/96,d=r*roughRadius(a);
      if(i)c.lineTo(Math.cos(a)*d,Math.sin(a)*d);else c.moveTo(Math.cos(a)*d,Math.sin(a)*d);}
    c.closePath();
  }
  function sandBed(c) {
    const rand=random(443);
    // Plage meuble, rebord friable et grains groupés par petits amas.
    outline(c,147); c.clip();
    const wash=c.createRadialGradient(-24,-15,8,0,0,148);
    wash.addColorStop(0,'#88704e'); wash.addColorStop(.52,'#b99a64'); wash.addColorStop(.82,'#c9ac78'); wash.addColorStop(1,'#ba9b6a00');
    c.fillStyle=wash; c.fillRect(-150,-150,300,300);
    for (let j=0;j<50;j++) {
      const x=rand()*290-145,y=rand()*290-145;
      cloudlet(c,x,y,9+rand()*21,j%3?'#dec89c50':'#71563865');
    }
    const colors=['#6f543d88','#ecd39cad','#dec18c99','#a582537a'];
    for(let j=0;j<4700;j++){const x=rand()*300-150,y=rand()*300-150;
      c.fillStyle=colors[j%4]; c.fillRect(x,y,.5+rand()*1.9,.55+rand()*.9);}
  }
  function sand(c,z,actors) {
    c.globalAlpha*=unit(z.t/.18)*clampFade(z.t,z.dur,.5);
    c.drawImage(painted('sand',300,sandBed),-z.r,-z.r,z.r*2,z.r*2);
    const sinks=[[0,0,26],[-.48,.18,14],[.43,-.34,17]];
    for(const e of actors){if(Math.hypot(e.x-z.x,e.y-z.y)<z.r*.90)
      sinks.push([(e.x-z.x)/z.r,(e.y-z.y+e.r*.5)/z.r,e.r*1.1]);}
    for(const [u,v,r] of sinks){
      const x=u*z.r,y=v*z.r; c.save();c.translate(x,y);c.scale(1,.53);
      cloudlet(c,0,0,r*1.45,'#5b422995');
      // Le versant éclairé glisse dans un creux dont le rebord opposé reste dans l'ombre.
      for(let j=0;j<3;j++){
        const a=.35+Math.sin(j+z.t*.45)*.13,rad=r*(.44+j*.23);
        c.beginPath();c.ellipse(0,0,rad,rad*.81,-.15,a,a+2.5);
        c.ellipse(-1,1,rad*.91,rad*.74,-.15,a+2.5,a,true);c.closePath();
        c.fillStyle=j%2?'#dabb824d':'#76563665';c.fill();
      }
      for(let i=0;i<30;i++){const t=(i*.351+z.t*.58)%1,a=i*2.4+t*.9,d=r*(1.38-t);
        disc(c,Math.cos(a)*d,Math.sin(a)*d,1.5,1.3,i%3?'#e2c48c':'#8a6943');}
      c.restore();
    }
  }
  function root(c,x,y,length,width,angle,bend,growth) {
    c.save();c.translate(x,y);c.rotate(angle);c.scale(growth,growth);
    const w=width,l=length,b=bend;
    const bark=c.createLinearGradient(0,-w,0,w);
    bark.addColorStop(0,'#c49866');bark.addColorStop(.32,'#94623e');bark.addColorStop(.75,'#643d2b');bark.addColorStop(1,'#392b21');
    c.fillStyle=bark;c.beginPath();c.moveTo(0,-w*.65);
    c.bezierCurveTo(l*.24,-w*1.35+b,l*.39,b-w*.55,l*.56,b*.32-w*.44);
    c.quadraticCurveTo(l*.83,-b-w*.25,l,0);
    c.bezierCurveTo(l*.76,-b*.69,l*.66,b*.5+w*.2,l*.48,b*.59+w*.57);
    c.quadraticCurveTo(l*.22,b+w*.76,0,w*.68);c.closePath();c.fill();
    c.strokeStyle='#d8af7b99';c.lineWidth=Math.max(.7,w*.16);c.beginPath();c.moveTo(l*.05,-w*.47);
    c.quadraticCurveTo(l*.25,b-w*.53,l*.48,b*.48-w*.31);c.stroke();
    if(w>2.4){
      root(c,l*.43,b*.57,l*.42,w*.41,-.55,b*.36,1);
      root(c,l*.7,-b*.24,l*.29,w*.30,.70,-b*.3,1);
    }
    c.restore();
  }
  function rootPatch(c,z) {
    const grow=unit(z.t/.36),rand=random(407);
    c.globalAlpha*=clampFade(z.t,z.dur,.36);
    for(let j=0;j<11;j++){
      const a=j*2.4,reach=z.r*(.45+rand()*.43);
      const x=Math.cos(a)*reach*.35,y=Math.sin(a)*reach*.35;
      disc(c,x,y,9*grow,4*grow,'#59452e9c');
      root(c,x,y,reach*.71,3+rand()*2.4,a,(rand()-.5)*36,grow);
    }
  }
  function shackles(c,r,t) {
    const grow=unit(t/.22);
    for(const side of [-1,1]){
      const x=side*r*.76,y=r*.8;
      disc(c,x,y+2,7,3,'#352e23a8');
      root(c,x+side*4,y+1,r*1.32,r*.27,side<0?-.75:-2.38,side*5,grow);
      root(c,x*.76,y+3,r*.82,r*.17,side<0?-1.40:-1.84,side*5,grow);
      const toss=Math.sin(Math.PI*unit(t/.31));
      for(let j=0;j<3;j++)disc(c,x+side*(6+j*4),y-toss*(7+j*3),2.4-j*.35,1.5,'#8c7256');
    }
  }
  function shard(c,x,y,w,h,lean,ice) {
    if(h<.4)return;
    c.save();c.translate(x,y);
    disc(c,w*.32,2,w*1.27,w*.39,'#14171b5c');
    const tip=[lean,-h],ridge=[-w*.14,-h*.54],heel=[w*.13,3];
    face(c,ice?'#68b5d9':'#776b5b',[-w,0],[-w*.72,-h*.34],tip,ridge,heel);
    face(c,ice?'#ccf5fe':'#baa68a',[-w*.72,-h*.34],tip,ridge,[-w*.40,-h*.19]);
    face(c,ice?'#397ba6':'#524d49',heel,ridge,tip,[w*.73,-h*.25],[w,0]);
    face(c,ice?'#92d9f0':'#988974',heel,[w*.24,-h*.33],[w*.73,-h*.25],[w,0]);
    face(c,ice?'#e8ffff':'#d1bea1',tip,[lean*.74-w*.16,-h*.73],[lean*.73-w*.24,-h*.69]);
    c.restore();
  }
  function rubble(c,x,y,n,t,ice=false) {
    for(let i=0;i<n;i++){const a=i*2.4,d=(9+(i*7)%22)*unit(t*4);
      const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.6;
      const lift=Math.sin(Math.PI*unit(t*2.5))*(8+(i*15)%19);
      face(c,ice?'#95cbd7':'#998770',[px-2.8,py-lift+1],[px-1,py-lift-3],[px+3.1,py-lift],[px+1,py-lift+2]);}
  }
  function rocks(c,z) {
    const rand=random(929),points=[];
    for(let j=0;j<15;j++){
      const a=j*2.4,d=z.r*Math.sqrt(j/16)*(.79+.15*rand());
      points.push({x:Math.cos(a)*d,y:Math.sin(a)*d,w:8+rand()*8,h:23+rand()*27,lean:(rand()-.5)*24,delay:d/z.r*.14});
    }
    c.globalAlpha*=clampFade(z.t,z.dur,.35);
    points.sort((a,b)=>a.y-b.y);
    for(const p of points){const age=z.t-p.delay;if(age<=0)continue;
      const rise=1-(1-unit(age/.17))**3;
      shard(c,p.x,p.y,p.w,p.h*rise,p.lean*rise,false);
      if(age<.6)rubble(c,p.x,p.y,4,age);}
  }
  // Cellules jointives : les éclats gardent la texture exacte du sol dont ils proviennent.
  function fracture(c,z) {
    const r=z.r;
    if(!z.plates){
      const rand=random(7751),centres=[[0,0]],rim=[];
      for(let j=0;j<32;j++){const a=j*2.399+.22*rand(),d=r*Math.sqrt((j+.55)/32)*(.86+.12*rand());
        centres.push([Math.cos(a)*d,Math.sin(a)*d]);}
      for(let i=0;i<16;i++){const a=i*tau/16,d=r*(.9+.08*rand());rim.push([Math.cos(a)*d,Math.sin(a)*d]);}
      z.plates=centres.map(([x,y],index)=>{
        let poly=rim;
        for(const [nx,ny] of centres){const dx=nx-x,dy=ny-y;if(!dx&&!dy)continue;
          const cut=(dx*(nx+x)+dy*(ny+y))/2,out=[];
          for(let i=0;i<poly.length;i++){
            const v=poly[i],w=poly[(i+1)%poly.length],a=v[0]*dx+v[1]*dy-cut,b=w[0]*dx+w[1]*dy-cut;
            if(a<=0)out.push(v);
            if((a<=0)!==(b<=0)){const t=a/(a-b);out.push([v[0]+(w[0]-v[0])*t,v[1]+(w[1]-v[1])*t]);}
          }poly=out;
        }
        const chipped=[];
        for(let i=0;i<poly.length;i++){
          const first=poly[i],next=poly[(i+1)%poly.length];chipped.push(first);
          const a=first[0]<next[0]?first:next,b=a===first?next:first;
          const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
          if(len<14)continue;
          const seed=Math.round(a[0]*2)*719+Math.round(a[1]*2)*41+Math.round(b[0]*2);
          const jitter=random(seed),mid=.40+.20*jitter(),offset=(jitter()-.5)*Math.min(len*.25,11);
          chipped.push([a[0]+dx*mid-dy/len*offset,a[1]+dy*mid+dx/len*offset]);
        }
        return {poly:chipped,x,y,d:Math.hypot(x,y)/r,tone:rand(),index};
      });
      const size=Math.ceil(r*2+4),layer=document.createElement('canvas');
      layer.width=layer.height=size;
      const copy=layer.getContext('2d'),m=c.getTransform().inverse();
      copy.translate(size/2,size/2);copy.transform(m.a,m.b,m.c,m.d,m.e,m.f);copy.drawImage(c.canvas,0,0);z.surface=layer;
    }
    c.globalAlpha*=clampFade(z.t,z.dur,.58);
    for(const p of z.plates){
      const age=z.t-p.d*.23;if(age<=0)continue;
      const open=unit(age/.12)*(1-.38*unit((age-.48)/.31)),lift=(4+10*p.tone)*(1-.42*p.d)*open*(1+.45*Math.sin(Math.PI*unit(age/.35)));
      // Ramener à zéro le déplacement sur le bord raccorde la fracture au sol intact.
      const breaks=p.poly.map(([x,y])=>unit((r*.86-Math.hypot(x,y))/(r*.23)));
      shape(c,p.poly);c.fillStyle='#292622';c.fill();
      const points=p.poly.map(([x,y],i)=>[
        x+(p.x-x)*.18*open*breaks[i],
        y+((p.y-y)*.18*open-lift*.52)*breaks[i]
      ]);
      c.save();
      for(let i=0;i<points.length;i++){const v=points[i],w=points[(i+1)%points.length];
        if(w[0]<v[0])face(c,p.tone>.5?'#705e4a':'#514738',v,w,[w[0],w[1]+lift*breaks[(i+1)%points.length]],[v[0],v[1]+lift*breaks[i]]);}
      c.save();shape(c,points);c.clip();
      const displacement=unit((.84-p.d)/.38)*open;
      c.drawImage(z.surface,-z.surface.width/2+p.x*.016*displacement,-z.surface.height/2-lift*.44*displacement);
      c.globalAlpha*=displacement;
      c.fillStyle=p.index%3?'#d6c5a12c':'#42382c44';c.fillRect(-r,-r,2*r,2*r);c.restore();
      c.globalAlpha*=unit((.88-p.d)/.31);c.lineWidth=1.4;c.strokeStyle='#dbceb26e';c.beginPath();c.moveTo(...points[0]);c.lineTo(...points[1]);c.stroke();c.restore();
      if(age<.40&&p.index%3===0)rubble(c,p.x,p.y,4,age);
    }
  }
  function lava(c,z) {
    c.rotate(z.cone.a);const r=z.r,t=z.t;
    // Courants voisins avec des fronts arrondis et une croûte refroidie sur les rives.
    const lavaBed=painted('lava',600,ctx=>{
      const rand=random(3405);
      // Une nappe continue lie les bras de lave ; les chenaux émergent de la même roche fondue.
      ctx.beginPath();ctx.moveTo(0,0);
      ctx.bezierCurveTo(91,-23,178,-85,235,-102);ctx.bezierCurveTo(267,-108,257,-68,248,-51);
      ctx.bezierCurveTo(236,-25,275,-39,258,-14);ctx.bezierCurveTo(248,6,275,20,247,42);
      ctx.bezierCurveTo(226,57,262,79,239,91);ctx.bezierCurveTo(209,100,192,78,158,66);
      ctx.quadraticCurveTo(58,19,0,4);ctx.closePath();ctx.fillStyle='#853a29';ctx.fill();
      for(let band=0;band<5;band++){
        const s=band-2,end=247+Math.cos(s*1.9)*18,dy=Math.tan(s*.17)*end;
        ctx.beginPath();ctx.moveTo(2,0);
        ctx.bezierCurveTo(53,s*12-8,155,dy*.64-26,end-17,dy-18);
        ctx.bezierCurveTo(end+13,dy-17,end+8,dy+11,end-4,dy+17);
        ctx.bezierCurveTo(end-31,dy+24,110,dy*.44+12,2,4);ctx.closePath();
        ctx.fillStyle='#5c2c25';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#4a3029';ctx.stroke();
        ctx.save();ctx.clip();
        const g=ctx.createLinearGradient(0,0,end,dy);g.addColorStop(0,'#ffbb43');g.addColorStop(.48,'#ff7a20');g.addColorStop(.89,'#e4491c');g.addColorStop(1,'#9e3a27');
        ctx.fillStyle=g;ctx.fillRect(0,-150,290,300);
        for(let j=0;j<95;j++){const x=rand()*280,y=dy*x/end+(rand()-.5)*48,sz=3+rand()*11;
          face(ctx,j%3?'#523a36':'#875043',[x-sz,y],[x-sz*.36,y-sz*.48],[x+sz*.62,y-sz*.26],[x+sz,y+1],[x+sz*.16,y+sz*.46]);
          face(ctx,'#ba4a24',[x-sz,y],[x+sz*.16,y+sz*.46],[x+sz*.55,y+sz*.26],[x,y+sz*.20]);}
        ctx.restore();
      }
      // Îlots qui traversent plusieurs veines : écorce basaltique, arêtes rouges et cœur sombre.
      for(let i=0;i<38;i++){
        const x=38+rand()*193,spread=x*.31,y=(rand()-.5)*2*spread,rx=4+rand()*9,ry=rx*(.38+rand()*.36);
        const corners=[];
        for(let j=0;j<7;j++){const a=j*tau/7,size=.64+rand()*.42;corners.push([x+Math.cos(a)*rx*size,y+Math.sin(a)*ry*size]);}
        face(ctx,'#ab4025',...corners);ctx.save();ctx.translate(-.6,-1.4);face(ctx,'#4d3531',...corners);ctx.restore();
        face(ctx,'#71504a',corners[0],corners[1],[x-1,y-1],corners[6]);
      }
    });
    const front=.06+.94*(1-(1-unit(t/.44))**2);
    c.globalAlpha*=clampFade(t,z.dur,.64);c.scale(front*r/270,front*r/270);
    c.drawImage(lavaBed,-300,-300);
    for(let j=0;j<21;j++){const u=(j*.381+t*(.19+j%3*.04))%1,x=22+u*219,y=Math.tan((j%5-2)*.17)*x+Math.sin(4*u+j)*4;
      c.save();c.translate(x,y);c.rotate((j%5-2)*.18);
      disc(c,0,0,3+4*Math.sin(u*Math.PI),1.35,'#ffd669');c.restore();}
  }
  function smoke(c,z,front) {
    const t=z.t,r=z.r,alpha=unit(t/.35)*clampFade(t,z.dur,.95);
    const puff=painted('soot',96,ctx=>{
      const rand=random(164);
      for(let j=0;j<17;j++){const a=j*2.4,d=rand()*23;
        cloudlet(ctx,Math.cos(a)*d,Math.sin(a)*d,16+rand()*12,j%3?'#373b3ff0':'#5f625ff2');}
      for(let j=0;j<6;j++)cloudlet(ctx,rand()*28-20,rand()*19-20,12+rand()*9,'#bbb8aa66');
    });
    for(let j=front?13:0;j<(front?26:13);j++){const a=j*2.399+t*(j%2?.13:-.11),d=r*Math.sqrt((j%13+.25)/13)*.82;
      const wave=Math.sin(t*1.85+j),sz=r*(.55+.15*Math.cos(j*4.15)+.10*wave)*(.53+.47*unit(t/.6));
      const x=Math.cos(a)*d+wave*6,y=Math.sin(a)*d*.87-6-4*Math.sin(t*2+j);
      c.save();c.globalAlpha*=alpha*(front?.72:.88);c.translate(x,y);c.rotate(Math.sin(j+t*.6)*.42);
      c.drawImage(puff,-sz,-sz*.88,sz*2,sz*1.76);c.restore();}
  }
  const meteorPixels=[
    '    111      ','   1222211   ','  123332221  ',' 12235533221 ',
    '1223444533321','1233442325331','1234232332431','1223334422431',
    ' 122554223321','  1232333321 ','   12233221  ','    112211   '];
  function meteor(c,z) {
    const u=unit(z.t/z.delay),left=1-u,flight=z.t<z.delay;
    if(flight){
      disc(c,0,3,8+22*u,3+8*u,'#19171366');
      c.translate(-238*left,-148*left-22*Math.sin(left*Math.PI));
      c.scale(.76+.24*u,.76+.24*u);
      for(let j=0;j<38;j++){const phase=(j*.183+z.t*2.2)%1,w=1-phase;
        const offset=Math.sin(j*5.43+phase*8)*12*w,x=-phase*102-offset*.46,y=-phase*64+offset;
        const s=2+9*w;c.fillStyle=['#ac3323','#ef5b24','#ff9d30','#ffd559'][j%4];c.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,s,s);}
      const palette=['','#672e27','#bf491e','#ff8a28','#403733','#ffe184'];
      for(let y=0;y<meteorPixels.length;y++)for(let x=0;x<meteorPixels[y].length;x++){
        const n=Number(meteorPixels[y][x]);if(n){c.fillStyle=palette[n];c.fillRect((x-6)*3.8,(y-6)*3.8,4,4);}}
    }else{
      const age=z.t-z.delay;
      c.globalAlpha*=clampFade(age,z.dur,.4);
      disc(c,0,2,46,19,'#322923ae');disc(c,-2,1,30,10,'#5f392bd9');
      for(let j=0;j<22;j++){const a=j*2.4,d=(24+j%6*12)*unit(age*5),x=Math.cos(a)*d,y=Math.sin(a)*d*.65;
        const s=2+(j%4),lift=Math.sin(Math.PI*unit(age/.53))*(8+j%6*5);
        c.fillStyle=j%3?'#814431':'#ffab47';c.fillRect(x,y-lift,s*1.4,s);}
      if(age<.28)cloudlet(c,0,0,21+130*age,'#ffd264a0');
    }
  }
  const prisonTravel=.76;
  function iceWall(c,z) {
    for(let row=0;row<3;row++){
      const age=z.t-row*prisonTravel/3;
      if(age<=0)continue;
      const grow=unit(age/.13),fade=clampFade(age,row===2?z.dur-2*prisonTravel/3:.53,.24);
      if(!fade)continue;
      const radius=z.r*[.92,.62,.27][row],n=[15,11,7][row];
      c.save();c.globalAlpha*=fade;
      for(let j=0;j<n;j++){const a=j*tau/n+row*.31,cs=Math.cos(a),sn=Math.sin(a);
        const x=cs*radius,y=sn*radius;
        shard(c,x,y,6+3*(.5+.5*Math.sin(4*j)),(19+9*(1-sn))*grow,-cs*15*grow,true);
        if(age<.4)rubble(c,x,y,2,age,true);}
      c.restore();
    }
  }
  function leaf(c,x,y,len,width,angle,top,bottom) {
    c.save();c.translate(x,y);c.rotate(angle);
    c.fillStyle=top;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*.38,-width,len,0);c.quadraticCurveTo(len*.48,width*.25,0,0);c.fill();
    c.fillStyle=bottom;c.beginPath();c.moveTo(0,0);c.lineTo(len,0);c.quadraticCurveTo(len*.46,width,0,0);c.fill();
    c.restore();
  }
  function flame(c,x,y,h,t) {
    const sway=Math.sin(t*7+x*.07)*.18;
    c.save();c.translate(x,y);c.scale(h,h);
    for(const [w,tip,color] of [[.48,1,'#aa4028'],[.34,.84,'#f16c26'],[.19,.56,'#ffca55']]){
      c.fillStyle=color;c.beginPath();c.moveTo(-w,0);
      c.bezierCurveTo(-w*1.25,-.31,-w*.1,-tip*.46,sway,-tip);
      c.bezierCurveTo(w*.29,-tip*.69,w*1.63,-.19,w,0);
      c.quadraticCurveTo(0,.26,-w,0);c.fill();
    }
    c.restore();
  }
  function waterDrop(c,x,y,len,angle) {
    c.save();c.translate(x,y);c.rotate(angle);
    leaf(c,-len*.45,0,len,len*.40,0,'#9fd5dc','#43859d');
    disc(c,len*.04,-len*.07,len*.20,len*.048,'#e3f7ed');c.restore();
  }
  function eddies(c,r,t,count) {
    for(let j=0;j<count;j++){
      const u=(t*1.6+j*.381)%1,a=j*2.4+u*.74,d=r*(.24+.67*u);
      const x=Math.cos(a)*d,y=Math.sin(a)*d*.80;
      leaf(c,x,y-14*Math.sin(Math.PI*u),6+j%5,2+j%3,a+1.2+u*4,'#bdad7d','#706c47');
    }
  }
  function wave(c,z) {
    const k=unit(z.t/z.dur),swell=Math.sin(Math.PI*unit(k*1.3));
    const front=z.r*(.18+.8*(1-(1-k)**2)),angle=z.angle;
    c.rotate(angle);c.globalAlpha*=clampFade(z.t,z.dur,.18);
    // Le ventre et la lèvre partagent les mêmes crêtes. La lèvre retombe devant la nappe.
    for(let layer=0;layer<3;layer++){
      const outer=[],inner=[];
      for(let i=0;i<=34;i++){
        const v=i/34,a=(v-.5)*2.17,edge=Math.sin(v*Math.PI);
        const rip=Math.sin(19*v+z.t*11)*3+Math.sin(43*v-z.t*8)*2;
        const depth=(layer===0?41:layer===1?22:6)*edge*(.45+.55*swell);
        const rr=front+rip-(layer===0?8:0);
        const h=(layer===0?0:layer===1?10:13)*edge*swell;
        outer.push([Math.cos(a)*rr,Math.sin(a)*rr-h]);
        inner.unshift([Math.cos(a)*(rr-depth),Math.sin(a)*(rr-depth)-h-depth*.19]);
      }
      shape(c,outer.concat(inner));c.fillStyle=['#22576dcb','#478fa1ef','#d0eeea'][layer];c.fill();
    }
    for(let i=0;i<48;i++){
      const u=i/47,a=(u-.5)*2.1,edge=Math.sin(Math.PI*u);
      const trough=front-(5+(i%5)*4)*edge,roll=.54+.46*Math.cos(u*41+z.t*13);
      c.save();c.translate(Math.cos(a)*trough,Math.sin(a)*trough-edge*swell*10);
      c.rotate(a+Math.PI/2);disc(c,0,0,2.4+roll*3.5,1+roll,i%4?'#a5d8d5cc':'#4c8796');c.restore();
    }
    for(let j=0;j<31;j++){const a=(j/30-.5)*2.07,d=front-3+Math.sin(j*6.7)*6;
      const air=Math.sin(k*Math.PI)*(7+j%11);
      waterDrop(c,Math.cos(a)*d,Math.sin(a)*d-air,2+j%5,a-.65);}
  }
  function squall(c,z) {
    const k=unit(z.t/z.dur),advance=1-(1-k)**2;
    c.globalAlpha*=clampFade(z.t,z.dur,.24);
    for(let j=0;j<27;j++){
      const a=j*2.4+.34*advance,d=z.r*(.12+(.56+(j%4)*.085)*advance);
      const x=Math.cos(a)*d,y=Math.sin(a)*d,hop=Math.sin(Math.PI*k)*(9+j%8);
      disc(c,x+2,y+3,3.1,1.35,'#19252651');
      leaf(c,x,y-hop,6+j%6,2+j%3,a+k*5,'#cab988','#7c784e');
      if(j%3===0)cloudlet(c,x-4,y+2,10+j%9,'#c5b09860');
    }
  }
  function rain(c,z) {
    const time=z.t;
    c.globalAlpha*=clampFade(time,z.dur,.28);
    const rand=random(377);
    for(let i=0;i<27;i++){
      const a=rand()*tau,d=z.r*Math.sqrt(rand())*.93,phase=(time*(1.3+rand()*.32)+rand())%1;
      const x=Math.cos(a)*d,y=Math.sin(a)*d;
      if(phase<.65){
        const fall=1-phase/.65,px=x-fall*29,py=y-fall*71;
        c.save();c.translate(px,py);c.rotate(1.19);
        face(c,'#347b9dc9',[-24,0],[-6,-2.6],[7,0],[-8,2.2]);
        face(c,'#c2ebed',[-18,-.4],[-5,-1.7],[7,0]);c.restore();
      }else{
        const splash=(phase-.65)/.35;
        disc(c,x,y,2+splash*9,1+splash*3,'#629db15e');
        for(let side of [-1,1])waterDrop(c,x+side*splash*7,y-Math.sin(splash*Math.PI)*5,3.7,side*.67);
      }
    }
  }
  function funnel(c,z,front) {
    const fade=unit(z.t/.24)*clampFade(z.t,z.dur,.4),r=z.r;
    c.globalAlpha*=fade;
    if(!front){disc(c,0,5,r*.81,r*.32,'#28312c69');cloudlet(c,0,0,r*.37,'#c8b493a9');}
    const dust=painted('vortexDust',96,ctx=>{
      const rand=random(513);
      for(let j=0;j<35;j++){
        const a=rand()*tau,d=rand()*24;
        cloudlet(ctx,Math.cos(a)*d,Math.sin(a)*d,10+rand()*16,j%3?'#9d9e8fbf':'#576b6bba');
      }
      for(let j=0;j<6;j++)cloudlet(ctx,rand()*25-19,rand()*20-21,10+rand()*10,'#e3d4b580');
    });
    // Les volutes passent derrière et devant les acteurs qui traversent l'entonnoir.
    for(let j=0;j<32;j++){
      const h=(z.t*.38+j/32)%1,theta=z.t*5.9+j*2.4,depth=Math.sin(theta);
      if((depth>0)!==front)continue;
      const radius=r*(.06+.65*h),sz=r*(.19+.31*h);
      const x=Math.cos(theta)*radius+Math.sin(h*5+z.t*2)*8*h;
      const y=-r*h+depth*radius*.27;
      c.save();c.globalAlpha*=Math.min(1,h*13,(1-h)*11)*.88;
      c.translate(x,y);c.rotate(Math.sin(theta)*.29);
      c.drawImage(dust,-sz,-sz*.61,sz*2,sz*1.22);c.restore();
    }
    // Hélices pleines qui se chevauchent ; leur largeur augmente depuis le pied jusqu'à la bouche.
    for(let band=0;band<5;band++){
      const outer=[],inner=[];
      for(let j=0;j<=28;j++){
        const u=j/28,h=(band+u)/5,a=u*Math.PI+(front?0:Math.PI);
        const radius=r*(.10+.74*h**.8),twist=z.t*5+h*9;
        const x=Math.cos(a)*radius+Math.sin(twist)*6*h;
        const y=-r*.99*h+Math.sin(a)*radius*.23;
        outer.push([x,y]);inner.unshift([x*.95,y+3+h*5]);
      }
      shape(c,outer.concat(inner));c.fillStyle=(front?['#8a968c65','#c3c5aa78','#94aaa45c']:['#636f6944','#b7ad8f45','#8aa6a250'])[band%3];c.fill();
    }
    for(let j=0;j<21;j++){
      const h=(z.t*.60+j*.137)%1,a=z.t*6+j*2.4+h*5;
      if((Math.sin(a)>0)!==front)continue;
      const rr=r*(.19+.72*h);
      leaf(c,Math.cos(a)*rr,-r*h+Math.sin(a)*rr*.26,5+j%7,2+j%4,a+.7,'#c7aa79','#716f4d');
    }
  }
  function fireball(c,r,t) {
    cloudlet(c,-r*.25,0,r*2.1,'#ff9a2c72');
    c.save();c.rotate(-Math.PI/2);
    for(let j=0;j<5;j++){
      const w=Math.sin(j*2.8+t*19);
      flame(c,(j-2)*r*.34,r*.27,r*(2+(j%3)*.57+w*.35),t+j*.57);
    }c.restore();
    face(c,'#743a2d',[r*1.15,0],[r*.69,-r*.83],[-r*.23,-r],[-r*.76,-r*.46],[-r*.68,r*.59],[r*.12,r*.94],[r*.88,r*.60]);
    face(c,'#ff9741',[r*.96,-r*.02],[r*.52,-r*.67],[-r*.24,-r*.75],[-r*.36,-r*.18],[r*.27,-r*.35]);
    face(c,'#e86327',[r*.85,r*.27],[r*.23,r*.04],[-r*.18,r*.42],[r*.11,r*.79]);
    face(c,'#ffc958',[-r*.73,-r*.32],[-r*.21,-r*.09],[r*.02,r*.3],[-r*.39,r*.07],[-r*.56,r*.36]);
  }
  function arrow(c,id,heavy) {
    const l=id==='G3'?44:id==='R2'?40:34,w=id==='G3'||heavy?7.4:id==='R2'?5:5.7;
    const iron=id==='G3'?'#9e9584':'#bcc9c7',fletch=id==='R2'?'#427c82':id==='G3'?'#96533d':'#a57d3e';
    face(c,'#68503c',[-l,-1.8],[0,-1.7],[0,1.7],[-l,1.6]);
    face(c,'#d4b586',[-l,-1.4],[0,-1.25],[-1,-.15],[-l,-.40]);
    for(const side of [-1,1]){
      face(c,fletch,[-l+1,0],[-l-3,side*5],[-l+6,side*5],[-l+15,0]);
      face(c,'#dfc599',[-l+5,side*3],[-l+6,side*4.4],[-l+12,side*.4]);
    }
    const tip=id==='R2'?22:15,back=id==='F2'?-8:-3;
    face(c,iron,[tip,0],[back,-w],[0,-1.6],[-1,1.6],[back,w]);
    face(c,'#5b686b',[tip,0],[back,w],[-1,0]);
    for(let i=0;i<(heavy||id==='G3'?4:2);i++){c.fillStyle='#b48a50';c.fillRect(-3-i*3,-2.25,1.3,4.5);}
    if(id==='F2')leaf(c,-l-14,0,13,2.1,0,'#dac6899a','#ac926348');
  }
  function projectile(c,b,t) {
    const r=b.r,angle=Math.atan2(b.vy,b.vx);
    c.save();c.translate(b.x,b.y);c.rotate(angle);
    if(b.arrow){arrow(c,b.spellId,b.heavyShot);}
    else if(b.el==='feu'||b.fire){fireball(c,r*1.35,t);}
    else if(b.el==='glace'){
      face(c,'#6bafc9',[r*3.5,0],[-r,-r],[-r*1.7,-r*.28],[-r*1.2,r*.91]);
      face(c,'#d8f5f3',[r*3.5,0],[-r,-r],[-r*.36,-r*.18]);
      face(c,'#3c789e',[r*3.5,0],[-r*.36,-r*.18],[-r*1.2,r*.91]);
      for(let j=0;j<5;j++){const u=(t*2+j*.21)%1;
        face(c,'#a9dce3a0',[-r*(1+3*u),r*Math.sin(j*4)*u],[-r*(1.7+3*u),-3-r*Math.cos(j)*u],[-r*(1.4+3*u),1]);}
    }else if(b.spellId==='S4'){
      leaf(c,-r*4,0,r*4.65,r*.89,.03,'#382b43aa','#70546cb0');
      face(c,'#40384f',[-r,-r*.43],[0,-r*.88],[r*2.5,-r*.38],[r*3.3,r*.08],[r*.22,r*.38],[-r,.19*r]);
      face(c,'#c3afc6',[r*3.3,r*.08],[r*2.3,r*.17],[r*.16,r*.57],[-r*.73,r*.25],[r*.30,0]);
      face(c,'#8c718f',[-r*1.25,-r*.68],[-r*.75,-r*.40],[-r*.91,r*.88],[-r*1.14,r*.70]);
    }else if(b.el==='air'){
      for(let j=0;j<5;j++){
        const theta=t*13+j*tau/5;
        const y=Math.sin(theta)*r*.64;
        c.fillStyle=j%2?'#cbe4d49c':'#76a79c9c';c.beginPath();c.moveTo(r*1.4,y*.16);
        c.bezierCurveTo(r*.7,y-r*.87,-r*1.4,y-r*.47,-r*(2.6+j*.3),y);
        c.quadraticCurveTo(-r*.7,y-r*.02,r*1.4,y*.16);c.fill();
        leaf(c,-r*.8+j*3,y,6,2.3,theta,'#d0bc8c','#81754c');
      }
    }else{
      // Pierre, éclat d'eau ou noyau arcanique : deux faces et un biseau éclairé.
      const tint=b.col||'#a58cbd';
      face(c,tint,[r*1.5,0],[0,-r],[-r*1.4,-r*.4],[-r,r*.63],[r*.32,r*.74]);
      face(c,'#edf5e5aa',[r*1.5,0],[-r*.03,-r*.85],[-r*.67,-r*.32],[r*.27,-r*.31]);
      face(c,'#2531416b',[r*1.5,0],[-r,r*.63],[r*.32,r*.74]);
    }
    if(b.from==='e'){c.fillStyle='#c05c46';c.beginPath();c.arc(0,0,r*1.22,1.9,4.2);c.lineWidth=2;c.strokeStyle='#d47759';c.stroke();}
    c.restore();
  }
  function bloom(c,f,p) {
    const g=unit(f.t/.48),s=1-(1-g)**2,x=f.x-17,y=f.y+16;
    c.save();c.translate(x,y);c.scale(s,s);
    disc(c,0,1,12,4,'#2d38277c');
    c.strokeStyle='#57704e';c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-4,-12,2,-20);c.stroke();
    leaf(c,-1,-7,13,5,-.38,'#94ac65','#467455');leaf(c,0,-4,14,5,-2.75,'#779759','#3c6146');
    for(let j=0;j<7;j++){const a=j*tau/7+Math.sin(f.t*2)*.09;
      leaf(c,2,-20,6+6*s,5.3,a,'#e3aaa6','#b77587');}
    disc(c,2,-20,3.5,3,'#e7c479');c.restore();
    for(let i=0;i<7;i++){const u=(f.t*.72+i/7)%1;
      disc(c,x+(p.x-x)*u+Math.sin(u*tau+i)*4,y-20+(p.y-y+15)*u-Math.sin(Math.PI*u)*14,1.8,.95,'#e2ca8f');}
  }
  function shield(c,r,t,hit) {
    for(let j=0;j<5;j++){
      const a=j*tau/5+t*.43,x=Math.cos(a)*r,y=Math.sin(a)*r*.6;
      c.save();c.translate(x,y);c.scale(.48+.47*Math.abs(Math.sin(a)),1);
      const pts=[[-8,-8],[0,-11],[8,-8],[7,1],[0,9],[-7,1]];
      face(c,'#7d6645',...pts);face(c,hit>.4?'#fff2b7':'#c8a765',[-6,-7],[0,-9],[0,6],[-5,0]);
      face(c,'#7e765e',[0,-9],[6,-7],[5,.5],[0,6]);disc(c,0,-2,2,2,'#f9dc96');c.restore();
    }
  }
  function rift(c,x,y,k,scale,angle) {
    c.save();c.translate(x,y);c.rotate(angle-.22);c.scale(Math.sin(Math.PI*k)*scale,scale);
    face(c,'#a695ba',[-2,-28],[7,-11],[1,1],[6,11],[-4,29],[-9,6],[-5,-6],[-9,-16]);
    face(c,'#212231',[-2,-24],[5,-11],[-1,1],[3,12],[-4,24],[-6,6],[-4,-6],[-6,-13]);
    face(c,'#665777',[-2,-21],[-3,-8],[0,-4],[-1,2],[3,-10]);
    for(let i=0;i<5;i++){const a=i*2.4,x=Math.cos(a)*(10+k*15),y=Math.sin(a)*23;
      face(c,'#c6b9d1',[x,y-3],[x+3,y],[x-1,y+2]);}c.restore();
  }
  function clockwork(c,r,t,lock) {
    // Balancier de la magie temporelle. L'arrêt immobilise aussi les grains entre les deux fioles.
    const a=lock?0:Math.sin(t*3.2)*.36;
    c.save();c.rotate(a);c.translate(0,-r);
    face(c,'#a28657',[-6,-8],[6,-8],[6,-6],[-6,-6]);face(c,'#ac9061',[-6,6],[6,6],[6,8],[-6,8]);
    face(c,'#a8cdcc99',[-4.5,-6],[4.5,-6],[1,-.2],[4.5,6],[-4.5,6],[-1,-.2]);
    face(c,'#eccd82',[-3,-4],[3,-4],[0,-.5]);face(c,'#d8b971',[-3,5],[0,3],[3,5]);disc(c,0,lock?1:1+(t*6%2),.8,1,'#f6dc9f');c.restore();
  }
  function timeDust(c,r,t,lock) {
    const phase=lock?.76:t*.32;
    for(let j=0;j<8;j++){
      const a=j*2.4+phase,d=r*(1.2+.30*Math.sin(j*7));
      const x=Math.cos(a)*d,y=Math.sin(a)*d*.84-3;
      face(c,j%2?'#b89a68':'#e8d4a2',[x-2,y],[x,y-2.7],[x+2.4,y-.1],[x,y+1.3]);
    }
  }
  function burst(c,r,t,k) {
    const advance=1-(1-k)**2;
    const plume=painted('combustion',108,ctx=>{
      const rand=random(157);
      for(let i=0;i<30;i++){
        const a=rand()*tau,d=rand()*28;
        cloudlet(ctx,Math.cos(a)*d,Math.sin(a)*d,12+rand()*13,i%3?'#5b4742c7':'#834d37cf');
      }
      for(let i=0;i<25;i++){
        const a=rand()*tau,d=rand()*21;
        cloudlet(ctx,Math.cos(a)*d,Math.sin(a)*d+3,5+rand()*13,i%3?'#ed6928d1':'#ffb74bdf');
      }
      cloudlet(ctx,0,4,12,'#ffe2a1e6');
    });
    cloudlet(c,0,0,r*(.30+.65*advance),'#f791394a');
    for(let j=0;j<19;j++){
      const a=j*2.4,d=r*(.08+advance*(.16+(j%5)*.15));
      const x=Math.cos(a)*d,y=Math.sin(a)*d*.70-r*.19*advance;
      const size=r*(.18+(j%4)*.065)*(.45+advance);
      c.save();c.translate(x,y);c.rotate(Math.sin(j*6)*.74+k*.53);
      c.drawImage(plume,-size,-size,size*2,size*2);c.restore();
      const dx=Math.cos(a)*r*advance*(.58+j%5*.095),dy=Math.sin(a)*r*advance*.72-23*Math.sin(Math.PI*k);
      face(c,j%3?'#b66133':'#efb96c',[dx-2,dy],[dx,dy-4],[dx+3,dy+1],[dx,dy+2]);
    }
    if(k<.26)cloudlet(c,0,-3,r*.47*(1-k),'#ffe3a4b0');
  }
  function motion(c,f,p,now) {
    const k=unit(f.t/f.dur),id=f.id,t=f.t,follow=['C6','P2','P4','F4','S3'].includes(id);
    const x=follow?p.x:f.x,y=follow?p.y:f.y;
    c.save();c.globalAlpha=clampFade(t,f.dur,Math.min(.28,f.dur*.32));c.translate(x,y);
    if(id==='D8'){bloom(c,{x:0,y:0,t}, {x:p.x-x,y:p.y-y});}
    if(id==='P4')shield(c,29,t,unit(1-(now-(p.shieldHit??-10))/.34));
    if(id==='P2'){
      for(let n=0;n<10;n++){const u=(t*.65+n/10)%1,a=n*2.4+t*.44,d=27*(1-u)+5;
        leaf(c,Math.cos(a)*d,Math.sin(a)*d*.66-u*17,7*(1-.32*u),3.6,a+u*2,'#c1d69a','#87a67c');}
    }
    if(id==='C6'){
      c.rotate(p.face);const pulse=unit(t/.38);
      if(t<.38){for(let j=0;j<11;j++){const a=(j/10-.5)*2.15,d=21+pulse*(27+j%3*7);
        cloudlet(c,Math.cos(a)*d,Math.sin(a)*d,5+j%3,'#d3bc8078');}}
      for(const side of [-1,1]){
        const sway=Math.sin(t*7)*3;
        face(c,'#80453a',[-3,side*9],[-14,side*12],[-27,side*(15+sway)],[-23,side*11],[-31,side*10],[-12,side*7]);
        face(c,'#cea369',[-7,side*9],[-15,side*11],[-21,side*11],[-14,side*8]);
      }
    }
    if(id==='F4'){
      c.rotate(p.face);c.translate(7,0);
      // Renforts de bronze ligaturés sur les deux branches de l'arc.
      for(const side of [-1,1])for(let i=0;i<3;i++){
        face(c,i===1?'#ead199':'#a5824c',[4,side*(7+i*2)],[8,side*(8+i*2)],[7,side*(10+i*2)],[3.5,side*(9+i*2)]);
      }
    }
    if(id==='S3'||id==='V2'){
      const px=id==='V2'?f.endX-x:0,py=id==='V2'?f.endY-y:0;
      for(let j=0;j<11;j++){const u=(id==='V2'?k:(t*.94+j*.27)%1),a=j*2.4,d=6+u*(12+j%5);
        const ox=id==='V2'&&j%2?px:0,oy=id==='V2'&&j%2?py:0;
        leaf(c,ox+Math.cos(a)*d,oy+Math.sin(a)*d*.67-u*7,12-u*6,5-u*2,a+.5,'#5a506689','#272b39b8');}
      if(id==='V2'){c.save();c.translate(px,py);c.rotate(f.angle+Math.PI);
        leaf(c,6,0,17+9*(1-k),3.4,-.3,'#e1d6dd','#70667f');c.restore();}
    }
    if(id==='SP'){rift(c,0,0,k,1,f.angle);rift(c,f.endX-x,f.endY-y,k,1.24,f.angle);}
    if(id==='TM2'||id==='TM4'){
      const lock=id==='TM4';clockwork(c,29,t,lock&&t>.17);
      if(t<.48){for(let j=0;j<13;j++){const a=j*2.4,d=15+t*(160+j%3*55);
        disc(c,Math.cos(a)*d,Math.sin(a)*d*.8,2,1.2,'#d1b68b');}}
    }
    if(id==='DS2')burst(c,f.a||180,t,k);
    c.restore();
  }
  function potion(c,f,k) {
    const colors={AL2:'#e07644',AL3:'#8db78a',AL4:'#977b9e',AL5:'#aad6c9',XP1:'#796a8d',XP2:'#ddbf7f'};
    const tint=colors[f.id],drink=f.id==='AL3'||f.id.startsWith('XP');
    c.save();c.translate(f.x,f.y);c.globalAlpha=clampFade(f.t,f.dur,.36);
    if(drink){
      c.save();c.translate(11,-10);c.rotate(-.95*unit(k*5));
      face(c,'#b8d2cd',[-3,-10],[3,-10],[3,-6],[6,-2],[5,4],[-4,5],[-6,1],[-3,-5]);
      face(c,tint,[-4,0],[4,-1],[4,3],[-3,4]);c.restore();
      for(let j=0;j<8;j++){const a=j*2.4,u=(k+j/8)%1;leaf(c,Math.cos(a)*14,8-u*32,4,2,a+u,tint,'#c0c7ad');}
    }else{
      if(f.id==='AL2')burst(c,f.a,f.t,k);
      else for(let j=0;j<17;j++){
        const a=j*2.4,d=f.a*(.12+.75*unit(k*3))*(.65+j%4*.10);
        const x=Math.cos(a)*d,y=Math.sin(a)*d;
        disc(c,x,y,4+(j%4)*2,2+j%3,tint+'8a');
        disc(c,x-1,y-3-8*Math.sin(k*Math.PI),1.6,2.2,'#c9dccd');
      }
      for(let j=0;j<7;j++){const a=j*2.4,x=Math.cos(a)*k*22,y=Math.sin(a)*k*21-16*Math.sin(Math.PI*k);
        face(c,'#bfd6ca',[x-3,y],[x+2,y-3],[x+1,y+2]);}
    }c.restore();
  }
  function channel(c,id,p,k) {
    const t=k*1.7,fire=id==='MA4'||id==='DS2',ice=id==='GL6',earth=id==='TE8';
    c.save();c.translate(p.x,p.y);
    for(let j=0;j<9;j++){
      const a=j*2.4+(earth?0:t),d=14+(1-k)*20+j%3*3;
      const x=Math.cos(a)*d,y=Math.sin(a)*d*.70;
      if(earth){disc(c,x,y+2,3+j%3,1.6,'#24292572');shard(c,x,y-k*(2+j%4),2.5+j%2,4+k*4,j%2?2:-2,false);}
      else if(ice)shard(c,x,y,2.5,4+5*k,-Math.cos(a)*3,true);
      else if(fire)flame(c,x,y,3+k*(id==='DS2'?17:9),t+j);
      else waterDrop(c,x,y-k*6,3+k*5,a);
    }c.restore();
  }
  function sparks(c,f,k) {
    const metal=f.element==='rng'||f.element==='mel',colour=metal?'#eac392':'#d7c2a5';
    c.save();c.translate(f.x,f.y);c.rotate(f.angle||0);
    for(let i=0;i<7;i++){
      const a=(i/6-.5)*2.9+.2*Math.sin(i),d=f.a*(.12+(1-(1-k)**2)*(.56+i%3*.28));
      const x=Math.cos(a)*d,y=Math.sin(a)*d+4*k*k;
      leaf(c,x,y,3+(1-k)*(i%3+4),1.5,a,colour,i%2?'#94735b':'#b49a7b');
    }c.restore();
  }
  function impact(c,f,k) {
    const el=f.element,advance=1-(1-k)**2;
    c.save();c.translate(f.x,f.y);c.rotate(f.angle||0);
    for(let j=0;j<9;j++){
      const a=(j/8-.5)*3.2+.17*Math.sin(j*6.7),d=f.a*(.19+advance*(1+j%4*.27));
      const x=Math.cos(a)*d,y=Math.sin(a)*d+9*k*k;
      if(el==='feu')flame(c,x,y,3+(1-k)*(6+j%5),f.t+j);
      else if(el==='eau')waterDrop(c,x,y,3+4*(1-k),a);
      else if(el==='glace'||el==='terre')shard(c,x,y,2+j%2,3+(1-k)*6,Math.cos(a)*4,el==='glace');
      else if(el==='foudre'){
        face(c,'#ead999',[x-2,y],[x+2,y-5],[x+1,y-1],[x+4,y-1],[x-2,y+4]);
      }else if(el==='poison'){disc(c,x,y,3-k,3-k,'#a484afa8');disc(c,x-.6,y-.8,1,.75,'#dfccdb');}
      else leaf(c,x,y,3+(1-k)*6,2.3,a+k*3,'#d2c49b','#8c9372');
    }
    c.restore();
  }
  function hazard(c,z) {
    const t=z.t,armed=t>=z.delay,alpha=armed?clampFade(t-z.delay,z.dur,.45):.22+.48*unit(t/z.delay);
    c.globalAlpha*=alpha;
    if(z.spell==='mist'){
      smoke(c,z,false);return;
    }
    const frost=z.spell==='frost';
    const surface=painted(frost?'rime':'embers',140,ctx=>{
      const rand=random(frost?81:64);outline(ctx,65);ctx.clip();
      cloudlet(ctx,0,0,66,frost?'#92c2d1cf':'#c35329');
      for(let j=0;j<102;j++){const x=(rand()-.5)*134,y=(rand()-.5)*134,w=3+rand()*11;
        if(frost)leaf(ctx,x,y,w,2+rand()*2,rand()*tau,'#d6e9e4aa','#7aa4b3a0');
        else face(ctx,j%3?'#563d35':'#ea782e',[x-w,y],[x,y-w*.4],[x+w*.6,y+1],[x+1,y+w*.4]);}
    });
    c.drawImage(surface,-z.r,-z.r,z.r*2,z.r*2);
    if(armed&&!frost)for(let j=0;j<4;j++){const a=j*2.4;flame(c,Math.cos(a)*z.r*.42,Math.sin(a)*z.r*.4,6+2*Math.sin(t*4+j),t+j);}
  }
  function omen(c,g) {
    if(!['rock','shadow','crack','rift'].includes(g.vis))return false;
    const k=unit(g.t/g.delay),after=unit((g.t-g.delay)/g.show);
    c.save();c.translate(g.x,g.y);
    if(g.vis==='rift'){
      c.rotate(g.a);const w=g.w*(g.done?.49:.05+.15*k),l=g.len;
      face(c,'#9c7eab',[-1,0],[l*.25,-w*.62],[l*.41,-w*.35],[l*.74,-w*.78],[l,0],[l*.68,w],[l*.34,w*.46]);
      face(c,'#362c45',[0,0],[l*.32,-w*.34],[l*.73,-w*.53],[l,0],[l*.65,w*.70],[l*.29,w*.25]);
    }else if(!g.done){
      disc(c,0,0,g.r*(.33+.64*k),g.r*(.16+.32*k),'#302a305a');
      if(g.vis==='crack'){
        for(let j=0;j<5;j++){
          const a=j*2.4;c.save();c.rotate(a);
          face(c,'#443a31',[0,-1],[g.r*.4*k,-3],[g.r*.77*k,2],[g.r*k,0],[g.r*.72*k,4],[g.r*.38*k,0],[0,2]);c.restore();}
      }else{
        c.translate(-92*(1-k),-178*(1-k));c.rotate(k*.7);
        if(g.vis==='shadow')fireball(c,12,g.t);
        else{
          face(c,'#726556',[-15,-6],[-6,-16],[11,-12],[17,1],[8,13],[-9,11]);
          face(c,'#b0a18b',[-15,-6],[-6,-16],[11,-12],[4,-4],[-6,-2]);
          face(c,'#4a4840',[-9,11],[4,1],[17,1],[8,13]);
        }
      }
    }else if(g.vis==='crack'){
      c.globalAlpha*=1-after;
      for(let j=0;j<3;j++)shard(c,(j-1)*g.r*.42,(j%2)*5,7+j,16+(j%2)*13,(j-1)*7,g.col==='#e8f8ff');
      if(g.col==='#ff7a2a')flame(c,0,0,21*(1-after),g.t);
    }else{
      c.globalAlpha*=1-after;
      if(g.vis==='shadow')burst(c,g.r,g.t,after);
      else for(let j=0;j<7;j++){const a=j*2.4; rubble(c,Math.cos(a)*g.r*.48*after,Math.sin(a)*g.r*.48*after,4,after*.4);}
    }
    c.restore();return true;
  }

  const floorPaint={TE8:fracture,TE3:rocks,TE10:sand,D2:rootPatch,GL6:iceWall,MA4:meteor,
    MA7:lava,BR4:smoke,EA3:wave,EA10:rain,AI3:squall,AI8:funnel,frost:hazard,embers:hazard,mist:hazard};
  function draw(c,z,actors,front=false) {
    const paint=floorPaint[z.spell];
    if(!paint)return false;
    c.save();c.translate(z.x,z.y);
    if(paint===smoke||paint===funnel)paint(c,z,front);
    else if(!front)paint(c,z,actors);
    c.restore();return true;
  }
  return {draw,shackles,prisonTravel,has:id=>Object.hasOwn(floorPaint,id),
    projectile,motion,potion,impact,sparks,channel,omen,timeDust,shard,burst,eddies,flame};
})();
