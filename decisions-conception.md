# Décisions de conception

La carte suit la marche du héros, y compris aux passages entre régions. Les collisions et les ralentissements du terrain s’appliquent. Le HUD reste masqué et le combat suspendu.

**[Validé] Progression et carte, 28 novembre 2026.** La fin de campagne demande un build de haut niveau. Réglage initial : niveau 50 recommandé pour Gorvan, 55 pour le Dévoreur. Chaque niveau rapporte une étoile. La carte prend le premier plan et masque les commandes de combat.

> Légende : **[Validé]** = demandé ou validé par toi ; **[Proposition]** = ajouté par Claude, à valider ; **[Plus tard]** = prévu.
> **27 novembre 2026 : refonte en monde ouvert.** Les entrées sur la campagne, les étapes, la préparation, la vague unique et les anciens boss (Seren, Brann, Kael) ne s'appliquent plus. Le monde, les zones et l'histoire sont dans « histoire-et-niveaux » (v14).

## Le jeu
- **Monde ouvert** [Validé] : 15 zones en rectangle (5 × 3) reliées par des chemins sur les bords ; carte sur la touche M avec ta position en temps réel. Remplace la campagne par étapes.
- **Zones et entrées** [Validé le 28 novembre] : le monde reste découpé en zones (pas de défilement continu), mais les entrées de chaque zone sont **beaucoup plus larges et ouvertes** pour donner l'impression d'un monde ouvert. Carte de **5 cases de large sur 7 de haut** (35 zones). Détail dans « histoire-et-niveaux ».
- **Accueil** [Validé] : « Continuer la partie » ou « Nouvelle partie » (avec confirmation de perte des données), puis directement sur la carte ; tout tient dans l'écran.
- **Deux modes, choisis au début d'une partie** (écart volontairement réduit) :
  - **Facile** : ennemis à 85 % de leurs PV et 75 % de leurs dégâts ; l'arbre peut être réinitialisé entièrement quand on veut.
  - **Difficile** : ennemis à 95 % de leurs PV et 90 % de leurs dégâts ; les choix dans l'arbre sont définitifs (une confirmation est demandée avant chaque achat).
  - Dans les deux modes, on ne peut **jamais retirer une compétence seule**. Changer de mode = nouvelle partie.
  - [Proposition] Le mode se choisit dans la fenêtre de confirmation de « Nouvelle partie ».
