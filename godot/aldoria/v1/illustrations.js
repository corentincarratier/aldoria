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
  const villageois = {Oswin:'ancien',Nell:'boulangere',Bastien:'artisan','Maëlle':'herboriste',Tobias:'apprenti',Rosa:'herboriste',Katniss:'katniss',Gale:'artisan',Pita:'boulangere',Rufus:'apprenti','Mère Ilda':'herboriste',Joran:'artisan',Pia:'enfant',Gaspard:'pecheur',Lise:'pecheur','Boulangère':'boulangere',Marchande:'herboriste',Enfant:'enfant','Vieille femme':'ancien',Mendiant:'apprenti',Tailleur:'artisan'};
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
  let bridgeSource;
  function bridge(c,w,h){
    const sheet=sheets.get('paysage');
    if(!sheet)return false;
    if(!bridgeSource){
      const side=sheet.width/4,cv=document.createElement('canvas');
      cv.width=cv.height=side;const pen=cv.getContext('2d');
      pen.drawImage(sheet,2*side,3*side,side,side,0,0,side,side);
      const data=pen.getImageData(0,0,side,side).data;
      let left=side,right=0,top=side,bottom=0;
      for(let y=0;y<side;y++)for(let x=0;x<side;x++)if(data[(y*side+x)*4+3]>64){
        left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      }
      bridgeSource=right>left&&bottom>top?[side*2+left,side*3+top,right-left+1,bottom-top+1]:[side*2.18,side*3.02,side*.64,side*.96];
    }
    c.drawImage(sheet,...bridgeSource,-w/2,-h/2,w,h);return true;
  }
  function texture(c,id,scale=1){
    const sheet=sheets.get('matieres');
    if(!sheet)return null;
    const key=id+'/'+scale;
    if(!patterns.has(key)){
      const side=Math.round(108*scale),tile=document.createElement('canvas');
      tile.width=tile.height=side*2;
      const ink=tile.getContext('2d'),cell=sheet.width/4;
      for(let row=0;row<2;row++)for(let col=0;col<2;col++){
        ink.save();ink.translate(col?side*2:0,row?side*2:0);ink.scale(col?-1:1,row?-1:1);
        ink.drawImage(sheet,id%4*cell+2,Math.floor(id/4)*cell+2,cell-4,cell-4,0,0,side,side);
        ink.restore();
      }
      patterns.set(key,c.createPattern(tile,'repeat'));
    }
    return patterns.get(key);
  }
  function material(c,id,alpha,x,y,w,h,scale=1){
    const fill=texture(c,id,scale);
    if(!fill)return;
    c.save();c.globalAlpha*=alpha;c.fillStyle=fill;c.fillRect(x,y,w,h);c.restore();
  }
  function materialOf(z){
    if(z.cold)return 8;
    return ({village:0,plain:0,forest:1,swamp:7,mont:9,cave:10,volcano:11,desert:4,coast:5,city:3,castle:14})[z.k] ?? 0;
  }
  function house(c,k,z){
    const id=z.k==='swamp'&&k.v!=='forge'?7:houses[k.v];
    if(id==null)return false;
    const size=k.r*(k.v==='long'||k.v==='big'?2.65:2.44);
    return draw(c,'architecture',id,k.x,k.y+(k.dy||0)-k.r*.22,size);
  }
  function tree(c,sty,x,y,i){
    const size=34+(i%5)*1.7;
    return draw(c,'paysage',trees[sty]??1,x,y-7,size);
  }
  function rock(c,k){
    const item=rocks[k.kind];
    if(!item)return false;
    const size=k.r*(k.kind==='deadtree'?2.85:2.15);
    return draw(c,...item,k.x,k.y-k.r*.12,size);
  }
  function prop(c,d,t){
    const p=props[d.kind];
    if(!p)return false;
    const height=p[2]*(d.kind==='fire'?1+Math.sin(t*8+d.x)*.045:1);
    return draw(c,p[0],p[1],d.x,d.y-(d.kind==='throne'?23:d.kind==='banner'?9:0),p[2],height);
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
  return {ready,sheets,creatures,allies,draw,bridge,texture,material,materialOf,house,tree,rock,prop,costume,beast,villager,animal};
})();
window.aldoriaIllustrations=BRUNE;
