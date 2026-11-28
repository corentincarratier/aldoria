# Développer Aldoria

@AGENTS.md

Suis les consignes communes d’[AGENTS.md](AGENTS.md) pour concevoir Aldoria en développeur de jeux vidéo et travailler sur GitHub. Pour un choix de conception, consulte les [textes de développeurs](METHODES-DEVELOPPEMENT.md) et applique la démarche de recherche et d’essai décrite dans les consignes communes.

- Cherche dans aldoria.html la fonction ou le sélecteur concerné. Lis uniquement le contexte nécessaire.
- Applique la plus petite modification qui répond à la demande. Conserve les contrôles, l’interface et les sauvegardes existantes.
- Utilise Frontend Design pour les demandes de design et Playwright pour vérifier un parcours modifié. Pour une modification de texte, une vérification ciblée suffit.
- Place les nouvelles ressources du jeu dans assets/. Ajoute une dépendance uniquement si le besoin le justifie.
- Consulte PROJECT_MEMORY.md pour les décisions techniques durables et consigne dans CHANGELOG.md les changements visibles pour les joueurs.
- Pour une tâche d’implémentation, livre le résultat sur GitHub selon AGENTS.md (branche dédiée, envoi, demande de fusion) et fournis le lien. Ne demande jamais au joueur de télécharger, de transférer ou d’appliquer un patch ou un fichier.
- Avant de conclure, indique le changement et la vérification effectuée.

## Avis, décision et exécution

- Pour une demande d’avis, donne une recommandation et attends la décision avant de modifier les fichiers.
- « On garde ça » valide le choix. Pour une décision de conception ou de scénario, actualise la rubrique concernée de [decisions-conception.md](decisions-conception.md) ou de [histoire-et-niveaux.md](histoire-et-niveaux.md) sur ta branche, puis vérifie son enregistrement selon AGENTS.md. Si tu disposes uniquement du contexte du projet Claude, indique où le choix a été enregistré et si sa synchronisation GitHub reste à faire. Les décisions techniques durables vont dans PROJECT_MEMORY.md.
- « Fais-le » demande d’appliquer la proposition validée. Reprends le contexte disponible, réalise le changement et vérifie le résultat attendu.

## Sommaire Aldoria

Commence par les repères du sujet dans aldoria.html. Élargis la recherche aux rubriques liées si nécessaire.

| Sujet | Repères dans le code |
| --- | --- |
| UI et ergonomie | Menus et pause (`modal`, `togglePause`), équipement (`renderLoadout`, `loadoutClicks`), interface en combat (`buildHud`, `hud`). |
| Arbre de compétences | Classes et prérequis (`CLS`, `RAW`, `EXCL`), coûts (`COST`), affichage (`drawTree`, `drawTreePanel`), statistiques (`heroStats`), capacités actives (`AB`, `abil`, `cast`). |
| Combat et équilibrage | Dégâts aux mobs (`hitE`), dégâts au joueur (`hurtP`, `absorb`), ennemis (`ET`, `zoneFoes`, `brain`), compagnons (`COMP`, `makeAllies`). |
| Design visuel | Carte (`drawMap`), terrain (`terrain`, `drawTerrain`, `decor`), personnage (`drawHero`), mobs (`LOOK`, `lookOf`, `drawEnemy`), effets (`fx`, `drawShot`, `drawTele`). Pour un effet à l’impact, suivre `hitE` puis `drawEnemy`. |
| Scénario et progression | Monde et zones (`startWorld`, `enterZone`, `zoneState`), défense du village (`startRaidTalk`, `updRaid`), sources et armuriers (`atSource`, `openArmory`). |
