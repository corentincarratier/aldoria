async function installerAldoria(engine, folder, edition) {
  const key='aldoria-editeur-installe-'+edition;
  if(localStorage.getItem(key))return;
  const response=await fetch('../projet-web.zip');
  if(!response.ok)throw new Error('Le projet Aldoria est indisponible.');
  const data=await response.arrayBuffer(),view=new DataView(data),decoder=new TextDecoder();
  let at=0,files=0;
  while(at+30<=data.byteLength && view.getUint32(at,true)===0x04034b50){
    const size=view.getUint32(at+18,true),length=view.getUint16(at+26,true),extra=view.getUint16(at+28,true);
    if(view.getUint16(at+8,true)!==0)throw new Error('Archive de projet non reconnue.');
    const name=decoder.decode(new Uint8Array(data,at+30,length)),start=at+30+length+extra;
    if(!name.includes('..') && !name.startsWith('/') && !name.endsWith('/')){
      engine.copyToFS(folder+'/'+name,new Uint8Array(data,start,size));files++;
    }
    at=start+size;
  }
  if(!files)throw new Error('Projet vide.');
  return key;
}