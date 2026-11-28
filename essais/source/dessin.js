const SourceArt=(()=>{
  function disk(c,x,y,rx,ry,col,angle=0){
    c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);c.fill();
  }
  function archer(c,p){
    c.save();c.translate(p.x,p.y);disk(c,1.4,2.8,11,7.6,'#352d2240');
    c.rotate(p.angle);
    CorpsBrune.draw(c,p,0);c.restore();
  }
  // Geler l’image de la pose articulée, pieds et arme compris.
  const glaces=new Map();
  function corpsGele(c,e){
    // Une cible figée conserve exactement sa pose et son arme pendant le gel.
    let prise=glaces.get(e.kind);
    const key=[e,e.phase,e.angle,e.travelAngle,e.walk,e.swing];
    if(prise&&key.every((v,i)=>v===prise.key[i])){
      peindreGel(c,prise,e.freeze);return;
    }
    function toile(){const t=document.createElement('canvas');t.width=t.height=160;return t;}
    prise={key,peau:toile(),gel:toile()};glaces.set(e.kind,prise);
    const corps=prise.peau.getContext('2d');
    corps.translate(80,80);corps.scale(1.6,1.6);CorpsBrune.draw(corps,e,e.kind);
    const g=prise.gel.getContext('2d');g.drawImage(prise.peau,0,0);
    g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=.74;
    const teinte=g.createLinearGradient(45,45,119,105);
    teinte.addColorStop(0,'#e6ffff');teinte.addColorStop(.53,'#a2dbe6');teinte.addColorStop(1,'#44829e');
    g.fillStyle=teinte;g.fillRect(0,0,160,160);g.fillStyle='#f1ffff';
    for(let i=0;i<28;i++){
      const x=45+(i*27)%75,y=46+(i*19)%68;
      g.beginPath();g.moveTo(x-3,y+1);g.lineTo(x+2,y-4);g.lineTo(x+.6,y+.9);g.fill();
    }
    g.restore();peindreGel(c,prise,e.freeze);
  }
  function peindreGel(c,prise,remaining){
    const frost=Math.min(1,remaining/.32,Math.max(.22,(2-remaining)/.14));
    if(frost<1)c.drawImage(prise.peau,-50,-50,100,100);
    c.save();c.globalAlpha*=frost;c.drawImage(prise.gel,-50,-50,100,100);c.restore();
  }
  function guard(c,e){
    if(e.dead>0&&e.dead<1.95)return;
    c.save();c.translate(e.x,e.y);disk(c,1,3,11,7,'#302a2740');c.rotate(e.angle);
    if(e.dead>0){
      const fall=clamp((2.9-e.dead)/.45,0,1);
      c.rotate(fall*.95);c.scale(1+fall*.16,1-fall*.28);c.globalAlpha=clamp((e.dead-1.95)/.30,0,1);
    }
    if(e.freeze>0&&e.dead<=0)corpsGele(c,e);else CorpsBrune.draw(c,e,e.kind);
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
  return {archer,guard,arrow,casting};
})();
