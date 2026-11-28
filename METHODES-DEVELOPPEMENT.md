# Méthodes de développeurs pour Aldoria

Ces lectures répondent à des questions qu’on rencontre dans Aldoria. Les essais proposés servent à évaluer une idée. Les choix retenus pour le jeu figurent dans les [décisions de conception](decisions-conception.md), les [références visuelles](REFERENCES-VISUELLES.md) et le [document sur l’histoire et les niveaux](histoire-et-niveaux.md).

## Comment faire sentir le poids d’une attaque ?

Sur *Dead Cells*, Thomas Vasseur règle quelques poses clés jusqu’à ce que le geste et son rythme fonctionnent. Il peut alors déplacer une pose si l’équipe change la vitesse d’une arme. Pour l’archer d’Aldoria, regarder d’abord l’armement, la tension et le lâcher depuis la caméra du jeu. Même en marchant, on doit pouvoir repérer l’instant où la main libère la corde et où la flèche part. Ajouter ensuite les effets qui renforcent ce moment. [Thomas Vasseur, sur l’animation de Dead Cells](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)

## Comment savoir si un sort touche ?

L’équipe de *League of Legends* compare la forme visible d’un sort à sa zone d’effet et réserve les signaux visuels et sonores les plus marqués aux événements qui demandent une réaction. Pour Prison de glace, placer un garde juste à l’intérieur de la couronne et un autre juste à l’extérieur. Relâcher le sort et vérifier qu’en regardant les pics on peut prédire lequel sera rabattu puis gelé. Rejouer avec les autres effets de combat pour voir si cette limite reste lisible. [Riot Games, La clarté dans League](https://www.leagueoflegends.com/fr-fr/news/dev/clarity-in-league//)

## Quand une commande semble-t-elle avoir été ignorée ?

Dans *Celeste*, Maddy Thorson décrit comment un saut demandé juste avant l’atterrissage peut être mémorisé puis exécuté au premier instant possible. Pour examiner une esquive jugée peu réactive dans Aldoria, essayer la touche juste avant, au moment et juste après la fin d’une récupération. Comparer ce que l’animation laisse attendre au moment où le jeu accepte la commande. Ce diagnostic permet de décider s’il faut retoucher le geste, le réglage ou la façon de mémoriser l’entrée. [Maddy Thorson, Celeste & Forgiveness](https://maddymakesgames.com/articles/celeste_and_forgiveness/index.html)

## Comment guider le regard dans un décor détaillé ?

Sur *Dead Cells*, Gwenaël Massé donne des contrastes différents aux décors, aux objets manipulables et aux menaces. Sur la place de Brune, traverser la cour depuis une ruelle en cherchant la source, puis refaire le trajet avec un garde qui attaque près du puits. Si les reflets de l’eau masquent le geste du garde, essayer d’atténuer ces reflets et rejouer la scène avant de retoucher le garde. [Gwenaël Massé, sur les couleurs et les décors de Dead Cells](https://www.gamedeveloper.com/production/art-design-deep-dive-giving-back-colors-to-cryptic-worlds-in-i-dead-cells-i-)

## Quelle place donner au joueur dans une rencontre ?

Pour *Specter of Torment*, Yacht Club Games a redessiné des salles autour des mouvements de Specter Knight. La course sur les murs et sa frappe en déplacement exigeaient des surfaces et des distances différentes de celles du premier héros. Pour une rencontre d’Aldoria près d’un pont, parcourir le passage en observant où l’on repère l’ennemi, où l’on peut esquiver et où l’on reprend le combat. Essayer avec les capacités accessibles à ce stade de la progression. [Yacht Club Games, sur la conception des niveaux de Specter of Torment](https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-1-5/)

## Comment faire exister l’histoire dans les actions du joueur ?

Pendant le développement de *80 Days*, l’équipe d’inkle s’est aperçue qu’elle passait elle-même les scènes affichées automatiquement à l’arrivée en ville. Rendre l’exploration facultative et permettre aux rencontres d’ouvrir des routes a changé l’intérêt de ces dialogues. Pour écrire une scène au Hameau, partir de ce que veut le villageois et de ce que le héros sait en arrivant. Écrire puis parcourir deux versions courtes du trajet, l’une où le joueur lui parle et l’autre où il poursuit sa route. Au prochain lieu, vérifier ce que chacun a pu apprendre et si le dialogue en tient compte. [Jon Ingold et Joseph Humfrey, retour sur le développement de 80 Days](https://www.gamedeveloper.com/business/postmortem-inkle-s-i-80-days-i-)
