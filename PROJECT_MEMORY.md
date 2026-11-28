# Mémoire technique

Les sentiers `trails` neutralisent la boue. Les routes pavées accordent 15 % de vitesse. Le passage côtier `4,6` ↔ `4,5` est réservé aux hauts-fonds à x=1450. Le Clan des Pins occupe `3,4`.

Progression v2 : seuil 35 + 5 × niveau. Les sauvegardes antérieures sont converties depuis leur XP cumulée, avec attribution des étoiles de niveau supplémentaires. La pondération des rencontres reste indexée sur leur palier régional.

Le prototype regroupe HTML, CSS et JavaScript dans aldoria.html. La progression utilise la clé de stockage local aldoria-v2, et le mode test la clé séparée aldoria-test. Préserver la compatibilité des sauvegardes lorsque leur structure évolue.

La branche principale est main. Les réglages partagés de Claude Code sont dans .claude/settings.json et .mcp.json.

GitHub Pages publie le jeu depuis la racine de `main` à l’adresse https://corentincarratier.github.io/aldoria/aldoria.html. Claude et ChatGPT intègrent leurs changements par demande de fusion depuis une branche par tâche. Les étapes de synchronisation sont dans [AGENTS.md](AGENTS.md).

Incendies de forêt : `igniteForest` ne s'appelle que pour les sorts de feu du joueur (projectiles non `basic`, zones `from:'p'`). `updFires` propage le feu aux bois en contact à `WALK` (200 px/s) ; chaque bois brûle 10 à 12 s puis `charForest` l'enregistre dans `S.burnt[idZone]` (indices de `terrain().forests`, sauvegardés). `inForest` ignore les bois brûlés (`isBurnt`). `forestMasked` masque un ennemi au repos à plus de 40 px de la lisière : ni dessin ni observation du bestiaire. Les coffres ont `cover` `wood` ou `rocks` (cercle ouvert) ; leur affichage et leur ouverture exigent `los`.

Les repoussements de combat passent par `startRecoil` puis `advanceRecoil` dans la simulation. Les sous-pas utilisent les collisions du décor. `markImpact` enregistre les impacts directs pour le rendu du héros et des ennemis.

Le menu du personnage (E) partage le dessin de l’arbre avec la source dans un mode de consultation distinct. La carte (M) est indépendante. La sauvegarde conserve les espèces observées dans `seen` et la compétence repérée dans `pinned`.

Une zone peut décrire ses bords à la main (`border`, segments `cliff`, `woods`, `river`, `fence`, `boulders`) : `buildBorder` pose des cercles de collision invisibles (`inv`) et `drawBorders` dessine chaque segment d'un seul tenant. `roads` et `plaza` sont dessinés une fois dans un calque (`groundLayer`, cache `z._ground`). `open` élargit une ouverture (`pa.half`) ; `PASSPOS` fixe la position d'un passage sur une frontière, partagée par les deux zones. Les maisons ont une variante `v` (`drawHouse`, rayons `HOUSER`) ; `obst` et `groves` placent des obstacles (`spike`) et des bosquets à la main.


**Séparation V1/V2 (28 novembre 2026)** : la V1 est le jeu 2D publié par GitHub Pages, y compris les clés existantes `aldoria-v2` et `aldoria-test`. La future V2 3D est un projet séparé, reporté ; ses expériences doivent vivre dans des branches et répertoires autonomes ou un projet Roblox privé distinct. Ne pas modifier le moteur, le déploiement, les données ni les sauvegardes V1 pour un test V2. Voir la section V2 de `decisions-conception.md`.

**Carte 5 x 7 (28 novembre 2026)** : `ZD` contient 35 zones `c,r` (colonne, rangée depuis le haut ; le Hameau est `2,6`) et des lieux cachés hors grille (`g11`, `g34`, `u0`, marqués `hidden`, sans `c`/`r`). Les passages fermés sont dans `BLOCK`, leur position dans `PASSPOS` (une même clé pour les deux zones voisines) ; une ouverture étroite se règle avec `narrow`. Une zone décrit ses bords avec `edges` (`mkBorder` produit `border`), ses fleuves avec `rivers` (`riverPts` ; une trouée dans les cercles d'eau à chaque pont), son sol avec `patches`, `sand` (ralentit, `inSand`), `paved`, `roads` (`rk:'dirt'`, `rw`, `fade`) et `lake` (lac de lave avec chemin et île). `props` pose des accessoires (`cactus` pique au contact), `camp` un camp, `portals` et `caves` des passages vers les lieux cachés, `witch` la sorcière (choix dans des fenêtres `wch-*`, `S.witch`), `honor` des ennemis qui n'apparaissent que sous un seuil de réputation, `gates` les tours de porte. Les cercles d'eau marqués `leap` se franchissent en esquivant (`pushOut(l,o,true)`). Les nouveaux ennemis sont déclinés de types existants dans une boucle après `DET` : à retravailler. La sauvegarde porte `world:3` : une ancienne partie garde le héros mais repart du Hameau. La carte (M) est dessinée par `drawMap` et `mapIcons` à partir des mêmes données.

`essais/mobs.html` est l'atelier des mobs : en haut, le vrai jeu dans une iframe en mode test (clé `aldoria-test`, la partie n'est pas touchée), piloté par `window.__aldoria` et `spawnE` pour faire apparaître n'importe quel mob sur un terrain choisi ; dessous, un dessin en gros plan et vu du dessus (crapaud en deux variantes). Elle doit être ouverte depuis le site publié (même origine que le jeu). Un design validé est ensuite porté dans `ART.beast` et `LOOK` de `aldoria.html`.