- **Terrain** : les obstacles bloquent les déplacements (et les tirs, sauf l'eau).
  - **Forêt** [Validé, remplace « les forêts ralentissent tout le monde de 40 % »] : ralentit un peu (−20 %) et **empêche les ruées**, pour les ennemis, les alliés et le héros (Charge, Éclair, Frappe dans le dos, Flèche de recul ; bonds, plongeons et charges des ennemis). Tu y es aussi plus discret. [Proposition] L'esquive d'Espace reste possible en forêt.
  - **Boue, marais et sables mouvants** [Validé le 28 novembre] : une créature au sol y marche au ralenti. Le héros ne peut ni rouler avec Espace ni utiliser une ruée. Les ennemis, y compris les loups, ne peuvent ni bondir ni charger. Une roulade ou un bond en cours s’arrête au contact du terrain. Le sort Sables mouvants crée ce même terrain pendant cinq secondes, y compris sous son lanceur et sur un chemin. Les créatures en vol survolent la zone. Le ralentissement actuel du marais est de 55 % pour le héros et de 60 % pour les alliés et les ennemis. Toute future zone naturelle de sables mouvants suit cette règle.
- **Forces et faiblesses des éléments** [Validé] : feu bat glace et plante, eau bat feu, foudre bat terre. [Proposition] Pour compléter : eau bat terre, foudre bat eau, glace bat air et plante, terre bat glace, air bat plante. Contre un élément que tu bats : ×1,5 (« efficace ! ») ; contre un élément qui te bat : ×0,6 ; même élément : ×0,5 (« résiste »). Éléments des ennemis : sorciers et Ignar feu, Vesna glace, Morwen eau, golems et brutes terre, griffon air. Les flèches et la mêlée sont neutres.
- **Le feu brûle** : brûlure de 2 s, Brûlure FE4, le héros n'est pas blessé. [Validé] **Seuls les sorts de feu** enflamment forêts et maisons. Le feu gagne les bois en contact à vitesse de marche (200) et dure 10 à 12 s ; ensuite les arbres carbonisés **restent dans la sauvegarde** et ne cachent ni ne ralentissent plus.
- **Forêt et vision** [Validé] : un ennemi à l'orée garde toute sa vue ; le héros en forêt est moins détectable. Les ennemis au fond d'un bois sont **masqués** (bestiaire compris) jusqu'au soupçon ou à la détection.
- **Brouillard** [Validé] : clair, percé par le héros proche et par les flammes, indépendant de la torche.
- **Commandes** [Validé] : ZQSD ; souris pour viser ; **clic gauche attaque de base** ; **1, 2, 3, 4** les quatre capacités ; **I inventaire** (torches et potions) ; **Maj discrétion** ; **Espace** esquive ; **M** carte ; Échap pause. Plus de molette, plus de touche E, plus de clic droit. **Plus de A + molette** : on change d'arme chez l'armurier d'un village (voir Combat de base).
  - Après l’essai du déplacement au clic droit et de l’attaque sur Espace, le déplacement au clavier ZQSD est confirmé pour la V1. L’essai souris est clos.
  - [Proposition] **F** interagir (parler, source, coffre, armurier) et faire avancer un dialogue ; **T** arbre, **seulement auprès d'une source** [Validé].
  - [Hypothèse prise] La torche est permanente : on l'allume et l'éteint dans l'inventaire.
- **Esquive universelle** : roulade courte dans la direction du déplacement, intouchable 0,3 s, recharge 1 s, avec une traînée de fumée.
- **Caméra** [Proposition] : elle suit le héros avec une légère avance vers le curseur ; des flèches au bord de l'écran montrent les ennemis qui te chassent hors champ. L'ancienne vue d'ensemble (V) et la mini-carte sont remplacées par la carte M.
- Les **sons** décrits auparavant ne sont pas dans le code actuel.

## Ennemis : peu nombreux, coriaces, imprévisibles
- **Beaucoup moins d'ennemis, durs à tuer** [Validé] : 2 à 4 ennemis par zone.
- **Jeu plus facile au début, difficulté croissante** [Validé, remplace les PV « environ 240 pour un Éteint du départ »] : chaque zone a un **niveau recommandé, affiché sur la carte** sous son nom et à l'entrée de la zone.
  - [Proposition] Niveaux : Hameau 1, Bois de Saule 1, Champs Brûlés 2, Côte 3, Mine 4, Bourg-Lanterne 4, Plaine des Statues 6, Forêt des Crocs 6, Marais 7, Fort Écarlate 8, Pic des Corbeaux 9, Grotte de Cristal 9, Caldeira 10, Gouffre 11, Citadelle 12. Sur la carte, le niveau est vert si tu l'as atteint, orange s'il te manque 1 ou 2 niveaux, rouge au-delà.
  - **PV des ennemis** [Validé] : un ennemi ordinaire a environ **100 à 110 PV**, une brute (troll) **600 à 800 PV**. [Proposition] Éteint 120, lancier et pillard 110, sorcier 95, archère 90, loup 85, chauve-souris 45, Brak 450, brute et griffon 800, golem 850 (avant le mode : en facile ×0,85). +3 % de PV et +7 % de dégâts par niveau de zone ; dégâts de base à 60 % ; +15 % d'XP par niveau. Exemple en facile : Éteint 102 PV au Bois de Saule, 135 à la Citadelle ; brute de la Plaine 781. Boss : 70 % de leurs PV et 75 % de leurs dégâts (Morwen environ 1 300 PV, Orvain environ 2 900).
- **Détection** [Validé, remplace le cône de vision] : un ennemi te repère dans une zone autour de lui, **qui n'est pas montrée au joueur** et qui dépend de l'ennemi (courte pour une brute, longue pour les loups). Trois distances :
  - normale : il te repère si tu marches normalement ;
  - discrète : plus courte, il te repère même en discrétion (Maj) ;
  - tout près : il te repère même invisible (assassin, Élixir d'ombre).
  - En forêt, la distance normale est réduite. Quand un compagnon est tué sans qu'il t'ait vu, les ennemis proches sont **alertés** et repèrent de plus loin (×1,4).
  - [Proposition] Valeurs (normale, discrète, tout près) : Éteint 260/105/45, archère 340/130/50, loup 440/210/80, brute 220/90/45, boss environ 420/200/75. Un « ? » au-dessus de la tête montre qu'il te soupçonne (environ 0,5 s avant de te repérer). Les rochers coupent la vue, sauf tout près.
- **Discrétion (Maj)** [Validé] : tu avances plus lentement (−45 %) et les ennemis te repèrent de moins loin.
- **Indicateur « caché »** [Validé] : un petit œil barré au-dessus du héros quand il est caché. [Proposition] Il s'affiche en forêt, en discrétion (Maj) et quand tu es invisible.
- **Focus permanent** [Validé] : au moindre dégât, l'ennemi te prend pour cible et ne te lâche plus, **sauf si tu deviens invisible** (Ombre du Voleur, Élixir d'ombre). Il cherche alors à l'endroit où tu as disparu, puis retourne à son poste.
- **Coup sur un ennemi qui ne t'a pas vu** [Validé, remplace la mise à mort d'un coup] : un tir chargé au maximum sur un ennemi qui ne t'a pas vu fait des **dégâts fixes : 100 à l'arc, 140 au bâton** (« tir parfait »). [Proposition] En mêlée, un coup en discrétion (Maj) fait ×2,5 ; tout autre premier coup fait ×2 (surprise).
- **Pas de schéma évident** [Validé]. [Proposition] Comment c'est fait :
  - chaque ennemi a plusieurs coups et en choisit un au hasard pondéré, en évitant de répéter le même ; il peut aussi ne rien faire ;
  - le temps de préparation de chaque coup est tiré au hasard ; les combos ont 2 à 4 coups, avec des pauses irrégulières ;
  - **feintes** : il prépare un coup, puis l'annule pour un autre ou recule ;
  - **visée** sur ta position future avec une avance variable (parfois pile sur toi, parfois là où tu vas) ;
  - il **attend parfois la fin de ton esquive** avant de frapper ;
  - il se déplace autour de toi (approche, contournement, pas de côté, recul) sans rythme fixe ;
  - au plus **deux ennemis ordinaires attaquent en même temps** (les boss ne comptent pas).
  - Les coups restent lisibles dans l'animation (arme levée, arc tendu, élan, fissures au sol, ombres des rochers), sans zone rouge.
  - **Coups esquivables, même au corps à corps** [Validé : trop durs à éviter quand on n'est pas archer]. [Proposition] Préparation d'au moins 0,3 à 0,4 s pour chaque coup (0,7 s pour un coup lourd), coups des combos espacés de 0,3 à 0,55 s, riposte après une garde en 0,3 s ; un **anneau orange puis rouge** entoure l'ennemi qui prépare un coup ; esquive rechargée en **1 s** (au lieu de 1,4 s).
- [Proposition] Les ennemis :
  - **Éteint** (épée) : coup rapide, combo, coup lourd qui étourdit, garde qui pare de face puis riposte.
  - **Lancier éteint** : garde ses distances, transperce en ligne, bondit, balaie autour de lui quand tu es trop près.
  - **Archère des brumes** : retient sa flèche plus ou moins longtemps, éventail avec parfois un trou, flèche qui ralentit, recule d'un bond.
  - **Loup cendré** (meute) : morsures, bonds ; le hurlement fait bondir toute la meute en même temps, de plusieurs côtés.
  - **Sorcier de cendre** : orbes qui tournent avant de filer droit, mines qui attendent un temps variable puis foncent, se téléporte quand tu t'approches.
  - **Brute** : coup lourd, onde de choc au sol, rocher lancé là où tu vas, charge qui te suit mais qui l'assomme si elle percute un obstacle.
  - **Ombre** : presque invisible ; réapparaît sur ton flanc ou dans ton dos (pas toujours au même endroit), écran de fumée.
  - **Chauve-souris** (grottes) : vol erratique et plongeons.
  - **Golem de cristal** : ligne de pics qui sortent du sol en se tordant vers toi.
  - **Griffon des cimes** (élite) : plongeons, griffures en série, rafale qui repousse.
- [Proposition] **Boss** (furie sous 50 % de PV : coups plus rapides et attaques en plus) :
  - **Morwen** : orbes, mines, brume qui blesse, doubles de brume (les doubles n'ont pas d'ombre).
  - **Varek** : ruées en chaîne (1 à 4), garde et riposte, épée lancée qui revient ; en furie, ses ruées laissent une trace qui frappe une seconde fois.
  - **Ignar** : marteau, onde de choc, enclumes lancées, failles de lave qui se ramifient.
  - **Vesna** : murs de glace, sol gelé, pics de glace, orbes ; accompagnée d'un griffon.
  - **Brak**, chef des pillards (élite) : grande épée, charge, coup au sol.
  - **Orvain** : pluie d'étoiles à des moments décalés, rayon qui tourne et peut changer de sens (deux rayons en furie), combos, rappel d'Éteints.

## Progression : niveaux, étoiles, villages
- **Niveaux** [Validé] : combattre donne de l'XP. **Chaque niveau gagné donne 1 étoile** (1 point d'arbre). [Proposition] XP pour passer au niveau suivant : 60 + 35 × niveau.
- **Finir une zone donne des étoiles** [Validé]. [Proposition] Zone libérée (tous ses ennemis vaincus) : +1 étoile ; zone de boss : +3.
- **Coffres cachés** [Validé] : peu nombreux ; torche, étoiles supplémentaires, plans de potions.
- Remplace les 3 étoiles par étape (terminer, plus de 50 % de PV, sans perdre de PV), qui ne s'appliquent plus.
- [Proposition] Avec les 15 zones actuelles : environ 12 niveaux, 19 étoiles de zones et 6 de coffres, soit environ 38 points.
- **L'arbre ne s'ouvre qu'à une source** [Validé le 27 novembre, remplace « quand il veut »] : le héros dépense ses étoiles avec T **seulement près de la source d'un village** (Hameau de Brune, Bourg-Lanterne). Ailleurs, T affiche un message qui le renvoie à une source. Les étoiles gagnées en route attendent le prochain retour au village. Pas de formateurs : les maisons des villages sont du décor.
- **Armurier dans chaque village** [Validé le 27 novembre] : voir Combat de base, « Changer d'arme ». **Brom** au Hameau de Brune, **Hilde** à Bourg-Lanterne.
- **Défendre un village** [Validé] : à Bourg-Lanterne, des pillards attaquent les villageois. Si tous survivent, les villageois offrent une étoile.
  - [Proposition] Deux vagues (3 pillards et une archère, puis 2 pillards, une archère et Brak, le chef). Les pillards visent les villageois et ne s'en prennent au héros que s'il les frappe (le focus permanent s'applique alors). Les villageois fuient quand un pillard approche. Sans aide, un premier villageois tombe en une vingtaine de secondes. Récompense : +1 étoile pour la zone libérée, +1 si personne n'est tombé. Un villageois tombé ne revient pas.
  - [Hypothèse prise] Hilde, l'armurière, ne compte pas parmi les 6 villageois à protéger : les pillards l'ignorent, et on ne peut pas lui parler pendant l'attaque.
- [Proposition] Les **Sceaux** : vaincre Morwen, Varek et Ignar ouvre la porte de la Citadelle.

## Tir ami et réputation [Validé]
- Tu peux blesser et tuer les villageois. Les tuer fait baisser ta **réputation** ; on s'en servira plus tard.
- [Proposition] Réputation de 0 à 100, départ à 50 ; −2 par coup (au plus une fois par seconde et par villageois), −15 par villageois tué. Un villageois blessé par toi te fuit 4 s. Un villageois tué ne revient pas. Pour l'instant, seuls les attaques de base et les projectiles touchent les villageois, pas les sorts de zone.
- [Hypothèse prise] Les **armuriers ne peuvent pas être blessés** (ils arrêtent le tir et protestent, sans perte de réputation) : sinon, en tuer un priverait le village de tout changement d'arme pour le reste de la partie.

## Mode test [Validé]
- Les essais Godot démarrent dans une partie modérateur qui conserve le gameplay de la V1. La nouveauté se teste avec les règles ordinaires du jeu.
- Un mode à part, pour toi : accès par le bouton « Mode test (concepteur) » de l'accueil, avec une sauvegarde séparée qui ne touche pas la vraie partie.
- Étoiles illimitées et bouton « Tout débloquer » dans l'arbre. [Proposition] Toutes les zones sont visibles sur la carte. Dans la pause : invincibilité, +5 niveaux, soin complet, remise à zéro des zones. Les boutons concepteur de l'arbre (secrets, +10 points) n'apparaissent plus qu'en mode test.
- La règle « arbre seulement à la source » s'applique aussi en mode test.
- **Pas de téléportation pour le moment** [Validé le 27 novembre, remplace « un clic sur la carte te téléporte »] : personne ne peut se téléporter d'une zone à l'autre, même en mode test ; on voyage à pied par les chemins. Les capacités de combat Frappe de l'ombre et Faille spatiale (déplacements courts dans la zone) ne sont pas concernées.

## Dialogues [Validé]
- Des dialogues entre le héros et les villageois, et entre le héros et les boss.
- [Proposition] Fenêtre en bas de l'écran avec portrait ; F ou Espace pour continuer, Échap pour passer ; le jeu s'arrête pendant le dialogue. Les villageois se parlent avec F. Chaque boss parle à la rencontre, lance une réplique en bulle quand il entre en furie, et dit une dernière phrase en tombant. Le chef des pillards parle avant la seconde vague.

## Boss qui changent le terrain [Validé]
- Des capacités de boss qui modifient le décor : arène qui enferme le boss et le héros, murs de glace, zones qui restent environ 10 s et ralentissent.
- [Proposition] Réalisé ainsi :
  - **Varek** : *cercle du duel*, un anneau de lames qui l'enferme avec toi pendant 15 s (dès la fin de son dialogue, puis de temps en temps) ; rien n'entre ni ne sort, les tirs non plus.
  - **Vesna, la Reine de Givre** (nouvelle boss facultative du Pic des Corbeaux) : murs de glace de 10 s, placés au hasard (dans ton dos, à côté de toi, ou deux murs en couloir) ; sol gelé de 10 s qui ralentit de 45 % ; lignes de pics de glace.
  - **Morwen** : brume sur tout le marais pendant 10 s ; tu ne vois plus qu'autour de toi.
  - **Ignar** : ses failles laissent des flaques de lave pendant 8 à 11 s.
  - **Orvain** : une étoile sur deux reste fichée dans le sol 9 à 12 s et bloque le passage.

## Vie, défense et récupération
- Le héros a **trois barres** : PV, **défense** et **défense magique** (20 de base + 2,5 par point de « % de défense »).
- **Aucune régénération de base des PV**. La régénération vient du Druide, du Paladin et de l'Eau.
- [Proposition] Changements pour le monde ouvert :
  - les **barres de défense** se rechargent hors combat (aucun ennemi ne te chasse et aucun coup reçu depuis 5 s) ;
  - les **sources** des villages rendent PV, défenses et potions, et deviennent ton point de retour ; **c'est aussi le seul endroit où l'on ouvre l'arbre** [Validé] ;
  - si tu tombes, tu te relèves à la dernière source ; tu gardes niveau, étoiles et objets ; les ennemis encore debout dans la zone récupèrent leurs PV ;
  - les potions se rechargent à la source (et non plus à chaque combat).

## Combat de base
- **Attaque de base au clic gauche** [Validé], plus d'attaque automatique.
  - **Arc et magie** : maintenir le clic. Le cône de visée couvre **toute la portée du tir dès le début** [Validé] et se resserre jusqu'à une ligne parfaite ; si tu continues, la charge augmente jusqu'à un tir puissant. La vitesse d'attaque fait se resserrer le cône plus vite [Validé]. Pendant la charge, **l'archer est ralenti de 30 %** et **le magicien de 75 %** [Validé, remplace 50 %].
  - [Proposition] Cône de ±32°, ligne en 0,6 s (arc) ou 1,1 s (bâton), puis 0,8 s (arc) ou 1,3 s (bâton) jusqu'au tir puissant. Dégâts : ×0,85 en tir lâché tout de suite, ×1,35 une fois la ligne atteinte, ×2,4 au maximum. **Le tir puissant ne traverse pas** : il s'arrête au premier ennemi [Validé]. Portée 550 à l'arc, **420 au bâton** [Validé : le bâton porte moins loin que l'arc], un peu plus au maximum de la charge (+12 %).
  - **Tir puissant** [Validé] : il s'arrête au premier ennemi ; sur un ennemi qui ne t'a pas vu, il fait 100 (arc) ou 140 (bâton).
  - **Vitesse des armes** [Validé] : arc 0,25 s ; bâton 0,7 s (plus lent que l'arc) ; **épée lente qui repousse les ennemis** (remplace 0,6 s) ; **dagues très rapides et qui font beaucoup de dégâts**. [Proposition] Épée 0,9 s, dagues 0,25 s.
  - **Les coups du combattant touchent tous les ennemis devant lui et les repoussent** [Validé]. [Proposition] Recul de 90, sauf les boss.
  - **Attaques de base plus fortes pour toutes les armes** [Validé]. [Proposition] Épée ×2,4 par coup, dagues ×1,6 par coup. Sur la durée, les dagues font environ 40 % de dégâts en plus que l'épée, sans recul.
- **Armes principales** [Validé] : l'arc (Archer), l'épée (Combattant) et les dagues (Voleur). Si tu prends aussi de la magie, tu gardes ton arme, et chaque coup ajoute des **dégâts magiques de ton élément** en plus des dégâts physiques. [Proposition] Ces dégâts magiques valent 45 % du coup : brûlure si c'est du feu, avec les forces et faiblesses des éléments.
- **Quatre armes seulement** [Validé] : **épée** (Combattant), **arc** (Archer), **bâton** (Magicien ou Druide : le bâton du druide en fait partie) et **dagues** (Voleur). Plus de grande épée, de fouet ni de fioles comme arme. **Le bâton tire comme l'arc** [Validé] (même charge, même cône, même tir puissant), mais **plus lentement**, et ses boules font des **dégâts magiques** et **50 à 60 % de dégâts de plus qu'une flèche** [Validé ; réglé à +55 %]. [Validé : bâton un peu plus lent, arc un peu plus rapide] Visée en 1,1 s (arc 0,6 s), tir puissant après 1,3 s de plus (arc 0,8 s), 0,7 s entre deux tirs (arc 0,25 s). **Le bâton s'obtient dès la classe Magicien** [Validé], sans attendre un élément ; sans élément, il fait moins de dégâts [Validé ; proposition : +10 % au lieu de +55 % par rapport à l'arc]. Pour un druide sans magie, son élément est la plante.
- **Changer d'arme** [Validé le 27 novembre, remplace « maintenir A + molette », qui remplaçait la touche R] : on ne change d'arme **que chez l'armurier d'un village** (Brom au Hameau de Brune, Hilde à Bourg-Lanterne, repérés par ⚒). F près de lui ouvre l'armurerie : les quatre armes, avec « Équipée », « Prendre » ou « Pas apprise ». Ailleurs, l'arme ne change pas ; appuyer sur A rappelle d'aller voir l'armurier.
  - [Hypothèse prise] Ta toute première arme se prend seule quand tu apprends ta première classe. Ensuite, apprendre une nouvelle classe ne change plus ton arme : un message t'envoie chez l'armurier.
