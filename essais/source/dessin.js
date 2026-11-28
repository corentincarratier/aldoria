// Les coordonnées locales du corps suivent l’axe du regard. Les deux mains,
// la corde et le point de départ de la flèche utilisent la même pose.
const SourceArt = (() => {
  const tau=2*Math.PI;
  function disk(c,x,y,rx,ry,fill,angle=0) {
    c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,angle,0,tau);c.fill();
  }
  function line(c,points,color,w) {
    c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);
    c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();
  }
  function arm(c,shoulder,elbow,hand,sleeve) {
    function segment(a,b,w0,w1,cloth) {
      const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
      if(len<.05)return;
      c.save();c.translate(...a);c.rotate(Math.atan2(dy,dx));
      c.beginPath();c.moveTo(-.7,-w0*.66);c.quadraticCurveTo(1,-w0*1.13,len*.46,-(w0+w1)*.50);
      c.lineTo(len,-w1);c.quadraticCurveTo(len+1.1,0,len,w1);c.lineTo(len*.38,w0*.94);
      c.quadraticCurveTo(-1.8,w0*.86,-.7,-w0*.66);c.closePath();
      c.fillStyle=cloth;c.fill();c.strokeStyle='#553e31';c.lineWidth=.48;c.stroke();
      line(c,[[1,-w0*.72],[len*.58,-w1*.73]],'#f4d5ad',.45);
      if(cloth===sleeve){
        for(const k of [.36,.70])line(c,[[len*k,-w0*.88],[len*k-.85,-.35],[len*k+.22,w0*.44]],'#968677',.47);
      }else{
        for(const k of [.22,.82])line(c,[[len*k,-w1],[len*k+.22,w1*.84]],'#c8a071',.52);
      }
      c.restore();
    }
    segment(shoulder,elbow,3.05,2.45,sleeve);
    segment(elbow,hand,2.25,1.72,'#895c3b');
    const a=Math.atan2(hand[1]-elbow[1],hand[0]-elbow[0]);
    disk(c,...hand,2.18,1.71,'#4c352a',a);disk(c,hand[0]+.10,hand[1]-.17,1.89,1.45,'#d9a57a',a);
    c.save();c.translate(...hand);c.rotate(a);line(c,[[.18,-.88],[.42,.28]],'#b87e5b',.37);
    disk(c,-.5,-1.02,1.05,.61,'#ecc198',-.25);c.restore();
  }
  function bowPose(p) {
    const recover=p.release/.235;
    const power=p.aiming?p.draw:(p.lastDraw||0)*recover*recover, spring=p.release>0?Math.sin(p.release*68)*p.release*5:0;
    return {grip:[12+power*4,-4], nock:[7-power*14+spring,1], bend:power};
  }
  function bow(c,pose,loaded) {
    const [x,y]=pose.grip, b=pose.bend;
    const tip= x-7-2*b, spread=12.3-b*1.5;
    function stave(col,w,dx=0){
      c.beginPath();c.moveTo(tip+dx,y-spread);c.bezierCurveTo(x+1+dx,y-9,x-1+dx,y-4,x+dx,y);
      c.bezierCurveTo(x+1+dx,y+5,x+2+dx,y+8,tip+dx,y+spread);c.strokeStyle=col;c.lineWidth=w;c.stroke();
    }
    stave('#442b22',2.9);stave('#ae713d',1.8);stave('#e0b978',.65,.4);
    line(c,[[tip,y-spread],pose.nock,[tip,y+spread]],'#e7dab0',.6);
    line(c,[[x,y-2.3],[x,y+2.3]],'#533524',2.5);
    if(loaded){line(c,[pose.nock,[pose.nock[0]+21,pose.nock[1]-1]],'#bcaa7f',.9); disk(c,pose.nock[0]+21,pose.nock[1]-1,1.9,.85,'#c7d3cd');}
  }
  function body(c,atlas,index,size) {
    c.drawImage(atlas,index*192,0,192,192,-size/2,-size/2,size,size);
  }
  function boots(c,step,speed) {
    for(const side of [-1,1]) {
      const x=-2+side*Math.sin(step)*6*speed;
      disk(c,x,side*5,5.2,2.7,'#46332c');disk(c,x+1,side*5-.4,3,1.9,'#835d41');
    }
  }
  function archer(c,p,atlas,t) {
    const moving=p.motion, swing=Math.sin(p.phase), d=p.dash/.19;
    const cast=p.cast, u=cast?Math.min(1,cast.t/cast.dur):0;
    const gesture=Math.sin(Math.PI*u);
    const twist=cast?(cast.id==='AI8'?Math.sin(u*tau)*.65:cast.id==='TE8'?-.32*gesture:.24*gesture):0;
    const pose=bowPose(p), shooting=p.aiming || p.release>0;
    c.save();c.translate(p.x,p.y);c.scale(2,2);disk(c,2,3,11+d*2,8,'#38281f42');
    c.rotate(p.angle);boots(c,p.phase,moving);
    c.translate(-Math.sin(d*Math.PI)*2,.6*swing*moving);c.rotate(twist+Math.sin(t*2)*.016);
    c.scale(1+.16*d,1-.19*d);
    let left=pose.grip,right=pose.nock;
    if(p.release>0)right=[-1-p.release*29,3+p.release*12];
    if(cast) {
      const sweep=cast.id==='AI8'?Math.sin(u*tau)*8:0;
      right=[4+gesture*(cast.id==='TE8'?12:8),7-gesture*(cast.id==='GL6'?14:4)+sweep];
      left=[7-gesture*2,-8-gesture*2];pose.grip=left;pose.nock=[4,-7];
    }else if(p.prep){
      const rise=Math.min(1,p.draw*2);right=[3+rise*4,7-rise*4];left=[6,-9];pose.grip=left;pose.nock=[2,-8];
    }else if(!shooting) {
      left=[8+2*swing*moving,-8];pose.grip=left;pose.nock=[3,-8];right=[2-swing*3*moving,8];
    }
    bow(c,pose,p.aiming);
    arm(c,[0,-6],[left[0]*.45,-9-moving*swing],left,'#bab5a0');
    arm(c,[0,6],[right[0]-4,9+p.draw*2],right,'#bcb8a0');
    c.save();c.rotate(Math.sin(p.phase)*moving*.055+Math.sin(t*2.7)*.019);
    c.scale(1+.017*Math.sin(t*2.7),1);body(c,atlas,0,34);c.restore();
    if(cast && gesture>.05) disk(c,...right,1.4+gesture,1.4+gesture,cast.id==='GL6'?'#c3f4ff':cast.id==='TE8'?'#d7ad74':'#c4dfbb');
    c.restore();
  }
  function guard(c,e,atlas,t) {
    if(e.dead>0 && e.dead<2.5)return;
    c.save();c.translate(e.x,e.y);c.scale(1.75,1.75);disk(c,2,3,9,7,'#3428214a');
    const fall=e.dead>0?Math.max(.05,(e.dead-2.5)/.4):1;
    c.globalAlpha=fall;c.rotate(e.angle+e.hit*.8+(1-fall)*.85);
    c.scale(fall,1);const stride=e.freeze>0?0:Math.sin(e.phase);
    boots(c,e.phase,e.walk); const jab=e.swing>0?Math.sin(Math.PI*(1-e.swing/.55)):0;
    const hand=[7+12*jab,7-stride];
    arm(c,[0,5],[2+4*jab,9],hand,'#9b7458');arm(c,[0,-6],[3,-9],[8,-8],e.kind===1?'#ae745e':'#698274');
    if(e.kind===1) {
      line(c,[[hand[0]-2,hand[1]],[hand[0]+16,hand[1]-2]],'#454851',2.9);
      line(c,[hand,[hand[0]+16,hand[1]-2]],'#c6c6b6',1.65);
      line(c,[[hand[0]+2,hand[1]-2.5],[hand[0]+2,hand[1]+2.5]],'#bc965d',1.8);
    }else{
      line(c,[[hand[0]-8,hand[1]+1],[hand[0]+17,hand[1]-3]],'#785332',1.75);
      line(c,[[hand[0]+15,hand[1]-2.5],[hand[0]+21,hand[1]-3.7]],'#bacbd1',2.6);
      disk(c,7,-8,6,5,'#a6a599');disk(c,7,-8,4.7,3.9,'#844a36');disk(c,7,-8,1.9,1.6,'#bec3ae');
    }
    body(c,atlas,e.kind,28);
    if(e.freeze>0){for(let i=0;i<5;i++){const a=i*tau/5;SpellArt.shard(c,Math.cos(a)*8,Math.sin(a)*8,1.6,4.3,-Math.cos(a)*2,true);}}
    if(e.hit>.12)disk(c,0,0,6,6,'#fff3ca40');
    c.restore();
    if(e.dead<=0 && e.hp<100){c.fillStyle='#382d27';c.fillRect(e.x-9,e.y-15,18,2);c.fillStyle='#d47f65';c.fillRect(e.x-9,e.y-15,18*e.hp/100,2);}
  }
  function arrow(c,b,t) {
    c.save();c.translate(b.x+1.4,b.y+2.6);c.rotate(b.angle);disk(c,-4,0,7.5,.7,'#382e234d');c.restore();
    c.save();c.translate(b.x,b.y);c.scale(.39,.39);
    SpellArt.projectile(c,{x:0,y:0,vx:Math.cos(b.angle),vy:Math.sin(b.angle),r:2.5,arrow:true,spellId:b.id==='R2'?'R2':'',heavyShot:false},t);c.restore();
  }
  // Two visible systems: the stream emerging from the spout and the pool waves
  // advancing from its impact. Clip both to the pool side of the crossbeam.
  function water(c,f,t) {
    c.save();c.translate(f.x,f.y);c.beginPath();c.arc(0,0,f.r,0,tau);c.clip();
    c.beginPath();c.rect(-f.r,f.lip-1,2*f.r,f.r-f.lip+2);c.clip();
    const y=f.lip+15, drift=Math.sin(t*4)*.6;
    for(let i=0;i<5;i++){
      const k=(t*.57+i/5)%1, rad=2+k*35;
      c.strokeStyle='rgba(139,230,211,'+((1-k)*.62)+')';c.lineWidth=1.1-k*.7;
      c.beginPath();c.ellipse(drift,y,rad,rad*.83,0,.2+i,5.9+i);c.stroke();
    }
    c.beginPath();c.moveTo(-1.6,f.lip);c.bezierCurveTo(-2,f.lip+6,drift-1.4,y-5,drift-2.3,y);
    c.quadraticCurveTo(drift,y+2.8,drift+2.5,y);c.bezierCurveTo(1.7,y-4,1.4,f.lip+6,1.3,f.lip);
    c.fillStyle='#79d8d5e0';c.fill();
    for(let i=0;i<7;i++){
      const k=(t*1.3+i/7)%1;disk(c,Math.sin(i*8+k)*.85,f.lip+14*k,.5,1.3,'#e3fff3');
      const a=i*2.4,k2=(t*1.8+i*.17)%1;
      disk(c,drift+Math.cos(a)*k2*5,y+Math.sin(a)*k2*3-6*k2*(1-k2),.55,.6,'#d8fff3');
    }
    c.restore();
  }
  function casting(c,p){
    const k=p.cast;
    if(!k || k.t>k.wind)return;
    const u=k.t/k.wind,a=p.angle,x0=p.x+17*Math.cos(a),y0=p.y+17*Math.sin(a),dx=k.x-x0,dy=k.y-y0;
    const x=x0+dx*u,y=y0+dy*u;
    c.save();c.translate(x,y);c.rotate(a);
    if(k.id==='GL6') {
      SpellArt.shard(c,0,0,3.4,8,-2,true);
      for(let j=1;j<5;j++)disk(c,-j*3.4,Math.sin(j*4+u*6)*2,1,.8,'#bce8e7');
    }else if(k.id==='TE8') {
      for(let j=0;j<5;j++){const a=j*2.4+u*7;disk(c,Math.cos(a)*7,Math.sin(a)*4,1.8,1.2,'#8f7659',a);}
    }else{
      for(let j=0;j<8;j++){const a=j*.86+u*12;disk(c,Math.cos(a)*9,Math.sin(a)*6,3.1,1.05,j%2?'#8b9872':'#d2b97d',a+.6);}
    }
    c.restore();
  }
  return {archer,guard,water,arrow,bowPose,casting};
})();
