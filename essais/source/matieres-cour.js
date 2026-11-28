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
  // Six fractures distinctes avec deux parois opposées et de la place entre les lames.
  const azimuts=[.17,1.09,2.33,3.18,4.19,5.22];
  function clawAngle(i){return azimuts[i];}
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
    for(let i=0;i<azimuts.length;i++){
      const a=clawAngle(i);g.save();g.rotate(a);g.translate(z.r,0);
      const centre=[[2.6,0]];
      for(let j=0;j<=7;j++){
        centre.push([-longueur*j/7,Math.sin(i*1.9+j*2.7)*1.65]);
      }
      const haut=centre.map(([x,y],j)=>[x,y-(j===0?.15:3.1+Math.sin(i+j)*1.2)]);
      const bas=centre.map(([x,y],j)=>[x,y+(j===0?.2:3.2+Math.cos(i+j*.8)*1.15)]);
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
  // Chaque section porte deux flancs et une arête. Le crochet se construit
  // depuis son socle, puis se couche vers le centre comme une mâchoire.
  const profils=[
    [0,0,1],[.05,.27,.93],[.19,.56,.73],[.43,.79,.49],[.72,.89,.24],[1,.77,0]
  ];
  function griffe(c,i,a,r,t){
    const cs=Math.cos(a),sn=Math.sin(a);
    const rise=unit((t-.027*(i%3))/.29);
    if(!rise)return;
    const fold=unit((t-.22)/(SpellArt.prisonTravel-.22));
    const baseX=cs*r,baseY=sn*r;
    const height=28+(i*11)%13,reach=16+14*fold+(i%3)*2,wide=9+(i%3)*1.6;
    const sweep=(i%2?1:-1)*5;
    const centres=profils.map(([d,z])=>{
      const along=reach*rise*(.34*d+.66*d*d),bend=rise*(Math.sin(d*Math.PI)*8+sweep*d*d);
      return [baseX-cs*along-sn*bend,baseY-sn*along+cs*bend-z*height*rise*.52];
    });
    const rings=centres.map(([x,y],k)=>{
      const prev=centres[Math.max(0,k-1)],next=centres[Math.min(k+1,centres.length-1)];
      const dx=next[0]-prev[0],dy=next[1]-prev[1],length=Math.hypot(dx,dy)||1;
      const nx=-dy/length,ny=dx/length,w=profils[k][2]*wide*rise;
      return [[x+nx*w,y+ny*w],[x+nx*w*.13,y+ny*w*.13-w*.22],[x-nx*w*.79,y-ny*w*.79]];
    });
    function face(points,col){polygon(c,points);c.fillStyle=col;c.fill();}
    face([...rings.map(s=>s[0]),...rings.map(s=>s[2]).reverse()],'#68aabd');
    const lit=cs+sn*.4>0;
    for(let k=0;k<rings.length-1;k++){
      const left=rings[k],right=rings[k+1];
      face([left[0],left[1],right[1],right[0]],lit?['#427c93','#5895a7','#8dc7d0','#abdce0','#e0f5eb'][k]:['#326273','#467f92','#65a7b7','#89c1cb','#bbdfe0'][k]);
      face([left[1],left[2],right[2],right[1]],lit?['#4b8998','#6aa4b1','#8ac1cb','#c6e8e5','#e5f6ea'][k]:['#6da8b7','#8cc5cf','#b4dde2','#d3eeea','#f2f8ed'][k]);
    }
    const ridge=rings.map(s=>s[1]);
    c.beginPath();c.moveTo(...ridge[1]);for(let k=2;k<ridge.length;k++)c.lineTo(...ridge[k]);
    c.lineWidth=.95;c.strokeStyle='#e5fbf2';c.stroke();
    face([rings[0][0],rings[1][0],rings[2][1]],'#42899b');
    face([rings[1][2],rings[2][2],rings[3][1]],'#a7d2d4');
    // Écailles de givre enchâssées au pied de la lame.
    for(let j=0;j<2;j++){
      const s=j?1:-1,bx=baseX+s*sn*wide*.64,by=baseY-s*cs*wide*.64;
      const tip=[bx-cs*(5+j)*rise,by-(9+j*4)*rise-sn*4*rise];
      face([[bx-4*rise,by],tip,[bx+3*rise,by+2*rise]],j?'#71aab7':'#b4dade');
    }
  }
  function lames(c,front,r,t){
    for(let i=0;i<azimuts.length;i++){
      const a=clawAngle(i);
      if((Math.sin(a)>0)===front)griffe(c,i,a,r,t);
    }
  }
  function glace(c,z,front){
    const t=z.t,r=clawRadius(z);
    c.save();c.translate(z.x,z.y);c.globalAlpha*=unit((z.dur-t)/.37);
    if(t<SpellArt.prisonTravel)lames(c,front,r,t);
    else{
      // Une fois refermée, seule l’opacité de la mâchoire évolue.
      const key=front?'lamesAvant':'lamesArriere',h=Math.ceil(r+52);
      if(!z[key]){
        const tile=document.createElement('canvas');tile.width=tile.height=h*4;
        const g=tile.getContext('2d');g.translate(h*2,h*2);g.scale(2,2);
        lames(g,front,r,t);z[key]=tile;
      }
      c.drawImage(z[key],-h,-h,h*2,h*2);
    }
    c.restore();
  }
  return {water,empreinte,solGlace,glace};
})();
