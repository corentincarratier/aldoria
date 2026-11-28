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
  // Planches de Riley Gombart. Les pièces partagent des cases carrées avec marge.
  function piece(c,atlas,index,x,y,w,h,angle=0) {
    c.save();c.translate(x,y);c.rotate(angle);
    c.drawImage(atlas,index*128,0,128,128,-w/2,-h/2,w,h);c.restore();
  }
  function arm(c,atlas,shoulder,elbow,hand) {
    function bone(index,a,b,width) {
      const dx=b[0]-a[0],dy=b[1]-a[1];
      piece(c,atlas,index,(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(dx,dy)*1.22+1,width,Math.atan2(dy,dx));
    }
    bone(2,shoulder,elbow,10);bone(3,elbow,hand,8);
    piece(c,atlas,4,...hand,5.6,5.6,Math.atan2(hand[1]-elbow[1],hand[0]-elbow[0]));
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
  function boots(c,atlas,p) {
    c.save();c.rotate(p.travelAngle??p.angle);
    for(const side of [-1,1]) {
      const wave=Math.sin(p.phase+(side<0?Math.PI:0))*p.motion;
      piece(c,atlas,6,-1+wave*3,side*4.3,9,7);
      piece(c,atlas,5,-2+wave*7.3,side*(4.6+.6*Math.abs(wave)),11.8,8.2);
    }
    c.restore();
  }
  function archer(c,p,atlas,t) {
    const moving=p.motion, swing=Math.sin(p.phase), d=p.dash/.19;
    const cast=p.cast, u=cast?Math.min(1,cast.t/cast.dur):0;
    const gesture=Math.sin(Math.PI*u);
    const twist=cast?(cast.id==='AI8'?Math.sin(u*tau)*.65:cast.id==='TE8'?-.32*gesture:.24*gesture):0;
    const pose=bowPose(p), shooting=p.aiming || p.release>0;
    c.save();c.translate(p.x,p.y);c.scale(2,2);disk(c,2,3,11+d*2,8,'#38281f42');
    boots(c,atlas,p);c.rotate(p.angle);
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
    arm(c,atlas,[0,-6],[left[0]*.45,-9-moving*swing],left);
    arm(c,atlas,[0,6],[right[0]-4,9+p.draw*2],right);
    c.save();c.rotate(Math.sin(p.phase)*moving*.055+Math.sin(t*2.7)*.019);
    c.scale(1+.017*Math.sin(t*2.7),1);piece(c,atlas,1,-1,0,25,25);
    // Écharpe de l’archer, attachée à l’épaule gauche.
    const trail=Math.sin(p.phase-.8)*moving;
    c.fillStyle='#893f36';c.beginPath();c.moveTo(0,-6);c.quadraticCurveTo(-8,-8,-14,-5+trail*2);
    c.lineTo(-16,-3+trail*2);c.lineTo(-11,-3+trail);c.lineTo(-14,-.3+trail);c.quadraticCurveTo(-6,-2,1,-4);c.fill();
    line(c,[[-5,-6],[-10,-5+trail]],'#ba6551',.8);
    line(c,[[-5.6,6],[3,-5.9]],'#523625',2.4);disk(c,2,-5,1.1,.95,'#e7c082');
    piece(c,atlas,0,.7,0,14.5,19,.025*swing*moving);c.restore();
    if(cast && gesture>.05) disk(c,...right,1.4+gesture,1.4+gesture,cast.id==='GL6'?'#c3f4ff':cast.id==='TE8'?'#d7ad74':'#c4dfbb');
    c.restore();
  }
  function guard(c,e,atlas,t) {
    if(e.dead>0 && e.dead<2.19)return;
    c.save();c.translate(e.x,e.y);c.scale(1.75,1.75);disk(c,2,3,9,7,'#3428214a');

    let state='idle',progress=0;
    if(e.dead>0){state='death';progress=clamp((2.9-e.dead)/.64,0,.999);}
    else if(e.swing>0){state='strike';progress=clamp(1-e.swing/.55,0,.999);}
    else if(e.walk>.045 || e.freeze>0){state='walk';progress=(e.phase%TAU)/TAU;}
    const row=state==='idle'?0:state==='walk'?1:state==='death'?4:e.kind+1;
    const count=[1,15,18,18,16][row],frame=Math.floor(progress*count);
    c.rotate(e.angle);c.translate(-Math.cos(e.phase)*e.walk*.24,0);
    const size=82;
    c.drawImage(atlas,frame*144,((e.kind-1)*5+row)*144,144,144,-size/2,-size/2,size,size);
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
    if(!k || !k.wind || k.t>k.wind)return;
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
