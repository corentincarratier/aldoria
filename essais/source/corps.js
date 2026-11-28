// Repère du personnage : x vers l’avant, y vers sa droite. Les appuis suivent
// le déplacement au sol, même quand le buste se tourne pour viser en marchant.
const CorpsBrune=(()=>{
  const tau=2*Math.PI;
  const costumes=[
    {sleeve:'#d5d5bd',shade:'#87958b',coat:'#777e70',collar:'#a23535',leg:'#59483e'},
    {sleeve:'#d2c8a5',shade:'#81877b',coat:'#28555b',collar:'#397077',leg:'#534940'},
    {sleeve:'#aaa993',shade:'#71796b',coat:'#9b652e',collar:'#c88b3b',leg:'#5c4e39'}
  ];
  const ink='#413934';
  function patch(c,coords,color,edge){
    c.beginPath();c.moveTo(coords[0],coords[1]);
    for(let j=2;j<coords.length;j+=2)c.lineTo(coords[j],coords[j+1]);
    c.closePath();c.fillStyle=color;c.fill();
    if(edge){c.lineWidth=.95;c.strokeStyle=edge;c.stroke();}
  }
  function stroke(c,x,y,u,v,color,width){
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.stroke();
  }
  function oval(c,x,y,rx,ry,color){
    c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,tau);c.fill();
  }
  function part(c,index,cx,cy,x,y,scale,angle=0){
    c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);
    c.drawImage(assets.details,index*64,0,64,64,50-cx,50-cy,64,64);c.restore();
  }
  function gait(phase){
    const p=((phase/tau)%1+1)%1;
    if(p<.5)return {reach:1-4*p,lift:0};
    const u=(p-.5)*2;
    return {reach:-1+2*u*u*(3-2*u),lift:Math.sin(Math.PI*u)};
  }
  function leg(c,side,phase,stride,effort,kind,slide){
    const {reach,lift}=gait(phase);
    const hipX=-3,hipY=side*5.4;
    const x=slide?(side>0?19:-11):reach*stride*effort-2;
    const y=side*(7.5+effort*2+lift*3*effort+(slide?2:0));
    const kneeX=(x+hipX)*.50+3+lift*4*effort,kneeY=(y+hipY)/2+side*2;
    stroke(c,hipX,hipY,kneeX,kneeY,ink,8);
    stroke(c,hipX,hipY,kneeX,kneeY,costumes[kind].leg,6.1);
    oval(c,kneeX,kneeY,3.9,3.6,costumes[kind].leg);
    stroke(c,kneeX,kneeY,x,y,ink,6.6);stroke(c,kneeX,kneeY,x,y,'#77614b',5);
    c.save();c.translate(x,y);c.rotate(side*(.075+.15*lift*effort));
    patch(c,[-3,-3.8,2,-4.1,6.8,-2.7,8.1,-.6,7,2.7,3.3,3.7,-2.8,3.1], '#795037',ink);
    stroke(c,3,-2.4,6,-.9,'#bd8c5a',1.5);stroke(c,-.8,-2.7,-.8,2.5,'#aa7f4c',1.1);c.restore();
  }
  function arm(c,s,handX,handY,col,elbowBack=0){
    const sx=1,sy=s*10.8,ex=(sx+handX)*.44-3.4-elbowBack,ey=(sy+handY)*.5+s*3;
    stroke(c,sx,sy,ex,ey,ink,8.1);stroke(c,sx,sy,ex,ey,col.shade,6.6);
    stroke(c,sx-.6,sy-.6,ex,ey-1,col.sleeve,4.5);
    stroke(c,ex,ey,handX,handY,ink,6.1);stroke(c,ex,ey,handX,handY,'#8a6146',4.9);
    stroke(c,ex+(handX-ex)*.28,ey+(handY-ey)*.28,ex+(handX-ex)*.58,ey+(handY-ey)*.58,'#b59566',5.1);
    oval(c,handX,handY,3.1,2.9,ink);oval(c,handX+.4,handY-.35,2.4,2.15,'#d69d74');
  }
  function sword(c,x,y,angle){
    c.save();c.translate(x,y);c.rotate(angle);
    stroke(c,-3.2,0,2.7,0,'#70442a',2.7);
    patch(c,[2,-1.8,16,-1.5,24,.15,17,1.4,2,1.7],'#91a6a5',ink);
    patch(c,[3,-1.1,16,-1.05,23.4,.1,4,.12],'#e5ead9');
    stroke(c,2,-3.4,2,3.4,'#563f2c',2.3);stroke(c,1.8,-3,1.8,2.5,'#d4ab71',1);c.restore();
  }
  function clothStep(p,dx,dy,dt){
    // Pesanteur perpendiculaire au sol : au repos, le tissu tombe près du dos.
    // Le vent relatif vient de la vitesse réellement parcourue.
    if(!p.tissu)p.tissu={x:-8*Math.cos(p.angle),y:-8*Math.sin(p.angle),vx:0,vy:0};
    const f=p.tissu,max=14,dist=Math.hypot(dx,dy),trail=Math.min(max,dist/dt*.09);
    const x=-8*Math.cos(p.angle)-(dist?dx/dist*trail:0),y=-8*Math.sin(p.angle)-(dist?dy/dist*trail:0);
    const spring=140,damping=20;
    f.vx+=((x-f.x)*spring-f.vx*damping)*dt;f.vy+=((y-f.y)*spring-f.vy*damping)*dt;
    f.x+=f.vx*dt;f.y+=f.vy*dt;
  }
  function cape(c,p){
    const f=p.tissu,cs=Math.cos(p.angle),sn=Math.sin(p.angle);
    const x=clamp(f?f.x*cs+f.y*sn:-8,-19,3)-3;
    const y=clamp(f?-f.x*sn+f.y*cs:0,-10,10);
    // Déformer le drap peint de la variante C, ourlet et plis compris.
    // Les huit bandes partagent les mêmes bords et sont attachées au col.
    const attache=2.5,longueur=attache-x+3;
    for(let i=0;i<8;i++){
      const u=i/8,v=(i+1)/8;
      const decrit=u=>[attache-longueur*u,y*u*u,18+3*u];
      const [x1,y1,h1]=decrit(u),[x2,y2,h2]=decrit(v);
      c.save();c.translate(x2,y2);c.transform(1,(y1-y2)/(x1-x2),0,1,0,0);
      c.drawImage(assets.details,256+4+(7-i)*3.5,1,3.5,50,0,-h2/2,x1-x2+.16,(h1+h2)/2);
      c.restore();
    }
  }
  function bow(c,x,y,pull){
    c.save();c.translate(x,y);c.strokeStyle='#533b2c';c.lineWidth=3.2;
    c.beginPath();c.moveTo(-5,-15);c.quadraticCurveTo(7,0,-5,15);c.stroke();
    c.lineWidth=1.2;c.strokeStyle='#d6a562';c.stroke();c.beginPath();c.moveTo(-5,-15);c.lineTo(-3-pull,0);c.lineTo(-5,15);
    c.strokeStyle='#e1d4ac';c.lineWidth=.78;c.stroke();c.restore();
  }
  function demiPas(p,kind){
    return kind?7+4*Math.min(1,Math.hypot(p.vx,p.vy)/37):13+3*clamp((p.motion-.56)/.38,0,1);
  }
  function bowGrip(draw){return [8.5+4.1*draw,2.4];}
  function draw(c,p,kind){
    const hero=kind===0,col=costumes[kind],effort=clamp(hero?p.motion:p.walk,0,1),phase=p.phase||0;
    const stride=demiPas(p,kind),slide=hero&&p.dash>0;
    const walking=hero?Math.min(1,effort*2):Math.min(1,effort*1.7);
    const bearing=p.travelAngle??p.angle;
    const forward=Math.cos(bearing-p.angle),lateral=Math.sin(bearing-p.angle);
    // Une jambe passe devant pendant que l’autre porte le poids, y compris en visée latérale.
    c.lineJoin=c.lineCap='round';
    c.save();c.rotate(bearing-p.angle);
    leg(c,-1,phase,stride,walking,kind,slide);leg(c,1,phase+Math.PI,stride,walking,kind,slide);c.restore();
    const swing=Math.cos(phase)*walking,pass=Math.sin(phase)*walking;
    const hold=hero&&(p.aiming||p.release>0);
    if(!hold){
      c.translate(slide?3:Math.abs(pass)*.8,swing*.85);
      c.rotate(.095*swing*forward+(slide?.19:0));
    }
    patch(c,[-9,-7,-4,-11,3,-11,7,-6,7,6,3,11,-4,10,-10,6],col.coat,ink);
    patch(c,[-8,-6,-5,-9,0,-9,-4,8,-8,6],col.shade);
    if(hero)cape(c,p);
    else {patch(c,[-7,-8,0,-10,4,-9,3,8,-2,9,-7,4],col.collar);stroke(c,-5,-6,1,8,'#b89966',1.45);}
    const melee=hero?p.cut||0:p.swing||0;
    let hx=2-9*swing*forward,hy=15-2.7*swing*lateral;
    let lx=2+9*swing*forward,ly=-15+2.7*swing*lateral;
    const thrust=hero?Math.sin(Math.PI*clamp(1-melee/.36,0,1)):clamp((.34-melee)/.13,0,1)*clamp(melee/.12,0,1);
    if(melee>0){hx=hero?4+thrust*12:melee>.30?-8:4+thrust*11;hy=15-thrust*6;}
    if(slide){hx=-7;lx=14;}
    if(hold){
      [lx,ly]=bowGrip(p.draw||0);
      hx=lx-2-(p.release>0?11*p.release/.235:14*(p.draw||0));hy=4+(p.draw||0)*2.4;
      bow(c,lx,ly,p.release>0?0:14*(p.draw||0));}
    else if(hero&&(p.prep||p.cast)){
      const u=p.cast?clamp(p.cast.t/(p.cast.wind||.22),0,1):0;
      lx=3+14*u;ly=-10+6*u;hx=-2+6*u;hy=12;
    }else if(kind===2){
      const advance=melee>0?hx-2:4*swing;
      const a=-.46+.12*swing;
      lx=advance+12*Math.cos(a);ly=1+12*Math.sin(a);
      hx=advance-8*Math.cos(a);hy=1-8*Math.sin(a);
      c.save();c.translate(advance,1);c.rotate(a);c.translate(0,-11);
      stroke(c,-17,11,33,11,'#49362c',3.7);stroke(c,-17,10.6,34,10.6,'#ad8052',1.8);
      patch(c,[31,8.8,41,10.5,31,12.6,28,10.6],'#cee0da',ink);c.restore();
    }else sword(c,hx,hy,hero&&melee>0?-1.45+2.6*thrust:1.06-.56*swing-.75*thrust);
    arm(c,-1,lx,ly,col);arm(c,1,hx,hy,col);
    if(kind===1)part(c,3,96,81,lx+1,ly-1.9,.72,-.26);
    oval(c,4,-.4,9,9.1,col.collar);
    const hc=[[89,79],[80,79],[80,78]][kind];
    part(c,kind,hc[0],hc[1],5.5+(slide?1:0),-.8,.94,kind===2?-Math.PI/2:0);
  }
  return {draw,clothStep,demiPas,bowGrip};
})();
