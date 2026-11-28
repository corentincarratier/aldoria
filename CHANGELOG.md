# Historique

Correction d’un écran noir au Clan des Pins lors du dessin de la hache du garde orc.

Essai de la plage : les pirates contournent le joueur et occupent des angles distincts avant de frapper. Les archers se répartissent à distance.

Les 35 compétences actives bénéficient d’animations de combat. Les projectiles, arcs de mêlée, éclairs et impacts élémentaires reprennent le rendu de l’essai validé.

Passages élargis, crique du Titan accessible par la mer, Clan des Pins, routes royales pavées (+15 % de vitesse) et sentiers praticables dans le marais.

La carte suit la marche du héros, y compris aux passages entre régions. Les collisions et les ralentissements du terrain s’appliquent. Le HUD reste masqué et le combat suspendu.

Le Château du Roi recommande le niveau 50 et le Dévoreur le niveau 55. La courbe d’XP permet de préparer un build avant Gorvan. Gorvan entre en furie à 65 % de PV et enchaîne 3 à 4 ruées sous 30 %. La carte masque le HUD et suspend le combat.

## 28 novembre 2026

Essai des rencontres : postes des gardes, flancs pirates et territoires des sangliers. Les chefs portent un étendard. Suppression des variantes rares et de leur mention au bestiaire.

Combat : parade précise sur R, esquive parfaite, interruptions et brise-garde, vulnérabilité, collisions, interception de projectiles, hitstop et ralenti de victoire. HUD de boss, alerte de PV, effets, recharge et réglage d’opacité. Mannequin DPS accessible en pause du mode concepteur.

Correction de l’Arbre aux Étoiles vide à la source et dans le journal.

Accueil : la citadelle épouse désormais la crête rocheuse, avec un donjon, une enceinte étagée et des fenêtres éclairées.

Nouvel habillage au clair de lune pour l’accueil, le HUD, le journal et l’arbre. Les médaillons de compétences reprennent la couleur de leur classe. Les commandes sont accessibles depuis un volet à l’accueil.

Le HUD centré occupe moins de hauteur pour mieux voir les ennemis qui arrivent du sud.

Le HUD de combat est centré. Les compétences rondes affichent leur recharge, puis viennent la jauge d’esquive, les PV et les deux défenses. La jauge se vide à la roulade et se remplit en 1,4 seconde. Les impacts directs font rougir la cible, les PV perdus restent brièvement dorés et un son signale la charge maximale de l’arc et du bâton.

## 27 novembre 2026

Import du prototype Aldoria et configuration du projet pour Claude Code.

Passage à la version en monde ouvert : 15 zones et carte (M), Bourg-Lanterne à défendre, réputation, dialogues, mode test (concepteur). Nouvelle sauvegarde `aldoria-v2` : une partie de l'ancienne version n'est pas reprise.

L'Arbre aux Étoiles (T) ne s'ouvre plus qu'auprès d'une source (Hameau de Brune, Bourg-Lanterne). On ne change plus d'arme avec A + molette : un armurier par village (Brom au Hameau, Hilde à Bourg-Lanterne) propose les armes apprises. L'arme reste celle qu'on a tant qu'on ne passe pas chez lui.

Mode test : le clic sur la carte ne téléporte plus. Personne ne peut se téléporter d'une zone à l'autre pour le moment.

Les compétences se visent en maintenant leur icône ou la touche 1 à 4. Relâcher lance la compétence, un clic droit annule la visée.

La visée dessine le couloir, le cône ou la surface d'effet du sort. L'arbre reste fixe, son panneau latéral défile et le déplacement du graphe ne sélectionne plus ses textes. Suppression du rappel d'armurier sur A (AZERTY).

Correction du suivi caméra lorsque la souris est déjà active au premier affichage ou que le héros se déplace brusquement.