- **4 emplacements** pour les capacités actives [Validé], touches 1 à 4, chacune avec un temps de recharge.
- **Visée des compétences** [Validé] : maintenir la touche affiche la zone, la trajectoire ou la cible sous la souris ; **relâcher la touche lance** ; **clic droit annule** (comme dans League of Legends). [Proposition] Les compétences sans cible (renforcements, sorts autour de soi) partent tout de suite.
- **Portée des tirs du héros** [Validé, remplace 760] : attaque de base à distance 550 (au départ du prototype : 400) ; projectiles des sorts environ 1,7 fois plus loin ; sorts de zone lançables 1,45 fois plus loin.
- **Sorts canalisés** : inchangés (Pluie mortelle 0,7 s, Météore 0,6 s, Séisme 0,5 s, Prison de glace 0,4 s, Annihilation 1 s).
- **Sacoche de potions** (Alchimiste) : 3 emplacements, 4 avec Sacoche élargie. [Validé] Deux potions secrètes, préparables seulement avec leur plan trouvé dans un coffre : [Proposition] **Élixir d'ombre** et **Tonique des étoiles**.
- Principe : surtout des **passifs** ; capacités actives rares (environ 20 % des nœuds). **Légendaires secrets** affichés « ??? ». **Compétences à exclusion** inchangées.

