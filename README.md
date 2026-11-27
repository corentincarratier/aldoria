# Aldoria

Ouvre `aldoria.html` dans ton navigateur pour lancer le prototype. Le jeu conserve la progression dans ce navigateur.

## Travailler depuis plusieurs ordinateurs

Sur chaque ordinateur, installe Git, Claude Code et Node.js LTS (pour Playwright). Connecte-toi au même compte Claude et au compte GitHub ayant accès au dépôt. Clone le projet une fois avec `git clone https://github.com/corentincarratier/aldoria.git`, puis entre dans le dossier avec `cd aldoria`.

Avant une session, lance `git pull --ff-only`, puis `claude`. La configuration du projet déclare Frontend Design et Playwright. Si Claude demande ton accord pour les activer, vérifie leur nom avant de valider.

Avant de changer d’ordinateur, vérifie `git status`, ajoute les fichiers voulus avec `git add <fichier>`, puis lance `git commit -m "Description du changement"` et `git push`. Si le pull échoue, conserve les modifications locales et résous la divergence avant de poursuivre.
