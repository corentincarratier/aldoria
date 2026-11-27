# Développer Aldoria

- Cherche dans aldoria.html la fonction ou le sélecteur concerné. Lis uniquement le contexte nécessaire.
- Applique la plus petite modification qui répond à la demande. Conserve les contrôles, l’interface et les sauvegardes existantes.
- Utilise Frontend Design pour les demandes de design et Playwright pour vérifier un parcours modifié. Pour une modification de texte, une vérification ciblée suffit.
- Place les nouvelles ressources du jeu dans assets/. Ajoute une dépendance uniquement si le besoin le justifie.
- Consulte PROJECT_MEMORY.md pour les décisions techniques durables et consigne dans CHANGELOG.md les changements visibles pour les joueurs.
- Avant de conclure, indique le changement et la vérification effectuée.

## Avis, décision et exécution

- Pour une demande d’avis, donne une recommandation et attends la décision avant de modifier les fichiers.
- « On garde ça » valide le choix. Pour une décision de conception ou de scénario, indique le document partagé du projet Claude (decisions-conception.md ou histoire-et-niveaux.md), la rubrique et la phrase à intégrer. Si tu peux modifier ce document, actualise l’entrée et vérifie son enregistrement. Les décisions techniques durables vont dans PROJECT_MEMORY.md.
- « Fais-le » demande d’appliquer la proposition validée. Reprends le contexte disponible, réalise le changement et vérifie le résultat attendu.

## Sommaire Aldoria

Commence par les repères du sujet dans aldoria.html. Élargis la recherche aux rubriques liées si nécessaire.

| Sujet | Repères dans le code |
| --- | --- |
| UI et ergonomie | Menus et pause (`modal`, `togglePause`), équipement (`renderLoadout`, `loadoutClicks`), interface en combat (`buildHud`, `hud`). |
| Arbre de compétences | Classes et prérequis (`CLS`, `RAW`, `EXCL`), coûts (`COST`), affichage (`drawTree`, `drawTreePanel`), statistiques (`heroStats`), capacités actives (`AB`, `abil`, `cast`). |
| Combat et équilibrage | Dégâts aux mobs (`hitE`), dégâts au joueur (`hurtP`, `absorb`), ennemis (`ET`, `enemySkills`), compagnons (`COMP`, `makeAllies`). |
| Design visuel | Carte (`mapDecor`, `renderMap`), terrain (`terrain`, `drawTerrain`, `decor`), mobs (`LOOK`, `lookOf`, `drawEnemy`), effets (`fx`, `drawShot`, `drawTele`). Pour un effet à l’impact, suivre `hitE` puis `drawEnemy`. |
| Scénario et progression | Niveaux et vagues (`LV`), préparation (`openPrep`, `renderPrep`), victoire et récompenses (`endGame`). |