Les impacts directs éclairent brièvement la cible. Les critiques ont un éclat doré et les coups absorbés par l’armure du héros un éclat bleu. Les repoussements s’animent avec une décélération et suivent les collisions du décor.

Forêts : seuls les sorts de feu les enflamment. L'incendie gagne les bois en contact à vitesse de marche, dure 10 à 12 s, puis les arbres carbonisés restent dans la sauvegarde : ils ne cachent plus et ne ralentissent plus. Un ennemi qui ne se doute de rien est masqué au fond d'un bois (bestiaire compris) jusqu'au soupçon ou à la détection ; à l'orée, il garde sa vue et reste visible. Le brouillard est plus clair, percé par le joueur proche et les flammes, sans lien avec la torche. Les coffres cachés sont sous un bois ou dans un cercle de rochers ouvert dont les rochers bloquent la vue.

E ouvre le menu Profil, Inventaire, Arbre et Bestiaire. Les fiches des créatures se révèlent à la première observation. La carte reste sur M et Pause est le seul bouton en haut à droite.

E ouvre le profil. La carte répond à la lettre M sur AZERTY et QWERTY. Les armes, compétences, impacts et menus ont des effets sonores, désactivables dans Pause.

Étape 1, Hameau de Brune : trois routes pavées partent de la source vers le nord, l'ouest et l'est. Le village a dix maisons différentes, une forge, deux nouveaux villageois (Gaspard, Lise), des rochers pointus et des bords variés (falaise, bois, palissade, rivière). On peut sortir n'importe où dans une ouverture.

Une nouvelle partie propose un court tutoriel : déplacement, attaque, étoiles et compétences.

Hameau de Brune : Brom travaille sous l'auvent de sa forge. Les bords suivent des formes irrégulières : plage arrondie vers le village au sud, lisière des bois découpée, falaise qui s'abaisse en éboulis avant la route ; la palissade est remplacée par un bois.

Le menu Pause (Échap) permet de passer en plein écran et de revenir à la fenêtre.

Le profil affiche la vitesse d’attaque de l’arme équipée en attaques par seconde, bonus et Tir lourd compris.

## 28 novembre 2026

Nouvelle carte : 5 colonnes sur 7 rangées, 35 zones, avec le Hameau de Brune en bas au centre. Les entrées entre zones sont beaucoup plus larges. À l'est, la route tourne vers le nord et mène à une forêt dense, au Hameau des Pins et aux monts gelés ; l'est du Hameau mène aussi à une plage avec un camp de pirates, où le sable ralentit. À l'ouest, une plaine avec des chiens, une rivière franchie par un pont, puis le marais de la sorcière : on peut l'appeler, répondre à ses questions, la combattre, ou obtenir le collier du phénix (relève une fois avec tous les PV). Au nord, une longue vallée de rivières qui se rejoignent, un désert (cactus qui piquent, scorpions, momies, esprits), un canyon, un volcan, des villages (Bourg-Lanterne attaqué par les pillards, Fin-de-Route avec Katniss, Gale et Pita), la ville du roi aux murailles percées de deux portes, et le château. Si ton honneur (la réputation) est inférieur à 25 en arrivant à Fin-de-Route, Katniss t'attaque. Cachés : une grotte dans la forêt du Hameau des Pins, une grotte dans les falaises, un passage discret au fond du volcan vers un lac de lave et le coffre de l'épée céleste (son effet n'est pas encore là), un trou vers le boss le plus dur, et une montagne que l'on n'atteint qu'en esquivant par-dessus la mer depuis la plage. Dans la ville, le roi se cache derrière son trône et fuit si on s'approche ; son maître d'armes se bat à sa place.

La carte (M) devient un parchemin dessiné à la main : montagnes, forêts, villages, rivières et noms de lieux.

Le héros commence avec une nouvelle histoire (sa mère tuée par le roi). Une ancienne sauvegarde garde ton niveau, tes étoiles, ton arbre et tes objets, mais la position et la progression des zones repartent du Hameau.

