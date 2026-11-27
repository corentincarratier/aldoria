# Aldoria

Ouvre `aldoria.html` dans ton navigateur pour lancer le prototype. Le jeu conserve la progression dans ce navigateur.

## Travailler depuis plusieurs ordinateurs

Sur chaque ordinateur, installe Git, Claude Code et Node.js LTS (pour Playwright). Connecte-toi au même compte Claude et au compte GitHub ayant accès au dépôt. Clone le projet une fois avec `git clone https://github.com/corentincarratier/aldoria.git`, puis entre dans le dossier avec `cd aldoria`.

Claude Code et ChatGPT travaillent sur le même dépôt. Chaque tâche part de la dernière version de `main`, sur sa propre branche. Deux sessions simultanées utilisent deux dossiers de travail. Les étapes de création, de synchronisation et de fusion sont dans [AGENTS.md](AGENTS.md).

Pour reprendre une tâche sur un autre ordinateur, enregistre et pousse d’abord les changements sur sa branche. Sur le second ordinateur, récupère la branche avec `git fetch origin`, sélectionne-la avec `git switch <branche>`, puis lance `git pull --ff-only`. La demande de fusion regroupe le travail en cours et les vérifications. La configuration de Claude Code déclare Frontend Design et Playwright.
