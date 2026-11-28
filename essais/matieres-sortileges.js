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
  const floorPaint={TE8:fracture,TE3:rocks,TE10:sand,D2:rootPatch,GL6:iceWall,MA4:meteor,MA7:lava,BR4:smoke};
  function draw(c,z,actors,front=false) {
    const paint=floorPaint[z.spell];
    if(!paint)return false;
    if(!front||z.spell==='BR4'){
      c.save();c.translate(z.x,z.y);
      if(z.spell==='BR4')smoke(c,z,front);
      else paint(c,z,actors);
      c.restore();
    }
    return true;
  }
  return {draw,shackles,prisonTravel,has:id=>Object.hasOwn(floorPaint,id)};
})();
