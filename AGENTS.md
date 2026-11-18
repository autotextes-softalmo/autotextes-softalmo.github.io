# Consignes pour les agents

Site statique sans compilation : `index.html`, `style.css`, `app.js`, `formulaires.js` (carte des tabulations et disposition de chaque formulaire), `catalogue.js` (autotextes publiés). Publié par GitHub Pages à chaque push sur `main`.

## Règles
- Ne jamais modifier l'ordre (`ordre`) d'un formulaire sans nouvelle calibration dans Softalmo : il reproduit les tabulations réelles.
- Après une modification de `app.js` ou `catalogue.js`, vérifier que chaque autotexte du catalogue ressort identique après import puis génération.
- Aucune ressource externe (polices, bibliothèques) : le site doit marcher sur les postes filtrés du CHU et ouvert en fichier local.
- Aucune donnée patient, nulle part.

## Design
La source de vérité est le dossier `~/Obsidian/10 Projets/Autotextes Softalmo/Design/` du Pi : `BRIEF.md`, `DESIGN.md`, `ETAT_REDESIGN.md`, `maquettes/`, `captures/`, `retours-agent.md`.
- Claude Design dépose ses livrables dans `~/Depot/claude-design-autotextes/` ; lire `NOTES.md` d'abord, ranger dans `Design/`, puis vider ce dossier (et lui seul).
- N'implémenter que ce qui est marqué « Validé — à implémenter » dans `ETAT_REDESIGN.md`. Les maquettes sont des références visuelles : reproduire leur rendu dans le code existant, sans copier leur code tel quel.
- Ne jamais modifier `DESIGN.md`, `ETAT_REDESIGN.md` ni les maquettes. Un problème technique se note dans `retours-agent.md` (date, écran, problème, proposition).