## Apparence : des ronds armés et de vraies créatures
- **Tous les humains sont des ronds** vus du dessus ; **c'est leur arme qui dit ce qu'ils font** (épée, grande épée, épée et bouclier, lance, masse, dagues, fouet, arc, bâton à cristal, bâton de druide).
- Les **non-humains ont leur vraie silhouette** (loup, troll pour la brute et le golem de cristal, griffon, oiseau pour les chauves-souris…).
- [Proposition] Le **héros** (Aube) garde la cape rouge, sans couronne. Il prend l'arme de sa classe principale, et une seconde s'il développe une deuxième classe.
- [Proposition] Les boss sont à taille humaine, avec couronne, aura et barre de vie nommée.
- Les armuriers tiennent un marteau, avec ⚒ au-dessus de la tête.

## Statistiques du personnage
- PV max, régénération (Druide, Paladin, Eau) ; défense et défense magique ; dégâts de mêlée, à distance, magiques (et par élément) ; portée ; vitesse d'attaque et de déplacement ; esquive, parade, critique ; temps de recharge.

## Points de compétence
- Des points fixes (les étoiles) plutôt que de l'or. On commence à **0 point**.
- **Coût selon le type** : passif, amélioration, entrée de branche ou potion = 1 ; capacité active = 2 ; compétence clé = 3 ; légendaire = 5. L'arbre complet coûte 311 points.

