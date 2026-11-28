(() => {
  if (window.AldoriaGodot) window.AldoriaGodot.close();
  let frame, canvas, observer, resizeObserver;
  const api = {
    save: null,
    mount(html, save) {
      this.save = save;
      canvas = document.querySelector('#game-canvas') || document.querySelector('#canvas');
      frame = document.createElement('iframe');
      frame.title = 'Aldoria · Commandes et combat';
      frame.id = 'aldoria-interface';
      frame.allow = 'fullscreen; autoplay';
      // Le document du jeu utilise le thème sombre. Un thème différent rend le fond du cadre opaque.
      frame.style.colorScheme = 'dark';
      Object.assign(frame.style, {position:'fixed',border:'0',margin:'0',background:'transparent',zIndex:2});
      canvas.parentNode.appendChild(frame);
      const fit = () => {
        if (!canvas.isConnected) { api.close(); return; }
        const r=canvas.getBoundingClientRect();
        Object.assign(frame.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',display:r.width&&r.height?'block':'none'});
      };
      resizeObserver=new ResizeObserver(fit); resizeObserver.observe(canvas);
      observer=new MutationObserver(() => { if(!canvas.isConnected) api.close(); });
      observer.observe(canvas.parentNode.parentNode,{childList:true,subtree:true});
      fit();
      frame.addEventListener('load',()=>frame?.contentWindow?.focus(),{once:true});
      frame.srcdoc=html;
    },
    tick(delta) {
      const host=frame?.contentWindow?.aldoriaHost;
      if(!host?.advance)return '';
      return JSON.stringify(host.tick(delta));
    },
    terrain(id,source,placement){frame?.contentWindow?.aldoriaHost?.terrain(id,source,JSON.parse(placement));},
    outfit(data){frame?.contentWindow?.aldoriaHost?.outfit(data);},
    close(){observer?.disconnect();resizeObserver?.disconnect();frame?.remove();this.save=null;}
  };
  window.AldoriaGodot=api;
})()
