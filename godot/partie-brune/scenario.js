/* La V1 garde la simulation, les entrées et les sauvegardes. Ce scénario fournit la cour et ses acteurs. */
(() => {
  const images = {};
  for (const [name, uri] of Object.entries(/*IMAGES_BRUNE*/{})) {
    const image = new Image();
    image.src = uri;
    images[name] = image;
  }
  const ready = img => img.complete && img.naturalWidth > 0;
  const COUR = 'cour-brune', width = 1600, height = 1100;
  const sx = width/896, sy = height/560;
  const walk = new WeakMap();
  const clamp = x => Math.max(0, Math.min(1,x));
  const ease = x => { const t=clamp(x); return t*t*(3-2*t); };
  const rays = Array.from({length:14}, (_,i) => {
    const angle=(i+.22)*Math.PI*2/14;
    return {x:Math.cos(angle),y:Math.sin(angle)};
  });
  // La partie peut aussi tourner dans la fenêtre Godot WRY.
  if (!window.aldoriaHost.dessinerSol) window.aldoriaHost.paintGround = true;

  function panneau(c,x,y) {
    c.save(); c.translate(x,y);
    c.fillStyle='#684933'; c.fillRect(-3,-12,6,23);
    c.beginPath();c.moveTo(-44,-32);c.lineTo(44,-32);c.lineTo(44,-14);c.lineTo(-44,-14);c.lineTo(-51,-23);c.closePath();
    c.fillStyle='#4c3a2c';c.fill();c.strokeStyle='#c5a36f';c.lineWidth=1.6;c.stroke();
    c.font='bold 12px sans-serif';c.fillStyle='#f6e4ba';c.textAlign='center';c.fillText('HAMEAU',0,-18);c.restore();
  }

  window.aldoriaEssai = {
    monde(zones) {
      const portals = zones['2,6'].portals ||= [];
      portals.push({x:940,y:655,to:COUR,at:{x:450,y:725},label:"Entrer dans la cour de Brune",stairs:1});
    },
    nouvellePartie(s, route) {
      s.zone=COUR; s.pos={x:500,y:670}; s.spawn={z:COUR,x:175,y:355};
      s.slots=['R2','GL6','TE8','AI8'];
      for(const id of s.slots) for(const parent of route(id).nodes) s.owned.add(parent);
      s.weapon='R';
    },
    terrain(z,t) {
      if(z.id!==COUR)return false;
      t.rocks.push({x:98*sx,y:99*sy,r:74*sx,kind:'rock'});
      for(let x=685;x<=940;x+=20) {
        const edge = (544-(x-674)*0.73)*sy;
        t.rocks.push({x:x*sx,y:edge+41,r:42,kind:'rock'});
      }
      return true;
    },
    rencontre(z) {
      if(z.id!==COUR)return null;
      return [{t:'garde',x:830,y:657,idx:0,idle:'patrol'}, {t:'garde_lance',x:934,y:702,idx:1,idle:'patrol'}];
    },
    dessinerCour(c,z,t) {
      if(z.id!==COUR || !ready(images.cour))return false;
      c.drawImage(images.cour,0,0,width,height);
      if(ready(images.eau)) {
        const f=Math.floor(t*30)%120;
        c.drawImage(images.eau,f%12*116,Math.floor(f/12)*116,116,116,40*sx,41*sy,116*sx,116*sy);
      }
      panneau(c,z.portals[0].x,z.portals[0].y);return true;
    },
    dessinerGarde(c,e,x,y,face,swing,t) {
      if((e.t!=='garde'&&e.t!=='garde_lance')||!ready(images.pas))return false;
      const row=e.t==='garde'?1:2;
      const step=walk.get(e)||{x:e.x,y:e.y,phase:0};
      const dist=Math.hypot(e.x-step.x,e.y-step.y);
      if(e.freeze<=0 && dist<80)step.phase=(step.phase+dist/63)%1;
      step.x=e.x;step.y=e.y;walk.set(e,step);
      c.save(); c.translate(x,y);c.rotate(face+swing*.25);
      if(e.freeze>0)c.filter='saturate(0.4) brightness(1.25)';
      c.drawImage(images.pas,Math.floor(step.phase*8)*128,row*128,128,128,-39,-39,78,78);
      c.filter='none';
      if(e.freeze>0 && ready(images.cristaux)){
        c.globalAlpha*=clamp(e.freeze/.22);
        for(let i=0;i<3;i++)c.drawImage(images.cristaux,i*100,0,100,112,-14+i*8,-4+(i%2)*5,10,14);
      }
      c.restore();return true;
    },
    prison(x,y,a,enemies,inside) {
      const z={prison:true,x,y,r:a.r,t:0,dur:2.4,delay:0,from:'p',dmg:a.dmg,el:a.el,freeze:a.freeze};
      z.captured=enemies.filter(e=>e.hp>0&&inside(z,e));return z;
    },
    avancerPrison(z,dt,zone,pushOut,clampWorld,hit) {
      const travel=.76, pull=Math.min(dt,Math.max(0,travel-(z.t-dt)));
      if(pull>0)for(const e of z.captured){
        if(e.hp<=0)continue;
        const gain=1-Math.exp(-2.35*pull);
        e.x+=(z.x-e.x)*gain;e.y+=(z.y-e.y)*gain;
        pushOut(zone,e);clampWorld(e);e.stun=Math.max(e.stun,.09);
      }
      if(z.t>=travel&&!z.done){
        z.done=true;
        for(const e of z.captured)if(e.hp>0)hit(e,z.dmg,z.el,{freeze:z.freeze});
      }
    },
    dessinerPrison(c,z,front,zone) {
      if(!ready(images.cristaux))return;
      const r=z.r*(1-.46*ease((z.t-.17)/(.76-.17)));
      const fade=clamp((z.dur-z.t)/.37), size=z.r/84;
      c.save();c.globalAlpha*=fade;
      for(let i=0;i<rays.length;i++) {
        const u=rays[i];
        if(!front && zone.id===COUR && ready(images.cour)){
          for(let j=0;j<3;j++){
            const d=z.r*(.96-j*.17), lift=ease((d-r+size*3)/(5*size))*fade;
            if(lift<=0)continue;
            const px=z.x+u.x*d-u.y*Math.sin(i+j)*3, py=z.y+u.y*d+u.x*Math.sin(i+j)*3;
            if(Math.hypot(px/sx-98,py/sy-99)<80 || (px/sx>670&&py/sy>535-(px/sx-674)*.73))continue;
            const w=(4+(i+j)%3)*size;
            c.save(); c.translate(px,py);c.beginPath();c.moveTo(-w,0);c.lineTo(-w*.4,-w*.52);c.lineTo(w,-w*.35);c.lineTo(w*.64,w*.4);c.lineTo(-w*.55,w*.58);c.closePath();
            c.fillStyle='#565755';c.fill();c.translate(0,-2.7*lift);c.beginPath();c.moveTo(-w,0);c.lineTo(-w*.4,-w*.52);c.lineTo(w,-w*.35);c.lineTo(w*.64,w*.4);c.lineTo(-w*.55,w*.58);c.closePath();c.clip();
            c.drawImage(images.cour,-px,-py,width,height);c.strokeStyle='rgba(196,230,226,'+lift+')';c.lineWidth=1.6;c.stroke();c.restore();
          }
        }
        if((u.y>0)!==front)continue;
        const rise=clamp((z.t-.019*(i%5))/.19), w=(17+(i*7)%9)*rise*size, h=(23+(i*11)%17)*rise*size;
        if(!rise)continue;
        c.save();c.translate(z.x+u.x*r,z.y+u.y*r);c.beginPath();c.ellipse(1,1,w*.46,w*.15,0,0,Math.PI*2);c.fillStyle='#234e5c3b';c.fill();c.rotate(-u.x*.25);
        c.drawImage(images.cristaux,i%4*100,0,100,112,-w*.5,-h,w,h);
        c.drawImage(images.cristaux,(i+1)%4*100,0,100,112,w*.27,-h*.31,w*.36,h*.33);c.restore();
      }
      c.restore();
    }
  };
})();
