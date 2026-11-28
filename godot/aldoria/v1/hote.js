'use strict';
const hostSettings = window.aldoriaSettings;
const archer = document.createElement('canvas');
archer.width=96; archer.height=96;
const ink = archer.getContext('2d');
const costume = ink.createImageData(96,96);
const slots = hostSettings.saves;
// Le fichier Godot reste disponible sur bureau. Sur le Web, son
// écriture IndexedDB peut finir après le rechargement de la page.
const savedKeys=['aldoria-v2','aldoria-test','aldoria-audio-muted'];
let browserSlots=null,storagePrefix='';
if(hostSettings.webSlot){
  try{
    browserSlots=window.localStorage;
    storagePrefix='aldoria-godot/'+window.parent.location.pathname.replace(/\/index\.html$/,'/')+'/'+hostSettings.webSlot+'/';
    for(const key of savedKeys){
      const copy=browserSlots.getItem(storagePrefix+key);
      if(copy!==null)slots[key]=copy;
    }
  }catch{browserSlots=null}
}
window.aldoriaHost = {
  archer, archerReady:false, clockActive:false, sol:null,
  moderator:hostSettings.moderator, regions:hostSettings.regions,
  storage:{
    getItem(key){ return slots[key] ?? null; },
    setItem(key,value){
      if(slots[key]===value)return;
      if(browserSlots&&savedKeys.includes(key)){
        try{browserSlots.setItem(storagePrefix+key,value)}catch{/* Le fichier Godot prend le relais. */}
      }
      slots[key]=value;
      const payload=JSON.stringify({type:'save',key,value});
      if(window.ipc)window.ipc.postMessage(payload);
      else window.parent.AldoriaGodot.save(payload);
    }
  },
  terrain(id,source,placement){
    const image=new Image();
    this.sol={id,image,placement};
    image.src=source;
  },
  dessinerSol(ctx,zone){
    const sol=this.sol;
    if(sol?.id!==zone.id || !sol.image.complete || !sol.image.naturalWidth)return false;
    const [a,b,c,d,x,y,left,top,width,height]=sol.placement;
    ctx.save();
    ctx.transform(a,b,c,d,x,y);
    ctx.drawImage(sol.image,left,top,width,height);
    ctx.restore();
    return true;
  },
  outfit(base64){
    const bytes=atob(base64);
    if(bytes.length!==costume.data.length)return;
    for(let i=0;i<bytes.length;i++) costume.data[i]=bytes.charCodeAt(i);
    ink.putImageData(costume,0,0);
    this.archerReady=true;
  },
  tick(dt){return this.advance ? this.advance(dt) : {active:false};}
};
