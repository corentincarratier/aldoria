# Travailler sur Aldoria

Ces consignes s’appliquent à Claude et à ChatGPT. Le dépôt GitHub `corentincarratier/aldoria` contient la version de référence du jeu. GitHub Pages publie `main`.

## Commencer une tâche

1. Vérifie `git status`, récupère les dernières branches avec `git fetch origin` et regarde les demandes de fusion ouvertes. Si l’une couvre déjà ta tâche, consulte son diff avant de continuer.
2. Pars de `origin/main` dans une branche dédiée, par exemple `claude/personnage` ou `codex/inventaire`. Chaque session simultanée utilise son propre dossier. Sur un même ordinateur, `git worktree add -b codex/inventaire ../aldoria-inventaire origin/main` en crée un sans déplacer le travail de l’autre session. Sur GitHub, crée la branche depuis le dernier commit de `main`.
3. Lis la rubrique pertinente de [la mémoire technique](PROJECT_MEMORY.md), les dernières entrées de [l’historique](CHANGELOG.md) et le [sommaire du code](CLAUDE.md#sommaire-aldoria). Une conversation ou une ancienne copie HTML peut décrire une autre version du jeu.

## Retrouver ou enregistrer une décision

Pour les règles, l’interface, le combat et les pistes à explorer, consulte [les décisions de conception](decisions-conception.md). Pour le monde, le récit et la progression, consulte [l’histoire et les niveaux](histoire-et-niveaux.md). Garde les statuts du document et classe chaque décision dans la rubrique concernée. Une demande d’avis reste une discussion. « On garde ça » valide la décision. « Fais-le » demande sa mise en œuvre et sa vérification.

Les versions de référence partagées sont sur GitHub. Si une conversation Claude a déjà modifié sa copie, compare les deux versions, puis reporte uniquement les passages concernés sur ta branche. Une fois la fusion faite, utilise le document de `main` pour actualiser la copie du projet Claude si tu y as accès. Si d’autres entrées y ont changé entre-temps, intègre-les avant de la remplacer.

## Modifier et publier

- Limite le diff aux fonctions et aux fichiers de ta tâche. Préserve les modifications locales d’autrui et les sauvegardes du joueur. Pour un travail en cours à partager, ouvre une demande de fusion en brouillon et indique les fonctions concernées.
- Avant la fusion, récupère à nouveau `origin/main`. Compare les changements arrivés depuis le départ avec `git diff HEAD...origin/main`, puis intègre-les sur ta branche avec `git merge origin/main`. Sur GitHub, compare les deux branches et actualise la branche de travail si la base a avancé. Relis aussi les nouvelles décisions dans les fichiers de contexte concernés.
- Si les deux tâches touchent la même fonction, combine leurs intentions et vérifie les deux comportements, même si Git fusionne le texte automatiquement. Si les décisions sont incompatibles, garde les deux versions sur leurs branches et demande quel comportement retenir.
- Vérifie le diff destiné à `main` et le parcours concerné. Mets à jour `PROJECT_MEMORY.md` pour une décision technique durable et `CHANGELOG.md` pour un changement visible en jeu. Dans la demande de fusion, résume le changement et le test effectué.
- Envoie uniquement ta branche. Intègre la demande de fusion quand le résultat est vérifié. Si GitHub signale un conflit ou si `main` a avancé sur le même sujet, actualise la branche et reprends la vérification. N’envoie jamais directement sur `main`, ne force jamais un envoi et ne remplace jamais `aldoria.html` par une copie ancienne.
