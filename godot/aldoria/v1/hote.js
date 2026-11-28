'use strict';
const hostSettings = window.aldoriaSettings;
const archer = document.createElement('canvas');
archer.width=96; archer.height=96;
const ink = archer.getContext('2d');
const costume = ink.createImageData(96,96);
const slots = hostSettings.saves;
window.aldoriaHost = {
  archer, archerReady:false, clockActive:false, paintGround:hostSettings.paintGround,
  moderator:hostSettings.moderator, regions:hostSettings.regions,
  storage:{
    getItem(key){ return slots[key] ?? null; },
    setItem(key,value){
      if(slots[key]===value)return;
      slots[key]=value;
      const payload=JSON.stringify({type:'save',key,value});
      if(window.ipc)window.ipc.postMessage(payload);
      else window.parent.AldoriaGodot.save(payload);
    }
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
