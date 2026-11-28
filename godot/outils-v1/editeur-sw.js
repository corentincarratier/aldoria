self.addEventListener('install', e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin || event.request.method!=='GET')return;
  event.respondWith((async()=>{
    const wasm=url.pathname.endsWith('/godot.editor.wasm');
    const response=await fetch(wasm?new URL('godot.editor.wasm.gz',self.registration.scope):event.request);
    if(!response.ok || response.type==='opaque')return response;
    const headers=new Headers(response.headers);
    headers.set('Cross-Origin-Opener-Policy','same-origin');
    headers.set('Cross-Origin-Embedder-Policy','require-corp');
    headers.set('Cross-Origin-Resource-Policy','same-origin');
    let body=response.body;
    if(wasm){
      headers.set('Content-Type','application/wasm');headers.delete('Content-Length');headers.delete('Content-Encoding');
      const [sample,stream]=body.tee(), reader=sample.getReader();
      const first=await reader.read();reader.cancel().catch(()=>{});
      const bytes=first.value;
      body=bytes?.[0]===31 && bytes[1]===139 ? stream.pipeThrough(new DecompressionStream('gzip')) : stream;
    }
    return new Response(body,{status:response.status,statusText:response.statusText,headers});
  })());
});
