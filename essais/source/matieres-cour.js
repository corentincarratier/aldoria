// Le masque vient de la couleur de l'eau du décor. La margelle, la traverse et
// le bec restent devant le courant, quelle que soit la résolution de la fenêtre.
const CourMatieres=(()=>{
  function water(c,f,t){
    // Cycle continu de quatre secondes. Le masque d'eau a été découpé dans
    // le décor à sa taille de jeu et respecte le bois des deux côtés du bec.
    const size=116,frame=Math.floor(t*30+1e-6)%120;
    c.drawImage(assets.eau,(frame%12)*size,Math.floor(frame/12)*size,size,size,
      f.x-size/2,f.y-size/2,size,size);
    c.save();c.translate(f.x+1.5,f.y+15.5);
    c.strokeStyle='#67d5cb';c.lineWidth=2.4;c.beginPath();c.moveTo(0,0);
    c.quadraticCurveTo(Math.sin(t*4)*.7,4,.6,10);c.stroke();
    c.fillStyle='#d7fff1';
    for(let i=0;i<6;i++){
      const q=(t*1.9+i/6)%1,a=i*2.4;
      c.fillRect(.5+Math.cos(a)*q*4.8,10+Math.sin(a)*q*2.6-Math.sin(q*Math.PI)*2.8,1,.9);
      if(i<3)c.fillRect(-.4,(t*27+i*3)%9,.8,1.6);
    }
    c.restore();
  }
  const unit=v=>Math.max(0,Math.min(1,v));
  function clawAngle(i){return (i+.22)*TAU/14;}
  function clawRadius(z){
    const progress=unit((z.t-.17)/(SpellArt.prisonTravel-.17));
    return z.r*(1-.46*progress*progress*(3-2*progress));
  }
  function polygon(c,points){
    c.beginPath();c.moveTo(...points[0]);
    for(let i=1;i<points.length;i++)c.lineTo(...points[i]);
    c.closePath();
  }
  // Les jointures conservent la texture du pavé ébréché à cet endroit.
  // Le dessin est préparé une fois, puis découvert à mesure que la griffe avance.
  function empreinte(z){
    const size=Math.ceil(z.r+7)*2,res=2,canvas=document.createElement('canvas');
    canvas.width=canvas.height=size*res;
    const g=canvas.getContext('2d'),h=size/2;
    g.scale(res,res);g.translate(h,h);
    const longueur=z.r*.46;
    for(let i=0;i<14;i++){
      const a=clawAngle(i);g.save();g.rotate(a);g.translate(z.r,0);
      const centre=[[2.6,0]];
      for(let j=0;j<=7;j++){
        centre.push([-longueur*j/7,Math.sin(i*1.9+j*2.7)*1.65]);
      }
      const haut=centre.map(([x,y],j)=>[x,y-(j===0?.15:2+Math.sin(i+j)*.8)]);
      const bas=centre.map(([x,y],j)=>[x,y+(j===0?.2:2.2+Math.cos(i+j*.8)*.85)]);
      polygon(g,haut.concat(bas.slice().reverse()));g.fillStyle='#645647';g.fill();
      polygon(g,centre.concat(bas.slice().reverse()));g.fillStyle='#8ca5a4';g.fill();
      // Le bord opposé se soulève en trois éclats. La face supérieure vient du décor réel.
      for(let j=1;j<8;j++){
        const [x,y]=centre[j],w=3+(i+j)%3;
        if((j+i)%2===0){
          const face=[[x+w,y-1.6],[x+.7,y-4.8],[x-w*.55,y-4.6],[x-w,y-2.4]];
          polygon(g,face);g.fillStyle='#7f7669';g.fill();
          g.save();g.translate(0,-1.3);polygon(g,face);g.clip();
          g.setTransform(res,0,0,res,(h-z.x)*res,(h-z.y)*res);
          g.drawImage(floor,Math.sin(a)*1.7,-Math.cos(a)*1.7,W,H);g.restore();
        }
        polygon(g,[[x+2.4,y+.6],[x+.4,y-.65],[x-w*.85,y+.5],[x-1,y+1.45]]);
        g.fillStyle=(i+j)%3?'#bbd4d5':'#e0ebde';g.fill();
      }
      g.restore();
    }
    return canvas;
  }
  function solGlace(c,z){
    const reach=clawRadius(z),opacity=unit(z.t/.12)*unit((z.dur-z.t)/.44);
    if(!opacity)return;
    const h=z.empreinte.width/4;
    c.save();
    // L'eau et les tuiles restent des surfaces distinctes des pavés.
    c.beginPath();c.rect(0,0,W,H);c.moveTo(fountain.x+74,fountain.y);
    c.arc(fountain.x,fountain.y,74,0,TAU);
    c.moveTo(674,544);c.lineTo(W,544-(W-674)*.73);c.lineTo(W,H);c.lineTo(674,H);c.closePath();
    c.clip('evenodd');c.translate(z.x,z.y);
    c.beginPath();c.rect(-h,-h,2*h,2*h);
    c.moveTo(reach-2.8,0);c.arc(0,0,reach-2.8,0,TAU);c.clip('evenodd');
    c.globalAlpha*=opacity;c.drawImage(z.empreinte,-h,-h,2*h,2*h);c.restore();
  }
  function glace(c,z,front,atlas){
    const t=z.t,radius=clawRadius(z);
    const dissolve=unit((z.dur-t)/.37);
    c.save();c.translate(z.x,z.y);c.globalAlpha*=dissolve;
    for(let i=0;i<14;i++){
      const a=clawAngle(i),cs=Math.cos(a),sn=Math.sin(a);
      if((sn>0)!==front)continue;
      const rise=unit((t-.019*(i%5))/.19);if(!rise)continue;
      const x=cs*radius,y=sn*radius,w=(17+(i*7%9))*rise,h=(23+(i*11%17))*rise;
      c.save();c.translate(x,y);c.fillStyle='rgba(31,76,94,.23)';c.beginPath();c.ellipse(1,1,w*.46,w*.15,0,0,TAU);c.fill();
      c.rotate(-cs*.25);c.drawImage(atlas,i%4*100,0,100,112,-w/2,-h,w,h);
      c.drawImage(atlas,(i+1)%4*100,0,100,112,w*.27,-h*.31,w*.36,h*.33);c.restore();
    }
    c.restore();
  }
  return {water,empreinte,solGlace,glace};
})();
