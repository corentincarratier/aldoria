# Mémoire technique

Le prototype regroupe HTML, CSS et JavaScript dans aldoria.html. La progression utilise la clé de stockage local aldoria-v2, et le mode test la clé séparée aldoria-test. Préserver la compatibilité des sauvegardes lorsque leur structure évolue.

La branche principale est main. Les réglages partagés de Claude Code sont dans .claude/settings.json et .mcp.json.

GitHub Pages publie le jeu depuis la racine de `main` à l’adresse https://corentincarratier.github.io/aldoria/aldoria.html. Claude et ChatGPT intègrent leurs changements par demande de fusion depuis une branche par tâche. Les étapes de synchronisation sont dans [AGENTS.md](AGENTS.md).

Les repoussements de combat passent par `startRecoil` puis `advanceRecoil` dans la simulation. Les sous-pas utilisent les collisions du décor. `markImpact` enregistre les impacts directs pour le rendu du héros et des ennemis.

Le menu du personnage (E) partage le dessin de l’arbre avec la source dans un mode de consultation distinct. La carte (M) est indépendante. La sauvegarde conserve les espèces observées dans `seen` et la compétence repérée dans `pinned`.
