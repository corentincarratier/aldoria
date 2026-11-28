/* Planches de Brune. Toutes les coordonnées sont exprimées dans le repère de la V1. */
const BRUNE = (() => {
  const sheets = new Map(), patterns = new Map(), poses = new WeakMap();
  const ready = Promise.all(Object.entries(window.aldoriaPlanches || {}).map(async ([key,src]) => {
    const sheet = new Image();
    sheet.src = src;
    await sheet.decode();
    sheets.set(key,sheet);
  }));
  const creatures = {}, allies = {Y1:'loup',YO1:'ours',YO2:'sanglier',YO4:'brute',YB1:'faucon',YB2:'griffon',YB3:'wyverne',YD:'dragon',YH:'aigle'};
  function register(sheet,rows){
    rows.forEach((names,i) => names.split(' ').filter(Boolean).forEach(name => {creatures[name]=[sheet,i]}));
  }
  register('faune',['loup','loup_neige','chien','ours','sanglier','crapaud','scorpion','chauve','libellule','anguille','ver','griffon','brute','yeti','golem','titan']);
  register('costumes',['pillard pillard_arc','garde garde_lance garde_arc','archere','eteint lancier','orc_lame orc_arc orc_garde','orc_chaman','pirate pirate_arc','capitaine','sorcier','ombre esprit','momie','noye','forgeron','ancien','artisan','enfant']);
  register('legendes',['brak','vesna','morwen clone','varek','ignar','orvain','maitre','roi','sorciere','katniss','abime','guerrier','aigle','wyverne','dragon','faucon']);
  register('objets',['','','','','','','','','','','','','pecheur','boulangere','herboriste','apprenti']);
  const villageois = {Oswin:'ancien',Nell:'boulangere',Bastien:'artisan','Maëlle':'herboriste',Tobias:'apprenti',Rosa:'herboriste',Katniss:'katniss',Gale:'artisan',Pita:'boulangere',Rufus:'apprenti','Mère Ilda':'herboriste',Joran:'artisan',Pia:'enfant',Gaspard:'pecheur',Lise:'herboriste','Boulangère':'boulangere',Marchande:'herboriste',Enfant:'enfant','Vieille femme':'herboriste',Mendiant:'apprenti',Tailleur:'artisan'};
  const houses = {cottage:0,cottage2:1,long:2,tower:3,thatch:4,big:5,forge:6,hut:7};
  const trees = {oak:0,pine:1,birch:2,snow:3,dead:4};
  const rocks = {cactus:['paysage',5],deadtree:['paysage',4],hedge:['paysage',7],rock:['paysage',8],cliff:['paysage',8],lava:['paysage',9],ice:['paysage',10],spike:['paysage',11],crystal:['paysage',11],pillar:['paysage',12],wall:['paysage',13],tent:['architecture',9],barrel:['architecture',10],crate:['architecture',11],thouse:['architecture',2]};
  const props = {tuft:['objets',0,18],bones:['objets',1,24],dune:['objets',2,84],shell:['objets',3,12],driftwood:['objets',4,47],stump:['objets',5,25],mushroom:['objets',6,15],snowtuft:['objets',7,26],crack:['objets',8,42],fire:['objets',9,37],throne:['objets',10,124],hole:['objets',11,72],reeds:['paysage',6,31],banner:['paysage',15,43],stairs:['architecture',14,69],cave:['architecture',15,109]};
  function draw(c,key,i,x,y,w,h=w){
    const sheet=sheets.get(key);
    if(!sheet || i==null)return false;
    const side=sheet.naturalWidth/4;
    c.drawImage(sheet,(i%4)*side,Math.floor(i/4)*side,side,side,x-w/2,y-h/2,w,h);
    return true;
  }
  function bridge(c,w,h){return draw(c,'paysage',14,0,0,w,h)}
  function texture(c,id,scale=1){
    const sheet=sheets.get('matieres');
    if(!sheet?.naturalWidth)return null;
    const key=id+'/'+scale;
    if(!patterns.has(key)){
      const side=Math.round(312*scale),tile=document.createElement('canvas');
      tile.width=tile.height=side;
      const ink=tile.getContext('2d'),cell=sheet.width/4;
      if(!ink||!side)return null;
      ink.drawImage(sheet,id%4*cell,Math.floor(id/4)*cell,cell,cell,0,0,side,side);
      try{
        const pattern=c.createPattern(tile,'repeat');
        if(pattern)patterns.set(key,pattern);
      }catch(error){
        if(error.name!=='InvalidStateError')throw error;
        tile.width=tile.height=1;
        return null;
      }
    }
    return patterns.get(key);
  }
  function material(c,id,alpha,x,y,w,h,scale=1){
    const fill=texture(c,id,scale);
    if(!fill)return;
    c.save();c.globalAlpha*=alpha;c.fillStyle=fill;c.fillRect(x,y,w,h);c.restore();
  }
  const patchTiles={grass:0,sand:4,dirt:2,rock:9,snow:8,swamp:7,ash:12,lava:11};
  let wash;
  function patch(c,kind,x,y,rx,ry,angle,zone){
    const id=kind==='sand'&&zone.k==='coast'?5:kind==='sand'&&zone.n==='Canyon Rouge'?13:patchTiles[kind];
    if(id==null||!sheets.has('matieres'))return;
    // La transparence de la lisière suit le lavis original, même pour deux
    // nappes qui se chevauchent. Le motif garde les coordonnées du monde.
    wash=wash||document.createElement('canvas');
    if(wash.width!==c.canvas.width)wash.width=c.canvas.width;
    if(wash.height!==c.canvas.height)wash.height=c.canvas.height;
    const ink=wash.getContext('2d');
    if(!ink)return;
    ink.globalCompositeOperation='source-over';
    ink.clearRect(0,0,wash.width,wash.height);
    ink.save();ink.translate(x,y);ink.rotate(angle||0);ink.scale(1,ry/rx);
    const fade=ink.createRadialGradient(0,0,rx*.45,0,0,rx);
    fade.addColorStop(0,'#fff');fade.addColorStop(.76,'#ffffffe5');fade.addColorStop(1,'#ffffff00');
    ink.fillStyle=fade;ink.fillRect(-rx,-rx,rx*2,rx*2);ink.restore();
    ink.globalCompositeOperation='source-in';
    const pat=texture(ink,id,1.25);if(!pat)return;ink.fillStyle=pat;ink.fillRect(0,0,wash.width,wash.height);
    c.save();c.globalAlpha*=kind==='lava'?.40:kind==='snow'?.67:.63;
    c.drawImage(wash,0,0);c.restore();
  }
  function materialOf(z){
    if(z.cold)return 8;
    return ({village:0,plain:0,forest:1,swamp:7,mont:9,cave:10,volcano:11,desert:4,coast:5,city:3,castle:14})[z.k] ?? 0;
  }
  function variation(x,y,n=0){
    const a=Math.imul(Math.round(x),374761393)^Math.imul(Math.round(y),668265263)^Math.imul(n+1,1597334677);
    const h=Math.imul(a^(a>>>13),1274126177);
    return ((h^(h>>>16))>>>0)/4294967296;
  }
  function trait(c,color,width,points){
    c.beginPath();c.moveTo(points[0],points[1]);
    for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);
    c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();
  }
  function tache(c,x,y,rx,ry,angle,color){
    c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fillStyle=color;c.fill();
  }
  function pavement(c,z,w,h){
    if(!sheets.has('matieres'))return false;
    const royal=z.k==='castle',base=royal?[107,105,97]:[127,117,99];
    c.fillStyle=royal?'#5f5c54':'#716957';c.fillRect(0,0,w,h);
    let row=0;
    for(let y=-4;y<h;row++){
      const high=(royal?26:17)+Math.floor(variation(row,7)*7);
      for(let x=-Math.floor(variation(row,18)*34);x<w;){
        const v=variation(x,row,2),span=Math.round((royal?43:24)+v*(royal?28:20));
        const cut=1.8+v*2.3,light=(variation(x,row,4)-.5)*20;
        const tone=base.map(n=>Math.round(n+light));
        c.fillStyle='rgb('+tone.join(',')+')';c.beginPath();
        c.moveTo(x+cut,y+1);c.lineTo(x+span-3,y+1.8);
        c.lineTo(x+span-1,y+4);c.lineTo(x+span-2,y+high-cut);
        c.lineTo(x+span-cut,y+high-1);c.lineTo(x+2.4,y+high-1.4);c.lineTo(x+1,y+3.9);c.closePath();c.fill();
        if(v>.39)trait(c,'#d6c8ac48',.85,[x+cut+1,y+2.1,x+span*(.4+v*.4),y+2.5]);
        if(v>.94)trait(c,'#514b4152',1.1,[x+span*.38,y+2,x+span*.40,y+high*.34,x+span*.55,y+high*.48]);
        x+=span;
      }
      y+=high;
    }
    material(c,royal?14:3,.19,0,0,w,h,1.28);return true;
  }
  function filet(c,x,y){
    c.save();c.translate(x,y);c.rotate(-.27);
    tache(c,0,4,25,8,0,'#514a3835');
    for(let i=0;i<9;i++){
      const dx=-19+i*4.6;
      trait(c,'#6c614788',.9,[dx,-6,dx+3,1,dx+8,7]);
    }
    for(let j=0;j<4;j++){
      const dy=-5+j*3.7;
      trait(c,'#766b4e9e',.9,[-18+j*2.2,dy,-7+j,dy+1,5+j,dy-1,19+j*1.6,dy+1]);
    }
    trait(c,'#67573d',1.4,[-20,-6,-10,-5,2,-7,18,-6]);
    for(const dx of [-17,-6,7,17])tache(c,dx,-6,2.1,1.1,-.2,'#b08c55');
    corde(c,23,6,5);c.restore();
  }
  function alentours(c,z){
    if(z.camp&&z.k==='coast'){
      const p=z.camp;filet(c,p.x+103,p.y-22);boisCoupe(c,p.x-109,p.y-18);
    }
    if(z.fountain&&z.k==='village'){
      const {x,y}=z.fountain;
      for(const [dx,dy,w] of [[-31,25,7],[-19,31,8],[-7,34,6],[9,33,7],[19,31,5]]){
        tache(c,x+dx,y+dy,w,2.3,-.1,'#4e554d50');
        trait(c,'#c0b4976b',.9,[x+dx-w*.6,y+dy-1,x+dx+w*.45,y+dy-1.6]);
      }
    }
    if(z.k==='volcano'&&z.boss==='ignar'){
      // Deux chenaux de cendre se rabattent sous le vent au pied du cratère.
      for(const [x,y,a] of [[620,533,-.09],[915,398,.13]]){
        c.save();c.translate(x,y);c.rotate(a);
        for(let i=0;i<7;i++){
          const dx=i*3.7,dy=i*2.2,reach=64-i*6;
          trait(c,i%2?'#89726842':'#2c25294a',2,[dx,dy,dx+reach*.42,dy-3,dx+reach,dy-8]);
        }
        c.restore();
      }
    }
  }
  function contact(c,x,y,rx,ry,dark='#2e251c'){
    c.save();c.translate(x,y);c.scale(1,ry/rx);
    const shade=c.createRadialGradient(0,0,rx*.15,0,0,rx);
    shade.addColorStop(0,dark+'78');shade.addColorStop(.62,dark+'4d');shade.addColorStop(1,dark+'00');
    c.fillStyle=shade;c.fillRect(-rx,-rx,2*rx,2*rx);c.restore();
  }
  function seuil(c,x,y,r,swamp,stone){
    const a=variation(x,y),earth=stone?'#574e43':'#64543b';
    if(swamp){
      for(let i=0;i<3;i++){
        const px=x-r*.18+i*4,py=y+5+i*3;
        trait(c,'#473b2d',3.5,[px-6,py,px+8,py-1]);trait(c,'#9c8964',.9,[px-6,py-1,px+5,py-2]);
      }
      return;
    }
    for(let i=0;i<4;i++){
      const px=x+(a-.5)*i*2,py=y+i*r*.074;
      tache(c,px,py,r*(.36-i*.045),r*.105,-.04,earth+(i===3?'22':'38'));
    }
    for(let i=0;i<3;i++){
      const px=x-r*.14+i*r*.16,py=y+2+(i%2)*2;
      tache(c,px,py,3.4+i%2,1.3,-.12,stone?'#ae9c7a':'#a19575');
    }
  }
  function boisCoupe(c,x,y){
    for(const [dx,dy,len] of [[0,0,12],[-3,-3,15],[2,-4,11]]){
      trait(c,'#504232',4.5,[x+dx,y+dy,x+dx+len,y+dy-2]);
      trait(c,'#877151',1.1,[x+dx,y+dy-1.3,x+dx+len-1,y+dy-3]);
      tache(c,x+dx+len,y+dy-2,1.7,2.0,-.22,'#c0a27b');
    }
  }
  function corde(c,x,y,r){
    c.save();c.translate(x,y);c.rotate(-.22);
    for(let i=0;i<3;i++){
      c.beginPath();c.ellipse(0,0,r-i*1.45,r*.52-i*.65,0,.12,Math.PI*2-.15);
      c.strokeStyle=i===0?'#594a36':'#ba9e70';c.lineWidth=i===0?2.6:1.2;c.stroke();
    }
    trait(c,'#a08761',1.25,[r*.8,0,r+4,2,r+8,1]);c.restore();
  }
  function devanture(c,k,z,x,y,r){
    if(k.v==='forge'){
      tache(c,x-r*.58,y+1,11,4,.08,'#423a3299');
      for(const [a,b] of [[-6,0],[-3,-2],[0,1],[3,-2],[5,0]])tache(c,x-r*.58+a,y+b,2.8,1.7,.27,'#484441');
      boisCoupe(c,x+r*.54,y-3);
    }else if(z.k==='swamp'){
      for(const side of [-1,1]){
        const dx=x+side*r*.47;
        trait(c,'#514633',3,[dx,y+2,dx+1,y-7]);trait(c,'#a09170',1,[dx-.3,y-6,dx+1,y-8]);
        trait(c,'#7c8c70',1.1,[dx-4,y+3,dx+4,y+2]);
      }
      corde(c,x+r*.56,y-1,5);
    }else if(k.v==='long'&&z.k==='village'){
      boisCoupe(c,x-r*.85,y-4);
    }else if(k.v==='big'&&z.k==='city'){
      draw(c,'architecture',11,x+r*.61,y-3,16);draw(c,'architecture',10,x+r*.78,y+1,13);
    }
    if(z.id==='2,6'&&k.v==='cottage2'){
      // Du linge à l'abri du vent, près du mur de la maison à ardoises.
      const bx=x-r*.94,by=y-r*.20;
      trait(c,'#62533d',2,[bx-12,by+8,bx-12,by-8]);
      trait(c,'#817057',1,[bx-12,by-7,bx-3,by-4,bx+9,by-5]);
      for(const [dx,w,col] of [[-9,4,'#cabfa0'],[-3,3,'#777f79'],[2,4,'#b1a594']]){
        c.fillStyle=col;c.beginPath();c.moveTo(bx+dx,by-5);c.lineTo(bx+dx+w,by-4);
        c.lineTo(bx+dx+w-1,by+2);c.lineTo(bx+dx-1,by+1);c.closePath();c.fill();
      }
    }
  }
  function house(c,k,z){
    const id=z.k==='swamp'&&k.v!=='forge'?7:houses[k.v];
    if(id==null||!sheets.has('architecture'))return false;
    const x=k.x,y=k.y+(k.dy||0),r=k.r;
    const size=r*(k.v==='long'||k.v==='big'?2.65:2.44);
    contact(c,x+r*.12,y+r*.48,r*1.15,r*.32);
    seuil(c,x,y+r*.78,r,z.k==='swamp',z.k==='city'||z.k==='castle');
    draw(c,'architecture',id,x,y-r*.22,size);
    devanture(c,k,z,x,y+r*.63,r);
    return true;
  }
  function tree(c,sty,x,y,i){
    if(!sheets.has('paysage'))return false;
    const age=variation(x,y),size=(age<.22?27:age>.85?49:38)*(1+.13*(variation(x,y,1)-.5));
    c.save();c.translate(x,y-6);c.rotate((variation(x,y,2)-.5)*(sty==='dead'?.32:.13));
    draw(c,'paysage',trees[sty]??1,0,-size*.08,size*(.90+age*.17),size);c.restore();return true;
  }
  function rock(c,k,z){
    let item=rocks[k.kind];
    if(!item||!sheets.has(item[0]))return false;
    const ordinary=k.kind==='spike'||k.kind==='rock'||k.kind==='cliff';
    if(ordinary)item=['paysage',z.cold?10:z.k==='volcano'?9:8];
    const size=k.r*(k.kind==='deadtree'?2.85:2.15),v=variation(k.x,k.y,5);
    if(ordinary||k.kind==='tent'||k.kind==='barrel')contact(c,k.x+size*.11,k.y+size*.22,size*.57,size*.19);
    c.save();c.translate(k.x,k.y-k.r*.12);
    if(ordinary)c.rotate((v-.5)*.53);
    draw(c,...item,0,0,size*(ordinary?.92+v*.17:1),size*(ordinary?.83+(1-v)*.23:1));
    c.restore();
    if(ordinary&&z.cold){
      tache(c,k.x+k.r*.66,k.y+k.r*.38,k.r*.36,k.r*.09,-.18,'#bbcbd7a8');
      trait(c,'#ecf0e9',1.4,[k.x+k.r*.61,k.y+k.r*.28,k.x+k.r*.91,k.y+k.r*.22]);
    }
    return true;
  }
  function prop(c,d,t){
    const p=props[d.kind];
    if(!p||!sheets.has(p[0]))return false;
    const ground=['tuft','bones','dune','shell','driftwood','stump','mushroom','snowtuft','crack','reeds'].includes(d.kind);
    const variationAt=variation(d.x,d.y,5),size=p[2]*(ground?.71+variationAt*.44:1);
    c.save();c.translate(d.x,d.y-(d.kind==='throne'?23:d.kind==='banner'?9:0));
    if(ground)c.rotate((variationAt-.5)*(d.kind==='tuft'?.36:.65));
    const height=size*(d.kind==='fire'?1+Math.sin(t*8+d.x)*.045:1);
    draw(c,p[0],p[1],0,0,size,height);c.restore();return true;
  }
  function motion(actor,clock,r){
    if(!actor)return {phase:0,power:0};
    let p=poses.get(actor);
    if(!p){p={x:actor.x,y:actor.y,t:clock,phase:0,power:0};poses.set(actor,p)}
    if(clock!==p.t){
      const dt=Math.max(0,Math.min(.1,clock-p.t)),distance=Math.hypot(actor.x-p.x,actor.y-p.y);
      const stride=distance<r*3?distance:0;
      p.phase=(p.phase+stride/Math.max(5,r*.72))%(2*Math.PI);
      const goal=Math.min(1,stride/Math.max(.01,dt*65));
      p.power+=(goal-p.power)*Math.min(1,dt*13);
      p.x=actor.x;p.y=actor.y;p.t=clock;
    }
    return p;
  }
  function costume(c,id,r,swing=0,actor=null,clock=0){
    const item=creatures[id];
    if(!item||!sheets.has(item[0]))return false;
    const gait=motion(actor,clock,r),step=Math.sin(gait.phase)*gait.power;
    c.save();
    c.translate(swing*r*.11,step*r*.035);
    c.rotate(step*.052+swing*.11);
    const size=2.4*r;
    draw(c,...item,0,0,size*(1+Math.abs(step)*.035),size*(1-Math.abs(step)*.025));
    if(actor?.n&&actor.col&&!actor.d){
      // Le rappel de couleur du villageois se retrouve dans le portrait.
      trait(c,'#383630',r*.13,[-r*.53,r*.22,-r*.23,r*.30,r*.19,r*.17]);
      trait(c,actor.col,r*.087,[-r*.53,r*.19,-r*.23,r*.27,r*.19,r*.14]);
      if(actor.id==='bastien'){
        trait(c,'#856c4a',r*.09,[r*.44,r*.62,r*1.12,-r*.25]);
        for(const off of [-.085,0,.085])trait(c,'#666a5d',r*.055,[r*(1.08+off),r*(-.23+off),r*(1.32+off),r*(-.49+off)]);
      }
    }
    c.restore();return true;
  }
  // Déformer la silhouette dans son repère local. Le thorax et la tête restent
  // sur la trajectoire réelle tandis que la queue, les pattes et les ailes suivent.
  function movingBody(c,item,size,id,gait,swing,wing,snake,clock){
    const sheet=sheets.get(item[0]),cell=sheet.width/4;
    const sx=item[1]%4*cell,sy=Math.floor(item[1]/4)*cell;
    const slices=12,part=cell/slices,screen=size/slices;
    const legs=!wing&&!snake,beat=Math.sin(clock*9);
    for(let i=0;i<slices;i++){
      const t=(i+.5)/slices;
      if(wing){
        const reach=Math.pow(Math.abs(2*t-1),1.4);
        const dx=(beat*.055+Math.max(0,swing)*.075)*size*reach;
        c.drawImage(sheet,sx,sy+i*part,cell,part,-size/2+dx,(t-.5)*size-screen/2,size,screen+.16);
      }else{
        const ripple=snake?Math.sin(gait.phase-t*5)*(1-t)*gait.power*.088:
          legs?Math.sin(gait.phase+(t>.5?0:Math.PI))*Math.sin(t*Math.PI)*gait.power*.042:0;
        const retract=id==='scorpion'?Math.max(0,-swing)*(1-t)*.14:0;
        c.drawImage(sheet,sx+i*part,sy,part,cell,(t-.5)*size-screen/2,(-.5+ripple-retract)*size,screen+.16,size);
      }
    }
  }
  function beast(c,id,x,y,r,f,swing=0,actor=null,clock=0){
    const item=creatures[id];
    if(!item||!sheets.has(item[0]))return false;
    const gait=motion(actor,clock,r),wing=['chauve','libellule','griffon','aigle','faucon','dragon','wyverne'].includes(id);
    const step=Math.sin(gait.phase)*gait.power,flap=wing?Math.sin(clock*9+x*.04)*.10:0;
    const snake=id==='ver'||id==='anguille';
    const size=r*(wing?2.85:2.65);
    c.save();c.translate(x,y);c.rotate(f+step*(snake?.12:.045));c.translate(r*swing*.10,0);
    c.scale(1+swing*.09+Math.abs(step)*.035,1+flap-swing*.06);
    c.translate(0,step*r*.035);
    if(wing||gait.power>.025||Math.abs(swing)>.04)movingBody(c,item,size,id,gait,swing,wing,snake,clock);
    else draw(c,...item,0,0,size);
    c.restore();return true;
  }
  function villager(v){return v.smith||/forgeron|armuri/i.test(v.n||'')?'forgeron':villageois[v.n]||(v.small?'enfant':v.elder?'ancien':'artisan')}
  function animal(id){return creatures[id]?.[0]==='faune'||['abime','aigle','wyverne','dragon','faucon'].includes(id)}
  return {ready,sheets,creatures,allies,draw,bridge,texture,material,patch,pavement,alentours,materialOf,house,tree,rock,prop,costume,beast,villager,animal};
})();
window.aldoriaIllustrations=BRUNE;
