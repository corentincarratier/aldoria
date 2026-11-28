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

  function panneau(c,x,y,nom) {
    c.save(); c.translate(x,y);
    c.fillStyle='#684933'; c.fillRect(-3,-12,6,23);
    c.beginPath();c.moveTo(-44,-32);c.lineTo(44,-32);c.lineTo(44,-14);c.lineTo(-44,-14);c.lineTo(-51,-23);c.closePath();
    c.fillStyle='#4c3a2c';c.fill();c.strokeStyle='#c5a36f';c.lineWidth=1.6;c.stroke();
    c.font='bold 12px sans-serif';c.fillStyle='#f6e4ba';c.textAlign='center';c.fillText(nom,0,-18);c.restore();
  }

  window.aldoriaEssai = {
    monde(zones) {
      const portals = zones['2,6'].portals ||= [];
      portals.push({x:606,y:677,to:COUR,at:{x:450,y:725},label:"Entrer dans la cour de Brune",stairs:1});
    },
    panneauRetour(c,z) {
      if(z.id==='2,6'){
        const porte=z.portals.find(p=>p.to===COUR);
        panneau(c,porte.x,porte.y,'COUR');
      }
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
      return [{t:'garde',x:830,y:657,px:870,py:740,face:2.6,idx:0,idle:'patrol'}, {t:'garde_lance',x:934,y:702,px:887,py:635,face:2.9,idx:1,idle:'patrol'}];
    },
    dessinerCour(c,z,t) {
      if(z.id!==COUR || !ready(images.cour))return false;
      c.drawImage(images.cour,0,0,width,height);
      if(ready(images.eau)) {
        const f=Math.floor(t*30)%120;
        c.drawImage(images.eau,f%12*116,Math.floor(f/12)*116,116,116,40*sx,41*sy,116*sx,116*sy);
      }
      panneau(c,z.portals[0].x,z.portals[0].y,'HAMEAU');return true;
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
      if(e.freeze>0 && ready(window.aldoriaPrison.cristaux)){
        c.globalAlpha*=clamp(e.freeze/.22);
        for(let i=0;i<3;i++)c.drawImage(window.aldoriaPrison.cristaux,i*100,0,100,112,-14+i*8,-4+(i%2)*5,10,14);
      }
      c.restore();return true;
    },
    obstacleCour(zone,x,y) {
      return zone.id===COUR && (Math.hypot(x/sx-98,y/sy-99)<80 || (x/sx>670&&y/sy>535-(x/sx-674)*.73));
    },
    solCour(c,zone) {
      if(zone.id!==COUR||!ready(images.cour))return false;
      c.drawImage(images.cour,0,0,width,height);return true;
    }
  };
})();