## Arbre de compétences (version de travail v12, 198 compétences, 311 points)
Inchangé. 5 classes disposées autour du personnage, dans le sens des aiguilles d'une montre en partant du haut : Druide, Combattant, Magicien (la plus grande, en bas), Archer, Voleur. **Il ne s'ouvre qu'auprès d'une source** (voir Progression).

- **Druide** : régénération, nature, défense et défense magique. Pont vers le Paladin et le Dresseur, prolongé par l'Alchimiste.
  - **Enfant de la forêt** : en forêt, il n'est plus ralenti, régénère 2 % de ses PV par seconde et fait +15 % de dégâts.
  - **Alchimiste** : sacoche de potions (Fiole explosive, Potion de soin, Potion de mort, Potion purifiante) ; passifs Sacoche élargie, Distillation, Transmutation, Pierre philosophale. Plus les deux potions secrètes à plans (voir Combat de base).
- **Combattant** : un tronc long (Grand slash, Cri de guerre, Parade, Riposte, **Dos à la roche**), puis :
  - Paladin : tank et régénération (demande aussi un nœud de Druide). Légendaire secret : **Immortel**.
  - Guerrier : gros dégâts. Tout au bout, **Anti-magie** (aucun point en Magicien ni en Druide, qui sont ensuite bloqués).
