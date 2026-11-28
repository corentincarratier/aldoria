# Aldoria V2 — Roblox, prototype de Brune (expérience 0.1)

Ce test ne remplace ni ne modifie Aldoria V1. Il n'est pas le lancement du développement de la V2 complète. Roblox est une piste, pas le moteur définitivement retenu. Aucun achat ni ressource tierce n'est nécessaire. Le code est conservé sur cette branche de travail jusqu'au test dans Roblox Studio.

## Installation dans Studio (uniquement une nouvelle Baseplate)

1. Ouvrir Roblox Studio et créer **une nouvelle Baseplate non publiée**. Ne pas ouvrir un jeu existant.
2. Ouvrir le fichier [install.luau](install.luau) sur GitHub et copier l'intégralité du code avec le bouton de copie du fichier brut (pas l'adresse).
3. Dans Studio, ouvrir la Barre de commande (Mac : Cmd+9 ; Windows : Ctrl+9). Si nécessaire, activer la barre de commande multiligne dans les fonctionnalités bêta.
4. Coller le code, puis cliquer sur Run/Exécuter (ou Cmd/Ctrl+Entrée en mode multiligne). Le script vérifie que le jeu est non publié et que la scène ressemble à une Baseplate neuve. Il génère les objets, le RemoteEvent et les scripts client/serveur dans Studio en mode édition. Il ne fait aucune requête réseau, n'active pas HTTP, n'enregistre pas et ne publie pas le lieu.
5. Ouvrir Output/Sortie, vérifier le message de fin, puis cliquer sur Play (F5). Pour conserver le résultat, enregistrer ce nouveau projet distinct, privé, si souhaité. Ne jamais remplacer une expérience existante.

## Commandes de test sur ordinateur

| Action | Commande |
|---|---|
| Déplacement et regard | ZQSD / WASD / flèches et souris |
| Épée | Clic gauche |
| Arc | Maintenir puis relâcher le clic gauche |
| Changer d'arme | F devant la forge de Brom |
| Boule de feu / gel / foudre / garde | Maintenir 1, 2, 3 ou 4, viser, relâcher |
| Annuler la visée | Clic droit |
| Esquive | Espace |
| Récupérer ses PV | F à la source |

## Parcours de vérification avant toute fusion

- Première personne, déplacements, collisions avec les bâtiments, pont et arbres.
- F à la forge : alternance épée/arc, animation visible, charge.
- Traverser le pont vers le Bois de Saule : les deux loups détectent, poursuivent, télégraphient leurs attaques ; l'épée/arc/feu peuvent les vaincre et attribuer des étoiles.
- Viser un arbre au 1 : ignition, propagation limitée, arbre carbonisé. Un tir d'arc ne doit pas déclencher d'incendie.
- Viser la rivière au 2 : pont de glace temporaire ; le sort 1 peut le faire fondre.
- Viser l'eau au 3 avec un loup à proximité dans l'eau : dégâts.
- Vérifier esquive, garde, recharge des compétences, vie, source, réapparition et absence d'erreur dans Output.
- Vérifier que la V1 n'a pas changé, que le projet Studio reste privé et que rien n'a été publié.

## Limites / état

Code écrit et relu statiquement ; pas encore exécuté dans le moteur Roblox. Décors et modèles procéduraux simples, animations de loups et d'armes rudimentaires, pas de musique originale ni d'ambiance sonore dédiée, pas de PNJ interactifs modélisés, pas de météo, pas d'arbre complet, pas de sauvegarde ni de multijoueur validé. Ce n'est pas un jeu fini. Pas de dépendance à des assets externes. Le prototype sert à juger la caméra, le combat et les réactions élémentaires avant d'investir dans l'art et la V2.

Documentation officielle : https://create.roblox.com/docs/studio/overview ; https://create.roblox.com/docs/reference/engine/classes/ScriptEditorService ; https://create.roblox.com/docs/studio/testing-modes.
