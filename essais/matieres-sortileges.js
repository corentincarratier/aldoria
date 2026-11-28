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
  // Le vitrail reste ouvert entre les panneaux pour laisser voir le paladin et l'assaillant.
  function ward(c,t,p,now,front) {
    const deploy=1-(1-unit(t/.34))**3;
    const hit=unit(1-(now-(p.shieldHit??-10))/.39);
    for(let i=0;i<5;i++){
      const a=i*tau/5+.22+Math.sin(t*.65)*.10,depth=Math.sin(a);
      if((depth>0)!==front)continue;
      const aligned=Math.max(0,Math.cos(a-(p.shieldBearing??p.face)));
      const strike=hit*aligned**4;
      const distance=23+deploy*19-strike*8;
      const x=Math.cos(a)*distance,y=depth*distance*.64;
      c.save();c.translate(x,y+10*(1-deploy));c.scale((.45+.55*Math.abs(depth))*(.5+.5*deploy),.25+.75*deploy);
      c.rotate(.16*Math.cos(a)*(1+strike));
      const plate=[[-16,-12],[-9,-19],[0,-25],[9,-19],[16,-12],[14,4],[8,12],[0,19],[-9,12],[-14,4]];
      face(c,'#493d39',...plate);c.translate(0,-2);
      face(c,strike>.28?'#fff2ba':'#d7b77b',...plate);
      face(c,'#745537',[-14,-12],[0,-21],[0,15],[-12,3]);
      face(c,'#5d9492',[-12,-10],[-6,-15],[-2,-12],[-2,-2],[-11,1]);
      face(c,'#98d2c2',[2,-13],[8,-15],[12,-10],[11,1],[2,-2]);
      face(c,'#437772',[-10,4],[-2,0],[-2,11]);
      face(c,'#80b9a5',[2,0],[10,4],[2,11]);
      face(c,strike>.15?'#ffffd8':'#f0d796',[0,-14],[4,-3],[0,4],[-4,-3]);
      for(const side of [-1,1])disc(c,side*11,-8,1.25,1.25,'#f7dfab');
      if(strike>.05){
        c.globalAlpha*=strike;
        face(c,'#fff4c2',[-2,-3],[5,-7],[9,-5],[16,-12],[9,-2],[6,-4],[1,1]);
        for(let j=0;j<5;j++){
          const u=1-hit,ang=(j-2)*.47-1.4,d=12+u*27;
          leaf(c,Math.cos(ang)*d,Math.sin(ang)*d,7,2.4,ang,'#fff3c3','#cb9b5a');
        }
      }
      c.restore();
    }
  }
  function chalice(c,t){
    const rise=unit(t/.32),beat=(t%1),flow=1-beat;
    c.save();c.translate(-25,9+(1-rise)*13);c.scale(.7+rise*.3,rise);
    disc(c,0,3,20,6,'#453c3470');
    face(c,'#86663c',[-13,1],[-5,-3],[-3,-10],[3,-10],[5,-3],[13,1],[10,4],[-10,4]);
    face(c,'#f0d397',[-12,0],[-4,-3],[-2,-11],[1,-11],[1,1],[-8,2]);
    face(c,'#bb9456',[-16,-27],[15,-27],[12,-17],[6,-11],[0,-8],[-9,-13],[-13,-19]);
    face(c,'#f1d491',[-15,-25],[-8,-23],[-3,-12],[-9,-15]);
    face(c,'#816044',[4,-12],[9,-18],[12,-24],[15,-26],[12,-16]);
    disc(c,0,-27,16,4.8,'#f9dea3');disc(c,0,-27,13,3.1,'#5cb6ac');
    for(let j=0;j<3;j++){
      const y=-27-2*Math.sin(t*6+j);
      c.fillStyle=['#518e92','#87d5bc','#e0f4cd'][j];
      c.beginPath();c.moveTo(-8+j*6,y);
      c.bezierCurveTo(-14+j*8,-52-flow*8,10+j*4,-54,20+j*4,-34);
      c.bezierCurveTo(31+j*3,-22,28+j*3,-15,26+j*3,-11);
      c.bezierCurveTo(30+j,-37,9+j*4,-56,1+j*3,-39);
      c.quadraticCurveTo(-4+j*5,-25,-8+j*6,y);c.fill();
    }
    for(let j=0;j<7;j++){const u=(beat+j/7)%1;
      waterDrop(c,25+12*u+4*Math.sin(j),-26+u*32,4.8-2*u,1.2);}
    c.restore();
  }
  function bloom(c,t,dx,dy){
    const open=unit((t-.14)/.40),growth=1-(1-unit(t/.38))**2;
    const x=-44,y=17,sway=2.7*Math.sin(t*3.1);
    c.save();c.translate(x,y);c.scale(growth,growth);
    disc(c,0,3,25,7,'#2a352c94');
    for(let side of [-1,1]){
      c.fillStyle=side<0?'#539367':'#436f52';c.beginPath();c.moveTo(0,2);
      c.quadraticCurveTo(side*13,-18,side*30,-22);c.quadraticCurveTo(side*23,-4,0,2);c.fill();
      for(let j=0;j<3;j++) leaf(c,side*(6+j*6),-j*4-3,10,3.8,side<0?-2:.0,'#acc283','#688d5c');
    }
    c.fillStyle='#597c4d';c.beginPath();c.moveTo(-3,1);c.bezierCurveTo(5,-14,-14,-29,sway,-43);
    c.quadraticCurveTo(-6,-26,3,-19);c.quadraticCurveTo(7,-8,2,1);c.fill();
    c.translate(sway,-39);c.scale(.35+.65*open,.85+.15*open);
    for(let layer=0;layer<2;layer++)for(let j=0;j<7;j++){
      const a=j*tau/7+layer*.45,sz=layer?13:21;
      c.save();c.rotate(a);c.fillStyle=layer?'#e8aaa8':j%2?'#bf778c':'#d58f9b';c.beginPath();
      c.moveTo(0,0);c.bezierCurveTo(-sz*.58,-sz*.28,-sz*.52,-sz*.93,0,-sz);
      c.bezierCurveTo(sz*.43,-sz*.84,sz*.55,-sz*.36,0,0);c.fill();
      leaf(c,0,-2,sz*.65,1.3,-Math.PI/2,'#f0bfaf','#cf8f93');c.restore();
    }
    disc(c,0,0,6.4,5.2,'#b4824d');for(let j=0;j<6;j++)disc(c,Math.cos(j)*3.8,Math.sin(j)*3,1.7,1.4,'#f8d483');c.restore();
    for(let j=0;j<9;j++){const u=(t*.82+j/9)%1;
      const px=(x+sway)*(1-u)+dx*u,py=(y-39)*(1-u)+dy*u-19*Math.sin(u*Math.PI);
      leaf(c,px,py,6-u*2,2.5,.4+u*2,'#ecd299','#be924f');}
  }
  function warHorn(c,t,bearing){
    c.rotate(bearing);
    for(const side of [-1,1]){
      c.save();c.scale(1,side);const wave=Math.sin(t*7+side)*4;
      face(c,'#63313a',[-3,7],[-19,8],[-34,5+wave],[-47,11+wave],[-39,15+wave],[-42,21+wave],[-26,18],[-10,15]);
      face(c,'#b75b4b',[-5,8],[-22,10],[-34,8+wave],[-43,12+wave],[-26,15],[-16,13]);
      face(c,'#dcaa6e',[-20,12],[-32,11+wave],[-37,14+wave],[-28,13+wave]);c.restore();
    }
    if(t>1.12)return;
    const lift=unit(t/.15)*unit((1.12-t)/.22);
    c.save();c.translate(11,-4);c.rotate(-.55*lift+.31);
    c.fillStyle='#593d31';c.beginPath();c.moveTo(0,0);c.bezierCurveTo(14,8,25,3,33,-16);
    c.lineTo(49,-7);c.bezierCurveTo(38,20,13,18,0,4);c.fill();
    c.fillStyle='#cf9654';c.beginPath();c.moveTo(2,2);c.quadraticCurveTo(25,17,35,-14);
    c.lineTo(45,-9);c.quadraticCurveTo(29,26,2,3);c.fill();
    face(c,'#f2d18c',[32,-16],[35,-20],[52,-10],[49,-6]);
    face(c,'#654539',[36,-17],[49,-10],[46,-10],[35,-15]);c.restore();
    if(t>.14&&t<.7){
      const u=(t-.14)/.56;c.globalAlpha*=Math.sin(Math.PI*u);
      for(let j=0;j<12;j++){const a=(j/11-.5)*1.32,d=38+u*(39+j%4*9);
        const x=Math.cos(a)*d,y=Math.sin(a)*d;leaf(c,x,y,7+j%4,2.6,a+u,'#c6ad8a','#8b765a');}
    }
  }
  function warBow(c,s,pull,t){
    c.save();c.scale(s,s);
    const span=20+6*unit(t/.3),bend=5*pull,tip=4-bend;
    for(const side of [-1,1]){
      c.save();c.scale(1,side);
      face(c,'#543f37',[-1,-3],[7,0],[11,9],[8,18],[tip,span],[tip-7,span+3],[tip-3,span-3],[3,16],[4,10]);
      face(c,'#d0a569',[4,1],[8,3],[9,10],[6,14],[4,11]);
      face(c,'#a2704e',[5,15],[8,13],[6,20],[tip-5,span+1],[tip-1,span-6]);
      face(c,'#e3c78d',[4,15],[7,14],[7,16],[4,18]);c.restore();
    }
    const notch=tip-2-17*pull;c.strokeStyle='#efddbb';c.lineWidth=1.15;c.beginPath();c.moveTo(tip-5,-span+1);c.lineTo(notch,0);c.lineTo(tip-5,span-1);c.stroke();
    c.fillStyle='#684e3f';c.fillRect(0,-4,7,8);
    if(pull>.05){c.save();c.translate(notch+25,0);c.scale(.68,.68);arrow(c,'G3',true);c.restore();}
    c.restore();
  }
  function shadeMantle(c,x,y,a,size,phase){
    c.save();c.translate(x,y);c.rotate(a);c.scale(size,size);
    const hem=Math.sin(phase)*4;
    face(c,'#252234',[9,-6],[1,-15],[-12,-14],[-23,-8],[-35,-6+hem],[-26,0],[-42,6+hem],[-24,8],[-28,14+hem],[-10,12],[6,7]);
    face(c,'#51445e',[5,-9],[-7,-12],[-26,-7+hem],[-15,-5],[-24,2],[-6,-2]);
    face(c,'#786680',[-2,0],[-13,4],[-24,8],[-10,7]);disc(c,4,-1,9,7,'#373043');
    face(c,'#a18caa',[1,-7],[6,-8],[12,-3],[8,-4]);c.restore();
  }
  function shadowStep(c,f,phase){
    const u=unit(phase/.34),k=unit(phase/f.dur),dx=f.endX-f.x,dy=f.endY-f.y;
    c.save();c.globalAlpha*=1-k;shadeMantle(c,0,0,f.angle,1.16-.38*u,u*6);
    for(let j=0;j<8;j++){
      const a=j*2.4,d=(12+j%3*7)*u;
      leaf(c,Math.cos(a)*d,Math.sin(a)*d,12-u*5,4.8,a+u,'#776581','#382c46');
    }
    c.restore();c.save();c.translate(dx,dy);c.rotate(f.angle+Math.PI);c.globalAlpha*=1-k;
    const swing=unit(phase/.24);
    c.rotate(-1.35+swing*1.95);
    face(c,'#463d50',[6,0],[19,-7],[40,-10],[62,-6],[73,0],[40,-3],[21,1]);
    face(c,'#e2d6d6',[14,1],[35,-3],[72,0],[51,4],[27,5]);c.restore();
  }
  function rift(c,x,y,k,scale,angle){
    const open=Math.sin(Math.PI*k)**.68;
    c.save();c.translate(x,y);c.rotate(angle-.25);c.scale(open*scale,scale);
    face(c,'#a998b3',[-5,-47],[11,-27],[7,-13],[18,-4],[10,17],[-5,45],[-15,22],[-12,9],[-19,-9],[-12,-29]);
    face(c,'#231e37',[-4,-43],[8,-26],[4,-11],[14,-3],[7,17],[-5,40],[-12,21],[-10,8],[-16,-9],[-9,-27]);
    for(let j=0;j<15;j++){
      const px=Math.sin(j*9.2)*8,py=Math.cos(j*6.78)*29;
      disc(c,px,py,1+j%2*.7,1+j%2*.6,j%4?'#a88ab7':'#f3dfc3');
    }
    face(c,'#685676',[-5,-43],[-11,-22],[-17,-11],[-25,-18],[-20,-30]);
    face(c,'#cbb5c1',[12,2],[20,-6],[25,-2],[15,12],[10,16]);
    for(let j=0;j<6;j++){const a=j*2.4,d=18+open*(7+j%3*7),px=Math.cos(a)*d,py=Math.sin(a)*d*1.4;
      face(c,'#9982a6',[px-3,py],[px+2,py-6],[px+4,py+3]);}c.restore();
  }
  function clockwork(c,t,lock){
    const open=unit(t/.3);
    c.save();c.translate(-29,-12);c.scale(.56+.44*open,.56+.44*open);c.rotate(lock?0:Math.sin(t*2)*.17);
    if(lock){
      // Le boîtier et ses morceaux s'écartent au lancement, puis se figent.
      const spread=unit(t/.21)*5;
      c.rotate(-.18+unit(t/.18)*.18);
      for(let j=0;j<4;j++){
        const a=j*Math.PI/2;c.save();c.rotate(a);c.translate(spread,-spread*.5);
        c.fillStyle='#b8935e';c.beginPath();c.arc(0,0,24,-1.45,-.07);c.arc(0,0,19,-.07,-1.45,true);c.fill();
        c.fillStyle='#4a5353';c.beginPath();c.moveTo(2,-4);c.arc(0,0,19,-1.45,-.07);c.closePath();c.fill();
        face(c,'#edd29f',[5,-19],[7,-18],[5,-13]);face(c,'#aaab91',[12,-14],[14,-13],[10,-10]);c.restore();
      }
      c.rotate(unit(t/.21)*.68);face(c,'#ffe1a1',[-2,4],[-2,-17],[0,-22],[2,-17],[1,4]);
      face(c,'#ddb57a',[-2,-1],[14,7],[10,8],[-2,2]);disc(c,0,0,3,3,'#f5d99d');c.restore();return;
    }
    for(const side of [-1,1]){
      face(c,'#785e45',[side*14,-20],[side*18,-18],[side*17,16],[side*14,20]);
      face(c,'#e5c283',[side*14,-18],[side*15,-18],[side*15,15],[side*13,17]);
    }
    c.fillStyle='#b2c5bd9e';c.beginPath();c.moveTo(-12,-18);c.lineTo(12,-18);
    c.bezierCurveTo(12,-7,7,-5,2,0);c.bezierCurveTo(2,6,13,7,12,18);c.lineTo(-12,18);
    c.bezierCurveTo(-13,8,-5,4,-2,0);c.bezierCurveTo(-6,-5,-12,-8,-12,-18);c.fill();
    const level=1-(t*.45%1);
    face(c,'#e3b868',[-10*level,-14*level],[10*level,-14*level],[0,-1]);
    face(c,'#cca05b',[-11,16],[0,12-level*5],[11,16]);disc(c,0,(t*24)%11,.95,2,'#ffe3a4');
    for(const sy of [-1,1]){disc(c,0,sy*19,18,4,'#76573f');disc(c,-1,sy*19-2,17,2.4,'#eacd91');}c.restore();
  }
  function timeDust(c,r,t,lock){
    const phase=lock?.74:t*.77;
    c.save();c.translate(0,r*.75);c.scale(1,.55);
    for(let j=0;j<12;j++){
      const a=j*tau/12,major=j%3===0;
      c.save();c.rotate(a);face(c,major?'#dfc08b':'#b09168',[r*1.12,-1.35],[r*(major?1.8:1.56),-1.7],[r*(major?1.88:1.64),1.7],[r*1.12,1]);c.restore();
    }
    for(let j=0;j<2;j++){c.save();c.rotate(-1.35+phase*(j?.28:1.1)+j*1.73);
      face(c,j?'#eacb91':'#b99666',[-4,-1],[r*(j?1.05:1.53),-1.6],[r*(j?1.21:1.75),0],[0,2]);c.restore();}
    c.restore();
    for(let j=0;j<6;j++){const a=j*2.4+phase*.3,d=r*(1.25+j%2*.32),x=Math.cos(a)*d,y=Math.sin(a)*d*.58-r*.62;
      if(lock)face(c,'#e0c291',[x-3,y+2],[x+1,y-5],[x+4,y],[x+1,y+3]);
      else disc(c,x,y+Math.sin(t+j)*3,2,1.55,'#ddbc85');
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
  function motion(c,f,p,now,back=false){
    if(back&&f.id!=='P4')return;
    const t=f.t,k=unit(t/f.dur),id=f.id;
    const follow=['C6','P2','P4','S3'].includes(id);
    const x=follow?p.x:f.x,y=follow?p.y:f.y;
    c.save();c.globalAlpha=clampFade(t,f.dur,Math.min(.28,f.dur*.32));c.translate(x,y);
    switch(id){
      case 'C6':warHorn(c,t,p.face);break;
      case 'F4':
        if(t<.38){
          const u=1-unit(t/.38);c.translate(p.x-x,p.y-y);c.rotate(p.face);
          for(const side of [-1,1])for(let j=0;j<3;j++){
            c.save();c.translate(19+u*(14+j*5),side*(11+j*4+u*14));c.rotate(side*u*.85);
            face(c,'#a67b47',[-4,-2],[2,-3],[6,0],[2,2],[-4,1]);
            face(c,'#f1d199',[-4,-2],[2,-3],[5,-1],[0,0]);c.restore();
          }
        }break;
      case 'D8':bloom(c,t,p.x-x,p.y-y);break;
      case 'P2':chalice(c,t);break;
      case 'P4':ward(c,t,p,now,!back);break;
      case 'V2':shadowStep(c,f,t);break;
      case 'S3':
        for(const echo of f.steps||[]){
          const age=now-echo.t;c.save();c.globalAlpha*=.68*unit(1-age/.46);
          shadeMantle(c,echo.x-x,echo.y-y,echo.a,.9-age*.38,age*12);c.restore();
        }
        c.globalAlpha*=.82;shadeMantle(c,0,0,p.face,.72+Math.min(.35,t),t*8);break;
      case 'SP':rift(c,0,0,k,.88,f.angle);rift(c,f.endX-x,f.endY-y,k,1.13,f.angle);break;
      case 'TM2':case 'TM4':
        clockwork(c,t,id==='TM4');break;
      case 'DS2':burst(c,f.a||180,t,k);break;
    }
    c.restore();
  }
  // La hampe, les éclats et le souffle partent du point de contact dans le repère du tir.
  function flashStep(c,f,k){
    c.save();c.translate(f.x,f.y);c.rotate(f.ang);c.globalAlpha=1-k;
    face(c,'#544640cb',[-15,-2],[-6,-5],[1,-4],[11,-1],[3,3],[-7,3]);
    face(c,k<.34?'#fff0ad':'#c89d5f',[-13,-1],[-5,-3],[-1,-1],[6,-1],[0,1],[-6,0]);
    for(let j=0;j<3;j++){
      const x=-3-j*4-k*(6+j*3),y=(j%2?1:-1)*(3+j+k*11);
      face(c,'#f5d490',[x-2,y],[x,y-3],[x+2,y+1]);
    }c.restore();
  }
  function contact(c,f,k){
    const angle=f.angle,t=f.t,hit=f.host,anchored=['G3','F2','F4','S4'].includes(f.id);
    const x=anchored&&hit?.hp>0?hit.x:f.x,y=anchored&&hit?.hp>0?hit.y:f.y;
    c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=clampFade(t,f.dur,.14);
    if(f.id==='F2'||f.id==='G3'||f.id==='F4'){
      c.translate(-hit.r*.52,0);c.rotate(Math.sin(t*52)*.19*Math.exp(-t*8));c.scale(.73,.73);
      arrow(c,f.id,f.id!=='F2');
    }else if(f.id==='S4'){
      // Une entaille violette se referme à l'endroit où la lame a frappé.
      c.rotate(-.78);c.scale(1,.28+.72*Math.sin(Math.PI*k));
      face(c,'#a78cab',[-28,0],[-11,-4],[3,-6],[28,-1],[8,1],[-5,5]);
      face(c,'#30263f',[-26,0],[-8,-2],[6,-4],[22,-1],[0,3]);
    }else if(f.id==='GL4'){
      for(let j=0;j<7;j++){const a=(j-3)*.35,d=9+(1-(1-k)**2)*(15+j%4*5);
        c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d+k*k*9);c.rotate(a+.4+k);
        shard(c,0,0,3+j%2,9+j%4*2,1,true);c.restore();}
    }else if(f.id==='R2'||f.id==='AI9'){
      for(let j=0;j<10;j++){
        const a=(j/9-.5)*(f.id==='R2'?1.1:3.1),d=12+(1-(1-k)**2)*(19+j%4*8);
        const px=Math.cos(a)*d,py=Math.sin(a)*d+(f.id==='R2'?k*k*8:0);
        leaf(c,px,py,9+j%3*3,2+j%3,a+k*.6,f.id==='R2'?'#d6b698':'#bbbc91',f.id==='R2'?'#8c735e':'#657e67');
      }
    }
    c.restore();
  }
  function potion(c,f,k,p) {
    const colors={AL2:'#e07644',AL3:'#8db78a',AL4:'#977b9e',AL5:'#aad6c9',XP1:'#796a8d',XP2:'#ddbf7f'};
    const tint=colors[f.id],drink=f.id==='AL3'||f.id.startsWith('XP');
    c.save();c.translate(drink?p.x:f.x,drink?p.y:f.y);c.globalAlpha=clampFade(f.t,f.dur,.36);
    if(drink){
      const lift=Math.sin(Math.PI*unit(k/.86));
      c.save();c.translate(20-6*lift,-7-8*lift);c.rotate(-1.12*lift);
      face(c,'#6d7c7a',[-5,-18],[5,-18],[5,-8],[10,-3],[12,4],[8,11],[-7,12],[-12,5],[-10,-3],[-5,-8]);
      face(c,'#ccdcd4',[-4,-16],[3,-16],[3,-6],[9,-2],[7,0],[-7,0],[-8,-2],[-3,-6]);
      face(c,tint,[-9,-1],[8,-2],[10,5],[6,9],[-6,10],[-9,4]);
      face(c,'#e4eee5',[-8,0],[-6,-2],[-6,4],[-4,6],[-6,6]);c.restore();
      if(f.id==='XP1'){c.save();c.globalAlpha*=Math.sin(k*Math.PI);shadeMantle(c,-9,5,0,1.12,k*9);c.restore();}
      else if(f.id==='XP2'){
        for(let j=0;j<5;j++){
          const u=unit((k-.09*j)*2.6),a=j*2.4,d=12+u*23,x=Math.cos(a)*d,y=Math.sin(a)*d*.66-u*11;
          if(!u)continue;
          face(c,'#a87e46',[x-7,y],[x-2,y-2],[x,y-9],[x+2,y-2],[x+7,y],[x+2,y+3],[x,y+8],[x-2,y+2]);
          face(c,'#ffe1a2',[x-6,y],[x-1,y-2],[x,y-7],[x,y],[x-1,y+4]);
        }
      }else for(let j=0;j<9;j++){const u=(k+j/9)%1;waterDrop(c,15-u*23+Math.cos(j)*9,6-u*31,6-u*3,-1.4);}
    }else{
      if(f.id==='AL2')burst(c,f.a,f.t,k);
      else if(f.id==='AL4'){
        const pool=painted('venomSplash',144,ctx=>{
          const rand=random(824);
          for(let j=0;j<46;j++){
            const a=rand()*tau,d=8+rand()*48,w=3+rand()*10,x=Math.cos(a)*d,y=Math.sin(a)*d;
            disc(ctx,x,y,w,w*.65,'#5c425ec4');disc(ctx,x-1,y-1,w*.78,w*.43,'#a17b9db3');
          }
        });
        const radius=f.a*(.18+.82*unit(k*3));c.drawImage(pool,-radius,-radius,radius*2,radius*2);
        for(let j=0;j<9;j++){const a=j*2.4,d=radius*(.25+j%3*.18),u=(k+j*.2)%1;
          disc(c,Math.cos(a)*d,Math.sin(a)*d-u*14,3.4-u,3.6-u,'#c8a8c7');}
      }else{
        for(let j=0;j<36;j++){const a=j*2.4,d=f.a*(.14+unit(k*2.6)*(.34+j%4*.15));
          const x=Math.cos(a)*d,y=Math.sin(a)*d;
          waterDrop(c,x,y-25*Math.sin(k*Math.PI),8+j%5,a);
          if(k>.42)disc(c,x,y,5+(k-.42)*12,2+(k-.42)*3,'#b0e0d9a3');}
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
    projectile,motion,contact,flashStep,warBow,potion,impact,sparks,channel,omen,timeDust,shard,burst,eddies,flame};
})();
