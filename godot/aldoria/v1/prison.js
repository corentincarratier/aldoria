// La cour et les régions utilisent le même anneau, les mêmes cibles et le même instant d’impact.
(() => {
  const cristaux=new Image();
  cristaux.src='/*ATLAS_CRISTAUX*/';
  const clamp = x => Math.max(0, Math.min(1,x));
  const ease = x => { const t=clamp(x); return t*t*(3-2*t); };
  const rays = Array.from({length:14}, (_,i) => {
    const angle=(i+.22)*Math.PI*2/14;
    return {x:Math.cos(angle),y:Math.sin(angle)};
  });

  window.aldoriaPrison={
    cristaux,
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
      if(!cristaux.complete||!cristaux.naturalWidth)return;
      const r=z.r*(1-.46*ease((z.t-.17)/(.76-.17)));
      const fade=clamp((z.dur-z.t)/.37), size=z.r/84;
      c.save();c.globalAlpha*=fade;
      for(let i=0;i<rays.length;i++) {
        const u=rays[i];
        if(!front){
          for(let j=0;j<3;j++){
            const d=z.r*(.96-j*.17), lift=ease((d-r+size*3)/(5*size))*fade;
            if(lift<=0)continue;
            const px=z.x+u.x*d-u.y*Math.sin(i+j)*3, py=z.y+u.y*d+u.x*Math.sin(i+j)*3;
            if(window.aldoriaEssai?.obstacleCour(zone,px,py))continue;
            const w=(4+(i+j)%3)*size;
            c.save(); c.translate(px,py);c.beginPath();c.moveTo(-w,0);c.lineTo(-w*.4,-w*.52);c.lineTo(w,-w*.35);c.lineTo(w*.64,w*.4);c.lineTo(-w*.55,w*.58);c.closePath();
            c.fillStyle='#565755';c.fill();c.translate(0,-2.7*lift);c.beginPath();c.moveTo(-w,0);c.lineTo(-w*.4,-w*.52);c.lineTo(w,-w*.35);c.lineTo(w*.64,w*.4);c.lineTo(-w*.55,w*.58);c.closePath();c.clip();
            c.save();c.translate(-px,-py);
            if(!window.aldoriaEssai?.solCour(c,zone))window.aldoriaHost.dessinerSol(c,zone);
            c.restore();c.strokeStyle='rgba(196,230,226,'+lift+')';c.lineWidth=1.6;c.stroke();c.restore();
          }
        }
        if((u.y>0)!==front)continue;
        const rise=clamp((z.t-.019*(i%5))/.19), w=(17+(i*7)%9)*rise*size, h=(23+(i*11)%17)*rise*size;
        if(!rise)continue;
        c.save();c.translate(z.x+u.x*r,z.y+u.y*r);c.beginPath();c.ellipse(1,1,w*.46,w*.15,0,0,Math.PI*2);c.fillStyle='#234e5c3b';c.fill();c.rotate(-u.x*.25);
        c.drawImage(cristaux,i%4*100,0,100,112,-w*.5,-h,w,h);
        c.drawImage(cristaux,(i+1)%4*100,0,100,112,w*.27,-h*.31,w*.36,h*.33);c.restore();
      }
      c.restore();
    }
  };
})();
