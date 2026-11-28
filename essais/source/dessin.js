// Chaque pose partage un pivot d’épaule. Les huit phases font alterner les
// appuis et décalent l’ourlet selon la distance parcourue.
const SourceArt=(()=>{
  const tau=Math.PI*2, cell=160, size=136;
  function disk(c,x,y,rx,ry,col,angle=0){
    c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,angle,0,tau);c.fill();
  }
  function frameAt(phase){return (Math.floor(phase*8/tau)%8+8)%8;}
  function sprite(c,atlas,row,phase){
    const frame=frameAt(phase);
    c.drawImage(atlas,frame*cell,row*cell,cell,cell,-size/2,-size/2,size,size);
  }
  function poseHeros(p){
    if(p.dash>0)return 3;
    if(p.cut>0)return 0;
    if(p.release>0)return 7;
    if(p.aiming)return p.draw<.2?4:p.draw<.68?5:6;
    if(p.prep||p.cast)return 7;
    if(p.motion>.68)return 2;
    return p.motion>.07?1:0;
  }
  function bowPose(p){
    // Coordonnées de la poignée au sein des trois poses d’armement.
    const grip=p.draw<.2?[9,3.9]:p.draw<.68?[10,3.6]:[12.6,2.2];
    return {grip};
  }
  function archer(c,p,atlas,t){
    const row=poseHeros(p),moving=p.motion;
    c.save();c.translate(p.x,p.y);disk(c,2.2,3,12,8,'#352d2240');
    c.rotate(p.angle);
    const phase=moving>.08?p.phase:t*2.6;
    if(p.cut>0){const u=1-p.cut/.36;c.rotate(.37-2.55*Math.sin(Math.PI*u)**2);}
    else if(row===3){c.translate(1.2,0);c.rotate(-.06);}
    else if(p.cast){
      const gesture=Math.sin(Math.PI*p.cast.t/p.cast.dur);
      c.rotate((p.cast.id==='TE8'?-.22:.17)*gesture);c.translate(gesture*1.7,0);
    }else if(p.release>0)c.translate(-2.2*p.release/.235,0);
    else if(moving>.08)c.rotate(Math.sin(phase)*moving*.045);
    sprite(c,atlas,row,phase);c.restore();
  }
  const givre=new Map();
  function cristalliser(c,atlas,row,phase,remaining){
    const frame=frameAt(phase),id=row*8+frame;
    let tile=givre.get(id);
    if(!tile){
      tile=document.createElement('canvas');tile.width=tile.height=cell;
      const g=tile.getContext('2d');
      g.drawImage(atlas,frame*cell,row*cell,cell,cell,0,0,cell,cell);
      g.globalCompositeOperation='source-in';
      const teinte=g.createLinearGradient(0,65,135,110);
      teinte.addColorStop(0,'#ecffff');teinte.addColorStop(.46,'#a6dee6');teinte.addColorStop(1,'#4f92ac');
      g.fillStyle=teinte;g.fillRect(0,0,cell,cell);
      g.globalCompositeOperation='source-atop';
      for(let i=0;i<36;i++){
        const x=24+(i*47)%113,y=21+(i*29)%112;
        g.fillStyle=i%3?'#f0ffff':'#75afc4';
        g.beginPath();g.moveTo(x-4,y+3);g.lineTo(x+4,y-6);g.lineTo(x+2,y+1);g.closePath();g.fill();
      }
      givre.set(id,tile);
    }
    const frost=Math.min(1,remaining/.32,Math.max(.22,(2-remaining)/.14));
    c.save();c.globalAlpha*=.76*frost;c.drawImage(tile,-size/2,-size/2,size,size);c.restore();
  }
  function guard(c,e,atlas,t){
    if(e.dead>0&&e.dead<1.95)return;
    c.save();c.translate(e.x,e.y);disk(c,1,3,11,7,'#302a2740');c.rotate(e.angle);
    let pose=e.walk>.12?1:0,phase=e.phase;
    if(e.dead>0){
      const fall=clamp((2.9-e.dead)/.45,0,1);
      pose=1;c.rotate(fall*.95);c.scale(1+fall*.16,1-fall*.28);c.globalAlpha=clamp((e.dead-1.95)/.30,0,1);
    }else if(e.swing>0){
      const wind=e.swing>.26;pose=wind?2:3;
      const thrust=wind?Math.sin((.55-e.swing)/.29*Math.PI/2):Math.sin(e.swing/.26*Math.PI/2);
      c.translate(wind?-1.7*thrust:3.4*thrust,0);c.rotate(e.kind===1?(wind?-.24:.19)*thrust:0);
    }else if(!e.freeze&&!e.stun){
      c.rotate(Math.sin(phase)*e.walk*.05);if(e.walk<.08)phase=t*2+e.kind;
    }
    const row=8+(e.kind-1)*4+pose;
    sprite(c,atlas,row,phase);
    if(e.freeze>0&&e.dead<=0)cristalliser(c,atlas,row,phase,e.freeze);
    c.restore();
    if(e.dead<=0 && e.freeze>0){
      c.save();c.globalAlpha*=Math.min(1,e.freeze/.32);
      for(let j=0;j<4;j++){
        const a=j*2.4+e.kind,x=e.x+Math.cos(a)*10,y=e.y+Math.sin(a)*8;
        const h=8+(j+e.kind)%3*2;
        c.drawImage(assets.ice,j*100,0,100,112,x-4,y-h*.76,8,h);
      }
      c.restore();
    }
    if(e.hit>.15)disk(c,e.x,e.y,5,4,'#fff4ce50');
    if(e.dead<=0 && e.hp<100){
      c.fillStyle='#362e27';c.fillRect(e.x-10,e.y-21,20,2);
      c.fillStyle='#dc826d';c.fillRect(e.x-10,e.y-21,20*e.hp/100,2);
    }
  }
  function arrow(c,b,t) {
    c.save();c.translate(b.x+1.4,b.y+2.6);c.rotate(b.angle);disk(c,-4,0,7.5,.7,'#382e234d');c.restore();
    c.save();c.translate(b.x,b.y);c.scale(.39,.39);
    SpellArt.projectile(c,{x:0,y:0,vx:Math.cos(b.angle),vy:Math.sin(b.angle),r:2.5,arrow:true,spellId:b.id==='R2'?'R2':'',heavyShot:false},t);c.restore();
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
  return {archer,guard,poseHeros,arrow,bowPose,casting};
})();