- **Voleur** : un tronc long (dont **Ombre des bois**), puis :
  - Assassin : poison, coup fatal, ombre, vitesse. Légendaire secret : **Faille spatiale**.
  - Dresseur (demande aussi un nœud de Druide) : Loup, puis Loup alpha (côté ours, **Meute sauvage**) et Lien animal (côté oiseau tonnerre) ; voie de l'ours jusqu'à **Fenrir**, voie de l'oiseau jusqu'à **Hræsvelg**, **Dragon** (Wyverne + Incinération).
- **Archer** : **Longue vue**, **Flèche perçante**, **Pointe lestée** ; côté Puissance **Tir lourd** (pendant 8 s : +100 % de dégâts, −30 % de vitesse d'attaque) et **Tireur embusqué** ; côté Agilité vitesse, flèches multiples, **Flèche de recul** [Validé, remplace Roulade : une grosse flèche qui fait de lourds dégâts au premier ennemi et te projette en arrière ; recharge 7 s], Lecture des trajectoires.

### Magicien
- **Tronc** : Attaque magique, Esprit vif et Esprit affûté, Concentration, Puissance arcanique, Barrière arcanique, Éveil élémentaire.
- **4 éléments de base** :
  - Terre : Pics de roche, Sables mouvants, Séisme, **Maître des roches** ;
  - Feu : Aura de feu, Boule de feu (enflamme forêts et maisons), **Brûlure**. Un mage de feu éclaire les grottes sans torche ;
  - Eau : Source de vie, soins reçus, Vague, et **Pluie mortelle** (après Marée, coût 2 : canalise 0,7 s puis une pluie de lances d'eau tombe 3 s sur la zone visée) ;
  - Air : Maelstrom, Bourrasque, Tornade, Balle de vent, Œil du cyclone.
- **Éléments supérieurs** : **Foudre (il faut l'air ET la brume)**, Glace (de l'eau), Magma (Sol en fusion, Peau de lave, Météore, Roche ardente, Éruption, **Coulée de lave** : cône de lave qui reste 4 s au sol et brûle), Brume.
- **Tornade de feu** : lien entre Aura de feu et Maelstrom.
- **Magies secrètes** : Magie temporelle (au bout de la Glace), Magie de destruction (Incinération + Éruption + Dieu de l'orage).

## Questions ouvertes
- **Zones cachées** [Plus tard] : où les placer sur les bords, et quels boss cachés.
- **Multijoueur** [Plus tard, piste notée le 27 novembre] : coopération à 2 joueurs en ligne (l'hôte fait tourner le monde, l'ami le rejoint), à envisager seulement quand le jeu solo sera stable ; d'ici là, le jeu en équipe passe par les compagnons (`COMP`, `makeAllies`). Pistes : pas de pause partagée (un dialogue, l'arbre ou l'armurerie ne bloquent que celui qui les ouvre), étoiles et niveaux propres à chacun, ennemis à environ +60 % de PV, sauvegarde de l'hôte inchangée. À trancher : discrétion à deux, focus permanent et limite de deux attaquants, cercle du duel de Varek, partage des coffres, de la réputation et du mode Facile/Difficile.
- Faut-il plus de 15 zones, et des ennemis qui réapparaissent pour pouvoir gagner de l'XP en plus ?
- Les ennemis qui te chassent doivent-ils te suivre dans la zone voisine ?
- Avec seulement deux sources (Hameau, Bourg-Lanterne), faut-il ajouter une source plus loin (par exemple la cabane de la Côte, ou près de la Caldeira) pour ne pas obliger à de longs allers-retours en fin de partie ?
- Valider ou modifier les propositions ci-dessus (sources, recharge des défenses, valeurs de détection et de charge, table des éléments, histoire, détails de l'attaque du bourg et des dialogues).
- Le feu a-t-il un élément supérieur à lui seul ? D'autres légendaires secrets (Archer, Druide…) ?

Maquette de l'arbre : https://claude.ai/artifact/RuD31oEXLbZMRU8VbtrPCS
Prototype jouable (monde ouvert) : https://claude.ai/artifact/9fpeKCuUxD6YgjFk8AEHLm
Ancien prototype (campagne) : https://claude.ai/artifact/LRSWNr171GdSHs15FMrKAp

- **Tutoriel** [Validé le 27 novembre] : au début d'une nouvelle partie, une fenêtre propose « Oui, explique-moi » ou « Passer le tutoriel ». L'explication tient en quatre lignes : ZQSD pour se déplacer ; clic gauche pour attaquer ; on gagne des étoiles en montant de niveau et en trouvant des coffres ; les étoiles débloquent des compétences (T, près de la source), qu'on lance avec 1, 2, 3 et 4. Pas de tutoriel en mode test.
- **Bords des zones et ouvertures** [Validé le 27 novembre] : on ferme les bords avec des décors variés (falaises, bois épais, rivière ou mer, palissade, amas de rochers pointus), pas avec une rangée de cailloux identiques. Une route mène à chaque ouverture, sans marque au sol. Si l'ouverture est plus large que prévu, ce n'est pas grave : on passe n'importe où dans l'ouverture et on réapparaît au même niveau de l'autre côté. Exemple : au Hameau de Brune, la sortie nord fait environ 300 de large entre la falaise et le bois.

- **Bords des zones et ouvertures** [Validé le 27 novembre] : on ferme les bords avec des décors variés (falaises, bois épais, rivière ou mer avec une plage, amas de rochers pointus), pas avec une rangée de cailloux identiques, ni avec des lignes droites : chaque bord a une forme irrégulière, une plage ou une lisière s'arrondit, une falaise s'abaisse en éboulis près d'une ouverture au lieu d'être coupée net. Pas de palissade comme bord. Une route mène à chaque ouverture, sans marque au sol. Si l'ouverture est plus large que prévu, ce n'est pas grave : on passe n'importe où dans l'ouverture et on réapparaît au même niveau de l'autre côté. Exemple : au Hameau de Brune, la sortie nord fait environ 300 de large entre la falaise et le bois.


## Aldoria V2 : projet 3D distinct [Validé le 28 novembre 2026]

- La version 2D actuellement jouable reste la **V1**, prioritaire. Continuer son développement normalement, sans la convertir en 3D, sans modifier sa publication ni ses sauvegardes. La clé historique `aldoria-v2` désigne une version de format de sauvegarde 2D, pas le futur jeu 3D.
- La **V2** sera un véritable jeu 3D à la première personne, développé beaucoup plus tard. Direction proposée : fantasy médiévale stylisée, non photoréaliste, avec combats en temps réel, liberté de build, environnement interactif et exploration. Conserver les concepts, pas nécessairement leur implémentation technique.
- Roblox est une piste privilégiée pour expérimenter, Godot et un moteur web restent des options. Aucun moteur définitif, budget, publication publique ou calendrier n'est arrêté. Favoriser ressources gratuites/licences vérifiées, outils IA déjà disponibles et GitHub comme référence commune. L'utilisateur autorise l'usage de son ordinateur pour Roblox Studio, pas pour modifier la V1.
- [Proposition] La sélection du 28 novembre (réactions élémentaires eau/feu/glace/foudre, combat technique et IA, HUD, arbre et builds, exploration, météo, villages et réputation, quêtes, profil/carte/bestiaire, équipement, compagnons, art/audio, rejouabilité, coopération, paramètres et outils concepteur) constitue un catalogue de pistes à préciser individuellement, pas un ordre de réalisation ni une validation de leurs paramètres.
- [Validé] Une petite expérience de test 3D indépendante est autorisée : Hameau de Brune simplifié, forêt, rivière, première personne, combat, sort de feu et interactions élémentaires, premiers ennemis et HUD. Aucun effet sur le code, la publication ou la progression de la V1. La V2 complète reste reportée.
