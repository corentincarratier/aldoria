/* Variante de la cour. Les positions des acteurs, des impacts et des collisions sont en unités V1. */
if (window.aldoriaSettings.inclinee) {
  const cour = window.aldoriaEssai;
  const largeur = 1600, hauteur = 1100;
  const compression = .95;
  const facteurX = largeur / 1536, facteurY = hauteur / 1024;
  const plans = [];
  let sol, atlasPret = false, horloge;

  function surface(w, h) {
    const toile = document.createElement('canvas');
    toile.width = w; toile.height = h;
    return toile;
  }

  function enregistrer(nom, toile, x, y, w, h, pied) {
    const ctx = toile.getContext('2d');
    const pixels = ctx.getImageData(0, 0, toile.width, toile.height).data;
    plans.push({nom, toile, pixels, x, y, w, h, pied, opacite: 1});
  }

  // Éplucher le dessin original une fois. La bande derrière l'avant-toit devient accessible.
  function detacher(image, nom, contour, solX, solY, pied, relief) {
    const xs = contour.map(p => p[0]), ys = contour.map(p => p[1]);
    const x = Math.min(...xs), y = Math.min(...ys);
    const w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    const forme = new Path2D();
    contour.forEach(([a,b], i) => i ? forme.lineTo(a,b) : forme.moveTo(a,b));
    forme.closePath();
    const objet = surface(w,h), c = objet.getContext('2d');
    c.translate(-x,-y); c.clip(forme); c.drawImage(image,0,0);
    const fond = sol.getContext('2d');
    fond.save(); fond.clip(forme);
    fond.drawImage(image,solX,solY,w,h,x,y,w,h);
    fond.restore();
    enregistrer(nom,objet,x*facteurX,y*facteurY-relief,w*facteurX,h*facteurY+relief,pied);
  }

  const mur = {x:936, y:758}, arbre = {x:1164, y:590};

  function preparer(image) {
    if (!sol) {
      sol = surface(image.naturalWidth,image.naturalHeight);
      sol.getContext('2d').drawImage(image,0,0);
      detacher(image,'toit',[[1117,1024],[1149,971],[1135,956],[1176,897],[1192,876],
        [1191,843],[1208,833],[1220,828],[1242,826],[1258,812],[1299,790],[1313,788],
        [1337,774],[1354,765],[1373,765],[1395,747],[1419,739],[1443,720],[1474,712],
        [1500,687],[1518,677],[1536,654],[1536,1024]],675,320,hauteur+32,12);
      detacher(image,'puits',[[24,151],[36,150],[43,113],[58,85],[90,59],[126,46],[161,40],
        [202,43],[244,55],[273,78],[291,104],[302,150],[315,152],[315,186],[304,190],
        [304,226],[293,258],[283,279],[293,290],[282,301],[277,310],[289,321],[308,326],
        [308,350],[290,355],[282,342],[261,349],[234,342],[226,325],[200,327],[147,325],
        [105,315],[76,296],[52,271],[36,241],[31,189],[23,188]],505,60,325*facteurY,5);
      // Feuillage qui déborde des bords du dessin. Le passage libre reste au pied des branches.
      detacher(image,'feuillage sud',[[0,804],[21,808],[40,792],[57,788],[67,819],[99,815],
        [132,824],[143,839],[120,847],[151,862],[167,889],[159,905],[179,925],[197,948],
        [227,964],[243,974],[280,975],[312,990],[325,1005],[290,1010],[293,1024],[0,1024]],
        780,732,hauteur+12,4);
      detacher(image,'feuillage nord-est',[[1396,0],[1536,0],[1536,103],[1515,95],[1494,104],
        [1487,97],[1477,100],[1455,86],[1440,83],[1446,72],[1418,66],[1419,49],
        [1396,41],[1403,26],[1387,25]],1115,120,104*facteurY,3);
      detacher(image,'feuillage nord-ouest',[[236,0],[458,0],[446,18],[432,27],[429,19],
        [411,44],[396,31],[381,46],[372,68],[358,65],[346,81],[333,74],[313,90],
        [295,82],[278,92],[269,72],[253,68],[257,58],[237,48],[224,42],[238,28]],
        538,96,94*facteurY,3);
    }
    if (atlasPret || !BRUNE.sheets.has('paysage')) return;
    atlasPret = true;
    // La feuille contient déjà l'alpha des pierres et de chaque branche.
    const ajouter = (nom,caseAtlas,obj,w,h,centreY) => {
      const toile = surface(192,192);
      BRUNE.draw(toile.getContext('2d'),'paysage',caseAtlas,96,96,192);
      enregistrer(nom,toile,obj.x-w/2,centreY-h/2,w,h,obj.y);
    };
    ajouter('mur',13,mur,184,126,mur.y-30);
    ajouter('chêne',0,arbre,170,177,arbre.y-51);
  }

  function couvre(plan, acteur) {
    if (acteur.y >= plan.pied) return false;
    const r = acteur.r || 16;
    // Échantillons de la tête, du torse et des épaules. Le vide entre les branches reste du vide.
    for (const [dx,dy] of sondes) {
      const u = (acteur.x + r*dx - plan.x) / plan.w;
      const v = (acteur.y + r*dy - plan.y) / plan.h;
      if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
      const i = Math.floor(v*plan.toile.height)*plan.toile.width + Math.floor(u*plan.toile.width);
      if (plan.pixels[4*i+3] > 75) return true;
    }
    return false;
  }
  const sondes = [[0,0],[0,-.85],[-.65,-.45],[.65,-.45],[0,.55]];

  Object.assign(cour,{
    sortsImposes: ['AI8','GL6','TE8'],
    projectionY(zone) { return zone.id === 'cour-brune' ? compression : 1; },
    fondIncline(c,image) {
      preparer(image);
      c.drawImage(sol,0,0,largeur,hauteur);
    },
    plansCour(c, g, acteurs, effets, eau) {
      const dt = Math.max(0,Math.min(.1,g.t-(horloge ?? g.t)));
      horloge = g.t;
      const couches = acteurs.map(({acteur,dessiner}) => ({
        pied:acteur.y,
        dessiner() {
          // Conserver la hauteur du corps et son point de contact avec le sol.
          c.save(); c.translate(acteur.x,acteur.y); c.scale(1,1/compression);
          c.translate(-acteur.x,-acteur.y); dessiner(); c.restore();
        }
      }));
      couches.push(...effets);
      for (const plan of plans) {
        const masque = acteurs.some(({acteur}) => couvre(plan,acteur));
        const cible = masque ? .38 : 1;
        plan.opacite += (cible-plan.opacite)*(1-Math.exp(-dt/(masque ? .075 : .15)));
        couches.push({pied:plan.pied, dessiner() {
          c.save(); c.globalAlpha *= plan.opacite;
          c.drawImage(plan.toile,plan.x,plan.y,plan.w,plan.h);
          if (plan.nom === 'puits') eau(c,g.t,-3);
          c.restore();
        }});
      }
      couches.sort((a,b) => a.pied-b.pied);
      for (const couche of couches) couche.dessiner();
    },
    collisionsInclinees(t) {
      // Le mur bloque au niveau de son soubassement, le chêne au tronc.
      for (let x=mur.x-66; x<=mur.x+66; x+=12) t.rocks.push({x,y:mur.y,r:9,kind:'wall'});
      t.rocks.push({x:arbre.x,y:arbre.y,r:16,kind:'rock'});
      // La maçonnerie est en retrait de la rive de tuiles. Suivre ses deux pans.
      const pans = [[1142,1100],[1252,944],[1600,774]];
      for (let i=1;i<pans.length;i++) {
        const [ax,ay] = pans[i-1], [bx,by] = pans[i], n=Math.ceil(Math.hypot(bx-ax,by-ay)/18);
        for(let j=0;j<=n;j++) t.rocks.push({x:ax+(bx-ax)*j/n,y:ay+(by-ay)*j/n+35,r:25,kind:'wall'});
      }
    }
  });
}
